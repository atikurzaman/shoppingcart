using ShoppingCart.Domain.Entities;
using ShoppingCart.Shared.Common;

namespace ShoppingCart.Application.Interfaces.Services;

public interface IMarketingService
{
    // Flash Deals
    Task<List<FlashDeal>> GetActiveFlashDealsAsync();
    Task<FlashDeal?> GetFlashDealBySlugAsync(string slug);
    Task<FlashDeal> CreateFlashDealAsync(FlashDeal flashDeal);
    Task<FlashDeal> UpdateFlashDealAsync(FlashDeal flashDeal);
    Task<bool> DeleteFlashDealAsync(int id);
    Task<List<FlashDeal>> GetAllFlashDealsAsync();

    // Newsletter
    Task<NewsletterSubscription> SubscribeAsync(string email);
    Task<bool> UnsubscribeAsync(string email);
    Task<List<NewsletterSubscription>> GetSubscribersAsync();
    Task<bool> IsSubscribedAsync(string email);
}
