using Microsoft.EntityFrameworkCore;
using ShoppingCart.Application.DTOs.Cart;
using ShoppingCart.Application.Interfaces.Services;
using ShoppingCart.Domain.Entities;
using ShoppingCart.Persistence.Data;
using ShoppingCart.Shared.Common;

namespace ShoppingCart.Application.Services;

public class WishlistService : IWishlistService
{
    private readonly AppDbContext _context;

    public WishlistService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<WishlistItemDto>> GetUserWishlistAsync(int userId, int pageIndex, int pageSize)
    {
        var customer = await _context.Customers.FirstOrDefaultAsync(c => c.UserId == userId);
        if (customer == null)
        {
            return new PagedResult<WishlistItemDto>(new List<WishlistItemDto>(), 0, pageIndex, pageSize);
        }

        var query = _context.Wishlists
            .Include(w => w.Items).ThenInclude(i => i.Product)
            .Where(w => w.CustomerId == customer.Id);

        var totalCount = await query.CountAsync();
        var items = await query
            .SelectMany(w => w.Items)
            .Include(wi => wi.Product)
            .OrderByDescending(wi => wi.CreatedAt)
            .Skip(pageIndex * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var result = items.Select(wi => new WishlistItemDto
        {
            Id = wi.Id,
            ProductId = wi.ProductId,
            ProductName = wi.Product.Name,
            Slug = wi.Product.Slug,
            Price = wi.Product.Price,
            OldPrice = wi.Product.OldPrice,
            ImageUrl = wi.Product.Images?.FirstOrDefault(i => i.IsMain)?.ImageUrl ?? wi.Product.Images?.FirstOrDefault()?.ImageUrl,
            StockQuantity = wi.Product.StockItems.Sum(si => si.QuantityOnHand - si.ReservedQuantity),
            IsInStock = wi.Product.StockItems.Sum(si => si.QuantityOnHand - si.ReservedQuantity) > 0,
            AddedAt = wi.CreatedAt
        }).ToList();

        return new PagedResult<WishlistItemDto>(result, totalCount, pageIndex, pageSize);
    }

    public async Task<int> GetWishlistCountAsync(int userId)
    {
        var customer = await _context.Customers.FirstOrDefaultAsync(c => c.UserId == userId);
        if (customer == null) return 0;

        return await _context.Wishlists
            .Where(w => w.CustomerId == customer.Id)
            .SelectMany(w => w.Items)
            .CountAsync();
    }

    public async Task<bool> IsInWishlistAsync(int userId, int productId)
    {
        var customer = await _context.Customers.FirstOrDefaultAsync(c => c.UserId == userId);
        if (customer == null) return false;

        return await _context.Wishlists
            .Where(w => w.CustomerId == customer.Id)
            .SelectMany(w => w.Items)
            .AnyAsync(wi => wi.ProductId == productId);
    }

    public async Task<WishlistItemDto> AddToWishlistAsync(int userId, int productId)
    {
        var customer = await _context.Customers.FirstOrDefaultAsync(c => c.UserId == userId);
        
        if (customer == null)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                throw new InvalidOperationException("User not found");
                
            customer = new Customer
            {
                UserId = userId,
                CompanyName = user.Email,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "system"
            };
            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();
        }

        var wishlist = await _context.Wishlists
            .Include(w => w.Items)
            .FirstOrDefaultAsync(w => w.CustomerId == customer.Id);

        if (wishlist == null)
        {
            wishlist = new Wishlist
            {
                CustomerId = customer.Id,
                UserId = userId,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = userId.ToString()
            };
            _context.Wishlists.Add(wishlist);
            await _context.SaveChangesAsync();
        }

        var existingItem = wishlist.Items.FirstOrDefault(i => i.ProductId == productId);
        if (existingItem != null)
        {
            throw new InvalidOperationException("Product already in wishlist");
        }

        var product = await _context.Products
            .Include(p => p.Images)
            .Include(p => p.StockItems)
            .FirstOrDefaultAsync(p => p.Id == productId)
            ?? throw new InvalidOperationException("Product not found");

        var item = new WishlistItem
        {
            WishlistId = wishlist.Id,
            ProductId = productId,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = userId.ToString()
        };

        _context.WishlistItems.Add(item);
        await _context.SaveChangesAsync();

        return new WishlistItemDto
        {
            Id = item.Id,
            ProductId = productId,
            ProductName = product.Name,
            Slug = product.Slug,
            Price = product.Price,
            OldPrice = product.OldPrice,
            ImageUrl = product.Images?.FirstOrDefault(i => i.IsMain)?.ImageUrl ?? product.Images?.FirstOrDefault()?.ImageUrl,
            StockQuantity = product.StockItems.Sum(si => si.QuantityOnHand - si.ReservedQuantity),
            IsInStock = product.StockItems.Sum(si => si.QuantityOnHand - si.ReservedQuantity) > 0,
            AddedAt = item.CreatedAt
        };
    }

    public async Task<bool> RemoveFromWishlistAsync(int userId, int productId)
    {
        var customer = await _context.Customers.FirstOrDefaultAsync(c => c.UserId == userId);
        if (customer == null) return false;

        var item = await _context.Wishlists
            .Where(w => w.CustomerId == customer.Id)
            .SelectMany(w => w.Items)
            .FirstOrDefaultAsync(wi => wi.ProductId == productId);

        if (item == null) return false;

        _context.WishlistItems.Remove(item);
        await _context.SaveChangesAsync();
        return true;
    }
}
