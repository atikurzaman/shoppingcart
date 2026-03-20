namespace ShoppingCart.Application.DTOs.Shipping;

public class ShippingMethodDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? CarrierName { get; set; }
    public decimal BaseCost { get; set; }
    public decimal CostPerKg { get; set; }
    public int EstimatedDaysMin { get; set; }
    public int EstimatedDaysMax { get; set; }
    public bool IsActive { get; set; }
    public bool IsFreeShipping { get; set; }
    public decimal? FreeShippingThreshold { get; set; }
}

public class ShipmentDto
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? TrackingNumber { get; set; }
    public string? TrackingUrl { get; set; }
    public string? CarrierName { get; set; }
    public DateTime? ShippedDate { get; set; }
    public DateTime? DeliveredDate { get; set; }
    public string? DeliveryNotes { get; set; }
    public decimal ShippingCost { get; set; }
    public ShippingMethodDto? ShippingMethod { get; set; }
}

public class ShipmentListDto
{
    public int Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? TrackingNumber { get; set; }
    public string? CarrierName { get; set; }
    public DateTime? ShippedDate { get; set; }
    public DateTime? DeliveredDate { get; set; }
}

public class CreateShipmentRequest
{
    public int OrderId { get; set; }
    public int ShippingMethodId { get; set; }
    public string? TrackingNumber { get; set; }
    public string? CarrierName { get; set; }
}

public class UpdateShipmentStatusRequest
{
    public int ShipmentId { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? TrackingNumber { get; set; }
    public string? TrackingUrl { get; set; }
    public string? Notes { get; set; }
}

public class CreateShippingMethodRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? CarrierName { get; set; }
    public decimal BaseCost { get; set; }
    public decimal CostPerKg { get; set; }
    public int EstimatedDaysMin { get; set; }
    public int EstimatedDaysMax { get; set; }
    public bool IsFreeShipping { get; set; }
    public decimal? FreeShippingThreshold { get; set; }
}

public class UpdateShippingMethodRequest : CreateShippingMethodRequest
{
    public int Id { get; set; }
    public bool IsActive { get; set; }
}

public class ShippingRateDto
{
    public int ShippingMethodId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Cost { get; set; }
    public string DeliveryTime { get; set; } = string.Empty;
    public bool IsFreeShipping { get; set; }
}
