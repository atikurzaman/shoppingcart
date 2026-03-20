using Microsoft.EntityFrameworkCore;
using ShoppingCart.Application.DTOs.Reviews;
using ShoppingCart.Application.Interfaces.Services;
using ShoppingCart.Domain.Entities;
using ShoppingCart.Persistence.Data;
using ShoppingCart.Shared.Common;
using ShoppingCart.Shared.Exceptions;

namespace ShoppingCart.Application.Services;

public class ReviewService : IReviewService
{
    private readonly AppDbContext _context;

    public ReviewService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<ReviewDto>> GetProductReviewsAsync(int productId, int pageIndex, int pageSize)
    {
        var query = _context.Reviews
            .Include(r => r.Customer).ThenInclude(c => c.User)
            .Include(r => r.Product)
            .Where(r => r.ProductId == productId && r.IsApproved)
            .AsQueryable();

        var totalCount = await query.CountAsync();
        var items = await query
            .OrderByDescending(r => r.CreatedAt)
            .Skip(pageIndex * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var result = items.Select(r => new ReviewDto
        {
            Id = r.Id,
            ProductId = r.ProductId,
            ProductName = r.Product.Name,
            ProductImageUrl = r.Product.Images?.FirstOrDefault(i => i.IsMain)?.ImageUrl,
            CustomerId = r.CustomerId,
            CustomerName = r.Customer.User?.FirstName + " " + r.Customer.User?.LastName ?? "Anonymous",
            CustomerAvatar = r.Customer.User?.AvatarUrl,
            Rating = r.Rating,
            Title = r.Title,
            Comment = r.Comment,
            IsVerifiedPurchase = r.IsVerifiedPurchase,
            CreatedAt = r.CreatedAt,
            AdminResponse = r.AdminResponse,
            AdminResponseDate = r.AdminResponseDate,
            HelpfulCount = r.HelpfulCount,
            NotHelpfulCount = r.NotHelpfulCount
        }).ToList();

        return new PagedResult<ReviewDto>(result, totalCount, pageIndex, pageSize);
    }

    public async Task<ProductReviewSummaryDto?> GetProductReviewSummaryAsync(int productId)
    {
        var product = await _context.Products.FindAsync(productId);
        if (product == null) return null;

        var reviews = await _context.Reviews
            .Where(r => r.ProductId == productId && r.IsApproved)
            .ToListAsync();

        if (!reviews.Any())
        {
            return new ProductReviewSummaryDto
            {
                ProductId = productId,
                ProductName = product.Name,
                AverageRating = 0,
                TotalReviews = 0
            };
        }

        return new ProductReviewSummaryDto
        {
            ProductId = productId,
            ProductName = product.Name,
            AverageRating = reviews.Average(r => r.Rating),
            TotalReviews = reviews.Count,
            FiveStarCount = reviews.Count(r => r.Rating == 5),
            FourStarCount = reviews.Count(r => r.Rating == 4),
            ThreeStarCount = reviews.Count(r => r.Rating == 3),
            TwoStarCount = reviews.Count(r => r.Rating == 2),
            OneStarCount = reviews.Count(r => r.Rating == 1),
            VerifiedReviewsCount = reviews.Count(r => r.IsVerifiedPurchase)
        };
    }

    public async Task<ReviewDto?> GetReviewByIdAsync(int id)
    {
        var r = await _context.Reviews
            .Include(r => r.Customer).ThenInclude(c => c.User)
            .Include(r => r.Product)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (r == null) return null;

        return new ReviewDto
        {
            Id = r.Id,
            ProductId = r.ProductId,
            ProductName = r.Product.Name,
            ProductImageUrl = r.Product.Images?.FirstOrDefault(i => i.IsMain)?.ImageUrl,
            CustomerId = r.CustomerId,
            CustomerName = r.Customer.User?.FirstName + " " + r.Customer.User?.LastName ?? "Anonymous",
            CustomerAvatar = r.Customer.User?.AvatarUrl,
            Rating = r.Rating,
            Title = r.Title,
            Comment = r.Comment,
            IsVerifiedPurchase = r.IsVerifiedPurchase,
            CreatedAt = r.CreatedAt,
            AdminResponse = r.AdminResponse,
            AdminResponseDate = r.AdminResponseDate,
            HelpfulCount = r.HelpfulCount,
            NotHelpfulCount = r.NotHelpfulCount
        };
    }

    public async Task<List<ReviewDto>> GetCustomerReviewsAsync(int customerId)
    {
        var reviews = await _context.Reviews
            .Include(r => r.Product)
            .Where(r => r.CustomerId == customerId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return reviews.Select(r => new ReviewDto
        {
            Id = r.Id,
            ProductId = r.ProductId,
            ProductName = r.Product.Name,
            ProductImageUrl = r.Product.Images?.FirstOrDefault(i => i.IsMain)?.ImageUrl,
            CustomerId = r.CustomerId,
            CustomerName = "",
            Rating = r.Rating,
            Title = r.Title,
            Comment = r.Comment,
            IsVerifiedPurchase = r.IsVerifiedPurchase,
            CreatedAt = r.CreatedAt,
            AdminResponse = r.AdminResponse,
            AdminResponseDate = r.AdminResponseDate,
            HelpfulCount = r.HelpfulCount,
            NotHelpfulCount = r.NotHelpfulCount
        }).ToList();
    }

    public async Task<ReviewDto> CreateReviewAsync(int customerId, CreateReviewRequest request)
    {
        var customer = await _context.Customers
            .Include(c => c.User)
            .FirstOrDefaultAsync(c => c.UserId == customerId);

        if (customer == null)
            throw new NotFoundException("Customer not found");

        var order = await _context.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.CustomerId == customer.Id && 
                                      o.Items.Any(i => i.ProductId == request.ProductId) &&
                                      o.Status == Domain.Enums.OrderStatus.Delivered);

        var isVerified = order != null;

        var existingReview = await _context.Reviews
            .FirstOrDefaultAsync(r => r.CustomerId == customer.Id && r.ProductId == request.ProductId);

        if (existingReview != null)
            throw new ConflictException("You have already reviewed this product");

        var review = new Review
        {
            ProductId = request.ProductId,
            CustomerId = customer.Id,
            OrderId = request.OrderId,
            Rating = request.Rating,
            Title = request.Title,
            Comment = request.Comment,
            IsVerifiedPurchase = isVerified,
            IsApproved = false,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = customerId.ToString()
        };

        _context.Reviews.Add(review);
        await _context.SaveChangesAsync();

        return (await GetReviewByIdAsync(review.Id))!;
    }

    public async Task<ReviewDto> UpdateReviewAsync(int customerId, UpdateReviewRequest request)
    {
        var customer = await _context.Customers.FirstOrDefaultAsync(c => c.UserId == customerId);
        if (customer == null)
            throw new NotFoundException("Customer not found");

        var review = await _context.Reviews.FindAsync(request.Id);
        if (review == null)
            throw new NotFoundException("Review not found");

        if (review.CustomerId != customer.Id)
            throw new System.UnauthorizedAccessException("You can only update your own reviews");

        review.Rating = request.Rating;
        review.Title = request.Title;
        review.Comment = request.Comment;
        review.UpdatedAt = DateTime.UtcNow;
        review.UpdatedBy = customerId.ToString();

        await _context.SaveChangesAsync();

        return (await GetReviewByIdAsync(review.Id))!;
    }

    public async Task<bool> DeleteReviewAsync(int customerId, int reviewId)
    {
        var customer = await _context.Customers.FirstOrDefaultAsync(c => c.UserId == customerId);
        if (customer == null) return false;

        var review = await _context.Reviews.FindAsync(reviewId);
        if (review == null) return false;

        if (review.CustomerId != customer.Id)
            throw new System.UnauthorizedAccessException("You can only delete your own reviews");

        _context.Reviews.Remove(review);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> MarkHelpfulAsync(int userId, ReviewHelpfulnessRequest request)
    {
        var existing = await _context.ReviewHelpfulness
            .FirstOrDefaultAsync(rh => rh.ReviewId == request.ReviewId && rh.UserId == userId);

        var review = await _context.Reviews.FindAsync(request.ReviewId);
        if (review == null) return false;

        if (existing != null)
        {
            if (existing.IsHelpful == request.IsHelpful)
            {
                _context.ReviewHelpfulness.Remove(existing);
                if (request.IsHelpful)
                    review.HelpfulCount--;
                else
                    review.NotHelpfulCount--;
            }
            else
            {
                if (request.IsHelpful)
                {
                    existing.IsHelpful = true;
                    review.HelpfulCount++;
                    review.NotHelpfulCount--;
                }
                else
                {
                    existing.IsHelpful = false;
                    review.HelpfulCount--;
                    review.NotHelpfulCount++;
                }
            }
        }
        else
        {
            _context.ReviewHelpfulness.Add(new ReviewHelpfulness
            {
                ReviewId = request.ReviewId,
                UserId = userId,
                IsHelpful = request.IsHelpful,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = userId.ToString()
            });

            if (request.IsHelpful)
                review.HelpfulCount++;
            else
                review.NotHelpfulCount++;
        }

        await _context.SaveChangesAsync();
        return true;
    }

    // Admin methods
    public async Task<PagedResult<ReviewListDto>> GetAllReviewsAsync(int pageIndex, int pageSize, bool? approved = null)
    {
        var query = _context.Reviews
            .Include(r => r.Customer).ThenInclude(c => c.User)
            .Include(r => r.Product)
            .AsQueryable();

        if (approved.HasValue)
            query = query.Where(r => r.IsApproved == approved.Value);

        var totalCount = await query.CountAsync();
        var items = await query
            .OrderByDescending(r => r.CreatedAt)
            .Skip(pageIndex * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var result = items.Select(r => new ReviewListDto
        {
            Id = r.Id,
            ProductId = r.ProductId,
            ProductName = r.Product.Name,
            CustomerName = r.Customer.User?.FirstName + " " + r.Customer.User?.LastName ?? "Anonymous",
            Rating = r.Rating,
            Title = r.Title,
            Comment = r.Comment,
            IsVerifiedPurchase = r.IsVerifiedPurchase,
            IsApproved = r.IsApproved,
            IsFeatured = r.IsFeatured,
            CreatedAt = r.CreatedAt
        }).ToList();

        return new PagedResult<ReviewListDto>(result, totalCount, pageIndex, pageSize);
    }

    public async Task<bool> ApproveReviewAsync(int reviewId)
    {
        var review = await _context.Reviews.FindAsync(reviewId);
        if (review == null) return false;

        review.IsApproved = true;
        review.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RejectReviewAsync(int reviewId)
    {
        var review = await _context.Reviews.FindAsync(reviewId);
        if (review == null) return false;

        review.IsApproved = false;
        review.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ToggleFeaturedAsync(int reviewId)
    {
        var review = await _context.Reviews.FindAsync(reviewId);
        if (review == null) return false;

        review.IsFeatured = !review.IsFeatured;
        review.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RespondToReviewAsync(int adminId, AdminReviewResponseRequest request)
    {
        var review = await _context.Reviews.FindAsync(request.ReviewId);
        if (review == null) return false;

        review.AdminResponse = request.Response;
        review.AdminResponseDate = DateTime.UtcNow;
        review.UpdatedAt = DateTime.UtcNow;
        review.UpdatedBy = adminId.ToString();
        await _context.SaveChangesAsync();
        return true;
    }
}
