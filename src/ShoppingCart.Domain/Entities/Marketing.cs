using ShoppingCart.Domain.Entities.Base;
using ShoppingCart.Domain.Enums;

namespace ShoppingCart.Domain.Entities;

public class Coupon : AuditableEntity<int>
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public CouponType CouponType { get; set; }
    public decimal DiscountValue { get; set; }
    public decimal? MinimumOrderAmount { get; set; }
    public decimal? MaximumDiscountAmount { get; set; }
    public int? MaximumUsageCount { get; set; }
    public int? MaximumUsagePerUser { get; set; }
    public int CurrentUsageCount { get; set; } = 0;
    public int? ApplicableProductId { get; set; }
    public int? ApplicableCategoryId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsFirstOrderOnly { get; set; } = false;
    public bool RequiresShipping { get; set; } = false;

    public virtual ICollection<CouponUsage> Usages { get; set; } = new List<CouponUsage>();
    public virtual ICollection<Cart> Carts { get; set; } = new List<Cart>();
}

public class CouponUsage : AuditableEntity<int>
{
    public int CouponId { get; set; }
    public int OrderId { get; set; }
    public int UserId { get; set; }
    public decimal DiscountAmount { get; set; }
    public DateTime UsedAt { get; set; } = DateTime.UtcNow;

    public virtual Coupon Coupon { get; set; } = null!;
}

public class Tax : AuditableEntity<int>
{
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public decimal Rate { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDefault { get; set; } = false;
    public string? Description { get; set; }
    public int Priority { get; set; } = 0;
    public bool ApplyToShipping { get; set; } = false;
}

public class PurchaseOrder : AuditableEntity<int>
{
    public string OrderNumber { get; set; } = string.Empty;
    public int SupplierId { get; set; }
    public DateTime OrderDate { get; set; } = DateTime.UtcNow;
    public DateTime? ExpectedDeliveryDate { get; set; }
    public DateTime? ActualDeliveryDate { get; set; }
    public string Status { get; set; } = "Pending";
    public decimal SubTotal { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal ShippingCost { get; set; }
    public decimal TotalAmount { get; set; }
    public string? Notes { get; set; }
    public string? ShippingAddress { get; set; }
    public string? BillingAddress { get; set; }

    public virtual Supplier Supplier { get; set; } = null!;
    public virtual ICollection<PurchaseOrderItem> Items { get; set; } = new List<PurchaseOrderItem>();
    public virtual ICollection<GoodsReceipt> GoodsReceipts { get; set; } = new List<GoodsReceipt>();
}

public class PurchaseOrderItem : AuditableEntity<int>
{
    public int PurchaseOrderId { get; set; }
    public int ProductId { get; set; }
    public int? VariantId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public int ReceivedQuantity { get; set; } = 0;
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
    public string? Notes { get; set; }

    public virtual PurchaseOrder PurchaseOrder { get; set; } = null!;
}

public class GoodsReceipt : AuditableEntity<int>
{
    public int PurchaseOrderId { get; set; }
    public string ReceiptNumber { get; set; } = string.Empty;
    public DateTime ReceiptDate { get; set; } = DateTime.UtcNow;
    public int WarehouseId { get; set; }
    public int ReceivedByUserId { get; set; }
    public string? Notes { get; set; }
    public string? Condition { get; set; } = "Good";

    public virtual PurchaseOrder PurchaseOrder { get; set; } = null!;
    public virtual Warehouse Warehouse { get; set; } = null!;
    public virtual ICollection<GoodsReceiptItem> Items { get; set; } = new List<GoodsReceiptItem>();
}

public class GoodsReceiptItem : AuditableEntity<int>
{
    public int GoodsReceiptId { get; set; }
    public int PurchaseOrderItemId { get; set; }
    public int ProductId { get; set; }
    public int? VariantId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitCost { get; set; }
    public string? BatchNumber { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public string? Notes { get; set; }

    public virtual GoodsReceipt GoodsReceipt { get; set; } = null!;
}
