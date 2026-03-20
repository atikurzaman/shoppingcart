-- =============================================
-- Shopping Cart Database Schema
-- SQL Server 2019+
-- =============================================

-- =============================================
-- DROP EXISTING TABLES (in reverse order of dependencies)
-- =============================================
-- Uncomment if you want to recreate the database
-- DROP TABLE IF EXISTS AuditLogs;
-- DROP TABLE IF EXISTS Notifications;
-- DROP TABLE IF EXISTS ReturnItems;
-- DROP TABLE IF EXISTS Returns;
-- DROP TABLE IF EXISTS InvoiceItems;
-- DROP TABLE IF EXISTS Invoices;
-- DROP TABLE IF EXISTS ShipmentItems;
-- DROP TABLE IF EXISTS Shipments;
-- DROP TABLE IF EXISTS PaymentItems;
-- DROP TABLE IF EXISTS Payments;
-- DROP TABLE IF EXISTS OrderItems;
-- DROP TABLE IF EXISTS Orders;
-- DROP TABLE IF EXISTS CouponUsages;
-- DROP TABLE IF EXISTS CouponRestrictions;
-- DROP TABLE IF EXISTS Coupons;
-- DROP TABLE IF EXISTS Taxes;
-- DROP TABLE IF EXISTS WishlistItems;
-- DROP TABLE IF EXISTS Wishlists;
-- DROP TABLE IF EXISTS CartItems;
-- DROP TABLE IF EXISTS Carts;
-- DROP TABLE IF EXISTS Addresses;
-- DROP TABLE IF EXISTS Customers;
-- DROP TABLE IF EXISTS GoodsReceiptItems;
-- DROP TABLE IF EXISTS GoodsReceipts;
-- DROP TABLE IF EXISTS PurchaseOrderItems;
-- DROP TABLE IF EXISTS PurchaseOrders;
-- DROP TABLE IF EXISTS ReorderRules;
-- DROP TABLE IF EXISTS StockAdjustments;
-- DROP TABLE IF EXISTS StockMovements;
-- DROP TABLE IF EXISTS StockItems;
-- DROP TABLE IF EXISTS Warehouses;
-- DROP TABLE IF EXISTS ProductAttributeValues;
-- DROP TABLE IF EXISTS ProductAttributes;
-- DROP TABLE IF EXISTS ProductVariants;
-- DROP TABLE IF EXISTS ProductImages;
-- DROP TABLE IF EXISTS Products;
-- DROP TABLE IF EXISTS Suppliers;
-- DROP TABLE IF EXISTS Brands;
-- DROP TABLE IF EXISTS Categories;
-- DROP TABLE IF EXISTS RolePermissions;
-- DROP TABLE IF EXISTS Permissions;
-- DROP TABLE IF EXISTS UserRoles;
-- DROP TABLE IF EXISTS RefreshTokens;
-- DROP TABLE IF EXISTS Users;
-- DROP TABLE IF EXISTS Roles;
-- DROP TABLE IF EXISTS AppSettings;
-- DROP TABLE IF EXISTS EmailTemplates;
-- DROP TABLE IF EXISTS ActivityLogs;

-- =============================================
-- BASE TABLES
-- =============================================

-- Roles Table
CREATE TABLE Roles (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(50) NOT NULL,
    Description NVARCHAR(500) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedAt DATETIME2 NULL,
    UpdatedBy NVARCHAR(100) NULL,
    RowVersion TIMESTAMP NULL
);

CREATE UNIQUE INDEX IX_Roles_Name ON Roles(Name) WHERE IsDeleted = 0;

-- Users Table
CREATE TABLE Users (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Email NVARCHAR(256) NOT NULL,
    PasswordHash NVARCHAR(500) NOT NULL,
    FirstName NVARCHAR(100) NOT NULL,
    LastName NVARCHAR(100) NOT NULL,
    PhoneNumber NVARCHAR(20) NULL,
    AvatarUrl NVARCHAR(500) NULL,
    Status NVARCHAR(20) NOT NULL DEFAULT 'Active',
    EmailConfirmed BIT NOT NULL DEFAULT 0,
    EmailVerificationToken NVARCHAR(500) NULL,
    EmailVerificationTokenExpiry DATETIME2 NULL,
    PasswordResetToken NVARCHAR(500) NULL,
    PasswordResetTokenExpiry DATETIME2 NULL,
    LastLoginAt DATETIME2 NULL,
    RefreshToken NVARCHAR(500) NULL,
    RefreshTokenExpiry DATETIME2 NULL,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedAt DATETIME2 NULL,
    UpdatedBy NVARCHAR(100) NULL,
    RowVersion TIMESTAMP NULL
);

CREATE UNIQUE INDEX IX_Users_Email ON Users(Email) WHERE IsDeleted = 0;

-- User Roles Table (Many-to-Many)
CREATE TABLE UserRoles (
    UserId INT NOT NULL,
    RoleId INT NOT NULL,
    AssignedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    PRIMARY KEY (UserId, RoleId),
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
    FOREIGN KEY (RoleId) REFERENCES Roles(Id) ON DELETE CASCADE
);

CREATE INDEX IX_UserRoles_UserId ON UserRoles(UserId);
CREATE INDEX IX_UserRoles_RoleId ON UserRoles(RoleId);

-- Permissions Table
CREATE TABLE Permissions (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500) NULL,
    Category NVARCHAR(50) NOT NULL DEFAULT 'General',
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedAt DATETIME2 NULL,
    UpdatedBy NVARCHAR(100) NULL,
    RowVersion TIMESTAMP NULL
);

CREATE UNIQUE INDEX IX_Permissions_Name ON Permissions(Name) WHERE IsDeleted = 0;

-- Role Permissions Table (Many-to-Many)
CREATE TABLE RolePermissions (
    RoleId INT NOT NULL,
    PermissionId INT NOT NULL,
    PRIMARY KEY (RoleId, PermissionId),
    FOREIGN KEY (RoleId) REFERENCES Roles(Id) ON DELETE CASCADE,
    FOREIGN KEY (PermissionId) REFERENCES Permissions(Id) ON DELETE CASCADE
);

-- Refresh Tokens Table
CREATE TABLE RefreshTokens (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    Token NVARCHAR(500) NOT NULL,
    ExpiresAt DATETIME2 NOT NULL,
    RevokedAt DATETIME2 NULL,
    RevokedByIp NVARCHAR(50) NULL,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedAt DATETIME2 NULL,
    UpdatedBy NVARCHAR(100) NULL,
    RowVersion TIMESTAMP NULL,
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IX_RefreshTokens_Token ON RefreshTokens(Token) WHERE IsDeleted = 0;
CREATE INDEX IX_RefreshTokens_UserId ON RefreshTokens(UserId);

-- =============================================
-- CATALOG TABLES
-- =============================================

-- Categories Table
CREATE TABLE Categories (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Slug NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500) NULL,
    IconUrl NVARCHAR(500) NULL,
    ImageUrl NVARCHAR(500) NULL,
    ParentCategoryId INT NULL,
    DisplayOrder INT NOT NULL DEFAULT 0,
    IsFeatured BIT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedAt DATETIME2 NULL,
    UpdatedBy NVARCHAR(100) NULL,
    RowVersion TIMESTAMP NULL,
    FOREIGN KEY (ParentCategoryId) REFERENCES Categories(Id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX IX_Categories_Slug ON Categories(Slug) WHERE IsDeleted = 0;
CREATE INDEX IX_Categories_ParentCategoryId ON Categories(ParentCategoryId);

-- Brands Table
CREATE TABLE Brands (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Slug NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500) NULL,
    LogoUrl NVARCHAR(500) NULL,
    Website NVARCHAR(200) NULL,
    IsFeatured BIT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedAt DATETIME2 NULL,
    UpdatedBy NVARCHAR(100) NULL,
    RowVersion TIMESTAMP NULL
);

CREATE UNIQUE INDEX IX_Brands_Slug ON Brands(Slug) WHERE IsDeleted = 0;

-- Suppliers Table
CREATE TABLE Suppliers (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(200) NOT NULL,
    ContactPerson NVARCHAR(100) NULL,
    Email NVARCHAR(256) NULL,
    Phone NVARCHAR(20) NULL,
    Address NVARCHAR(500) NULL,
    City NVARCHAR(100) NULL,
    Country NVARCHAR(100) NULL DEFAULT 'Bangladesh',
    Notes NVARCHAR(1000) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedAt DATETIME2 NULL,
    UpdatedBy NVARCHAR(100) NULL,
    RowVersion TIMESTAMP NULL
);

CREATE INDEX IX_Suppliers_Name ON Suppliers(Name);

-- Products Table
CREATE TABLE Products (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(200) NOT NULL,
    Slug NVARCHAR(200) NOT NULL,
    SKU NVARCHAR(50) NULL,
    Barcode NVARCHAR(50) NULL,
    ShortDescription NVARCHAR(500) NULL,
    Description NVARCHAR(MAX) NULL,
    Price DECIMAL(18,2) NOT NULL,
    OldPrice DECIMAL(18,2) NULL,
    CostPrice DECIMAL(18,2) NOT NULL DEFAULT 0,
    CategoryId INT NOT NULL,
    BrandId INT NULL,
    SupplierId INT NULL,
    IsFeatured BIT NOT NULL DEFAULT 0,
    IsBestSeller BIT NOT NULL DEFAULT 0,
    IsNewArrival BIT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1,
    MinimumStockLevel INT NOT NULL DEFAULT 10,
    ReorderLevel INT NOT NULL DEFAULT 5,
    Weight DECIMAL(18,2) NOT NULL DEFAULT 0,
    Dimensions NVARCHAR(100) NULL,
    ViewCount INT NOT NULL DEFAULT 0,
    RatingAverage DECIMAL(3,2) NOT NULL DEFAULT 0,
    ReviewCount INT NOT NULL DEFAULT 0,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedAt DATETIME2 NULL,
    UpdatedBy NVARCHAR(100) NULL,
    RowVersion TIMESTAMP NULL,
    FOREIGN KEY (CategoryId) REFERENCES Categories(Id) ON DELETE RESTRICT,
    FOREIGN KEY (BrandId) REFERENCES Brands(Id) ON DELETE SET NULL,
    FOREIGN KEY (SupplierId) REFERENCES Suppliers(Id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX IX_Products_Slug ON Products(Slug) WHERE IsDeleted = 0;
CREATE UNIQUE INDEX IX_Products_SKU ON Products(SKU) WHERE IsDeleted = 0;
CREATE UNIQUE INDEX IX_Products_Barcode ON Products(Barcode) WHERE IsDeleted = 0;
CREATE INDEX IX_Products_CategoryId ON Products(CategoryId);
CREATE INDEX IX_Products_BrandId ON Products(BrandId);
CREATE INDEX IX_Products_IsFeatured ON Products(IsFeatured) WHERE IsFeatured = 1;

-- Product Images Table
CREATE TABLE ProductImages (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ProductId INT NOT NULL,
    ImageUrl NVARCHAR(500) NOT NULL,
    AltText NVARCHAR(200) NULL,
    DisplayOrder INT NOT NULL DEFAULT 0,
    IsMain BIT NOT NULL DEFAULT 0,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedAt DATETIME2 NULL,
    UpdatedBy NVARCHAR(100) NULL,
    RowVersion TIMESTAMP NULL,
    FOREIGN KEY (ProductId) REFERENCES Products(Id) ON DELETE CASCADE
);

CREATE INDEX IX_ProductImages_ProductId ON ProductImages(ProductId);

-- Product Variants Table
CREATE TABLE ProductVariants (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ProductId INT NOT NULL,
    Name NVARCHAR(100) NOT NULL,
    SKU NVARCHAR(50) NULL,
    Barcode NVARCHAR(50) NULL,
    Price DECIMAL(18,2) NOT NULL,
    CostPrice DECIMAL(18,2) NOT NULL DEFAULT 0,
    StockQuantity INT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedAt DATETIME2 NULL,
    UpdatedBy NVARCHAR(100) NULL,
    RowVersion TIMESTAMP NULL,
    FOREIGN KEY (ProductId) REFERENCES Products(Id) ON DELETE CASCADE
);

CREATE INDEX IX_ProductVariants_ProductId ON ProductVariants(ProductId);
CREATE INDEX IX_ProductVariants_SKU ON ProductVariants(SKU) WHERE SKU IS NOT NULL;

-- Product Attributes Table
CREATE TABLE ProductAttributes (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500) NULL,
    DisplayOrder INT NOT NULL DEFAULT 0,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedAt DATETIME2 NULL,
    UpdatedBy NVARCHAR(100) NULL,
    RowVersion TIMESTAMP NULL
);

-- Product Attribute Values Table
CREATE TABLE ProductAttributeValues (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ProductId INT NOT NULL,
    VariantId INT NULL,
    AttributeId INT NOT NULL,
    Value NVARCHAR(500) NOT NULL,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedAt DATETIME2 NULL,
    UpdatedBy NVARCHAR(100) NULL,
    RowVersion TIMESTAMP NULL,
    FOREIGN KEY (ProductId) REFERENCES Products(Id) ON DELETE CASCADE,
    FOREIGN KEY (VariantId) REFERENCES ProductVariants(Id) ON DELETE CASCADE,
    FOREIGN KEY (AttributeId) REFERENCES ProductAttributes(Id) ON DELETE CASCADE
);

CREATE INDEX IX_ProductAttributeValues_ProductId ON ProductAttributeValues(ProductId);
CREATE INDEX IX_ProductAttributeValues_VariantId ON ProductAttributeValues(VariantId);

-- =============================================
-- INVENTORY TABLES
-- =============================================

-- Warehouses Table
CREATE TABLE Warehouses (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Code NVARCHAR(20) NOT NULL,
    Description NVARCHAR(500) NULL,
    Address NVARCHAR(500) NULL,
    City NVARCHAR(100) NULL,
    Country NVARCHAR(100) NULL DEFAULT 'Bangladesh',
    Phone NVARCHAR(20) NULL,
    Email NVARCHAR(256) NULL,
    IsDefault BIT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedAt DATETIME2 NULL,
    UpdatedBy NVARCHAR(100) NULL,
    RowVersion TIMESTAMP NULL
);

CREATE UNIQUE INDEX IX_Warehouses_Code ON Warehouses(Code) WHERE IsDeleted = 0;

-- Stock Items Table
CREATE TABLE StockItems (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ProductId INT NOT NULL,
    VariantId INT NULL,
    WarehouseId INT NOT NULL,
    QuantityOnHand INT NOT NULL DEFAULT 0,
    ReservedQuantity INT NOT NULL DEFAULT 0,
    ReorderLevel INT NULL,
    BatchNumber NVARCHAR(50) NULL,
    ExpiryDate DATE NULL,
    LastStockCheckDate DATETIME2 NULL,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedAt DATETIME2 NULL,
    UpdatedBy NVARCHAR(100) NULL,
    RowVersion TIMESTAMP NULL,
    FOREIGN KEY (ProductId) REFERENCES Products(Id) ON DELETE CASCADE,
    FOREIGN KEY (VariantId) REFERENCES ProductVariants(Id) ON DELETE CASCADE,
    FOREIGN KEY (WarehouseId) REFERENCES Warehouses(Id) ON DELETE RESTRICT
);

CREATE UNIQUE INDEX IX_StockItems_ProductId_VariantId_WarehouseId 
ON StockItems(ProductId, VariantId, WarehouseId) WHERE IsDeleted = 0;
CREATE INDEX IX_StockItems_ProductId ON StockItems(ProductId);

-- Stock Movements Table
CREATE TABLE StockMovements (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ProductId INT NOT NULL,
    VariantId INT NULL,
    FromWarehouseId INT NULL,
    ToWarehouseId INT NULL,
    Quantity INT NOT NULL,
    MovementType NVARCHAR(20) NOT NULL,
    ReferenceNumber NVARCHAR(50) NULL,
    ReferenceId INT NULL,
    Notes NVARCHAR(500) NULL,
    UnitCost DECIMAL(18,2) NULL,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedAt DATETIME2 NULL,
    UpdatedBy NVARCHAR(100) NULL,
    RowVersion TIMESTAMP NULL,
    FOREIGN KEY (ProductId) REFERENCES Products(Id) ON DELETE RESTRICT,
    FOREIGN KEY (FromWarehouseId) REFERENCES Warehouses(Id) ON DELETE SET NULL,
    FOREIGN KEY (ToWarehouseId) REFERENCES Warehouses(Id) ON DELETE SET NULL
);

CREATE INDEX IX_StockMovements_ProductId ON StockMovements(ProductId);
CREATE INDEX IX_StockMovements_MovementType ON StockMovements(MovementType);
CREATE INDEX IX_StockMovements_CreatedAt ON StockMovements(CreatedAt);

-- Stock Adjustments Table
CREATE TABLE StockAdjustments (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ProductId INT NOT NULL,
    VariantId INT NULL,
    WarehouseId INT NOT NULL,
    AdjustmentQuantity INT NOT NULL,
    Reason NVARCHAR(200) NOT NULL,
    Notes NVARCHAR(500) NULL,
    AdjustedByUserId INT NOT NULL,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedAt DATETIME2 NULL,
    UpdatedBy NVARCHAR(100) NULL,
    RowVersion TIMESTAMP NULL,
    FOREIGN KEY (ProductId) REFERENCES Products(Id) ON DELETE RESTRICT,
    FOREIGN KEY (WarehouseId) REFERENCES Warehouses(Id) ON DELETE RESTRICT
);

CREATE INDEX IX_StockAdjustments_ProductId ON StockAdjustments(ProductId);
CREATE INDEX IX_StockAdjustments_CreatedAt ON StockAdjustments(CreatedAt);

-- Reorder Rules Table
CREATE TABLE ReorderRules (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ProductId INT NOT NULL,
    VariantId INT NULL,
    ReorderLevel INT NOT NULL,
    ReorderQuantity INT NOT NULL,
    PreferredSupplierId INT NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedAt DATETIME2 NULL,
    UpdatedBy NVARCHAR(100) NULL,
    RowVersion TIMESTAMP NULL,
    FOREIGN KEY (ProductId) REFERENCES Products(Id) ON DELETE CASCADE,
    FOREIGN KEY (PreferredSupplierId) REFERENCES Suppliers(Id) ON DELETE SET NULL
);

CREATE INDEX IX_ReorderRules_ProductId ON ReorderRules(ProductId);

PRINT 'Schema created successfully!';
