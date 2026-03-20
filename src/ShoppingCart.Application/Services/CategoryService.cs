using Mapster;
using Microsoft.EntityFrameworkCore;
using ShoppingCart.Application.DTOs.Brands;
using ShoppingCart.Application.DTOs.Categories;
using ShoppingCart.Application.Interfaces.Services;
using ShoppingCart.Domain.Entities;
using ShoppingCart.Persistence.Data;
using ShoppingCart.Shared.Common;
using ShoppingCart.Shared.Exceptions;

namespace ShoppingCart.Application.Services;

public class CategoryService : ICategoryService
{
    private readonly AppDbContext _context;

    public CategoryService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<CategoryDto>> GetCategoriesAsync(int pageIndex, int pageSize, string? search = null)
    {
        var query = _context.Categories
            .Include(c => c.ParentCategory)
            .Include(c => c.Products)
            .Where(c => c.IsActive)
            .AsQueryable();

        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(c => c.Name.Contains(search));
        }

        var totalCount = await query.CountAsync();
        var items = await query
            .OrderBy(c => c.DisplayOrder)
            .ThenBy(c => c.Name)
            .Skip(pageIndex * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResult<CategoryDto>(
            items.Adapt<List<CategoryDto>>(),
            totalCount,
            pageIndex,
            pageSize);
    }

    public async Task<List<CategoryListDto>> GetAllCategoriesAsync()
    {
        var categories = await _context.Categories
            .Include(c => c.Products)
            .Where(c => c.IsActive)
            .OrderBy(c => c.DisplayOrder)
            .ToListAsync();

        return categories.Adapt<List<CategoryListDto>>();
    }

    public async Task<List<CategoryDto>> GetFeaturedCategoriesAsync()
    {
        var categories = await _context.Categories
            .Include(c => c.SubCategories)
            .Include(c => c.Products)
            .Where(c => c.IsActive && c.IsFeatured)
            .OrderBy(c => c.DisplayOrder)
            .Take(12)
            .ToListAsync();

        return categories.Adapt<List<CategoryDto>>();
    }

    public async Task<CategoryDto?> GetCategoryByIdAsync(int id)
    {
        var category = await _context.Categories
            .Include(c => c.ParentCategory)
            .Include(c => c.SubCategories)
            .Include(c => c.Products)
            .FirstOrDefaultAsync(c => c.Id == id);

        return category?.Adapt<CategoryDto>();
    }

    public async Task<CategoryDto?> GetCategoryBySlugAsync(string slug)
    {
        var category = await _context.Categories
            .Include(c => c.SubCategories)
            .Include(c => c.Products)
            .FirstOrDefaultAsync(c => c.Slug == slug && c.IsActive);

        return category?.Adapt<CategoryDto>();
    }

    public async Task<CategoryDto> CreateCategoryAsync(CreateCategoryRequest request)
    {
        var category = request.Adapt<Category>();
        category.Slug = GenerateUniqueSlug(request.Name);
        category.CreatedAt = DateTime.UtcNow;
        category.CreatedBy = "system";

        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        return (await GetCategoryByIdAsync(category.Id))!;
    }

    public async Task<CategoryDto> UpdateCategoryAsync(UpdateCategoryRequest request)
    {
        var category = await _context.Categories.FindAsync(request.Id);
        if (category == null)
        {
            throw new NotFoundException("Category not found");
        }

        category.Name = request.Name;
        category.Slug = GenerateUniqueSlug(request.Name);
        category.Description = request.Description;
        category.IconUrl = request.IconUrl;
        category.ImageUrl = request.ImageUrl;
        category.ParentCategoryId = request.ParentCategoryId;
        category.DisplayOrder = request.DisplayOrder;
        category.IsFeatured = request.IsFeatured;
        category.IsActive = request.IsActive;
        category.UpdatedAt = DateTime.UtcNow;
        category.UpdatedBy = "system";

        await _context.SaveChangesAsync();
        return (await GetCategoryByIdAsync(category.Id))!;
    }

    public async Task<bool> DeleteCategoryAsync(int id)
    {
        var category = await _context.Categories.FindAsync(id);
        if (category == null)
        {
            return false;
        }

        category.IsDeleted = true;
        category.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ToggleFeaturedAsync(int id)
    {
        var category = await _context.Categories.FindAsync(id);
        if (category == null)
        {
            return false;
        }

        category.IsFeatured = !category.IsFeatured;
        category.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ReorderCategoriesAsync(List<(int Id, int DisplayOrder)> orders)
    {
        foreach (var (id, displayOrder) in orders)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category != null)
            {
                category.DisplayOrder = displayOrder;
            }
        }

        await _context.SaveChangesAsync();
        return true;
    }

    private string GenerateUniqueSlug(string name)
    {
        var slug = name.ToLowerInvariant().Replace(" ", "-");
        var existingCount = _context.Categories.Count(c => c.Slug.StartsWith(slug));
        return existingCount > 0 ? $"{slug}-{existingCount + 1}" : slug;
    }
}

public class BrandService : IBrandService
{
    private readonly AppDbContext _context;

    public BrandService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<BrandDto>> GetBrandsAsync(int pageIndex, int pageSize, string? search = null)
    {
        var query = _context.Brands
            .Include(b => b.Products)
            .AsQueryable();

        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(b => b.Name.Contains(search));
        }

        var totalCount = await query.CountAsync();
        var items = await query
            .OrderBy(b => b.Name)
            .Skip(pageIndex * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResult<BrandDto>(items.Adapt<List<BrandDto>>(), totalCount, pageIndex, pageSize);
    }

    public async Task<List<BrandListDto>> GetAllBrandsAsync()
    {
        var brands = await _context.Brands
            .Include(b => b.Products)
            .OrderBy(b => b.Name)
            .ToListAsync();

        return brands.Adapt<List<BrandListDto>>();
    }

    public async Task<List<BrandListDto>> GetFeaturedBrandsAsync()
    {
        var brands = await _context.Brands
            .Include(b => b.Products)
            .Where(b => b.IsActive && b.IsFeatured)
            .OrderBy(b => b.Name)
            .Take(10)
            .ToListAsync();

        return brands.Adapt<List<BrandListDto>>();
    }

    public async Task<BrandDto?> GetBrandByIdAsync(int id)
    {
        var brand = await _context.Brands.Include(b => b.Products).FirstOrDefaultAsync(b => b.Id == id);
        return brand?.Adapt<BrandDto>();
    }

    public async Task<BrandDto?> GetBrandBySlugAsync(string slug)
    {
        var brand = await _context.Brands.Include(b => b.Products).FirstOrDefaultAsync(b => b.Slug == slug && b.IsActive);
        return brand?.Adapt<BrandDto>();
    }

    public async Task<BrandDto> CreateBrandAsync(CreateBrandRequest request)
    {
        var brand = request.Adapt<Brand>();
        brand.Slug = GenerateUniqueSlug(request.Name);
        brand.CreatedAt = DateTime.UtcNow;
        brand.CreatedBy = "system";
        _context.Brands.Add(brand);
        await _context.SaveChangesAsync();
        return (await GetBrandByIdAsync(brand.Id))!;
    }

    public async Task<BrandDto> UpdateBrandAsync(UpdateBrandRequest request)
    {
        var brand = await _context.Brands.FindAsync(request.Id) ?? throw new NotFoundException("Brand not found");
        brand.Name = request.Name;
        brand.Slug = GenerateUniqueSlug(request.Name);
        brand.Description = request.Description;
        brand.LogoUrl = request.LogoUrl;
        brand.Website = request.Website;
        brand.IsFeatured = request.IsFeatured;
        brand.IsActive = request.IsActive;
        brand.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return (await GetBrandByIdAsync(brand.Id))!;
    }

    public async Task<bool> DeleteBrandAsync(int id)
    {
        var brand = await _context.Brands.FindAsync(id);
        if (brand == null) return false;
        brand.IsDeleted = true;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ToggleFeaturedAsync(int id)
    {
        var brand = await _context.Brands.FindAsync(id);
        if (brand == null) return false;
        brand.IsFeatured = !brand.IsFeatured;
        await _context.SaveChangesAsync();
        return true;
    }

    private string GenerateUniqueSlug(string name)
    {
        var slug = name.ToLowerInvariant().Replace(" ", "-");
        var count = _context.Brands.Count(b => b.Slug.StartsWith(slug));
        return count > 0 ? $"{slug}-{count + 1}" : slug;
    }
}
