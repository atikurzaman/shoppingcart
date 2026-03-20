using ShoppingCart.Domain.Entities.Base;

namespace ShoppingCart.Domain.Entities;

public class Customer : AuditableEntity<int>
{
    public int UserId { get; set; }
    public string? CompanyName { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? Gender { get; set; }
    public decimal TotalSpent { get; set; } = 0;
    public int OrderCount { get; set; } = 0;
    public DateTime? LastOrderDate { get; set; }
    public string? Notes { get; set; }

    public virtual User User { get; set; } = null!;
    public virtual ICollection<Address> Addresses { get; set; } = new List<Address>();
    public virtual ICollection<Cart> Carts { get; set; } = new List<Cart>();
    public virtual ICollection<Wishlist> Wishlists { get; set; } = new List<Wishlist>();
    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();
    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();
}

public class Address : AuditableEntity<int>
{
    public int CustomerId { get; set; }
    public int? UserId { get; set; }
    public string AddressType { get; set; } = "Shipping";
    public string FullName { get; set; } = string.Empty;
    public string? CompanyName { get; set; }
    public string PhoneNumber { get; set; } = string.Empty;
    public string AddressLine1 { get; set; } = string.Empty;
    public string? AddressLine2 { get; set; }
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string PostalCode { get; set; } = string.Empty;
    public string Country { get; set; } = "Bangladesh";
    public bool IsDefault { get; set; } = false;
    public string? DeliveryInstructions { get; set; }

    public virtual Customer Customer { get; set; } = null!;
    public virtual User? User { get; set; }
    public virtual ICollection<Order> BillingOrders { get; set; } = new List<Order>();
    public virtual ICollection<Order> ShippingOrders { get; set; } = new List<Order>();
}

public class Cart : AuditableEntity<int>
{
    public int? CustomerId { get; set; }
    public int? UserId { get; set; }
    public string? SessionId { get; set; }
    public decimal SubTotal { get; set; } = 0;
    public decimal TaxAmount { get; set; } = 0;
    public decimal ShippingAmount { get; set; } = 0;
    public decimal DiscountAmount { get; set; } = 0;
    public decimal Total { get; set; } = 0;
    public int? AppliedCouponId { get; set; }
    public string? CouponCode { get; set; }

    public virtual Customer? Customer { get; set; }
    public virtual User? User { get; set; }
    public virtual Coupon? AppliedCoupon { get; set; }
    public virtual ICollection<CartItem> Items { get; set; } = new List<CartItem>();
}

public class CartItem : AuditableEntity<int>
{
    public int CartId { get; set; }
    public int ProductId { get; set; }
    public int? VariantId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }

    public virtual Cart Cart { get; set; } = null!;
    public virtual Product Product { get; set; } = null!;
    public virtual ProductVariant? Variant { get; set; }
}

public class Wishlist : AuditableEntity<int>
{
    public int? CustomerId { get; set; }
    public int? UserId { get; set; }
    public string Name { get; set; } = "My Wishlist";
    public string? SharingToken { get; set; }

    public virtual Customer? Customer { get; set; }
    public virtual User? User { get; set; }
    public virtual ICollection<WishlistItem> Items { get; set; } = new List<WishlistItem>();
}

public class WishlistItem : AuditableEntity<int>
{
    public int WishlistId { get; set; }
    public int ProductId { get; set; }
    public int? VariantId { get; set; }
    public string? Notes { get; set; }
    public int Priority { get; set; } = 0;

    public virtual Wishlist Wishlist { get; set; } = null!;
    public virtual Product Product { get; set; } = null!;
    public virtual ProductVariant? Variant { get; set; }
}
