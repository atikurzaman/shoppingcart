using Microsoft.EntityFrameworkCore;
using ShoppingCart.Application.DTOs.Coupons;
using ShoppingCart.Application.Interfaces.Services;
using ShoppingCart.Domain.Entities;
using ShoppingCart.Domain.Enums;
using ShoppingCart.Persistence.Data;
using ShoppingCart.Shared.Common;
using ShoppingCart.Shared.Exceptions;

namespace ShoppingCart.Application.Services;

public class CouponService : ICouponService
{
    private readonly AppDbContext _context;

    public CouponService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ValidateCouponResponse> ValidateCouponAsync(int? userId, ValidateCouponRequest request)
    {
        var coupon = await _context.Coupons
            .FirstOrDefaultAsync(c => c.Code.ToLower() == request.Code.ToUpper());

        if (coupon == null)
        {
            return new ValidateCouponResponse
            {
                IsValid = false,
                Message = "Coupon not found"
            };
        }

        if (!coupon.IsActive)
        {
            return new ValidateCouponResponse
            {
                IsValid = false,
                Message = "This coupon is no longer active"
            };
        }

        if (DateTime.UtcNow < coupon.StartDate)
        {
            return new ValidateCouponResponse
            {
                IsValid = false,
                Message = "This coupon is not yet valid"
            };
        }

        if (DateTime.UtcNow > coupon.EndDate)
        {
            return new ValidateCouponResponse
            {
                IsValid = false,
                Message = "This coupon has expired"
            };
        }

        if (coupon.MaximumUsageCount.HasValue && coupon.CurrentUsageCount >= coupon.MaximumUsageCount.Value)
        {
            return new ValidateCouponResponse
            {
                IsValid = false,
                Message = "This coupon has reached its usage limit"
            };
        }

        if (coupon.MinimumOrderAmount.HasValue && request.OrderTotal < coupon.MinimumOrderAmount.Value)
        {
            return new ValidateCouponResponse
            {
                IsValid = false,
                Message = $"Minimum order amount of {coupon.MinimumOrderAmount:C} required"
            };
        }

        if (coupon.IsFirstOrderOnly && userId.HasValue)
        {
            var hasOrders = await _context.Orders.AnyAsync(o => o.Customer!.UserId == userId);
            if (hasOrders)
            {
                return new ValidateCouponResponse
                {
                    IsValid = false,
                    Message = "This coupon is only valid for first orders"
                };
            }
        }

        decimal discount = 0;
        switch (coupon.CouponType)
        {
            case CouponType.FixedAmount:
                discount = coupon.DiscountValue;
                break;
            case CouponType.Percentage:
                discount = request.OrderTotal * (coupon.DiscountValue / 100);
                if (coupon.MaximumDiscountAmount.HasValue)
                    discount = Math.Min(discount, coupon.MaximumDiscountAmount.Value);
                break;
        }

        discount = Math.Min(discount, request.OrderTotal);

        return new ValidateCouponResponse
        {
            IsValid = true,
            Message = "Coupon applied successfully",
            Coupon = MapToDto(coupon),
            DiscountAmount = discount
        };
    }

    public async Task<CouponDto?> GetCouponByCodeAsync(string code)
    {
        var coupon = await _context.Coupons.FirstOrDefaultAsync(c => c.Code.ToLower() == code.ToLower());
        return coupon == null ? null : MapToDto(coupon);
    }

    public async Task<PagedResult<CouponListDto>> GetAllCouponsAsync(int pageIndex, int pageSize, bool? active = null)
    {
        var query = _context.Coupons.AsQueryable();

        if (active.HasValue)
            query = query.Where(c => c.IsActive == active.Value);

        var totalCount = await query.CountAsync();
        var items = await query
            .OrderByDescending(c => c.CreatedAt)
            .Skip(pageIndex * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var result = items.Select(c => new CouponListDto
        {
            Id = c.Id,
            Code = c.Code,
            Name = c.Name,
            CouponType = c.CouponType.ToString(),
            DiscountValue = c.DiscountValue,
            CurrentUsageCount = c.CurrentUsageCount,
            MaximumUsageCount = c.MaximumUsageCount,
            EndDate = c.EndDate,
            IsActive = c.IsActive
        }).ToList();

        return new PagedResult<CouponListDto>(result, totalCount, pageIndex, pageSize);
    }

    public async Task<CouponDto?> GetCouponByIdAsync(int id)
    {
        var coupon = await _context.Coupons.FindAsync(id);
        return coupon == null ? null : MapToDto(coupon);
    }

    public async Task<CouponDto> CreateCouponAsync(CreateCouponRequest request)
    {
        var existing = await _context.Coupons.FirstOrDefaultAsync(c => c.Code.ToLower() == request.Code.ToUpper());
        if (existing != null)
            throw new ConflictException("A coupon with this code already exists");

        var coupon = new Coupon
        {
            Code = request.Code.ToUpper(),
            Name = request.Name,
            Description = request.Description,
            CouponType = Enum.Parse<CouponType>(request.CouponType),
            DiscountValue = request.DiscountValue,
            MinimumOrderAmount = request.MinimumOrderAmount,
            MaximumDiscountAmount = request.MaximumDiscountAmount,
            MaximumUsageCount = request.MaximumUsageCount,
            MaximumUsagePerUser = request.MaximumUsagePerUser,
            ApplicableProductId = request.ApplicableProductId,
            ApplicableCategoryId = request.ApplicableCategoryId,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            IsFirstOrderOnly = request.IsFirstOrderOnly,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "system"
        };

        _context.Coupons.Add(coupon);
        await _context.SaveChangesAsync();

        return MapToDto(coupon);
    }

    public async Task<CouponDto> UpdateCouponAsync(UpdateCouponRequest request)
    {
        var coupon = await _context.Coupons.FindAsync(request.Id)
            ?? throw new NotFoundException("Coupon not found");

        coupon.Name = request.Name;
        coupon.Description = request.Description;
        coupon.CouponType = Enum.Parse<CouponType>(request.CouponType);
        coupon.DiscountValue = request.DiscountValue;
        coupon.MinimumOrderAmount = request.MinimumOrderAmount;
        coupon.MaximumDiscountAmount = request.MaximumDiscountAmount;
        coupon.MaximumUsageCount = request.MaximumUsageCount;
        coupon.MaximumUsagePerUser = request.MaximumUsagePerUser;
        coupon.ApplicableProductId = request.ApplicableProductId;
        coupon.ApplicableCategoryId = request.ApplicableCategoryId;
        coupon.StartDate = request.StartDate;
        coupon.EndDate = request.EndDate;
        coupon.IsFirstOrderOnly = request.IsFirstOrderOnly;
        coupon.IsActive = request.IsActive;
        coupon.UpdatedAt = DateTime.UtcNow;
        coupon.UpdatedBy = "system";

        await _context.SaveChangesAsync();

        return MapToDto(coupon);
    }

    public async Task<bool> DeleteCouponAsync(int id)
    {
        var coupon = await _context.Coupons.FindAsync(id);
        if (coupon == null) return false;

        coupon.IsActive = false;
        coupon.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ToggleActiveAsync(int id)
    {
        var coupon = await _context.Coupons.FindAsync(id);
        if (coupon == null) return false;

        coupon.IsActive = !coupon.IsActive;
        coupon.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    private static CouponDto MapToDto(Coupon coupon)
    {
        return new CouponDto
        {
            Id = coupon.Id,
            Code = coupon.Code,
            Name = coupon.Name,
            Description = coupon.Description,
            CouponType = coupon.CouponType.ToString(),
            DiscountValue = coupon.DiscountValue,
            MinimumOrderAmount = coupon.MinimumOrderAmount,
            MaximumDiscountAmount = coupon.MaximumDiscountAmount,
            MaximumUsageCount = coupon.MaximumUsageCount,
            MaximumUsagePerUser = coupon.MaximumUsagePerUser,
            CurrentUsageCount = coupon.CurrentUsageCount,
            ApplicableProductId = coupon.ApplicableProductId,
            ApplicableCategoryId = coupon.ApplicableCategoryId,
            StartDate = coupon.StartDate,
            EndDate = coupon.EndDate,
            IsActive = coupon.IsActive,
            IsFirstOrderOnly = coupon.IsFirstOrderOnly
        };
    }
}
