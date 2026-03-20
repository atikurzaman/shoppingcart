using Microsoft.EntityFrameworkCore;
using ShoppingCart.Application.DTOs.Payments;
using ShoppingCart.Application.Interfaces.Services;
using ShoppingCart.Domain.Entities;
using ShoppingCart.Domain.Enums;
using ShoppingCart.Persistence.Data;
using ShoppingCart.Shared.Common;
using ShoppingCart.Shared.Exceptions;

namespace ShoppingCart.Application.Services;

public class PaymentService : IPaymentService
{
    private readonly AppDbContext _context;

    public PaymentService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PaymentDto?> GetPaymentByIdAsync(int id)
    {
        var payment = await _context.Payments
            .Include(p => p.Order)
            .ThenInclude(o => o.Customer)
            .ThenInclude(c => c.User)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (payment == null) return null;

        return MapToDto(payment);
    }

    public async Task<PaymentDto?> GetPaymentByOrderIdAsync(int orderId)
    {
        var payment = await _context.Payments
            .Include(p => p.Order)
            .FirstOrDefaultAsync(p => p.OrderId == orderId);

        return payment == null ? null : MapToDto(payment);
    }

    public async Task<PaymentDto> InitiatePaymentAsync(int userId, InitiatePaymentRequest request)
    {
        var order = await _context.Orders
            .Include(o => o.Customer)
            .FirstOrDefaultAsync(o => o.Id == request.OrderId);

        if (order == null)
            throw new NotFoundException("Order not found");

        if (order.Customer.UserId != userId)
            throw new System.UnauthorizedAccessException("Unauthorized");

        if (order.PaymentStatus == PaymentStatus.Paid)
            throw new BadRequestException("Order already paid");

        var payment = new Payment
        {
            OrderId = request.OrderId,
            Amount = order.TotalAmount,
            TransactionAmount = order.TotalAmount,
            PaymentMethod = Enum.Parse<Domain.Enums.PaymentMethod>(request.PaymentMethod),
            Status = PaymentStatus.Pending,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = userId.ToString()
        };

        _context.Payments.Add(payment);
        await _context.SaveChangesAsync();

        return MapToDto(payment);
    }

    public async Task<PaymentDto> ProcessPaymentCallbackAsync(PaymentCallbackRequest request)
    {
        var payment = await _context.Payments
            .Include(p => p.Order)
            .FirstOrDefaultAsync(p => p.TransactionId == request.TransactionId);

        if (payment == null)
            throw new NotFoundException("Payment not found");

        payment.GatewayResponse = request.GatewayResponse;
        payment.ProcessedAt = DateTime.UtcNow;

        if (request.Status == "success" || request.Status == "completed")
        {
            await ConfirmPaymentAsync(payment.Id, request.TransactionId);
        }
        else
        {
            await FailPaymentAsync(payment.Id, request.FailureReason ?? "Payment failed");
        }

        return MapToDto(payment);
    }

    public async Task<PaymentDto> ConfirmPaymentAsync(int paymentId, string transactionId)
    {
        var payment = await _context.Payments
            .Include(p => p.Order)
            .FirstOrDefaultAsync(p => p.Id == paymentId)
            ?? throw new NotFoundException("Payment not found");

        payment.TransactionId = transactionId;
        payment.Status = PaymentStatus.Paid;
        payment.ProcessedAt = DateTime.UtcNow;

        payment.Order.PaymentStatus = PaymentStatus.Paid;
        payment.Order.PaymentDate = DateTime.UtcNow;
        payment.Order.PaymentTransactionId = transactionId;
        payment.Order.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return MapToDto(payment);
    }

    public async Task<bool> FailPaymentAsync(int paymentId, string reason)
    {
        var payment = await _context.Payments
            .Include(p => p.Order)
            .FirstOrDefaultAsync(p => p.Id == paymentId);

        if (payment == null) return false;

        payment.Status = PaymentStatus.Failed;
        payment.FailureReason = reason;
        payment.ProcessedAt = DateTime.UtcNow;

        payment.Order.PaymentStatus = PaymentStatus.Failed;
        payment.Order.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<PagedResult<PaymentListDto>> GetAllPaymentsAsync(int pageIndex, int pageSize, string? status = null)
    {
        var query = _context.Payments
            .Include(p => p.Order)
            .ThenInclude(o => o.Customer)
            .ThenInclude(c => c.User)
            .AsQueryable();

        if (!string.IsNullOrEmpty(status) && Enum.TryParse<PaymentStatus>(status, true, out var paymentStatus))
        {
            query = query.Where(p => p.Status == paymentStatus);
        }

        var totalCount = await query.CountAsync();
        var payments = await query
            .OrderByDescending(p => p.CreatedAt)
            .Skip(pageIndex * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var result = payments.Select(p => new PaymentListDto
        {
            Id = p.Id,
            OrderNumber = p.Order.OrderNumber,
            CustomerName = $"{p.Order.Customer.User.FirstName} {p.Order.Customer.User.LastName}",
            Amount = p.Amount,
            PaymentMethod = p.PaymentMethod.ToString(),
            Status = p.Status.ToString(),
            ProcessedAt = p.ProcessedAt
        }).ToList();

        return new PagedResult<PaymentListDto>(result, totalCount, pageIndex, pageSize);
    }

    public async Task<PaymentSummaryDto> GetPaymentSummaryAsync()
    {
        var today = DateTime.UtcNow.Date;
        var startOfMonth = new DateTime(today.Year, today.Month, 1);

        var allPayments = await _context.Payments.ToListAsync();
        var monthPayments = allPayments.Where(p => p.CreatedAt >= startOfMonth).ToList();
        var todayPayments = allPayments.Where(p => p.CreatedAt >= today).ToList();

        return new PaymentSummaryDto
        {
            TotalRevenue = allPayments.Where(p => p.Status == PaymentStatus.Paid).Sum(p => p.Amount),
            TodayRevenue = todayPayments.Where(p => p.Status == PaymentStatus.Paid).Sum(p => p.Amount),
            MonthlyRevenue = monthPayments.Where(p => p.Status == PaymentStatus.Paid).Sum(p => p.Amount),
            PendingPayments = allPayments.Count(p => p.Status == PaymentStatus.Pending),
            CompletedPayments = allPayments.Count(p => p.Status == PaymentStatus.Paid),
            FailedPayments = allPayments.Count(p => p.Status == PaymentStatus.Failed),
            RefundedPayments = allPayments.Count(p => p.Status == PaymentStatus.Refunded)
        };
    }

    public async Task<PaymentDto> ProcessRefundAsync(int adminId, RefundRequest request)
    {
        var payment = await _context.Payments
            .Include(p => p.Order)
            .FirstOrDefaultAsync(p => p.Id == request.PaymentId)
            ?? throw new NotFoundException("Payment not found");

        if (payment.Status != PaymentStatus.Paid)
            throw new BadRequestException("Cannot refund unpaid payment");

        if (request.Amount > payment.Amount)
            throw new BadRequestException("Refund amount exceeds payment amount");

        payment.Status = PaymentStatus.Refunded;
        payment.RefundedAmount = request.Amount;
        payment.ProcessedAt = DateTime.UtcNow;
        payment.UpdatedAt = DateTime.UtcNow;
        payment.UpdatedBy = adminId.ToString();

        payment.Order.RefundedAmount = request.Amount;
        payment.Order.PaymentStatus = PaymentStatus.Refunded;
        payment.UpdatedAt = DateTime.UtcNow;
        payment.UpdatedBy = adminId.ToString();
        payment.Order.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return MapToDto(payment);
    }

    public async Task<List<PaymentDto>> GetPaymentHistoryAsync(int customerId)
    {
        var payments = await _context.Payments
            .Include(p => p.Order)
            .Where(p => p.Order.Customer.UserId == customerId)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        return payments.Select(MapToDto).ToList();
    }

    private static PaymentDto MapToDto(Payment payment)
    {
        return new PaymentDto
        {
            Id = payment.Id,
            OrderId = payment.OrderId,
            OrderNumber = payment.Order?.OrderNumber ?? "",
            Amount = payment.Amount,
            TransactionAmount = payment.TransactionAmount,
            PaymentMethod = payment.PaymentMethod.ToString(),
            Status = payment.Status.ToString(),
            TransactionId = payment.TransactionId,
            GatewayResponse = payment.GatewayResponse,
            FailureReason = payment.FailureReason,
            ProcessedAt = payment.ProcessedAt,
            ReferenceNumber = payment.ReferenceNumber
        };
    }
}
