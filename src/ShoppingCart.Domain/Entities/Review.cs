using ShoppingCart.Domain.Entities.Base;

namespace ShoppingCart.Domain.Entities;

public class Review : AuditableEntity<int>
{
    public int ProductId { get; set; }
    public int CustomerId { get; set; }
    public int OrderId { get; set; }
    public int Rating { get; set; }
    public string? Title { get; set; }
    public string? Comment { get; set; }
    public bool IsVerifiedPurchase { get; set; } = false;
    public bool IsApproved { get; set; } = false;
    public bool IsFeatured { get; set; } = false;
    public int HelpfulCount { get; set; } = 0;
    public int NotHelpfulCount { get; set; } = 0;
    public string? AdminResponse { get; set; }
    public DateTime? AdminResponseDate { get; set; }

    public virtual Product Product { get; set; } = null!;
    public virtual Customer Customer { get; set; } = null!;
    public virtual Order Order { get; set; } = null!;
    public virtual ICollection<ReviewHelpfulness> HelpfulVotes { get; set; } = new List<ReviewHelpfulness>();
}

public class ReviewHelpfulness : AuditableEntity<int>
{
    public int ReviewId { get; set; }
    public int UserId { get; set; }
    public bool IsHelpful { get; set; }

    public virtual Review Review { get; set; } = null!;
}
