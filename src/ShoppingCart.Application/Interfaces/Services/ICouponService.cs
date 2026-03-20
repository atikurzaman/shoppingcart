using ShoppingCart.Application.DTOs.Coupons;
using ShoppingCart.Shared.Common;

namespace ShoppingCart.Application.Interfaces.Services;

public interface ICouponService
{
    Task<ValidateCouponResponse> ValidateCouponAsync(int? userId, ValidateCouponRequest request);
    Task<CouponDto?> GetCouponByCodeAsync(string code);
    
    // Admin
    Task<PagedResult<CouponListDto>> GetAllCouponsAsync(int pageIndex, int pageSize, bool? active = null);
    Task<CouponDto?> GetCouponByIdAsync(int id);
    Task<CouponDto> CreateCouponAsync(CreateCouponRequest request);
    Task<CouponDto> UpdateCouponAsync(UpdateCouponRequest request);
    Task<bool> DeleteCouponAsync(int id);
    Task<bool> ToggleActiveAsync(int id);
}
