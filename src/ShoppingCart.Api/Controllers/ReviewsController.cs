using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShoppingCart.Application.DTOs.Reviews;
using ShoppingCart.Application.Interfaces.Services;
using ShoppingCart.Shared.Common;

namespace ShoppingCart.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReviewsController : ControllerBase
{
    private readonly IReviewService _reviewService;

    public ReviewsController(IReviewService reviewService)
    {
        _reviewService = reviewService;
    }

    private int? GetUserId()
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
        if (userIdClaim != null && int.TryParse(userIdClaim.Value, out var userId))
        {
            return userId;
        }
        return null;
    }

    [HttpGet("product/{productId}")]
    public async Task<ActionResult<ApiResponse<PagedResult<ReviewDto>>>> GetProductReviews(
        int productId,
        [FromQuery] int pageIndex = 0,
        [FromQuery] int pageSize = 10)
    {
        var reviews = await _reviewService.GetProductReviewsAsync(productId, pageIndex, pageSize);
        return Ok(ApiResponse<PagedResult<ReviewDto>>.Success(reviews));
    }

    [HttpGet("product/{productId}/summary")]
    public async Task<ActionResult<ApiResponse<ProductReviewSummaryDto>>> GetProductReviewSummary(int productId)
    {
        var summary = await _reviewService.GetProductReviewSummaryAsync(productId);
        if (summary == null)
            return NotFound(ApiResponse<ProductReviewSummaryDto>.NotFound("Product not found"));

        return Ok(ApiResponse<ProductReviewSummaryDto>.Success(summary));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<ReviewDto>>> GetReview(int id)
    {
        var review = await _reviewService.GetReviewByIdAsync(id);
        if (review == null)
            return NotFound(ApiResponse<ReviewDto>.NotFound("Review not found"));

        return Ok(ApiResponse<ReviewDto>.Success(review));
    }

    [HttpGet("my-reviews")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<List<ReviewDto>>>> GetMyReviews()
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        var reviews = await _reviewService.GetCustomerReviewsAsync(userId.Value);
        return Ok(ApiResponse<List<ReviewDto>>.Success(reviews));
    }

    [HttpPost]
    [Authorize]
    public async Task<ActionResult<ApiResponse<ReviewDto>>> CreateReview([FromBody] CreateReviewRequest request)
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        var review = await _reviewService.CreateReviewAsync(userId.Value, request);
        return CreatedAtAction(nameof(GetReview), new { id = review.Id },
            ApiResponse<ReviewDto>.Created(review, "Review submitted successfully"));
    }

    [HttpPut]
    [Authorize]
    public async Task<ActionResult<ApiResponse<ReviewDto>>> UpdateReview([FromBody] UpdateReviewRequest request)
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        var review = await _reviewService.UpdateReviewAsync(userId.Value, request);
        return Ok(ApiResponse<ReviewDto>.Success(review, "Review updated successfully"));
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<ActionResult<ApiResponse>> DeleteReview(int id)
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        var result = await _reviewService.DeleteReviewAsync(userId.Value, id);
        if (!result)
            return NotFound(ApiResponse.Fail("Review not found"));

        return Ok(ApiResponse.Success("Review deleted successfully"));
    }

    [HttpPost("helpful")]
    [Authorize]
    public async Task<ActionResult<ApiResponse>> MarkHelpful([FromBody] ReviewHelpfulnessRequest request)
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        await _reviewService.MarkHelpfulAsync(userId.Value, request);
        return Ok(ApiResponse.Success("Marked as helpful"));
    }

    // Admin endpoints
    [HttpGet("admin/all")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<PagedResult<ReviewListDto>>>> GetAllReviews(
        [FromQuery] int pageIndex = 0,
        [FromQuery] int pageSize = 20,
        [FromQuery] bool? approved = null)
    {
        var reviews = await _reviewService.GetAllReviewsAsync(pageIndex, pageSize, approved);
        return Ok(ApiResponse<PagedResult<ReviewListDto>>.Success(reviews));
    }

    [HttpPut("admin/{id}/approve")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse>> ApproveReview(int id)
    {
        var result = await _reviewService.ApproveReviewAsync(id);
        if (!result)
            return NotFound(ApiResponse.Fail("Review not found"));

        return Ok(ApiResponse.Success("Review approved"));
    }

    [HttpPut("admin/{id}/reject")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse>> RejectReview(int id)
    {
        var result = await _reviewService.RejectReviewAsync(id);
        if (!result)
            return NotFound(ApiResponse.Fail("Review not found"));

        return Ok(ApiResponse.Success("Review rejected"));
    }

    [HttpPut("admin/{id}/featured")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse>> ToggleFeatured(int id)
    {
        var result = await _reviewService.ToggleFeaturedAsync(id);
        if (!result)
            return NotFound(ApiResponse.Fail("Review not found"));

        return Ok(ApiResponse.Success("Featured status toggled"));
    }

    [HttpPut("admin/respond")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse>> RespondToReview([FromBody] AdminReviewResponseRequest request)
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        var result = await _reviewService.RespondToReviewAsync(userId.Value, request);
        if (!result)
            return NotFound(ApiResponse.Fail("Review not found"));

        return Ok(ApiResponse.Success("Response added"));
    }
}
