namespace ShoppingCart.Application.DTOs.Brands;

public class BrandDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? LogoUrl { get; set; }
    public string? Website { get; set; }
    public bool IsFeatured { get; set; }
    public bool IsActive { get; set; }
    public int ProductCount { get; set; }
}

public class BrandListDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? LogoUrl { get; set; }
    public bool IsFeatured { get; set; }
    public int ProductCount { get; set; }
}

public class CreateBrandRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? LogoUrl { get; set; }
    public string? Website { get; set; }
    public bool IsFeatured { get; set; }
}

public class UpdateBrandRequest : CreateBrandRequest
{
    public int Id { get; set; }
    public bool IsActive { get; set; } = true;
}
