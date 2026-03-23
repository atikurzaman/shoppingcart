using Mapster;
using Microsoft.EntityFrameworkCore;
using ShoppingCart.Application.DTOs.Products;
using ShoppingCart.Application.Interfaces.Services;
using ShoppingCart.Domain.Entities;
using ShoppingCart.Persistence.Data;
using ShoppingCart.Shared.Common;
using ShoppingCart.Shared.Exceptions;

namespace ShoppingCart.Application.Services;

public class ProductService : IProductService
{
    private readonly AppDbContext _context;

    public ProductService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<ProductListDto>> GetProductsAsync(
        int pageIndex, int pageSize, string? search, int? categoryId, int? brandId, string? sortBy, bool? isFeatured, bool? isBestSeller = null, bool? isNewArrival = null)
    {
        var query = _context.Products
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .Include(p => p.Images)
            .Where(p => p.IsActive)
            .AsQueryable();

        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(p => p.Name.Contains(search) || 
                                     (p.SKU != null && p.SKU.Contains(search)));
        }

        if (categoryId.HasValue)
        {
            query = query.Where(p => p.CategoryId == categoryId.Value);
        }

        if (brandId.HasValue)
        {
            query = query.Where(p => p.BrandId == brandId.Value);
        }

        if (isFeatured.HasValue && isFeatured.Value)
        {
            query = query.Where(p => p.IsFeatured);
        }

        if (isBestSeller.HasValue && isBestSeller.Value)
        {
            query = query.Where(p => p.IsBestSeller);
        }

        if (isNewArrival.HasValue && isNewArrival.Value)
        {
            query = query.Where(p => p.IsNewArrival);
        }

        query = sortBy?.ToLower() switch
        {
            "price_asc" => query.OrderBy(p => p.Price),
            "price_desc" => query.OrderByDescending(p => p.Price),
            "name_asc" => query.OrderBy(p => p.Name),
            "name_desc" => query.OrderByDescending(p => p.Name),
            "newest" => query.OrderByDescending(p => p.CreatedAt),
            _ => query.OrderByDescending(p => p.IsFeatured).ThenByDescending(p => p.CreatedAt)
        };

        var totalCount = await query.CountAsync();
        var items = await query
            .Skip(pageIndex * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResult<ProductListDto>(
            items.Adapt<List<ProductListDto>>(),
            totalCount,
            pageIndex,
            pageSize);
    }

    public async Task<ProductDto?> GetProductByIdAsync(int id)
    {
        var product = await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .Include(p => p.Images.OrderBy(i => i.DisplayOrder))
            .Include(p => p.Variants.Where(v => v.IsActive))
            .Include(p => p.StockItems)
            .FirstOrDefaultAsync(p => p.Id == id);

        return product?.Adapt<ProductDto>();
    }

    public async Task<ProductDto?> GetProductBySlugAsync(string slug)
    {
        var product = await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .Include(p => p.Images.OrderBy(i => i.DisplayOrder))
            .Include(p => p.Variants.Where(v => v.IsActive))
            .Include(p => p.StockItems)
            .FirstOrDefaultAsync(p => p.Slug == slug && p.IsActive);

        return product?.Adapt<ProductDto>();
    }

    public async Task<ProductDto> CreateProductAsync(CreateProductRequest request)
    {
        var product = request.Adapt<Product>();
        product.Slug = GenerateUniqueSlug(request.Name);
        product.CreatedAt = DateTime.UtcNow;
        product.CreatedBy = "system";

        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        if (request.Images?.Any() == true)
        {
            foreach (var imageRequest in request.Images)
            {
                var image = imageRequest.Adapt<ProductImage>();
                image.ProductId = product.Id;
                image.CreatedAt = DateTime.UtcNow;
                image.CreatedBy = "system";
                _context.ProductImages.Add(image);
            }
            await _context.SaveChangesAsync();
        }

        return (await GetProductByIdAsync(product.Id))!;
    }

    public async Task<ProductDto> UpdateProductAsync(UpdateProductRequest request)
    {
        var product = await _context.Products
            .Include(p => p.Images)
            .FirstOrDefaultAsync(p => p.Id == request.Id);

        if (product == null)
        {
            throw new NotFoundException("Product not found");
        }

        product.Name = request.Name;
        product.SKU = request.SKU;
        product.Barcode = request.Barcode;
        product.ShortDescription = request.ShortDescription;
        product.Description = request.Description;
        product.Price = request.Price;
        product.OldPrice = request.OldPrice;
        product.CostPrice = request.CostPrice;
        product.CategoryId = request.CategoryId;
        product.BrandId = request.BrandId;
        product.SupplierId = request.SupplierId;
        product.IsFeatured = request.IsFeatured;
        product.IsBestSeller = request.IsBestSeller;
        product.IsNewArrival = request.IsNewArrival;
        product.MinimumStockLevel = request.MinimumStockLevel;
        product.ReorderLevel = request.ReorderLevel;
        product.Weight = request.Weight;
        product.Dimensions = request.Dimensions;
        product.IsActive = request.IsActive;
        product.UpdatedAt = DateTime.UtcNow;
        product.UpdatedBy = "system";

        await _context.SaveChangesAsync();
        return (await GetProductByIdAsync(product.Id))!;
    }

    public async Task<bool> DeleteProductAsync(int id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null)
        {
            return false;
        }

        product.IsDeleted = true;
        product.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ToggleFeaturedAsync(int id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null)
        {
            return false;
        }

        product.IsFeatured = !product.IsFeatured;
        product.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<List<ProductListDto>> GetFeaturedProductsAsync(int count = 10)
    {
        var products = await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .Include(p => p.Images)
            .Where(p => p.IsActive && p.IsFeatured)
            .OrderByDescending(p => p.CreatedAt)
            .Take(count)
            .ToListAsync();

        return products.Adapt<List<ProductListDto>>();
    }

    public async Task<List<ProductListDto>> GetBestSellersAsync(int count = 10)
    {
        var productIds = await _context.OrderItems
            .GroupBy(oi => oi.ProductId)
            .OrderByDescending(g => g.Sum(oi => oi.Quantity))
            .Take(count)
            .Select(g => g.Key)
            .ToListAsync();

        var products = await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .Include(p => p.Images)
            .Where(p => productIds.Contains(p.Id) && p.IsActive)
            .ToListAsync();

        return products.Adapt<List<ProductListDto>>();
    }

    public async Task<List<ProductListDto>> GetNewArrivalsAsync(int count = 10)
    {
        var products = await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .Include(p => p.Images)
            .Where(p => p.IsActive && p.IsNewArrival)
            .OrderByDescending(p => p.CreatedAt)
            .Take(count)
            .ToListAsync();

        return products.Adapt<List<ProductListDto>>();
    }

    public async Task<List<ProductListDto>> GetRelatedProductsAsync(int productId, int count = 8)
    {
        var product = await _context.Products.FindAsync(productId);
        if (product == null)
        {
            return new List<ProductListDto>();
        }

        var products = await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .Include(p => p.Images)
            .Where(p => p.Id != productId && 
                        p.CategoryId == product.CategoryId && 
                        p.IsActive)
            .OrderByDescending(p => p.IsFeatured)
            .ThenByDescending(p => p.CreatedAt)
            .Take(count)
            .ToListAsync();

        return products.Adapt<List<ProductListDto>>();
    }

    public async Task<List<ProductListDto>> SearchProductsAsync(string query, int count = 20)
    {
        var products = await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .Include(p => p.Images)
            .Where(p => p.IsActive && 
                        (p.Name.Contains(query) || 
                         (p.SKU != null && p.SKU.Contains(query))))
            .Take(count)
            .ToListAsync();

        return products.Adapt<List<ProductListDto>>();
    }

    public async Task IncrementViewCountAsync(int productId)
    {
        var product = await _context.Products.FindAsync(productId);
        if (product != null)
        {
            product.ViewCount++;
            await _context.SaveChangesAsync();
        }
    }

    private string GenerateUniqueSlug(string name)
    {
        var slug = name.ToLowerInvariant()
            .Replace(" ", "-")
            .Replace("'", "")
            .Replace("\"", "");

        var existingCount = _context.Products
            .Count(p => p.Slug.StartsWith(slug));

        return existingCount > 0 ? $"{slug}-{existingCount + 1}" : slug;
    }
}
