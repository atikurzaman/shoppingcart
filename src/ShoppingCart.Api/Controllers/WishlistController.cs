using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShoppingCart.Application.DTOs.Cart;
using ShoppingCart.Application.Interfaces.Services;
using ShoppingCart.Shared.Common;

namespace ShoppingCart.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class WishlistController : ControllerBase
{
    private readonly IWishlistService _wishlistService;

    public WishlistController(IWishlistService wishlistService)
    {
        _wishlistService = wishlistService;
    }

    private int GetUserId()
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
        return int.TryParse(userIdClaim?.Value, out var userId) ? userId : 0;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<WishlistItemDto>>>> GetWishlist(
        [FromQuery] int pageIndex = 0,
        [FromQuery] int pageSize = 20)
    {
        var userId = GetUserId();
        if (userId == 0)
        {
            return Unauthorized();
        }

        var wishlist = await _wishlistService.GetUserWishlistAsync(userId, pageIndex, pageSize);
        return Ok(ApiResponse<PagedResult<WishlistItemDto>>.Success(wishlist));
    }

    [HttpGet("count")]
    public async Task<ActionResult<ApiResponse<int>>> GetWishlistCount()
    {
        var userId = GetUserId();
        if (userId == 0)
        {
            return Unauthorized();
        }

        var count = await _wishlistService.GetWishlistCountAsync(userId);
        return Ok(ApiResponse<int>.Success(count));
    }

    [HttpGet("check/{productId}")]
    public async Task<ActionResult<ApiResponse<bool>>> CheckInWishlist(int productId)
    {
        var userId = GetUserId();
        if (userId == 0)
        {
            return Unauthorized();
        }

        var isInWishlist = await _wishlistService.IsInWishlistAsync(userId, productId);
        return Ok(ApiResponse<bool>.Success(isInWishlist));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<WishlistItemDto>>> AddToWishlist([FromBody] AddToWishlistRequest request)
    {
        var userId = GetUserId();
        if (userId == 0)
        {
            return Unauthorized();
        }

        var item = await _wishlistService.AddToWishlistAsync(userId, request.ProductId);
        return Ok(ApiResponse<WishlistItemDto>.Success(item, "Added to wishlist"));
    }

    [HttpDelete("{productId}")]
    public async Task<ActionResult<ApiResponse>> RemoveFromWishlist(int productId)
    {
        var userId = GetUserId();
        if (userId == 0)
        {
            return Unauthorized();
        }

        var result = await _wishlistService.RemoveFromWishlistAsync(userId, productId);
        if (!result)
        {
            return NotFound(ApiResponse.Fail("Item not found in wishlist"));
        }

        return Ok(ApiResponse.Success("Removed from wishlist"));
    }
}
