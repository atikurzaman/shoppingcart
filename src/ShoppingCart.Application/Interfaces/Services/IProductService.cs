using ShoppingCart.Application.DTOs.Products;
using ShoppingCart.Shared.Common;

namespace ShoppingCart.Application.Interfaces.Services;

public interface IProductService
{
    Task<PagedResult<ProductListDto>> GetProductsAsync(int pageIndex, int pageSize, string? search, int? categoryId, int? brandId, string? sortBy, bool? isFeatured, bool? isBestSeller = null, bool? isNewArrival = null);
    Task<ProductDto?> GetProductByIdAsync(int id);
    Task<ProductDto?> GetProductBySlugAsync(string slug);
    Task<ProductDto> CreateProductAsync(CreateProductRequest request);
    Task<ProductDto> UpdateProductAsync(UpdateProductRequest request);
    Task<bool> DeleteProductAsync(int id);
    Task<bool> ToggleFeaturedAsync(int id);
    Task<List<ProductListDto>> GetFeaturedProductsAsync(int count = 10);
    Task<List<ProductListDto>> GetBestSellersAsync(int count = 10);
    Task<List<ProductListDto>> GetNewArrivalsAsync(int count = 10);
    Task<List<ProductListDto>> GetRelatedProductsAsync(int productId, int count = 8);
    Task<List<ProductListDto>> SearchProductsAsync(string query, int count = 20);
    Task IncrementViewCountAsync(int productId);
}
