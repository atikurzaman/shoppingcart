using ShoppingCart.Domain.Entities.Base;
using ShoppingCart.Domain.Enums;

namespace ShoppingCart.Domain.Entities;

public class Warehouse : AuditableEntity<int>
{
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? Country { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public bool IsDefault { get; set; } = false;
    public bool IsActive { get; set; } = true;

    public virtual ICollection<StockItem> StockItems { get; set; } = new List<StockItem>();
    public virtual ICollection<StockMovement> StockMovements { get; set; } = new List<StockMovement>();
}

public class StockItem : AuditableEntity<int>
{
    public int ProductId { get; set; }
    public int? VariantId { get; set; }
    public int WarehouseId { get; set; }
    public int QuantityOnHand { get; set; } = 0;
    public int ReservedQuantity { get; set; } = 0;
    public int? ReorderLevel { get; set; }
    public string? BatchNumber { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public DateTime? LastStockCheckDate { get; set; }

    public int AvailableQuantity => QuantityOnHand - ReservedQuantity;
    public StockStatus StockStatus
    {
        get
        {
            if (QuantityOnHand <= 0) return StockStatus.OutOfStock;
            if (ReorderLevel.HasValue && QuantityOnHand <= ReorderLevel.Value) return StockStatus.LowStock;
            return StockStatus.InStock;
        }
    }

    public virtual Product Product { get; set; } = null!;
    public virtual ProductVariant? Variant { get; set; }
    public virtual Warehouse Warehouse { get; set; } = null!;
    public virtual ICollection<StockMovement> StockMovements { get; set; } = new List<StockMovement>();
}

public class StockMovement : AuditableEntity<int>
{
    public int ProductId { get; set; }
    public int? VariantId { get; set; }
    public int? FromWarehouseId { get; set; }
    public int? ToWarehouseId { get; set; }
    public int Quantity { get; set; }
    public StockMovementType MovementType { get; set; }
    public string? ReferenceNumber { get; set; }
    public int? ReferenceId { get; set; }
    public string? Notes { get; set; }
    public decimal? UnitCost { get; set; }

    public virtual Product Product { get; set; } = null!;
    public virtual ProductVariant? Variant { get; set; }
    public virtual Warehouse? FromWarehouse { get; set; }
    public virtual Warehouse? ToWarehouse { get; set; }
}

public class StockAdjustment : AuditableEntity<int>
{
    public int ProductId { get; set; }
    public int? VariantId { get; set; }
    public int WarehouseId { get; set; }
    public int AdjustmentQuantity { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public int AdjustedByUserId { get; set; }

    public virtual Product Product { get; set; } = null!;
    public virtual ProductVariant? Variant { get; set; }
    public virtual Warehouse Warehouse { get; set; } = null!;
}

public class ReorderRule : AuditableEntity<int>
{
    public int ProductId { get; set; }
    public int? VariantId { get; set; }
    public int ReorderLevel { get; set; }
    public int ReorderQuantity { get; set; }
    public int? PreferredSupplierId { get; set; }
    public bool IsActive { get; set; } = true;

    public virtual Product Product { get; set; } = null!;
    public virtual ProductVariant? Variant { get; set; }
    public virtual Supplier? PreferredSupplier { get; set; }
}
