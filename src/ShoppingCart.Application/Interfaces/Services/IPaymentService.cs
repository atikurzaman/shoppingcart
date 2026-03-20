using ShoppingCart.Application.DTOs.Payments;
using ShoppingCart.Shared.Common;

namespace ShoppingCart.Application.Interfaces.Services;

public interface IPaymentService
{
    Task<PaymentDto?> GetPaymentByIdAsync(int id);
    Task<PaymentDto?> GetPaymentByOrderIdAsync(int orderId);
    Task<PaymentDto> InitiatePaymentAsync(int userId, InitiatePaymentRequest request);
    Task<PaymentDto> ProcessPaymentCallbackAsync(PaymentCallbackRequest request);
    Task<PaymentDto> ConfirmPaymentAsync(int paymentId, string transactionId);
    Task<bool> FailPaymentAsync(int paymentId, string reason);
    
    // Admin
    Task<PagedResult<PaymentListDto>> GetAllPaymentsAsync(int pageIndex, int pageSize, string? status = null);
    Task<PaymentSummaryDto> GetPaymentSummaryAsync();
    Task<PaymentDto> ProcessRefundAsync(int adminId, RefundRequest request);
    Task<List<PaymentDto>> GetPaymentHistoryAsync(int customerId);
}
