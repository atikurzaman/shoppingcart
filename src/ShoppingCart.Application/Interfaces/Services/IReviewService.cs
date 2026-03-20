using ShoppingCart.Application.DTOs.Reviews;
using ShoppingCart.Shared.Common;

namespace ShoppingCart.Application.Interfaces.Services;

public interface IReviewService
{
    Task<PagedResult<ReviewDto>> GetProductReviewsAsync(int productId, int pageIndex, int pageSize);
    Task<ProductReviewSummaryDto?> GetProductReviewSummaryAsync(int productId);
    Task<ReviewDto?> GetReviewByIdAsync(int id);
    Task<List<ReviewDto>> GetCustomerReviewsAsync(int customerId);
    Task<ReviewDto> CreateReviewAsync(int customerId, CreateReviewRequest request);
    Task<ReviewDto> UpdateReviewAsync(int customerId, UpdateReviewRequest request);
    Task<bool> DeleteReviewAsync(int customerId, int reviewId);
    Task<bool> MarkHelpfulAsync(int userId, ReviewHelpfulnessRequest request);
    
    // Admin methods
    Task<PagedResult<ReviewListDto>> GetAllReviewsAsync(int pageIndex, int pageSize, bool? approved = null);
    Task<bool> ApproveReviewAsync(int reviewId);
    Task<bool> RejectReviewAsync(int reviewId);
    Task<bool> ToggleFeaturedAsync(int reviewId);
    Task<bool> RespondToReviewAsync(int adminId, AdminReviewResponseRequest request);
}
