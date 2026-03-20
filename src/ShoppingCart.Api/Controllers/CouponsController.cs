using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShoppingCart.Application.DTOs.Coupons;
using ShoppingCart.Application.Interfaces.Services;
using ShoppingCart.Shared.Common;

namespace ShoppingCart.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CouponsController : ControllerBase
{
    private readonly ICouponService _couponService;

    public CouponsController(ICouponService couponService)
    {
        _couponService = couponService;
    }

    private int? GetUserId()
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
        if (userIdClaim != null && int.TryParse(userIdClaim.Value, out var userId))
        {
            return userId;
        }
        return null;
    }

    [HttpPost("validate")]
    public async Task<ActionResult<ApiResponse<ValidateCouponResponse>>> ValidateCoupon([FromBody] ValidateCouponRequest request)
    {
        var userId = GetUserId();
        var result = await _couponService.ValidateCouponAsync(userId, request);
        return Ok(ApiResponse<ValidateCouponResponse>.Success(result));
    }

    [HttpGet("{code}")]
    public async Task<ActionResult<ApiResponse<CouponDto>>> GetCouponByCode(string code)
    {
        var coupon = await _couponService.GetCouponByCodeAsync(code);
        if (coupon == null)
            return NotFound(ApiResponse<CouponDto>.NotFound("Coupon not found"));

        return Ok(ApiResponse<CouponDto>.Success(coupon));
    }

    // Admin endpoints
    [HttpGet("admin/all")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<PagedResult<CouponListDto>>>> GetAllCoupons(
        [FromQuery] int pageIndex = 0,
        [FromQuery] int pageSize = 20,
        [FromQuery] bool? active = null)
    {
        var coupons = await _couponService.GetAllCouponsAsync(pageIndex, pageSize, active);
        return Ok(ApiResponse<PagedResult<CouponListDto>>.Success(coupons));
    }

    [HttpGet("admin/{id}")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<CouponDto>>> GetCoupon(int id)
    {
        var coupon = await _couponService.GetCouponByIdAsync(id);
        if (coupon == null)
            return NotFound(ApiResponse<CouponDto>.NotFound("Coupon not found"));

        return Ok(ApiResponse<CouponDto>.Success(coupon));
    }

    [HttpPost("admin")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<CouponDto>>> CreateCoupon([FromBody] CreateCouponRequest request)
    {
        var coupon = await _couponService.CreateCouponAsync(request);
        return CreatedAtAction(nameof(GetCoupon), new { id = coupon.Id },
            ApiResponse<CouponDto>.Created(coupon, "Coupon created successfully"));
    }

    [HttpPut("admin")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<CouponDto>>> UpdateCoupon([FromBody] UpdateCouponRequest request)
    {
        var coupon = await _couponService.UpdateCouponAsync(request);
        return Ok(ApiResponse<CouponDto>.Success(coupon, "Coupon updated successfully"));
    }

    [HttpDelete("admin/{id}")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse>> DeleteCoupon(int id)
    {
        var result = await _couponService.DeleteCouponAsync(id);
        if (!result)
            return NotFound(ApiResponse.Fail("Coupon not found"));

        return Ok(ApiResponse.Success("Coupon deleted successfully"));
    }

    [HttpPut("admin/{id}/toggle")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse>> ToggleCoupon(int id)
    {
        var result = await _couponService.ToggleActiveAsync(id);
        if (!result)
            return NotFound(ApiResponse.Fail("Coupon not found"));

        return Ok(ApiResponse.Success("Coupon status toggled"));
    }
}
