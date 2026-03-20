namespace ShoppingCart.Domain.Enums;

public enum OrderStatus
{
    Pending = 1,
    Confirmed = 2,
    Processing = 3,
    Shipped = 4,
    Delivered = 5,
    Cancelled = 6,
    Refunded = 7
}

public enum PaymentStatus
{
    Pending = 1,
    Paid = 2,
    Failed = 3,
    Refunded = 4,
    PartiallyRefunded = 5
}

public enum PaymentMethod
{
    CashOnDelivery = 1,
    Card = 2,
    MobileBanking = 3,
    InternetBanking = 4
}

public enum ShippingStatus
{
    NotShipped = 1,
    Shipped = 2,
    Delivered = 3,
    Returned = 4
}

public enum StockMovementType
{
    Purchase = 1,
    Sale = 2,
    Adjustment = 3,
    Transfer = 4,
    Return = 5
}

public enum CouponType
{
    FixedAmount = 1,
    Percentage = 2,
    FreeShipping = 3
}

public enum DiscountType
{
    None = 0,
    Percentage = 1,
    FixedAmount = 2
}

public enum UserStatus
{
    Active = 1,
    Inactive = 2,
    Suspended = 3
}

public enum StockStatus
{
    InStock = 1,
    LowStock = 2,
    OutOfStock = 3
}
