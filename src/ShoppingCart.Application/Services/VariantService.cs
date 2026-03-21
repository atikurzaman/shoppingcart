using Mapster;
using Microsoft.EntityFrameworkCore;
using ShoppingCart.Application.DTOs.Products;
using ShoppingCart.Application.Interfaces.Services;
using ShoppingCart.Domain.Entities;
using ShoppingCart.Persistence.Data;
using ShoppingCart.Shared.Exceptions;

namespace ShoppingCart.Application.Services;

public class VariantService : IVariantService
{
    private readonly AppDbContext _context;

    public VariantService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<ProductVariantDto>> GetVariantsByProductIdAsync(int productId)
    {
        var variants = await _context.ProductVariants
            .Include(v => v.AttributeValues)
                .ThenInclude(av => av.Attribute)
            .Where(v => v.ProductId == productId)
            .ToListAsync();

        return variants.Adapt<List<ProductVariantDto>>();
    }

    public async Task<ProductVariantDto?> GetVariantByIdAsync(int id)
    {
        var variant = await _context.ProductVariants
            .Include(v => v.AttributeValues)
                .ThenInclude(av => av.Attribute)
            .FirstOrDefaultAsync(v => v.Id == id);

        return variant?.Adapt<ProductVariantDto>();
    }

    public async Task<ProductVariantDto> CreateVariantAsync(CreateVariantRequest request)
    {
        var product = await _context.Products.FindAsync(request.ProductId);
        if (product == null)
        {
            throw new NotFoundException("Product not found");
        }

        var variant = new ProductVariant
        {
            ProductId = request.ProductId,
            Name = request.Name,
            SKU = request.SKU,
            Barcode = request.Barcode,
            Price = request.Price,
            CostPrice = request.CostPrice,
            StockQuantity = request.StockQuantity,
            IsActive = request.IsActive,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "system"
        };

        _context.ProductVariants.Add(variant);
        await _context.SaveChangesAsync();

        if (request.Attributes?.Any() == true)
        {
            foreach (var attr in request.Attributes)
            {
                var attributeValue = new ProductAttributeValue
                {
                    ProductId = request.ProductId,
                    VariantId = variant.Id,
                    AttributeId = attr.AttributeId,
                    Value = attr.Value,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = "system"
                };
                _context.ProductAttributeValues.Add(attributeValue);
            }
            await _context.SaveChangesAsync();
        }

        if (request.StockQuantity > 0)
        {
            var defaultWarehouse = await _context.Warehouses.FirstOrDefaultAsync(w => w.IsDefault);
            if (defaultWarehouse != null)
            {
                var stockItem = new StockItem
                {
                    ProductId = request.ProductId,
                    VariantId = variant.Id,
                    WarehouseId = defaultWarehouse.Id,
                    QuantityOnHand = request.StockQuantity,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = "system"
                };
                _context.StockItems.Add(stockItem);
                await _context.SaveChangesAsync();
            }
        }

        return (await GetVariantByIdAsync(variant.Id))!;
    }

    public async Task<ProductVariantDto> UpdateVariantAsync(int id, UpdateVariantRequest request)
    {
        var variant = await _context.ProductVariants
            .Include(v => v.AttributeValues)
            .FirstOrDefaultAsync(v => v.Id == id);

        if (variant == null)
        {
            throw new NotFoundException("Variant not found");
        }

        variant.Name = request.Name;
        variant.SKU = request.SKU;
        variant.Barcode = request.Barcode;
        variant.Price = request.Price;
        variant.CostPrice = request.CostPrice;
        variant.StockQuantity = request.StockQuantity;
        variant.IsActive = request.IsActive;
        variant.UpdatedAt = DateTime.UtcNow;
        variant.UpdatedBy = "system";

        if (request.Attributes?.Any() == true)
        {
            _context.ProductAttributeValues.RemoveRange(variant.AttributeValues);
            
            foreach (var attr in request.Attributes)
            {
                var attributeValue = new ProductAttributeValue
                {
                    ProductId = variant.ProductId,
                    VariantId = variant.Id,
                    AttributeId = attr.AttributeId,
                    Value = attr.Value,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = "system"
                };
                _context.ProductAttributeValues.Add(attributeValue);
            }
        }

        await _context.SaveChangesAsync();
        return (await GetVariantByIdAsync(id))!;
    }

    public async Task<bool> DeleteVariantAsync(int id)
    {
        var variant = await _context.ProductVariants.FindAsync(id);
        if (variant == null)
        {
            return false;
        }

        var attributeValues = await _context.ProductAttributeValues
            .Where(av => av.VariantId == id)
            .ToListAsync();
        _context.ProductAttributeValues.RemoveRange(attributeValues);

        variant.IsActive = false;
        variant.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        
        return true;
    }
}
