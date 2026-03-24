using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShoppingCart.Application.Interfaces.Services;
using ShoppingCart.Domain.Entities;
using ShoppingCart.Shared.Common;

namespace ShoppingCart.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MarketingController : ControllerBase
{
    private readonly IMarketingService _marketingService;

    public MarketingController(IMarketingService marketingService)
    {
        _marketingService = marketingService;
    }

    // Flash Deals
    [HttpGet("flash-deals/active")]
    public async Task<ActionResult<ApiResponse<List<FlashDeal>>>> GetActiveFlashDeals()
    {
        var deals = await _marketingService.GetActiveFlashDealsAsync();
        return Ok(ApiResponse<List<FlashDeal>>.Success(deals));
    }

    [HttpGet("flash-deals")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<List<FlashDeal>>>> GetAllFlashDeals()
    {
        var deals = await _marketingService.GetAllFlashDealsAsync();
        return Ok(ApiResponse<List<FlashDeal>>.Success(deals));
    }

    [HttpPost("flash-deals")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<FlashDeal>>> CreateFlashDeal([FromBody] FlashDeal deal)
    {
        var created = await _marketingService.CreateFlashDealAsync(deal);
        return Ok(ApiResponse<FlashDeal>.Created(created, "Flash Deal created successfully"));
    }

    [HttpDelete("flash-deals/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse>> DeleteFlashDeal(int id)
    {
        var result = await _marketingService.DeleteFlashDealAsync(id);
        if (!result) return NotFound(ApiResponse.Fail("Flash Deal not found"));
        return Ok(ApiResponse.Success("Flash Deal deleted successfully"));
    }

    // Newsletters
    [HttpPost("newsletter/subscribe")]
    public async Task<ActionResult<ApiResponse<NewsletterSubscription>>> Subscribe([FromBody] string email)
    {
        var sub = await _marketingService.SubscribeAsync(email);
        return Ok(ApiResponse<NewsletterSubscription>.Created(sub, "Subscribed successfully"));
    }

    [HttpGet("subscribers")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<List<NewsletterSubscription>>>> GetSubscribers()
    {
        var subs = await _marketingService.GetSubscribersAsync();
        return Ok(ApiResponse<List<NewsletterSubscription>>.Success(subs));
    }
}
