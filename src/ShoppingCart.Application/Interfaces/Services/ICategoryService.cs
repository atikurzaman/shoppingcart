using ShoppingCart.Application.DTOs.Categories;
using ShoppingCart.Shared.Common;

namespace ShoppingCart.Application.Interfaces.Services;

public interface ICategoryService
{
    Task<PagedResult<CategoryDto>> GetCategoriesAsync(int pageIndex, int pageSize, string? search = null);
    Task<List<CategoryListDto>> GetAllCategoriesAsync();
    Task<List<CategoryDto>> GetFeaturedCategoriesAsync();
    Task<CategoryDto?> GetCategoryByIdAsync(int id);
    Task<CategoryDto?> GetCategoryBySlugAsync(string slug);
    Task<CategoryDto> CreateCategoryAsync(CreateCategoryRequest request);
    Task<CategoryDto> UpdateCategoryAsync(UpdateCategoryRequest request);
    Task<bool> DeleteCategoryAsync(int id);
    Task<bool> ToggleFeaturedAsync(int id);
    Task<bool> ReorderCategoriesAsync(List<(int Id, int DisplayOrder)> orders);
    Task<List<CategoryDto>> GetCategoryTreeAsync();
}
