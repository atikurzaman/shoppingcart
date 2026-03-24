using ShoppingCart.Domain.Entities.Base;
using ShoppingCart.Domain.Enums;

namespace ShoppingCart.Domain.Entities;

public class Seller : AuditableEntity<int>
{
    public int UserId { get; set; }
    public string StoreName { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? StoreDescription { get; set; }
    public string? StoreLogo { get; set; }
    public string? StoreBanner { get; set; }
    public string? Address { get; set; }
    public string? Phone { get; set; }
    public decimal Balance { get; set; } = 0;
    public bool IsApproved { get; set; } = false;
    public bool IsActive { get; set; } = true;
    public decimal CommissionRate { get; set; } = 10.0m; // Default percentage

    public virtual User User { get; set; } = null!;
}

public class Wallet : AuditableEntity<int>
{
    public int CustomerId { get; set; }
    public decimal Balance { get; set; } = 0;
    public string CurrencyCode { get; set; } = "USD";

    public virtual Customer Customer { get; set; } = null!;
    public virtual ICollection<WalletTransaction> Transactions { get; set; } = new List<WalletTransaction>();
}

public class WalletTransaction : AuditableEntity<int>
{
    public int WalletId { get; set; }
    public decimal Amount { get; set; } // Positive for deposit/refund, Negative for withdrawal/purchase
    public string TransactionType { get; set; } = "Deposit"; // Deposit, Withdrawal, Purchase, Refund
    public string Status { get; set; } = "Completed"; // Pending, Completed, Failed
    public string? Reference { get; set; } // Order ID or Payment ID reference
    public string? Description { get; set; }

    public virtual Wallet Wallet { get; set; } = null!;
}

// Refund schema added to support threaded refunds
public class RefundRequest : AuditableEntity<int>
{
    public int OrderId { get; set; }
    public int CustomerId { get; set; }
    public decimal RefundAmount { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected, Refunded
    public string? AdminNote { get; set; }
    public bool ReturnToWallet { get; set; } = true;

    public virtual Order Order { get; set; } = null!;
    public virtual Customer Customer { get; set; } = null!;
}
