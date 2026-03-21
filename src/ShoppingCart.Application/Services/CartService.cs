using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ShoppingCart.Application.DTOs.Cart;
using ShoppingCart.Application.DTOs.Orders;
using ShoppingCart.Application.Interfaces.Services;
using ShoppingCart.Domain.Entities;
using ShoppingCart.Persistence.Data;
using ShoppingCart.Shared.Exceptions;

namespace ShoppingCart.Application.Services;

public class CartService : ICartService
{
    private readonly AppDbContext _context;
    private readonly ILogger<CartService> _logger;

    public CartService(AppDbContext context, ILogger<CartService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<CartDto?> GetCartAsync(int? customerId = null, string? sessionId = null)
    {
        int? userId = customerId;
        int? actualCustomerId = null;
        if (userId.HasValue)
        {
            var customer = await _context.Customers.FirstOrDefaultAsync(c => c.UserId == userId.Value);
            actualCustomerId = customer?.Id;
        }

        var query = _context.Carts
            .Include(c => c.Items)
            .ThenInclude(ci => ci.Product)
            .ThenInclude(p => p.Images)
            .Include(c => c.Items)
            .ThenInclude(ci => ci.Product)
            .ThenInclude(p => p.StockItems)
            .Include(c => c.AppliedCoupon)
            .AsQueryable();

        if (actualCustomerId.HasValue)
            query = query.Where(c => c.CustomerId == actualCustomerId);
        else if (!string.IsNullOrEmpty(sessionId))
            query = query.Where(c => c.SessionId == sessionId);
        else
            return null;

        var cart = await query.FirstOrDefaultAsync();
        return cart == null ? null : CalculateCartTotals(cart);
    }

    public async Task<CartDto> AddToCartAsync(int? customerId, string? sessionId, AddToCartRequest request)
    {
        int? userId = customerId;
        _logger.LogInformation("AddToCart called - CustomerId: {CustomerId}, ProductId: {ProductId}, Quantity: {Quantity}", customerId, request.ProductId, request.Quantity);
        
        var cart = await GetOrCreateCartAsync(userId, sessionId);
        _logger.LogInformation("Cart retrieved/created - CartId: {CartId}", cart.Id);
        
        var product = await _context.Products
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(p => p.Id == request.ProductId && !p.IsDeleted && p.IsActive);
        
        if (product == null)
        {
            _logger.LogWarning("Product not found: {ProductId}", request.ProductId);
            throw new NotFoundException("Product not found");
        }
        
        _logger.LogInformation("Product found: {ProductName}, Price: {Price}", product.Name, product.Price);

        var existingItem = cart.Items.FirstOrDefault(ci =>
            ci.ProductId == request.ProductId && ci.VariantId == request.VariantId);

        if (existingItem != null)
        {
            existingItem.Quantity += request.Quantity;
            existingItem.TotalPrice = existingItem.Quantity * existingItem.UnitPrice;
        }
        else
        {
            var cartItem = new CartItem
            {
                CartId = cart.Id,
                ProductId = request.ProductId,
                VariantId = request.VariantId,
                Quantity = request.Quantity,
                UnitPrice = product.Price,
                TotalPrice = request.Quantity * product.Price,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = customerId?.ToString() ?? "guest"
            };
            _context.CartItems.Add(cartItem);
        }

        await _context.SaveChangesAsync();
        var result = await GetCartAsync(customerId, sessionId);
        _logger.LogInformation("Cart updated successfully");
        return result!;
    }

    public async Task<CartDto> UpdateCartItemAsync(int? customerId, string? sessionId, UpdateCartItemRequest request)
    {
        var cartItem = await _context.CartItems.FindAsync(request.CartItemId)
            ?? throw new NotFoundException("Cart item not found");

        cartItem.Quantity = request.Quantity;
        cartItem.TotalPrice = cartItem.UnitPrice * request.Quantity;
        await _context.SaveChangesAsync();

        return (await GetCartAsync(customerId, sessionId))!;
    }

    public async Task<CartDto> RemoveCartItemAsync(int? customerId, string? sessionId, int cartItemId)
    {
        var cartItem = await _context.CartItems.FindAsync(cartItemId)
            ?? throw new NotFoundException("Cart item not found");

        _context.CartItems.Remove(cartItem);
        await _context.SaveChangesAsync();

        return (await GetCartAsync(customerId, sessionId))!;
    }

    public async Task<CartDto> ClearCartAsync(int? customerId, string? sessionId)
    {
        int? userId = customerId;
        var cart = await GetOrCreateCartAsync(userId, sessionId);
        _context.CartItems.RemoveRange(cart.Items);
        await _context.SaveChangesAsync();
        return (await GetCartAsync(customerId, sessionId))!;
    }

    public async Task<CartDto> ApplyCouponAsync(int? customerId, string? sessionId, ApplyCouponRequest request)
    {
        int? userId = customerId;
        var cart = await GetOrCreateCartAsync(userId, sessionId);
        var coupon = await _context.Coupons.FirstOrDefaultAsync(c =>
            c.Code == request.CouponCode && c.IsActive &&
            c.StartDate <= DateTime.UtcNow && c.EndDate >= DateTime.UtcNow);

        if (coupon == null)
            throw new BadRequestException("Invalid or expired coupon");

        if (coupon.MinimumOrderAmount.HasValue && cart.SubTotal < coupon.MinimumOrderAmount.Value)
            throw new BadRequestException($"Minimum order amount is {coupon.MinimumOrderAmount}");

        cart.AppliedCouponId = coupon.Id;
        cart.CouponCode = coupon.Code;
        await _context.SaveChangesAsync();

        return (await GetCartAsync(customerId, sessionId))!;
    }

    public async Task<CartDto> RemoveCouponAsync(int? customerId, string? sessionId)
    {
        var cart = await GetOrCreateCartAsync(customerId, sessionId);
        cart.AppliedCouponId = null;
        cart.CouponCode = null;
        await _context.SaveChangesAsync();
        return (await GetCartAsync(customerId, sessionId))!;
    }

    private async Task<Cart> GetOrCreateCartAsync(int? userId, string? sessionId)
    {
        int? customerId = null;
        if (userId.HasValue)
        {
            var customer = await _context.Customers.FirstOrDefaultAsync(c => c.UserId == userId.Value);
            customerId = customer?.Id;
        }

        var query = _context.Carts.AsQueryable();
        if (customerId.HasValue)
            query = query.Where(c => c.CustomerId == customerId);
        else if (!string.IsNullOrEmpty(sessionId))
            query = query.Where(c => c.SessionId == sessionId);

        var cart = await query.FirstOrDefaultAsync();
        if (cart == null)
        {
            cart = new Cart
            {
                CustomerId = customerId,
                UserId = userId,
                SessionId = sessionId,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = userId?.ToString() ?? "guest"
            };
            _context.Carts.Add(cart);
            await _context.SaveChangesAsync();
        }
        return cart;
    }

    private CartDto CalculateCartTotals(Cart cart)
    {
        var dto = new CartDto
        {
            Id = cart.Id,
            CustomerId = cart.CustomerId,
            SessionId = cart.SessionId,
            SubTotal = cart.Items.Sum(i => i.TotalPrice),
            Items = cart.Items.Select(i => new CartItemDto
            {
                Id = i.Id,
                ProductId = i.ProductId,
                ProductName = i.Product.Name,
                Slug = i.Product.Slug,
                VariantId = i.VariantId,
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice,
                TotalPrice = i.TotalPrice,
                ImageUrl = i.Product.Images.FirstOrDefault()?.ImageUrl,
                StockQuantity = i.Product.StockItems.Sum(s => s.QuantityOnHand - s.ReservedQuantity),
                IsInStock = i.Product.StockItems.Sum(s => s.QuantityOnHand - s.ReservedQuantity) > 0
            }).ToList()
        };

        dto.TaxAmount = dto.SubTotal * 0.15m;
        dto.DiscountAmount = 0;
        if (cart.AppliedCoupon != null)
        {
            if (cart.AppliedCoupon.CouponType == Domain.Enums.CouponType.FixedAmount)
                dto.DiscountAmount = cart.AppliedCoupon.DiscountValue;
            else if (cart.AppliedCoupon.CouponType == Domain.Enums.CouponType.Percentage)
                dto.DiscountAmount = Math.Min(dto.SubTotal * (cart.AppliedCoupon.DiscountValue / 100),
                    cart.AppliedCoupon.MaximumDiscountAmount ?? decimal.MaxValue);
        }

        dto.Total = dto.SubTotal + dto.TaxAmount - dto.DiscountAmount;
        return dto;
    }
}
