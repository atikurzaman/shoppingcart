using ShoppingCart.Application.DTOs.Brands;
using ShoppingCart.Shared.Common;

namespace ShoppingCart.Application.Interfaces.Services;

public interface IBrandService
{
    Task<PagedResult<BrandDto>> GetBrandsAsync(int pageIndex, int pageSize, string? search = null);
    Task<List<BrandListDto>> GetAllBrandsAsync();
    Task<List<BrandListDto>> GetFeaturedBrandsAsync();
    Task<BrandDto?> GetBrandByIdAsync(int id);
    Task<BrandDto?> GetBrandBySlugAsync(string slug);
    Task<BrandDto> CreateBrandAsync(CreateBrandRequest request);
    Task<BrandDto> UpdateBrandAsync(UpdateBrandRequest request);
    Task<bool> DeleteBrandAsync(int id);
    Task<bool> ToggleFeaturedAsync(int id);
}
