-- =============================================
-- Shopping Cart Database Schema - Part 3
-- System Tables: Notifications, Audit Logs, Settings
-- =============================================

-- =============================================
-- SYSTEM TABLES
-- =============================================

-- Notifications Table
CREATE TABLE Notifications (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NULL,
    Title NVARCHAR(200) NOT NULL,
    Message NVARCHAR(1000) NOT NULL,
    Type NVARCHAR(50) NOT NULL DEFAULT 'Info',
    Link NVARCHAR(500) NULL,
    ImageUrl NVARCHAR(500) NULL,
    IsRead BIT NOT NULL DEFAULT 0,
    ReadAt DATETIME2 NULL,
    IsSent BIT NOT NULL DEFAULT 0,
    SentAt DATETIME2 NULL,
    TargetRole NVARCHAR(50) NULL,
    SendEmail BIT NOT NULL DEFAULT 0,
    SendSms BIT NOT NULL DEFAULT 0,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedAt DATETIME2 NULL,
    UpdatedBy NVARCHAR(100) NULL,
    RowVersion TIMESTAMP NULL,
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
);

CREATE INDEX IX_Notifications_UserId ON Notifications(UserId);
CREATE INDEX IX_Notifications_IsRead ON Notifications(IsRead);
CREATE INDEX IX_Notifications_CreatedAt ON Notifications(CreatedAt);
CREATE INDEX IX_Notifications_TargetRole ON Notifications(TargetRole) WHERE TargetRole IS NOT NULL;

-- Audit Logs Table
CREATE TABLE AuditLogs (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NULL,
    Action NVARCHAR(100) NOT NULL,
    EntityName NVARCHAR(100) NOT NULL,
    EntityId INT NULL,
    OldValues NVARCHAR(MAX) NULL,
    NewValues NVARCHAR(MAX) NULL,
    IpAddress NVARCHAR(50) NULL,
    UserAgent NVARCHAR(500) NULL,
    Details NVARCHAR(1000) NULL,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedAt DATETIME2 NULL,
    UpdatedBy NVARCHAR(100) NULL,
    RowVersion TIMESTAMP NULL,
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE SET NULL
);

CREATE INDEX IX_AuditLogs_UserId ON AuditLogs(UserId);
CREATE INDEX IX_AuditLogs_EntityName ON AuditLogs(EntityName);
CREATE INDEX IX_AuditLogs_EntityId ON AuditLogs(EntityId);
CREATE INDEX IX_AuditLogs_Action ON AuditLogs(Action);
CREATE INDEX IX_AuditLogs_CreatedAt ON AuditLogs(CreatedAt);

-- App Settings Table
CREATE TABLE AppSettings (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    [Key] NVARCHAR(100) NOT NULL,
    Value NVARCHAR(MAX) NOT NULL,
    Description NVARCHAR(500) NULL,
    Category NVARCHAR(50) NOT NULL DEFAULT 'General',
    IsPublic BIT NOT NULL DEFAULT 1,
    DataType NVARCHAR(50) NOT NULL DEFAULT 'String',
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedAt DATETIME2 NULL,
    UpdatedBy NVARCHAR(100) NULL,
    RowVersion TIMESTAMP NULL
);

CREATE UNIQUE INDEX IX_AppSettings_Key ON AppSettings([Key]) WHERE IsDeleted = 0;
CREATE INDEX IX_AppSettings_Category ON AppSettings(Category);

-- Email Templates Table
CREATE TABLE EmailTemplates (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Subject NVARCHAR(200) NOT NULL,
    Body NVARCHAR(MAX) NOT NULL,
    TemplateType NVARCHAR(50) NOT NULL DEFAULT 'General',
    IsActive BIT NOT NULL DEFAULT 1,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedAt DATETIME2 NULL,
    UpdatedBy NVARCHAR(100) NULL,
    RowVersion TIMESTAMP NULL
);

CREATE UNIQUE INDEX IX_EmailTemplates_Name ON EmailTemplates(Name) WHERE IsDeleted = 0;
CREATE INDEX IX_EmailTemplates_TemplateType ON EmailTemplates(TemplateType);

-- Activity Logs Table
CREATE TABLE ActivityLogs (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    ActivityType NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500) NOT NULL,
    EntityType NVARCHAR(100) NULL,
    EntityId INT NULL,
    IpAddress NVARCHAR(50) NULL,
    UserAgent NVARCHAR(500) NULL,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedAt DATETIME2 NULL,
    UpdatedBy NVARCHAR(100) NULL,
    RowVersion TIMESTAMP NULL,
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
);

CREATE INDEX IX_ActivityLogs_UserId ON ActivityLogs(UserId);
CREATE INDEX IX_ActivityLogs_ActivityType ON ActivityLogs(ActivityType);
CREATE INDEX IX_ActivityLogs_CreatedAt ON ActivityLogs(CreatedAt);

-- =============================================
-- TRIGGERS FOR AUTO-UPDATE TIMESTAMPS
-- =============================================

-- Trigger for updating UpdatedAt on relevant tables
CREATE TRIGGER TR_Users_UpdateTimestamp
ON Users
AFTER UPDATE
AS
BEGIN
    IF UPDATE(FirstName) OR UPDATE(LastName) OR UPDATE(Email) OR UPDATE(Status)
    BEGIN
        UPDATE Users SET UpdatedAt = GETUTCDATE() WHERE Id IN (SELECT Id FROM inserted);
    END
END;

CREATE TRIGGER TR_Products_UpdateTimestamp
ON Products
AFTER UPDATE
AS
BEGIN
    IF UPDATE(Price) OR UPDATE(Name) OR UPDATE(Description) OR UPDATE(IsActive)
    BEGIN
        UPDATE Products SET UpdatedAt = GETUTCDATE() WHERE Id IN (SELECT Id FROM inserted);
    END
END;

CREATE TRIGGER TR_Orders_UpdateTimestamp
ON Orders
AFTER UPDATE
AS
BEGIN
    IF UPDATE(Status)
    BEGIN
        UPDATE Orders SET UpdatedAt = GETUTCDATE() WHERE Id IN (SELECT Id FROM inserted);
    END
END;

CREATE TRIGGER TR_StockItems_UpdateTimestamp
ON StockItems
AFTER UPDATE
AS
BEGIN
    IF UPDATE(QuantityOnHand) OR UPDATE(ReservedQuantity)
    BEGIN
        UPDATE StockItems SET UpdatedAt = GETUTCDATE() WHERE Id IN (SELECT Id FROM inserted);
    END
END;

-- =============================================
-- VIEWS FOR COMMON QUERIES
-- =============================================

-- Low Stock Products View
CREATE VIEW vw_LowStockProducts
AS
SELECT 
    p.Id,
    p.Name,
    p.SKU,
    p.MinimumStockLevel,
    p.ReorderLevel,
    c.Name AS CategoryName,
    ISNULL(SUM(si.QuantityOnHand), 0) AS TotalStock,
    CASE 
        WHEN ISNULL(SUM(si.QuantityOnHand), 0) <= 0 THEN 'OutOfStock'
        WHEN ISNULL(SUM(si.QuantityOnHand), 0) <= p.ReorderLevel THEN 'LowStock'
        ELSE 'InStock'
    END AS StockStatus
FROM Products p
LEFT JOIN StockItems si ON p.Id = si.ProductId AND si.IsDeleted = 0
LEFT JOIN Categories c ON p.CategoryId = c.Id
WHERE p.IsDeleted = 0 AND p.IsActive = 1
GROUP BY p.Id, p.Name, p.SKU, p.MinimumStockLevel, p.ReorderLevel, c.Name;

-- Order Summary View
CREATE VIEW vw_OrderSummary
AS
SELECT 
    o.Id,
    o.OrderNumber,
    o.OrderDate,
    o.Status,
    o.TotalAmount,
    o.PaymentStatus,
    u.FirstName + ' ' + u.LastName AS CustomerName,
    u.Email AS CustomerEmail,
    COUNT(oi.Id) AS ItemCount
FROM Orders o
INNER JOIN Customers c ON o.CustomerId = c.Id
INNER JOIN Users u ON c.UserId = u.Id
LEFT JOIN OrderItems oi ON o.Id = oi.OrderId
WHERE o.IsDeleted = 0
GROUP BY o.Id, o.OrderNumber, o.OrderDate, o.Status, o.TotalAmount, o.PaymentStatus, u.FirstName, u.LastName, u.Email;

-- Sales Summary View (for reporting)
CREATE VIEW vw_SalesSummary
AS
SELECT 
    CAST(o.OrderDate AS DATE) AS OrderDate,
    COUNT(DISTINCT o.Id) AS OrderCount,
    SUM(o.SubTotal) AS TotalSales,
    SUM(o.TaxAmount) AS TotalTax,
    SUM(o.ShippingAmount) AS TotalShipping,
    SUM(o.DiscountAmount) AS TotalDiscount,
    SUM(o.TotalAmount) AS TotalRevenue,
    SUM(CASE WHEN o.PaymentStatus = 'Paid' THEN o.TotalAmount ELSE 0 END) AS CollectedAmount
FROM Orders o
WHERE o.IsDeleted = 0
GROUP BY CAST(o.OrderDate AS DATE);

-- Product Sales Ranking View
CREATE VIEW vw_ProductSalesRanking
AS
SELECT 
    p.Id AS ProductId,
    p.Name AS ProductName,
    p.SKU,
    c.Name AS CategoryName,
    COUNT(DISTINCT oi.OrderId) AS OrderCount,
    SUM(oi.Quantity) AS TotalQuantitySold,
    SUM(oi.TotalPrice) AS TotalRevenue,
    SUM(oi.TotalCost) AS TotalCost,
    SUM(oi.TotalPrice - oi.TotalCost) AS TotalProfit
FROM Products p
INNER JOIN OrderItems oi ON p.Id = oi.ProductId
INNER JOIN Orders o ON oi.OrderId = o.Id
LEFT JOIN Categories c ON p.CategoryId = c.Id
WHERE p.IsDeleted = 0 AND o.IsDeleted = 0 AND o.Status NOT IN ('Cancelled')
GROUP BY p.Id, p.Name, p.SKU, c.Name
ORDER BY TotalRevenue DESC;

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to calculate available quantity
CREATE FUNCTION fn_GetAvailableQuantity(@ProductId INT, @VariantId INT = NULL)
RETURNS INT
AS
BEGIN
    DECLARE @OnHand INT, @Reserved INT;
    
    SELECT @OnHand = ISNULL(SUM(QuantityOnHand), 0),
           @Reserved = ISNULL(SUM(ReservedQuantity), 0)
    FROM StockItems
    WHERE ProductId = @ProductId AND ISNULL(VariantId, 0) = ISNULL(@VariantId, 0) AND IsDeleted = 0;
    
    RETURN ISNULL(@OnHand, 0) - ISNULL(@Reserved, 0);
END;

-- Function to calculate order total
CREATE FUNCTION fn_CalculateOrderTotal(@SubTotal DECIMAL(18,2), @Shipping DECIMAL(18,2), @TaxRate DECIMAL(5,2), @Discount DECIMAL(18,2))
RETURNS DECIMAL(18,2)
AS
BEGIN
    DECLARE @Tax DECIMAL(18,2) = @SubTotal * (@TaxRate / 100);
    RETURN @SubTotal + @Shipping + @Tax - @Discount;
END;

-- Function to generate order number
CREATE FUNCTION fn_GenerateOrderNumber()
RETURNS NVARCHAR(50)
AS
BEGIN
    DECLARE @Sequence INT;
    DECLARE @DateStr NVARCHAR(8) = FORMAT(GETUTCDATE(), 'yyyyMMdd');
    DECLARE @OrderNumber NVARCHAR(50);
    
    SELECT @Sequence = ISNULL(MAX(CAST(RIGHT(OrderNumber, 6) AS INT)), 0) + 1
    FROM Orders
    WHERE LEFT(OrderNumber, 17) = 'ORD-' + @DateStr + '-';
    
    SET @OrderNumber = 'ORD-' + @DateStr + '-' + RIGHT('000000' + CAST(@Sequence AS NVARCHAR(6)), 6);
    
    RETURN @OrderNumber;
END;

PRINT 'Schema Part 3 and additional objects created successfully!';
PRINT 'Database schema creation complete!';
