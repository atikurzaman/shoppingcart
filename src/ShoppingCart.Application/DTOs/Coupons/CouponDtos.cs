namespace ShoppingCart.Application.DTOs.Coupons;

public class CouponDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string CouponType { get; set; } = string.Empty;
    public decimal DiscountValue { get; set; }
    public decimal? MinimumOrderAmount { get; set; }
    public decimal? MaximumDiscountAmount { get; set; }
    public int? MaximumUsageCount { get; set; }
    public int? MaximumUsagePerUser { get; set; }
    public int CurrentUsageCount { get; set; }
    public int? ApplicableProductId { get; set; }
    public int? ApplicableCategoryId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsActive { get; set; }
    public bool IsFirstOrderOnly { get; set; }
}

public class CouponListDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string CouponType { get; set; } = string.Empty;
    public decimal DiscountValue { get; set; }
    public int CurrentUsageCount { get; set; }
    public int? MaximumUsageCount { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsActive { get; set; }
}

public class CreateCouponRequest
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string CouponType { get; set; } = string.Empty;
    public decimal DiscountValue { get; set; }
    public decimal? MinimumOrderAmount { get; set; }
    public decimal? MaximumDiscountAmount { get; set; }
    public int? MaximumUsageCount { get; set; }
    public int? MaximumUsagePerUser { get; set; }
    public int? ApplicableProductId { get; set; }
    public int? ApplicableCategoryId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsFirstOrderOnly { get; set; }
}

public class UpdateCouponRequest : CreateCouponRequest
{
    public int Id { get; set; }
    public bool IsActive { get; set; }
}

public class ValidateCouponRequest
{
    public string Code { get; set; } = string.Empty;
    public decimal OrderTotal { get; set; }
    public int? ProductId { get; set; }
    public int? CategoryId { get; set; }
}

public class ValidateCouponResponse
{
    public bool IsValid { get; set; }
    public string? Message { get; set; }
    public CouponDto? Coupon { get; set; }
    public decimal DiscountAmount { get; set; }
}
