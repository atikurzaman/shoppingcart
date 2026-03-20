using Microsoft.EntityFrameworkCore;
using ShoppingCart.Application.DTOs.Orders;
using ShoppingCart.Application.Interfaces.Services;
using ShoppingCart.Persistence.Data;
using ShoppingCart.Shared.Exceptions;
using ShoppingCart.Shared.Common;

namespace ShoppingCart.Application.Services;

public class OrderService : IOrderService
{
    private readonly AppDbContext _context;
    private readonly ICartService _cartService;

    public OrderService(AppDbContext context, ICartService cartService)
    {
        _context = context;
        _cartService = cartService;
    }

    public async Task<PagedResult<OrderListDto>> GetOrdersAsync(int pageIndex, int pageSize, int? customerId = null, string? status = null)
    {
        var query = _context.Orders
            .Include(o => o.Customer).ThenInclude(c => c.User)
            .Include(o => o.Items)
            .AsQueryable();

        if (customerId.HasValue)
            query = query.Where(o => o.CustomerId == customerId);

        if (!string.IsNullOrEmpty(status) && Enum.TryParse<Domain.Enums.OrderStatus>(status, true, out var orderStatus))
            query = query.Where(o => o.Status == orderStatus);

        var totalCount = await query.CountAsync();
        var orders = await query
            .OrderByDescending(o => o.OrderDate)
            .Skip(pageIndex * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResult<OrderListDto>(
            orders.Select(o => new OrderListDto
            {
                Id = o.Id,
                OrderNumber = o.OrderNumber,
                CustomerName = $"{o.Customer.User.FirstName} {o.Customer.User.LastName}",
                Status = o.Status.ToString(),
                OrderDate = o.OrderDate,
                TotalAmount = o.TotalAmount,
                PaymentStatus = o.PaymentStatus.ToString(),
                ItemCount = o.Items.Count
            }).ToList(),
            totalCount, pageIndex, pageSize);
    }

    public async Task<OrderDto?> GetOrderByIdAsync(int id)
    {
        var order = await _context.Orders
            .Include(o => o.Customer).ThenInclude(c => c.User)
            .Include(o => o.Items)
            .Include(o => o.BillingAddress)
            .Include(o => o.ShippingAddress)
            .FirstOrDefaultAsync(o => o.Id == id);

        return order == null ? null : MapOrderToDto(order);
    }

    public async Task<OrderDto?> GetOrderByNumberAsync(string orderNumber)
    {
        var order = await _context.Orders
            .Include(o => o.Customer).ThenInclude(c => c.User)
            .Include(o => o.Items)
            .Include(o => o.BillingAddress)
            .Include(o => o.ShippingAddress)
            .FirstOrDefaultAsync(o => o.OrderNumber == orderNumber);

        return order == null ? null : MapOrderToDto(order);
    }

    public async Task<OrderDto> CreateOrderAsync(int? customerId, CheckoutRequest request)
    {
        var cart = await _cartService.GetCartAsync(customerId);
        if (cart == null || !cart.Items.Any())
            throw new BadRequestException("Cart is empty");

        var customer = await _context.Customers
            .Include(c => c.User)
            .FirstOrDefaultAsync(c => c.UserId == customerId);

        if (customer == null)
            throw new NotFoundException("Customer not found");

        var shippingAddress = await _context.Addresses.FindAsync(request.ShippingAddressId)
            ?? throw new NotFoundException("Shipping address not found");

        var order = new Domain.Entities.Order
        {
            OrderNumber = $"ORD-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..8].ToUpper()}",
            CustomerId = customer.Id,
            UserId = customerId,
            ShippingAddressId = request.ShippingAddressId,
            BillingAddressId = request.BillingAddressId ?? request.ShippingAddressId,
            Status = Domain.Enums.OrderStatus.Pending,
            OrderDate = DateTime.UtcNow,
            SubTotal = cart.SubTotal,
            ShippingAmount = cart.ShippingAmount,
            TaxAmount = cart.TaxAmount,
            DiscountAmount = cart.DiscountAmount,
            TotalAmount = cart.Total,
            PaymentMethod = Enum.Parse<Domain.Enums.PaymentMethod>(request.PaymentMethod),
            PaymentStatus = Domain.Enums.PaymentStatus.Pending,
            CustomerNote = request.CustomerNote,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = customerId?.ToString() ?? "guest"
        };

        foreach (var item in cart.Items)
        {
            order.Items.Add(new Domain.Entities.OrderItem
            {
                ProductId = item.ProductId,
                ProductName = item.ProductName,
                SKU = (await _context.Products.FindAsync(item.ProductId))?.SKU,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice,
                TotalPrice = item.TotalPrice,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = customerId?.ToString() ?? "guest"
            });
        }

        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        return (await GetOrderByIdAsync(order.Id))!;
    }

    public async Task<OrderDto> UpdateOrderStatusAsync(int orderId, UpdateOrderStatusRequest request)
    {
        var order = await _context.Orders.FindAsync(orderId)
            ?? throw new NotFoundException("Order not found");

        order.Status = Enum.Parse<Domain.Enums.OrderStatus>(request.Status);
        order.InternalNote = request.Notes;
        order.UpdatedAt = DateTime.UtcNow;

        if (order.Status == Domain.Enums.OrderStatus.Confirmed)
            order.OrderConfirmedDate = DateTime.UtcNow;
        else if (order.Status == Domain.Enums.OrderStatus.Shipped)
            order.ShippedDate = DateTime.UtcNow;
        else if (order.Status == Domain.Enums.OrderStatus.Delivered)
            order.DeliveredDate = DateTime.UtcNow;
        else if (order.Status == Domain.Enums.OrderStatus.Cancelled)
            order.CancellationDate = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return (await GetOrderByIdAsync(orderId))!;
    }

    public async Task<bool> CancelOrderAsync(int orderId, string reason)
    {
        var order = await _context.Orders.FindAsync(orderId)
            ?? throw new NotFoundException("Order not found");

        if (order.Status != Domain.Enums.OrderStatus.Pending && order.Status != Domain.Enums.OrderStatus.Confirmed)
            throw new BadRequestException("Only pending or confirmed orders can be cancelled");

        order.Status = Domain.Enums.OrderStatus.Cancelled;
        order.CancellationReason = reason;
        order.CancellationDate = DateTime.UtcNow;
        order.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<OrderSummary> GetOrderSummaryAsync(int? customerId = null)
    {
        var query = _context.Orders.AsQueryable();
        if (customerId.HasValue)
            query = query.Where(o => o.CustomerId == customerId);

        return new OrderSummary
        {
            TotalOrders = await query.CountAsync(),
            TotalRevenue = await query.Where(o => o.PaymentStatus == Domain.Enums.PaymentStatus.Paid)
                .SumAsync(o => o.TotalAmount),
            PendingOrders = await query.CountAsync(o => o.Status == Domain.Enums.OrderStatus.Pending),
            ProcessingOrders = await query.CountAsync(o => o.Status == Domain.Enums.OrderStatus.Processing),
            CompletedOrders = await query.CountAsync(o => o.Status == Domain.Enums.OrderStatus.Delivered),
            CancelledOrders = await query.CountAsync(o => o.Status == Domain.Enums.OrderStatus.Cancelled)
        };
    }

    private OrderDto MapOrderToDto(Domain.Entities.Order order)
    {
        return new OrderDto
        {
            Id = order.Id,
            OrderNumber = order.OrderNumber,
            CustomerId = order.CustomerId,
            CustomerName = $"{order.Customer.User.FirstName} {order.Customer.User.LastName}",
            CustomerEmail = order.Customer.User.Email,
            Status = order.Status.ToString(),
            OrderDate = order.OrderDate,
            OrderConfirmedDate = order.OrderConfirmedDate,
            ShippedDate = order.ShippedDate,
            DeliveredDate = order.DeliveredDate,
            SubTotal = order.SubTotal,
            ShippingAmount = order.ShippingAmount,
            TaxAmount = order.TaxAmount,
            DiscountAmount = order.DiscountAmount,
            TotalAmount = order.TotalAmount,
            PaidAmount = order.PaidAmount,
            RefundedAmount = order.RefundedAmount,
            PaymentMethod = order.PaymentMethod.ToString(),
            PaymentStatus = order.PaymentStatus.ToString(),
            BillingAddress = new Application.DTOs.Orders.AddressDto
            {
                Id = order.BillingAddress.Id,
                FullName = order.BillingAddress.FullName,
                PhoneNumber = order.BillingAddress.PhoneNumber,
                AddressLine1 = order.BillingAddress.AddressLine1,
                AddressLine2 = order.BillingAddress.AddressLine2,
                City = order.BillingAddress.City,
                State = order.BillingAddress.State,
                PostalCode = order.BillingAddress.PostalCode,
                Country = order.BillingAddress.Country
            },
            ShippingAddress = new Application.DTOs.Orders.AddressDto
            {
                Id = order.ShippingAddress.Id,
                FullName = order.ShippingAddress.FullName,
                PhoneNumber = order.ShippingAddress.PhoneNumber,
                AddressLine1 = order.ShippingAddress.AddressLine1,
                AddressLine2 = order.ShippingAddress.AddressLine2,
                City = order.ShippingAddress.City,
                State = order.ShippingAddress.State,
                PostalCode = order.ShippingAddress.PostalCode,
                Country = order.ShippingAddress.Country
            },
            Items = order.Items.Select(i => new OrderItemDto
            {
                Id = i.Id,
                ProductId = i.ProductId,
                ProductName = i.ProductName,
                VariantName = i.VariantName,
                SKU = i.SKU,
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice,
                DiscountAmount = i.DiscountAmount,
                TotalPrice = i.TotalPrice
            }).ToList()
        };
    }
}
