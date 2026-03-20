using ShoppingCart.Application.DTOs.Cart;
using ShoppingCart.Application.DTOs.Orders;
using ShoppingCart.Shared.Common;

namespace ShoppingCart.Application.Interfaces.Services;

public interface ICartService
{
    Task<CartDto?> GetCartAsync(int? customerId = null, string? sessionId = null);
    Task<CartDto> AddToCartAsync(int? customerId, string? sessionId, AddToCartRequest request);
    Task<CartDto> UpdateCartItemAsync(int? customerId, string? sessionId, UpdateCartItemRequest request);
    Task<CartDto> RemoveCartItemAsync(int? customerId, string? sessionId, int cartItemId);
    Task<CartDto> ClearCartAsync(int? customerId, string? sessionId);
    Task<CartDto> ApplyCouponAsync(int? customerId, string? sessionId, ApplyCouponRequest request);
    Task<CartDto> RemoveCouponAsync(int? customerId, string? sessionId);
}

public interface IWishlistService
{
    Task<PagedResult<WishlistItemDto>> GetUserWishlistAsync(int userId, int pageIndex, int pageSize);
    Task<int> GetWishlistCountAsync(int userId);
    Task<bool> IsInWishlistAsync(int userId, int productId);
    Task<WishlistItemDto> AddToWishlistAsync(int userId, int productId);
    Task<bool> RemoveFromWishlistAsync(int userId, int productId);
}

public interface IOrderService
{
    Task<PagedResult<OrderListDto>> GetOrdersAsync(int pageIndex, int pageSize, int? customerId = null, string? status = null);
    Task<OrderDto?> GetOrderByIdAsync(int id);
    Task<OrderDto?> GetOrderByNumberAsync(string orderNumber);
    Task<OrderDto> CreateOrderAsync(int? customerId, CheckoutRequest request);
    Task<OrderDto> UpdateOrderStatusAsync(int orderId, UpdateOrderStatusRequest request);
    Task<bool> CancelOrderAsync(int orderId, string reason);
    Task<OrderSummary> GetOrderSummaryAsync(int? customerId = null);
}
