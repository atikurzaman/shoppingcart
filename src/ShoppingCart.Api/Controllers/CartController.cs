using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShoppingCart.Application.DTOs.Cart;
using ShoppingCart.Application.Interfaces.Services;
using ShoppingCart.Shared.Common;

namespace ShoppingCart.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CartController : ControllerBase
{
    private readonly ICartService _cartService;

    public CartController(ICartService cartService)
    {
        _cartService = cartService;
    }

    private (int? CustomerId, string? SessionId) GetIdentifiers()
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
        int? customerId = null;
        if (userIdClaim != null && int.TryParse(userIdClaim.Value, out var userId))
        {
            customerId = userId;
        }

        var sessionId = Request.Cookies["cart_session_id"];
        return (customerId, sessionId);
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<CartDto>>> GetCart()
    {
        var (customerId, sessionId) = GetIdentifiers();
        var cart = await _cartService.GetCartAsync(customerId, sessionId);
        
        if (cart == null)
        {
            return Ok(ApiResponse<CartDto>.Success(new CartDto()));
        }

        return Ok(ApiResponse<CartDto>.Success(cart));
    }

    [HttpPost("items")]
    public async Task<ActionResult<ApiResponse<CartDto>>> AddToCart([FromBody] AddToCartRequest request)
    {
        var (customerId, sessionId) = GetIdentifiers();
        var cart = await _cartService.AddToCartAsync(customerId, sessionId, request);
        return Ok(ApiResponse<CartDto>.Success(cart, "Item added to cart"));
    }

    [HttpPut("items/{itemId}")]
    public async Task<ActionResult<ApiResponse<CartDto>>> UpdateCartItem(int itemId, [FromBody] UpdateCartItemRequest request)
    {
        request.CartItemId = itemId;
        var (customerId, sessionId) = GetIdentifiers();
        var cart = await _cartService.UpdateCartItemAsync(customerId, sessionId, request);
        return Ok(ApiResponse<CartDto>.Success(cart, "Cart item updated"));
    }

    [HttpDelete("items/{itemId}")]
    public async Task<ActionResult<ApiResponse<CartDto>>> RemoveCartItem(int itemId)
    {
        var (customerId, sessionId) = GetIdentifiers();
        var cart = await _cartService.RemoveCartItemAsync(customerId, sessionId, itemId);
        return Ok(ApiResponse<CartDto>.Success(cart, "Item removed from cart"));
    }

    [HttpDelete]
    public async Task<ActionResult<ApiResponse<CartDto>>> ClearCart()
    {
        var (customerId, sessionId) = GetIdentifiers();
        var cart = await _cartService.ClearCartAsync(customerId, sessionId);
        return Ok(ApiResponse<CartDto>.Success(cart, "Cart cleared"));
    }

    [HttpPost("coupon")]
    public async Task<ActionResult<ApiResponse<CartDto>>> ApplyCoupon([FromBody] ApplyCouponRequest request)
    {
        var (customerId, sessionId) = GetIdentifiers();
        var cart = await _cartService.ApplyCouponAsync(customerId, sessionId, request);
        return Ok(ApiResponse<CartDto>.Success(cart, "Coupon applied"));
    }

    [HttpDelete("coupon")]
    public async Task<ActionResult<ApiResponse<CartDto>>> RemoveCoupon()
    {
        var (customerId, sessionId) = GetIdentifiers();
        var cart = await _cartService.RemoveCouponAsync(customerId, sessionId);
        return Ok(ApiResponse<CartDto>.Success(cart, "Coupon removed"));
    }
}
