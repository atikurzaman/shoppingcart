using Microsoft.EntityFrameworkCore;
using ShoppingCart.Application.Interfaces.Services;
using ShoppingCart.Domain.Entities;
using ShoppingCart.Persistence.Data;

namespace ShoppingCart.Application.Services;

public class MarketingService : IMarketingService
{
    private readonly AppDbContext _context;

    public MarketingService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<FlashDeal>> GetActiveFlashDealsAsync()
    {
        var now = DateTime.UtcNow;
        return await _context.FlashDeals
            .Include(f => f.Products)
                .ThenInclude(p => p.Product)
            .Where(f => f.IsActive && f.StartDate <= now && f.EndDate >= now)
            .ToListAsync();
    }

    public async Task<FlashDeal?> GetFlashDealBySlugAsync(string slug)
    {
        return await _context.FlashDeals
            .Include(f => f.Products)
                .ThenInclude(p => p.Product)
            .FirstOrDefaultAsync(f => f.Slug == slug);
    }

    public async Task<FlashDeal> CreateFlashDealAsync(FlashDeal flashDeal)
    {
        _context.FlashDeals.Add(flashDeal);
        await _context.SaveChangesAsync();
        return flashDeal;
    }

    public async Task<FlashDeal> UpdateFlashDealAsync(FlashDeal flashDeal)
    {
        _context.FlashDeals.Update(flashDeal);
        await _context.SaveChangesAsync();
        return flashDeal;
    }

    public async Task<bool> DeleteFlashDealAsync(int id)
    {
        var flashDeal = await _context.FlashDeals.FindAsync(id);
        if (flashDeal == null) return false;

        _context.FlashDeals.Remove(flashDeal);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<List<FlashDeal>> GetAllFlashDealsAsync()
    {
        return await _context.FlashDeals
            .Include(f => f.Products)
            .OrderByDescending(f => f.CreatedAt)
            .ToListAsync();
    }

    public async Task<NewsletterSubscription> SubscribeAsync(string email)
    {
        var existing = await _context.NewsletterSubscriptions
            .FirstOrDefaultAsync(s => s.Email == email);

        if (existing != null)
        {
            if (!existing.IsActive)
            {
                existing.IsActive = true;
                existing.SubscribedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }
            return existing;
        }

        var subscription = new NewsletterSubscription
        {
            Email = email,
            IsActive = true,
            SubscribedAt = DateTime.UtcNow
        };

        _context.NewsletterSubscriptions.Add(subscription);
        await _context.SaveChangesAsync();
        return subscription;
    }

    public async Task<bool> UnsubscribeAsync(string email)
    {
        var existing = await _context.NewsletterSubscriptions
            .FirstOrDefaultAsync(s => s.Email == email);

        if (existing == null) return false;

        existing.IsActive = false;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<List<NewsletterSubscription>> GetSubscribersAsync()
    {
        return await _context.NewsletterSubscriptions
            .OrderByDescending(s => s.SubscribedAt)
            .ToListAsync();
    }

    public async Task<bool> IsSubscribedAsync(string email)
    {
        return await _context.NewsletterSubscriptions
            .AnyAsync(s => s.Email == email && s.IsActive);
    }
}
