using ShoppingCart.Application.DTOs.Products;

namespace ShoppingCart.Application.Interfaces.Services;

public interface IVariantService
{
    Task<List<ProductVariantDto>> GetVariantsByProductIdAsync(int productId);
    Task<ProductVariantDto?> GetVariantByIdAsync(int id);
    Task<ProductVariantDto> CreateVariantAsync(CreateVariantRequest request);
    Task<ProductVariantDto> UpdateVariantAsync(int id, UpdateVariantRequest request);
    Task<bool> DeleteVariantAsync(int id);
}

public class CreateVariantRequest
{
    public int ProductId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? SKU { get; set; }
    public string? Barcode { get; set; }
    public decimal Price { get; set; }
    public decimal CostPrice { get; set; }
    public int StockQuantity { get; set; }
    public bool IsActive { get; set; } = true;
    public List<CreateVariantAttributeRequest> Attributes { get; set; } = new();
}

public class UpdateVariantRequest
{
    public string Name { get; set; } = string.Empty;
    public string? SKU { get; set; }
    public string? Barcode { get; set; }
    public decimal Price { get; set; }
    public decimal CostPrice { get; set; }
    public int StockQuantity { get; set; }
    public bool IsActive { get; set; } = true;
    public List<CreateVariantAttributeRequest> Attributes { get; set; } = new();
}

public class CreateVariantAttributeRequest
{
    public int AttributeId { get; set; }
    public string Value { get; set; } = string.Empty;
}
