-- =============================================
-- Shopping Cart Database Schema - Part 2
-- Commerce, Orders, Marketing Tables
-- =============================================

-- =============================================
-- COMMERCE TABLES
-- =============================================

-- Customers Table
CREATE TABLE Customers (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    CompanyName NVARCHAR(200) NULL,
    DateOfBirth DATE NULL,
    Gender NVARCHAR(20) NULL,
    TotalSpent DECIMAL(18,2) NOT NULL DEFAULT 0,
    OrderCount INT NOT NULL DEFAULT 0,
    LastOrderDate DATETIME2 NULL,
    Notes NVARCHAR(1000) NULL,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedAt DATETIME2 NULL,
    UpdatedBy NVARCHAR(100) NULL,
    RowVersion TIMESTAMP NULL,
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IX_Customers_UserId ON Customers(UserId) WHERE IsDeleted = 0;

-- Addresses Table
CREATE TABLE Addresses (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    CustomerId INT NOT NULL,
    UserId INT NULL,
    AddressType NVARCHAR(20) NOT NULL DEFAULT 'Shipping',
    FullName NVARCHAR(100) NOT NULL,
    CompanyName NVARCHAR(200) NULL,
    PhoneNumber NVARCHAR(20) NOT NULL,
    AddressLine1 NVARCHAR(500) NOT NULL,
    AddressLine2 NVARCHAR(500) NULL,
    City NVARCHAR(100) NOT NULL,
    State NVARCHAR(100) NULL,
    PostalCode NVARCHAR(20) NULL,
    Country NVARCHAR(100) NOT NULL DEFAULT 'Bangladesh',
    IsDefault BIT NOT NULL DEFAULT 0,
    DeliveryInstructions NVARCHAR(500) NULL,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedAt DATETIME2 NULL,
    UpdatedBy NVARCHAR(100) NULL,
    RowVersion TIMESTAMP NULL,
    FOREIGN KEY (CustomerId) REFERENCES Customers(Id) ON DELETE CASCADE
);

CREATE INDEX IX_Addresses_CustomerId ON Addresses(CustomerId);
CREATE INDEX IX_Addresses_UserId ON Addresses(UserId);

-- Carts Table
CREATE TABLE Carts (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    CustomerId INT NULL,
    UserId INT NULL,
    SessionId NVARCHAR(100) NULL,
    SubTotal DECIMAL(18,2) NOT NULL DEFAULT 0,
    TaxAmount DECIMAL(18,2) NOT NULL DEFAULT 0,
    ShippingAmount DECIMAL(18,2) NOT NULL DEFAULT 0,
    DiscountAmount DECIMAL(18,2) NOT NULL DEFAULT 0,
    Total DECIMAL(18,2) NOT NULL DEFAULT 0,
    AppliedCouponId INT NULL,
    CouponCode NVARCHAR(50) NULL,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedAt DATETIME2 NULL,
    UpdatedBy NVARCHAR(100) NULL,
    RowVersion TIMESTAMP NULL,
    FOREIGN KEY (CustomerId) REFERENCES Customers(Id) ON DELETE SET NULL,
    FOREIGN KEY (AppliedCouponId) REFERENCES Coupons(Id) ON DELETE SET NULL
);

CREATE INDEX IX_Carts_CustomerId ON Carts(CustomerId);
CREATE INDEX IX_Carts_UserId ON Carts(UserId);
CREATE INDEX IX_Carts_SessionId ON Carts(SessionId);

-- Cart Items Table
CREATE TABLE CartItems (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    CartId INT NOT NULL,
    ProductId INT NOT NULL,
    VariantId INT NULL,
    Quantity INT NOT NULL DEFAULT 1,
    UnitPrice DECIMAL(18,2) NOT NULL,
    TotalPrice DECIMAL(18,2) NOT NULL,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedAt DATETIME2 NULL,
    UpdatedBy NVARCHAR(100) NULL,
    RowVersion TIMESTAMP NULL,
    FOREIGN KEY (CartId) REFERENCES Carts(Id) ON DELETE CASCADE,
    FOREIGN KEY (ProductId) REFERENCES Products(Id) ON DELETE CASCADE,
    FOREIGN KEY (VariantId) REFERENCES ProductVariants(Id) ON DELETE SET NULL
);

CREATE INDEX IX_CartItems_CartId ON CartItems(CartId);
CREATE INDEX IX_CartItems_ProductId ON CartItems(ProductId);

-- Wishlists Table
CREATE TABLE Wishlists (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    CustomerId INT NULL,
    UserId INT NULL,
    Name NVARCHAR(100) NOT NULL DEFAULT 'My Wishlist',
    SharingToken NVARCHAR(100) NULL,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedAt DATETIME2 NULL,
    UpdatedBy NVARCHAR(100) NULL,
    RowVersion TIMESTAMP NULL,
    FOREIGN KEY (CustomerId) REFERENCES Customers(Id) ON DELETE SET NULL
);

CREATE INDEX IX_Wishlists_CustomerId ON Wishlists(CustomerId);

-- Wishlist Items Table
CREATE TABLE WishlistItems (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    WishlistId INT NOT NULL,
    ProductId INT NOT NULL,
    VariantId INT NULL,
    Notes NVARCHAR(500) NULL,
    Priority INT NOT NULL DEFAULT 0,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedAt DATETIME2 NULL,
    UpdatedBy NVARCHAR(100) NULL,
    RowVersion TIMESTAMP NULL,
    FOREIGN KEY (WishlistId) REFERENCES Wishlists(Id) ON DELETE CASCADE,
    FOREIGN KEY (ProductId) REFERENCES Products(Id) ON DELETE CASCADE,
    FOREIGN KEY (VariantId) REFERENCES ProductVariants(Id) ON DELETE SET NULL
);

CREATE INDEX IX_WishlistItems_WishlistId ON WishlistItems(WishlistId);
CREATE INDEX IX_WishlistItems_ProductId ON WishlistItems(ProductId);

-- =============================================
-- ORDER TABLES
-- =============================================

-- Orders Table
CREATE TABLE Orders (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    OrderNumber NVARCHAR(50) NOT NULL,
    CustomerId INT NOT NULL,
    UserId INT NULL,
    Status NVARCHAR(20) NOT NULL DEFAULT 'Pending',
    OrderDate DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    OrderConfirmedDate DATETIME2 NULL,
    ShippedDate DATETIME2 NULL,
    DeliveredDate DATETIME2 NULL,
    CancellationDate DATETIME2 NULL,
    CancellationReason NVARCHAR(500) NULL,
    BillingAddressId INT NULL,
    ShippingAddressId INT NOT NULL,
    SubTotal DECIMAL(18,2) NOT NULL,
    ShippingAmount DECIMAL(18,2) NOT NULL DEFAULT 0,
    TaxAmount DECIMAL(18,2) NOT NULL DEFAULT 0,
    DiscountAmount DECIMAL(18,2) NOT NULL DEFAULT 0,
    TotalAmount DECIMAL(18,2) NOT NULL,
    PaidAmount DECIMAL(18,2) NOT NULL DEFAULT 0,
    RefundedAmount DECIMAL(18,2) NOT NULL DEFAULT 0,
    PaymentMethod NVARCHAR(20) NOT NULL,
    PaymentStatus NVARCHAR(20) NOT NULL DEFAULT 'Pending',
    PaymentDate DATETIME2 NULL,
    PaymentTransactionId NVARCHAR(100) NULL,
    CustomerNote NVARCHAR(1000) NULL,
    AdminNote NVARCHAR(1000) NULL,
    InternalNote NVARCHAR(2000) NULL,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedAt DATETIME2 NULL,
    UpdatedBy NVARCHAR(100) NULL,
    RowVersion TIMESTAMP NULL,
    FOREIGN KEY (CustomerId) REFERENCES Customers(Id) ON DELETE RESTRICT,
    FOREIGN KEY (BillingAddressId) REFERENCES Addresses(Id) ON DELETE SET NULL,
    FOREIGN KEY (ShippingAddressId) REFERENCES Addresses(Id) ON DELETE RESTRICT
);

CREATE UNIQUE INDEX IX_Orders_OrderNumber ON Orders(OrderNumber) WHERE IsDeleted = 0;
CREATE INDEX IX_Orders_CustomerId ON Orders(CustomerId);
CREATE INDEX IX_Orders_Status ON Orders(Status);
CREATE INDEX IX_Orders_OrderDate ON Orders(OrderDate);
CREATE INDEX IX_Orders_PaymentStatus ON Orders(PaymentStatus);

-- Order Items Table
CREATE TABLE OrderItems (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    OrderId INT NOT NULL,
    ProductId INT NOT NULL,
    VariantId INT NULL,
    ProductName NVARCHAR(200) NOT NULL,
    VariantName NVARCHAR(100) NULL,
    SKU NVARCHAR(50) NULL,
    Quantity INT NOT NULL,
    UnitPrice DECIMAL(18,2) NOT NULL,
    UnitCost DECIMAL(18,2) NOT NULL DEFAULT 0,
    DiscountAmount DECIMAL(18,2) NOT NULL DEFAULT 0,
    TaxAmount DECIMAL(18,2) NOT NULL DEFAULT 0,
    TotalPrice DECIMAL(18,2) NOT NULL,
    TotalCost DECIMAL(18,2) NOT NULL DEFAULT 0,
    Notes NVARCHAR(500) NULL,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedAt DATETIME2 NULL,
    UpdatedBy NVARCHAR(100) NULL,
    RowVersion TIMESTAMP NULL,
    FOREIGN KEY (OrderId) REFERENCES Orders(Id) ON DELETE CASCADE,
    FOREIGN KEY (ProductId) REFERENCES Products(Id) ON DELETE RESTRICT
);

CREATE INDEX IX_OrderItems_OrderId ON OrderItems(OrderId);
CREATE INDEX IX_OrderItems_ProductId ON OrderItems(ProductId);

-- Payments Table
CREATE TABLE Payments (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    OrderId INT NOT NULL,
    Amount DECIMAL(18,2) NOT NULL,
    TransactionAmount DECIMAL(18,2) NOT NULL,
    PaymentMethod NVARCHAR(20) NOT NULL,
    Status NVARCHAR(20) NOT NULL DEFAULT 'Pending',
    TransactionId NVARCHAR(100) NULL,
    GatewayResponse NVARCHAR(2000) NULL,
    FailureReason NVARCHAR(500) NULL,
    ProcessedAt DATETIME2 NULL,
    ReferenceNumber NVARCHAR(50) NULL,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedAt DATETIME2 NULL,
    UpdatedBy NVARCHAR(100) NULL,
    RowVersion TIMESTAMP NULL,
    FOREIGN KEY (OrderId) REFERENCES Orders(Id) ON DELETE CASCADE
);

CREATE INDEX IX_Payments_OrderId ON Payments(OrderId);
CREATE INDEX IX_Payments_TransactionId ON Payments(TransactionId);

-- Shipments Table
CREATE TABLE Shipments (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    OrderId INT NOT NULL,
    TrackingNumber NVARCHAR(100) NULL,
    TrackingUrl NVARCHAR(500) NULL,
    Status NVARCHAR(20) NOT NULL DEFAULT 'NotShipped',
    WarehouseId INT NULL,
    ShippedDate DATETIME2 NULL,
    DeliveredDate DATETIME2 NULL,
    CarrierName NVARCHAR(100) NULL,
    DeliveryNotes NVARCHAR(500) NULL,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedAt DATETIME2 NULL,
    UpdatedBy NVARCHAR(100) NULL,
    RowVersion TIMESTAMP NULL,
    FOREIGN KEY (OrderId) REFERENCES Orders(Id) ON DELETE CASCADE,
    FOREIGN KEY (WarehouseId) REFERENCES Warehouses(Id) ON DELETE SET NULL
);

CREATE INDEX IX_Shipments_OrderId ON Shipments(OrderId);
CREATE INDEX IX_Shipments_TrackingNumber ON Shipments(TrackingNumber);

-- Invoices Table
CREATE TABLE Invoices (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    OrderId INT NOT NULL,
    InvoiceNumber NVARCHAR(50) NOT NULL,
    InvoiceDate DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    SubTotal DECIMAL(18,2) NOT NULL,
    TaxAmount DECIMAL(18,2) NOT NULL DEFAULT 0,
    ShippingAmount DECIMAL(18,2) NOT NULL DEFAULT 0,
    DiscountAmount DECIMAL(18,2) NOT NULL DEFAULT 0,
    TotalAmount DECIMAL(18,2) NOT NULL,
    AmountDue DECIMAL(18,2) NOT NULL,
    Notes NVARCHAR(1000) NULL,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedAt DATETIME2 NULL,
    UpdatedBy NVARCHAR(100) NULL,
    RowVersion TIMESTAMP NULL,
    FOREIGN KEY (OrderId) REFERENCES Orders(Id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IX_Invoices_InvoiceNumber ON Invoices(InvoiceNumber) WHERE IsDeleted = 0;
CREATE INDEX IX_Invoices_OrderId ON Invoices(OrderId);

-- Returns Table
CREATE TABLE Returns (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    OrderId INT NOT NULL,
    ReturnNumber NVARCHAR(50) NOT NULL,
    Reason NVARCHAR(500) NOT NULL,
    Notes NVARCHAR(1000) NULL,
    RequestDate DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    ApprovalDate DATETIME2 NULL,
    ReturnReceivedDate DATETIME2 NULL,
    RefundDate DATETIME2 NULL,
    Status NVARCHAR(20) NOT NULL DEFAULT 'Pending',
    RefundAmount DECIMAL(18,2) NOT NULL DEFAULT 0,
    ProcessedByUserId INT NULL,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedAt DATETIME2 NULL,
    UpdatedBy NVARCHAR(100) NULL,
    RowVersion TIMESTAMP NULL,
    FOREIGN KEY (OrderId) REFERENCES Orders(Id) ON DELETE RESTRICT
);

CREATE UNIQUE INDEX IX_Returns_ReturnNumber ON Returns(ReturnNumber) WHERE IsDeleted = 0;
CREATE INDEX IX_Returns_OrderId ON Returns(OrderId);

-- Return Items Table
CREATE TABLE ReturnItems (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ReturnId INT NOT NULL,
    OrderItemId INT NOT NULL,
    Quantity INT NOT NULL,
    RefundAmount DECIMAL(18,2) NOT NULL,
    Reason NVARCHAR(500) NULL,
    Condition NVARCHAR(50) NOT NULL DEFAULT 'Unopened',
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedAt DATETIME2 NULL,
    UpdatedBy NVARCHAR(100) NULL,
    RowVersion TIMESTAMP NULL,
    FOREIGN KEY (ReturnId) REFERENCES Returns(Id) ON DELETE CASCADE,
    FOREIGN KEY (OrderItemId) REFERENCES OrderItems(Id) ON DELETE RESTRICT
);

CREATE INDEX IX_ReturnItems_ReturnId ON ReturnItems(ReturnId);

-- =============================================
-- MARKETING TABLES
-- =============================================

-- Coupons Table
CREATE TABLE Coupons (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Code NVARCHAR(50) NOT NULL,
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500) NULL,
    CouponType NVARCHAR(20) NOT NULL,
    DiscountValue DECIMAL(18,2) NOT NULL,
    MinimumOrderAmount DECIMAL(18,2) NULL,
    MaximumDiscountAmount DECIMAL(18,2) NULL,
    MaximumUsageCount INT NULL,
    MaximumUsagePerUser INT NULL,
    CurrentUsageCount INT NOT NULL DEFAULT 0,
    ApplicableProductId INT NULL,
    ApplicableCategoryId INT NULL,
    StartDate DATETIME2 NOT NULL,
    EndDate DATETIME2 NOT NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    IsFirstOrderOnly BIT NOT NULL DEFAULT 0,
    RequiresShipping BIT NOT NULL DEFAULT 0,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedAt DATETIME2 NULL,
    UpdatedBy NVARCHAR(100) NULL,
    RowVersion TIMESTAMP NULL
);

CREATE UNIQUE INDEX IX_Coupons_Code ON Coupons(Code) WHERE IsDeleted = 0;
CREATE INDEX IX_Coupons_StartDate ON Coupons(StartDate);
CREATE INDEX IX_Coupons_EndDate ON Coupons(EndDate);

-- Coupon Usages Table
CREATE TABLE CouponUsages (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    CouponId INT NOT NULL,
    OrderId INT NOT NULL,
    UserId INT NOT NULL,
    DiscountAmount DECIMAL(18,2) NOT NULL,
    UsedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedAt DATETIME2 NULL,
    UpdatedBy NVARCHAR(100) NULL,
    RowVersion TIMESTAMP NULL,
    FOREIGN KEY (CouponId) REFERENCES Coupons(Id) ON DELETE CASCADE,
    FOREIGN KEY (OrderId) REFERENCES Orders(Id) ON DELETE CASCADE,
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
);

CREATE INDEX IX_CouponUsages_CouponId ON CouponUsages(CouponId);
CREATE INDEX IX_CouponUsages_UserId ON CouponUsages(UserId);

-- Taxes Table
CREATE TABLE Taxes (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Code NVARCHAR(50) NOT NULL,
    Rate DECIMAL(5,2) NOT NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    IsDefault BIT NOT NULL DEFAULT 0,
    Description NVARCHAR(500) NULL,
    Priority INT NOT NULL DEFAULT 0,
    ApplyToShipping BIT NOT NULL DEFAULT 0,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedAt DATETIME2 NULL,
    UpdatedBy NVARCHAR(100) NULL,
    RowVersion TIMESTAMP NULL
);

CREATE UNIQUE INDEX IX_Taxes_Code ON Taxes(Code) WHERE IsDeleted = 0;

-- =============================================
-- PURCHASE ORDER TABLES
-- =============================================

-- Purchase Orders Table
CREATE TABLE PurchaseOrders (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    OrderNumber NVARCHAR(50) NOT NULL,
    SupplierId INT NOT NULL,
    OrderDate DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    ExpectedDeliveryDate DATETIME2 NULL,
    ActualDeliveryDate DATETIME2 NULL,
    Status NVARCHAR(20) NOT NULL DEFAULT 'Pending',
    SubTotal DECIMAL(18,2) NOT NULL,
    TaxAmount DECIMAL(18,2) NOT NULL DEFAULT 0,
    ShippingCost DECIMAL(18,2) NOT NULL DEFAULT 0,
    TotalAmount DECIMAL(18,2) NOT NULL,
    Notes NVARCHAR(1000) NULL,
    ShippingAddress NVARCHAR(500) NULL,
    BillingAddress NVARCHAR(500) NULL,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedAt DATETIME2 NULL,
    UpdatedBy NVARCHAR(100) NULL,
    RowVersion TIMESTAMP NULL,
    FOREIGN KEY (SupplierId) REFERENCES Suppliers(Id) ON DELETE RESTRICT
);

CREATE UNIQUE INDEX IX_PurchaseOrders_OrderNumber ON PurchaseOrders(OrderNumber) WHERE IsDeleted = 0;
CREATE INDEX IX_PurchaseOrders_SupplierId ON PurchaseOrders(SupplierId);
CREATE INDEX IX_PurchaseOrders_Status ON PurchaseOrders(Status);

-- Purchase Order Items Table
CREATE TABLE PurchaseOrderItems (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    PurchaseOrderId INT NOT NULL,
    ProductId INT NOT NULL,
    VariantId INT NULL,
    ProductName NVARCHAR(200) NOT NULL,
    Quantity INT NOT NULL,
    ReceivedQuantity INT NOT NULL DEFAULT 0,
    UnitPrice DECIMAL(18,2) NOT NULL,
    TotalPrice DECIMAL(18,2) NOT NULL,
    Notes NVARCHAR(500) NULL,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedAt DATETIME2 NULL,
    UpdatedBy NVARCHAR(100) NULL,
    RowVersion TIMESTAMP NULL,
    FOREIGN KEY (PurchaseOrderId) REFERENCES PurchaseOrders(Id) ON DELETE CASCADE,
    FOREIGN KEY (ProductId) REFERENCES Products(Id) ON DELETE RESTRICT
);

CREATE INDEX IX_PurchaseOrderItems_PurchaseOrderId ON PurchaseOrderItems(PurchaseOrderId);

-- Goods Receipts Table
CREATE TABLE GoodsReceipts (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    PurchaseOrderId INT NOT NULL,
    ReceiptNumber NVARCHAR(50) NOT NULL,
    ReceiptDate DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    WarehouseId INT NOT NULL,
    ReceivedByUserId INT NOT NULL,
    Notes NVARCHAR(1000) NULL,
    Condition NVARCHAR(50) NOT NULL DEFAULT 'Good',
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedAt DATETIME2 NULL,
    UpdatedBy NVARCHAR(100) NULL,
    RowVersion TIMESTAMP NULL,
    FOREIGN KEY (PurchaseOrderId) REFERENCES PurchaseOrders(Id) ON DELETE CASCADE,
    FOREIGN KEY (WarehouseId) REFERENCES Warehouses(Id) ON DELETE RESTRICT
);

CREATE UNIQUE INDEX IX_GoodsReceipts_ReceiptNumber ON GoodsReceipts(ReceiptNumber) WHERE IsDeleted = 0;
CREATE INDEX IX_GoodsReceipts_PurchaseOrderId ON GoodsReceipts(PurchaseOrderId);

-- Goods Receipt Items Table
CREATE TABLE GoodsReceiptItems (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    GoodsReceiptId INT NOT NULL,
    PurchaseOrderItemId INT NOT NULL,
    ProductId INT NOT NULL,
    VariantId INT NULL,
    Quantity INT NOT NULL,
    UnitCost DECIMAL(18,2) NOT NULL,
    BatchNumber NVARCHAR(50) NULL,
    ExpiryDate DATE NULL,
    Notes NVARCHAR(500) NULL,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedAt DATETIME2 NULL,
    UpdatedBy NVARCHAR(100) NULL,
    RowVersion TIMESTAMP NULL,
    FOREIGN KEY (GoodsReceiptId) REFERENCES GoodsReceipts(Id) ON DELETE CASCADE,
    FOREIGN KEY (PurchaseOrderItemId) REFERENCES PurchaseOrderItems(Id) ON DELETE RESTRICT,
    FOREIGN KEY (ProductId) REFERENCES Products(Id) ON DELETE RESTRICT
);

CREATE INDEX IX_GoodsReceiptItems_GoodsReceiptId ON GoodsReceiptItems(GoodsReceiptId);

PRINT 'Schema Part 2 created successfully!';
