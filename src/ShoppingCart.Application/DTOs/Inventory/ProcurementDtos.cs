namespace ShoppingCart.Application.DTOs.Inventory;

public class PurchaseOrderDto
{
    public int Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public int SupplierId { get; set; }
    public string SupplierName { get; set; } = string.Empty;
    public DateTime OrderDate { get; set; }
    public DateTime? ExpectedDeliveryDate { get; set; }
    public DateTime? ActualDeliveryDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public int TotalItems { get; set; }
    public string? Notes { get; set; }
    public List<PurchaseOrderItemDto> Items { get; set; } = new();
}

public class PurchaseOrderItemDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int? VariantId { get; set; }
    public string? VariantName { get; set; }
    public int Quantity { get; set; }
    public int ReceivedQuantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice => Quantity * UnitPrice;
}

public class CreatePurchaseOrderRequest
{
    public int SupplierId { get; set; }
    public DateTime? ExpectedDeliveryDate { get; set; }
    public string? Notes { get; set; }
    public List<CreatePurchaseOrderItemRequest> Items { get; set; } = new();
}

public class CreatePurchaseOrderItemRequest
{
    public int ProductId { get; set; }
    public int? VariantId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
}

public class GoodsReceiptDto
{
    public int Id { get; set; }
    public int PurchaseOrderId { get; set; }
    public string PurchaseOrderNumber { get; set; } = string.Empty;
    public string ReceiptNumber { get; set; } = string.Empty;
    public DateTime ReceiptDate { get; set; }
    public int WarehouseId { get; set; }
    public string WarehouseName { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public List<GoodsReceiptItemDto> Items { get; set; } = new();
}

public class GoodsReceiptItemDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int? VariantId { get; set; }
    public int Quantity { get; set; }
    public string? BatchNumber { get; set; }
    public DateTime? ExpiryDate { get; set; }
}

public class CreateGoodsReceiptRequest
{
    public int PurchaseOrderId { get; set; }
    public int WarehouseId { get; set; }
    public string? Notes { get; set; }
    public List<CreateGoodsReceiptItemRequest> Items { get; set; } = new();
}

public class CreateGoodsReceiptItemRequest
{
    public int PurchaseOrderItemId { get; set; }
    public int ProductId { get; set; }
    public int? VariantId { get; set; }
    public int Quantity { get; set; }
    public string? BatchNumber { get; set; }
    public DateTime? ExpiryDate { get; set; }
}
