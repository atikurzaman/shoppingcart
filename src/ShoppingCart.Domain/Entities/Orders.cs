using ShoppingCart.Domain.Entities.Base;
using ShoppingCart.Domain.Enums;

namespace ShoppingCart.Domain.Entities;

public class Order : AuditableEntity<int>
{
    public string OrderNumber { get; set; } = string.Empty;
    public int CustomerId { get; set; }
    public int? UserId { get; set; }
    public OrderStatus Status { get; set; } = OrderStatus.Pending;
    public DateTime OrderDate { get; set; } = DateTime.UtcNow;
    public DateTime? OrderConfirmedDate { get; set; }
    public DateTime? ShippedDate { get; set; }
    public DateTime? DeliveredDate { get; set; }
    public DateTime? CancellationDate { get; set; }
    public string? CancellationReason { get; set; }
    public int? BillingAddressId { get; set; }
    public int ShippingAddressId { get; set; }

    public decimal SubTotal { get; set; }
    public decimal ShippingAmount { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal PaidAmount { get; set; }
    public decimal RefundedAmount { get; set; }

    public PaymentMethod PaymentMethod { get; set; }
    public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Pending;
    public DateTime? PaymentDate { get; set; }
    public string? PaymentTransactionId { get; set; }

    public string? CustomerNote { get; set; }
    public string? AdminNote { get; set; }
    public string? InternalNote { get; set; }

    public virtual Customer Customer { get; set; } = null!;
    public virtual User? User { get; set; }
    public virtual Address BillingAddress { get; set; } = null!;
    public virtual Address ShippingAddress { get; set; } = null!;
    public virtual ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
    public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();
    public virtual ICollection<Shipment> Shipments { get; set; } = new List<Shipment>();
    public virtual Invoice? Invoice { get; set; }
    public virtual ICollection<Return> Returns { get; set; } = new List<Return>();
}

public class OrderItem : AuditableEntity<int>
{
    public int OrderId { get; set; }
    public int ProductId { get; set; }
    public int? VariantId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string? VariantName { get; set; }
    public string? SKU { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal UnitCost { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal TotalPrice { get; set; }
    public decimal TotalCost { get; set; }
    public string? Notes { get; set; }

    public virtual Order Order { get; set; } = null!;
    public virtual Product Product { get; set; } = null!;
    public virtual ProductVariant? Variant { get; set; }
}

public class Payment : AuditableEntity<int>
{
    public int OrderId { get; set; }
    public decimal Amount { get; set; }
    public decimal TransactionAmount { get; set; }
    public decimal RefundedAmount { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;
    public string? TransactionId { get; set; }
    public string? GatewayResponse { get; set; }
    public string? FailureReason { get; set; }
    public DateTime? ProcessedAt { get; set; }
    public string? ReferenceNumber { get; set; }

    public virtual Order Order { get; set; } = null!;
}

public class Shipment : AuditableEntity<int>
{
    public int OrderId { get; set; }
    public int? ShippingMethodId { get; set; }
    public string TrackingNumber { get; set; } = string.Empty;
    public string? TrackingUrl { get; set; }
    public ShippingStatus Status { get; set; } = ShippingStatus.NotShipped;
    public int? WarehouseId { get; set; }
    public DateTime? ShippedDate { get; set; }
    public DateTime? DeliveredDate { get; set; }
    public string? CarrierName { get; set; }
    public string? DeliveryNotes { get; set; }
    public decimal ShippingCost { get; set; }
    public decimal Weight { get; set; }

    public virtual Order Order { get; set; } = null!;
    public virtual ShippingMethod? ShippingMethod { get; set; }
    public virtual Warehouse? Warehouse { get; set; }
}

public class ShippingMethod : AuditableEntity<int>
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? CarrierName { get; set; }
    public decimal BaseCost { get; set; }
    public decimal CostPerKg { get; set; } = 0;
    public int EstimatedDaysMin { get; set; }
    public int EstimatedDaysMax { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsFreeShipping { get; set; } = false;
    public decimal? FreeShippingThreshold { get; set; }
    public int DisplayOrder { get; set; } = 0;
}

public class Invoice : AuditableEntity<int>
{
    public int OrderId { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public DateTime InvoiceDate { get; set; } = DateTime.UtcNow;
    public decimal SubTotal { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal ShippingAmount { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal AmountDue { get; set; }
    public string? Notes { get; set; }

    public virtual Order Order { get; set; } = null!;
}

public class Return : AuditableEntity<int>
{
    public int OrderId { get; set; }
    public string ReturnNumber { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public DateTime RequestDate { get; set; } = DateTime.UtcNow;
    public DateTime? ApprovalDate { get; set; }
    public DateTime? ReturnReceivedDate { get; set; }
    public DateTime? RefundDate { get; set; }
    public string Status { get; set; } = "Pending";
    public decimal RefundAmount { get; set; }
    public int? ProcessedByUserId { get; set; }

    public virtual Order Order { get; set; } = null!;
    public virtual ICollection<ReturnItem> Items { get; set; } = new List<ReturnItem>();
}

public class ReturnItem : AuditableEntity<int>
{
    public int ReturnId { get; set; }
    public int OrderItemId { get; set; }
    public int Quantity { get; set; }
    public decimal RefundAmount { get; set; }
    public string? Reason { get; set; }
    public string Condition { get; set; } = "Unopened";

    public virtual Return Return { get; set; } = null!;
    public virtual OrderItem OrderItem { get; set; } = null!;
}
