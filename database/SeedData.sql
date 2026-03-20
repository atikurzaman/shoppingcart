-- =============================================
-- Shopping Cart Database Seed Data
-- Initial data for roles, users, categories, brands, etc.
-- =============================================

SET IDENTITY_INSERT Roles ON;

-- =============================================
-- ROLES
-- =============================================

INSERT INTO Roles (Id, Name, Description, IsActive, IsDeleted, CreatedAt, CreatedBy)
VALUES 
(1, 'Admin', 'System administrator with full access', 1, 0, GETUTCDATE(), 'system'),
(2, 'Manager', 'Store manager with elevated permissions', 1, 0, GETUTCDATE(), 'system'),
(3, 'Staff', 'Store staff with limited permissions', 1, 0, GETUTCDATE(), 'system'),
(4, 'Customer', 'Regular customer account', 1, 0, GETUTCDATE(), 'system');

SET IDENTITY_INSERT Roles OFF;

PRINT 'Roles seeded successfully.';

-- =============================================
-- PERMISSIONS
-- =============================================

SET IDENTITY_INSERT Permissions ON;

INSERT INTO Permissions (Id, Name, Description, Category, IsDeleted, CreatedAt, CreatedBy)
VALUES 
-- Dashboard
(1, 'dashboard:view', 'View dashboard', 'Dashboard', 0, GETUTCDATE(), 'system'),
-- Users
(2, 'users:view', 'View users list', 'Users', 0, GETUTCDATE(), 'system'),
(3, 'users:create', 'Create new users', 'Users', 0, GETUTCDATE(), 'system'),
(4, 'users:update', 'Update user information', 'Users', 0, GETUTCDATE(), 'system'),
(5, 'users:delete', 'Delete users', 'Users', 0, GETUTCDATE(), 'system'),
-- Roles
(6, 'roles:view', 'View roles', 'Roles', 0, GETUTCDATE(), 'system'),
(7, 'roles:create', 'Create new roles', 'Roles', 0, GETUTCDATE(), 'system'),
(8, 'roles:update', 'Update role permissions', 'Roles', 0, GETUTCDATE(), 'system'),
(9, 'roles:delete', 'Delete roles', 'Roles', 0, GETUTCDATE(), 'system'),
-- Products
(10, 'products:view', 'View products', 'Products', 0, GETUTCDATE(), 'system'),
(11, 'products:create', 'Create products', 'Products', 0, GETUTCDATE(), 'system'),
(12, 'products:update', 'Update products', 'Products', 0, GETUTCDATE(), 'system'),
(13, 'products:delete', 'Delete products', 'Products', 0, GETUTCDATE(), 'system'),
-- Categories
(14, 'categories:view', 'View categories', 'Categories', 0, GETUTCDATE(), 'system'),
(15, 'categories:create', 'Create categories', 'Categories', 0, GETUTCDATE(), 'system'),
(16, 'categories:update', 'Update categories', 'Categories', 0, GETUTCDATE(), 'system'),
(17, 'categories:delete', 'Delete categories', 'Categories', 0, GETUTCDATE(), 'system'),
-- Brands
(18, 'brands:view', 'View brands', 'Brands', 0, GETUTCDATE(), 'system'),
(19, 'brands:create', 'Create brands', 'Brands', 0, GETUTCDATE(), 'system'),
(20, 'brands:update', 'Update brands', 'Brands', 0, GETUTCDATE(), 'system'),
(21, 'brands:delete', 'Delete brands', 'Brands', 0, GETUTCDATE(), 'system'),
-- Orders
(22, 'orders:view', 'View orders', 'Orders', 0, GETUTCDATE(), 'system'),
(23, 'orders:create', 'Create orders', 'Orders', 0, GETUTCDATE(), 'system'),
(24, 'orders:update', 'Update orders', 'Orders', 0, GETUTCDATE(), 'system'),
(25, 'orders:delete', 'Delete orders', 'Orders', 0, GETUTCDATE(), 'system'),
(26, 'orders:process', 'Process orders', 'Orders', 0, GETUTCDATE(), 'system'),
-- Inventory
(27, 'inventory:view', 'View inventory', 'Inventory', 0, GETUTCDATE(), 'system'),
(28, 'inventory:adjust', 'Adjust inventory', 'Inventory', 0, GETUTCDATE(), 'system'),
-- Coupons
(29, 'coupons:view', 'View coupons', 'Coupons', 0, GETUTCDATE(), 'system'),
(30, 'coupons:create', 'Create coupons', 'Coupons', 0, GETUTCDATE(), 'system'),
(31, 'coupons:update', 'Update coupons', 'Coupons', 0, GETUTCDATE(), 'system'),
(32, 'coupons:delete', 'Delete coupons', 'Coupons', 0, GETUTCDATE(), 'system'),
-- Reports
(33, 'reports:view', 'View reports', 'Reports', 0, GETUTCDATE(), 'system'),
(34, 'reports:export', 'Export reports', 'Reports', 0, GETUTCDATE(), 'system'),
-- Settings
(35, 'settings:view', 'View settings', 'Settings', 0, GETUTCDATE(), 'system'),
(36, 'settings:update', 'Update settings', 'Settings', 0, GETUTCDATE(), 'system');

SET IDENTITY_INSERT Permissions OFF;

PRINT 'Permissions seeded successfully.';

-- =============================================
-- ROLE PERMISSIONS
-- =============================================

-- Admin gets all permissions
INSERT INTO RolePermissions (RoleId, PermissionId)
SELECT 1, Id FROM Permissions WHERE IsDeleted = 0;

-- Manager gets most permissions except user/role deletion
INSERT INTO RolePermissions (RoleId, PermissionId)
SELECT 2, Id FROM Permissions WHERE IsDeleted = 0 AND Name NOT LIKE '%:delete' AND Name NOT LIKE 'users:%' AND Name NOT LIKE 'roles:%';

-- Staff gets view and limited update permissions
INSERT INTO RolePermissions (RoleId, PermissionId)
SELECT 3, Id FROM Permissions WHERE IsDeleted = 0 AND Name LIKE '%:view' 
UNION
SELECT 3, Id FROM Permissions WHERE IsDeleted = 0 AND Name IN ('products:update', 'orders:view', 'orders:update', 'inventory:view');

-- Customer gets basic permissions
INSERT INTO RolePermissions (RoleId, PermissionId)
SELECT 4, Id FROM Permissions WHERE IsDeleted = 0 AND Name IN ('dashboard:view');

PRINT 'Role permissions seeded successfully.';

-- =============================================
-- ADMIN USER
-- Password: Admin@123 (BCrypt hash)
-- =============================================

SET IDENTITY_INSERT Users ON;

INSERT INTO Users (Id, Email, PasswordHash, FirstName, LastName, PhoneNumber, Status, EmailConfirmed, IsDeleted, CreatedAt, CreatedBy)
VALUES 
(1, 'admin@shoppingcart.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYuP7Z.K4Gu', 'System', 'Admin', '+8809613800800', 'Active', 1, 0, GETUTCDATE(), 'system');

SET IDENTITY_INSERT Users OFF;

-- Assign Admin role to admin user
INSERT INTO UserRoles (UserId, RoleId, AssignedAt)
VALUES (1, 1, GETUTCDATE());

-- Create customer record for admin
SET IDENTITY_INSERT Customers ON;

INSERT INTO Customers (Id, UserId, IsDeleted, CreatedAt, CreatedBy)
VALUES (1, 1, 0, GETUTCDATE(), 'system');

SET IDENTITY_INSERT Customers OFF;

PRINT 'Admin user seeded successfully. Email: admin@shoppingcart.com, Password: Admin@123';

-- =============================================
-- TEST CUSTOMER USER
-- Password: Customer@123
-- =============================================

SET IDENTITY_INSERT Users ON;

INSERT INTO Users (Id, Email, PasswordHash, FirstName, LastName, PhoneNumber, Status, EmailConfirmed, IsDeleted, CreatedAt, CreatedBy)
VALUES 
(2, 'customer@test.com', '$2a$12$XQxBtLkSPNqz9gN7x8E3/.m7xL4qF0k8Xy2H1V5dT8rM6pL5oK4Ji', 'John', 'Doe', '+8801712345678', 'Active', 1, 0, GETUTCDATE(), 'system');

SET IDENTITY_INSERT Users OFF;

INSERT INTO UserRoles (UserId, RoleId, AssignedAt)
VALUES (2, 4, GETUTCDATE());

SET IDENTITY_INSERT Customers ON;

INSERT INTO Customers (Id, UserId, IsDeleted, CreatedAt, CreatedBy)
VALUES (2, 2, 0, GETUTCDATE(), 'system');

SET IDENTITY_INSERT Customers OFF;

PRINT 'Test customer seeded successfully.';

-- =============================================
-- CATEGORIES (Like Othoba)
-- =============================================

SET IDENTITY_INSERT Categories ON;

INSERT INTO Categories (Id, Name, Slug, Description, IconUrl, ImageUrl, ParentCategoryId, DisplayOrder, IsFeatured, IsActive, IsDeleted, CreatedAt, CreatedBy)
VALUES 
(1, 'Global Finds', 'global-finds', 'Discover products from around the world', 'https://cdn.othoba.com/images/thumbs/1997733_Global Finds_20.png', 'https://cdn.othoba.com/images/thumbs/1997731_trending-store_200.png', NULL, 1, 1, 1, 0, GETUTCDATE(), 'system'),
(2, 'Smartphone', 'smartphone', 'Latest smartphones and accessories', 'https://cdn.othoba.com/images/thumbs/2000487_Mobile_20.png', 'https://cdn.othoba.com/images/thumbs/2000469_smartphone_200.png', NULL, 2, 1, 1, 0, GETUTCDATE(), 'system'),
(3, 'Daily Bazar', 'daily-bazar', 'Daily essentials and groceries', 'https://cdn.othoba.com/images/thumbs/2001251_Daily bazar icon_20.png', 'https://cdn.othoba.com/images/thumbs/2001238_daily-bazar_200.png', NULL, 3, 1, 1, 0, GETUTCDATE(), 'system'),
(4, 'Baby Care', 'baby-care-toys', 'Baby products and toys', 'https://cdn.othoba.com/images/thumbs/1997719_Baby care_20.png', 'https://cdn.othoba.com/images/thumbs/1997717_baby-care_200.png', NULL, 4, 1, 1, 0, GETUTCDATE(), 'system'),
(5, 'Electronics & Appliances', 'electronics-store', 'Electronic devices and home appliances', 'https://cdn.othoba.com/images/thumbs/1997724_Electronics & Appliances_20.png', 'https://cdn.othoba.com/images/thumbs/1997722_electronics-appliances_200.png', NULL, 5, 1, 1, 0, GETUTCDATE(), 'system'),
(6, 'Men', 'men', 'Men fashion and accessories', 'https://cdn.othoba.com/images/thumbs/2000383_men_20.png', 'https://cdn.othoba.com/images/thumbs/2000354_men_200.png', NULL, 6, 1, 1, 0, GETUTCDATE(), 'system'),
(7, 'Women', 'womens-fashion', 'Women fashion and accessories', 'https://cdn.othoba.com/images/thumbs/2000652_women_20.png', 'https://cdn.othoba.com/images/thumbs/2000616_women_200.png', NULL, 7, 1, 1, 0, GETUTCDATE(), 'system'),
(8, 'Furniture', 'furniture', 'Home and office furniture', 'https://cdn.othoba.com/images/thumbs/1997726_Furniture_20.png', 'https://cdn.othoba.com/images/thumbs/1997725_furniture_200.png', NULL, 8, 1, 1, 0, GETUTCDATE(), 'system'),
(9, 'Beauty', 'health-beauty', 'Health and beauty products', 'https://cdn.othoba.com/images/thumbs/1997739_Health & Beauty_20.png', 'https://cdn.othoba.com/images/thumbs/1997737_health-beauty_200.png', NULL, 9, 1, 1, 0, GETUTCDATE(), 'system'),
(10, 'Household Essentials', 'household-essential', 'Daily household items', 'https://cdn.othoba.com/images/thumbs/1997745_House hold2_20.png', 'https://cdn.othoba.com/images/thumbs/1997743_household-essentials_200.png', NULL, 10, 1, 1, 0, GETUTCDATE(), 'system'),
(11, 'Kitchen', 'kitchen-tools', 'Kitchen tools and appliances', 'https://cdn.othoba.com/images/thumbs/2000255_Kitchen tools_20.png', 'https://cdn.othoba.com/images/thumbs/2000214_kitchen-tools_200.png', NULL, 11, 1, 1, 0, GETUTCDATE(), 'system'),
(12, 'Grocery', 'food-grocery', 'Food and grocery items', 'https://cdn.othoba.com/images/thumbs/1997736_Grocery_20.png', 'https://cdn.othoba.com/images/thumbs/1997734_grocery_200.png', NULL, 12, 1, 1, 0, GETUTCDATE(), 'system');

SET IDENTITY_INSERT Categories OFF;

PRINT 'Categories seeded successfully.';

-- =============================================
-- BRANDS
-- =============================================

SET IDENTITY_INSERT Brands ON;

INSERT INTO Brands (Id, Name, Slug, Description, LogoUrl, Website, IsFeatured, IsActive, IsDeleted, CreatedAt, CreatedBy)
VALUES 
(1, 'Samsung', 'samsung', 'Samsung Electronics', 'https://cdn.othoba.com/brands/samsung.png', 'https://www.samsung.com', 1, 1, 0, GETUTCDATE(), 'system'),
(2, 'Apple', 'apple', 'Apple Inc.', 'https://cdn.othoba.com/brands/apple.png', 'https://www.apple.com', 1, 1, 0, GETUTCDATE(), 'system'),
(3, 'Xiaomi', 'xiaomi', 'Xiaomi Corporation', 'https://cdn.othoba.com/brands/xiaomi.png', 'https://www.xiaomi.com', 1, 1, 0, GETUTCDATE(), 'system'),
(4, 'RFL', 'rfl', 'RFL Group - Plastics & Furniture', 'https://cdn.othoba.com/brands/rfl.png', 'https://www.rflglobal.com', 1, 1, 0, GETUTCDATE(), 'system'),
(5, 'Unilever', 'unilever', 'Unilever Bangladesh', 'https://cdn.othoba.com/brands/unilever.png', 'https://www.unilever.com', 1, 1, 0, GETUTCDATE(), 'system'),
(6, 'Walton', 'walton', 'Walton Hi-Tech Industries', 'https://cdn.othoba.com/brands/walton.png', 'https://www.waltonbd.com', 1, 1, 0, GETUTCDATE(), 'system'),
(7, 'Vision', 'vision', 'Vision Appliances', 'https://cdn.othoba.com/brands/vision.png', NULL, 0, 1, 0, GETUTCDATE(), 'system'),
(8, 'Lux', 'lux', 'Lux Soap and Beauty Products', 'https://cdn.othoba.com/brands/lux.png', 'https://www.luxinternational.com', 0, 1, 0, GETUTCDATE(), 'system');

SET IDENTITY_INSERT Brands OFF;

PRINT 'Brands seeded successfully.';

-- =============================================
-- SUPPLIERS
-- =============================================

SET IDENTITY_INSERT Suppliers ON;

INSERT INTO Suppliers (Id, Name, ContactPerson, Email, Phone, Address, City, Country, IsActive, IsDeleted, CreatedAt, CreatedBy)
VALUES 
(1, 'Samsung Electronics Bangladesh', 'Mr. Rahman', 'contact@samsung-bd.com', '+8802-9876543', 'Gulshan-1, Dhaka', 'Dhaka', 'Bangladesh', 1, 0, GETUTCDATE(), 'system'),
(2, 'Apple Authorized Distributor', 'Ms. Khatun', 'sales@apple-bd.com', '+8802-8765432', 'Banani, Dhaka', 'Dhaka', 'Bangladesh', 1, 0, GETUTCDATE(), 'system'),
(3, 'RFL Plastics Ltd', 'Mr. Islam', 'info@rfl-bd.com', '+8802-7654321', 'Mymensingh', 'Mymensingh', 'Bangladesh', 1, 0, GETUTCDATE(), 'system'),
(4, 'Unilever Bangladesh', 'Ms. Begum', 'unilever@unilever.com', '+8802-6543210', 'Dhaka', 'Dhaka', 'Bangladesh', 1, 0, GETUTCDATE(), 'system'),
(5, 'Walton Electronics', 'Mr. Khan', 'walton@waltonbd.com', '+8802-5432109', 'Dhaka', 'Dhaka', 'Bangladesh', 1, 0, GETUTCDATE(), 'system');

SET IDENTITY_INSERT Suppliers OFF;

PRINT 'Suppliers seeded successfully.';

-- =============================================
-- WAREHOUSES
-- =============================================

SET IDENTITY_INSERT Warehouses ON;

INSERT INTO Warehouses (Id, Name, Code, Description, Address, City, Country, Phone, Email, IsDefault, IsActive, IsDeleted, CreatedAt, CreatedBy)
VALUES 
(1, 'Main Warehouse', 'WH-MAIN', 'Primary storage facility', 'Gazipur, Dhaka', 'Dhaka', 'Bangladesh', '+8802-1234567', 'warehouse@shoppingcart.com', 1, 1, 0, GETUTCDATE(), 'system'),
(2, 'Chittagong Hub', 'WH-CTG', 'Chittagong regional hub', 'Chittagong', 'Chittagong', 'Bangladesh', '+88031-123456', 'chittagong@shoppingcart.com', 0, 1, 0, GETUTCDATE(), 'system'),
(3, 'Sylhet Hub', 'WH-SYL', 'Sylhet regional hub', 'Sylhet', 'Sylhet', 'Bangladesh', '+880821-123456', 'sylhet@shoppingcart.com', 0, 1, 0, GETUTCDATE(), 'system');

SET IDENTITY_INSERT Warehouses OFF;

PRINT 'Warehouses seeded successfully.';

-- =============================================
-- TAXES
-- =============================================

SET IDENTITY_INSERT Taxes ON;

INSERT INTO Taxes (Id, Name, Code, Rate, IsActive, IsDefault, Description, Priority, ApplyToShipping, IsDeleted, CreatedAt, CreatedBy)
VALUES 
(1, 'VAT', 'VAT-15', 15.00, 1, 1, 'Value Added Tax @ 15%', 1, 1, 0, GETUTCDATE(), 'system'),
(2, 'Supplementary Duty', 'SD-5', 5.00, 1, 0, 'Supplementary Duty @ 5%', 2, 0, 0, GETUTCDATE(), 'system');

SET IDENTITY_INSERT Taxes OFF;

PRINT 'Taxes seeded successfully.';

-- =============================================
-- COUPONS
-- =============================================

SET IDENTITY_INSERT Coupons ON;

INSERT INTO Coupons (Id, Code, Name, Description, CouponType, DiscountValue, MinimumOrderAmount, MaximumDiscountAmount, MaximumUsageCount, MaximumUsagePerUser, StartDate, EndDate, IsActive, IsFirstOrderOnly, IsDeleted, CreatedAt, CreatedBy)
VALUES 
(1, 'WELCOME10', 'Welcome Discount', '10% off for new customers', 'Percentage', 10.00, 500.00, 200.00, 1000, 1, GETUTCDATE(), DATEADD(MONTH, 6, GETUTCDATE()), 1, 1, 0, GETUTCDATE(), 'system'),
(2, 'FLAT100', 'Flat Tk 100 Off', 'Tk 100 off on orders above Tk 1000', 'FixedAmount', 100.00, 1000.00, NULL, 500, 1, GETUTCDATE(), DATEADD(MONTH, 3, GETUTCDATE()), 1, 0, 0, GETUTCDATE(), 'system'),
(3, 'EID20', 'Eid Special Offer', '20% off up to Tk 500', 'Percentage', 20.00, 2000.00, 500.00, NULL, NULL, GETUTCDATE(), DATEADD(MONTH, 1, GETUTCDATE()), 1, 0, 0, GETUTCDATE(), 'system');

SET IDENTITY_INSERT Coupons OFF;

PRINT 'Coupons seeded successfully.';

-- =============================================
-- APP SETTINGS
-- =============================================

SET IDENTITY_INSERT AppSettings ON;

INSERT INTO AppSettings (Id, [Key], Value, Description, Category, IsPublic, DataType, IsDeleted, CreatedAt, CreatedBy)
VALUES 
(1, 'StoreName', 'ShoppingCart', 'Store display name', 'General', 1, 'String', 0, GETUTCDATE(), 'system'),
(2, 'StoreEmail', 'support@shoppingcart.com', 'Contact email address', 'General', 1, 'String', 0, GETUTCDATE(), 'system'),
(3, 'StorePhone', '+8809613800800', 'Contact phone number', 'General', 1, 'String', 0, GETUTCDATE(), 'system'),
(4, 'Currency', 'BDT', 'Default currency code', 'General', 1, 'String', 0, GETUTCDATE(), 'system'),
(5, 'CurrencySymbol', 'Tk', 'Currency symbol', 'General', 1, 'String', 0, GETUTCDATE(), 'system'),
(6, 'TaxRate', '15', 'Default tax rate percentage', 'Tax', 1, 'Decimal', 0, GETUTCDATE(), 'system'),
(7, 'FreeShippingThreshold', '500', 'Free shipping for orders above this amount', 'Shipping', 1, 'Decimal', 0, GETUTCDATE(), 'system'),
(8, 'DefaultShippingCost', '60', 'Default shipping cost', 'Shipping', 1, 'Decimal', 0, GETUTCDATE(), 'system'),
(9, 'LowStockThreshold', '10', 'Low stock alert threshold', 'Inventory', 0, 'Integer', 0, GETUTCDATE(), 'system'),
(10, 'EnableReviews', 'true', 'Enable product reviews', 'Products', 1, 'Boolean', 0, GETUTCDATE(), 'system');

SET IDENTITY_INSERT AppSettings OFF;

PRINT 'App settings seeded successfully.';

-- =============================================
-- SAMPLE PRODUCTS
-- =============================================

SET IDENTITY_INSERT Products ON;

INSERT INTO Products (Id, Name, Slug, SKU, ShortDescription, Description, Price, OldPrice, CostPrice, CategoryId, BrandId, SupplierId, IsFeatured, IsBestSeller, IsNewArrival, IsActive, MinimumStockLevel, ReorderLevel, ViewCount, RatingAverage, ReviewCount, IsDeleted, CreatedAt, CreatedBy)
VALUES 
(1, 'Samsung Galaxy S24 Ultra', 'samsung-galaxy-s24-ultra', 'SAMS-S24U-001', 'Latest Samsung flagship with AI features', 'Experience the future with Samsung Galaxy S24 Ultra featuring advanced AI capabilities, 200MP camera, and S Pen built-in.', 149999.00, 159999.00, 130000.00, 2, 1, 1, 1, 1, 1, 1, 10, 5, 1523, 4.50, 127, 0, GETUTCDATE(), 'system'),
(2, 'Apple iPhone 15 Pro Max', 'apple-iphone-15-pro-max', 'APPLE-IP15PM-001', 'Premium Apple smartphone with A17 Pro chip', 'iPhone 15 Pro Max features the powerful A17 Pro chip, titanium design, and the most advanced camera system ever.', 179999.00, 189999.00, 155000.00, 2, 2, 2, 1, 1, 0, 1, 10, 5, 2045, 4.80, 245, 0, GETUTCDATE(), 'system'),
(3, 'Xiaomi Redmi Note 13 Pro', 'xiaomi-redmi-note-13-pro', 'XIAOMI-RN13P-001', '108MP camera mid-range champion', 'Xiaomi Redmi Note 13 Pro with 6.67" AMOLED display, 108MP camera, and 5100mAh battery.', 28999.00, 32999.00, 22000.00, 2, 3, NULL, 1, 0, 1, 1, 15, 5, 876, 4.20, 89, 0, GETUTCDATE(), 'system'),
(4, 'RFL Caino Closet 5 Drawer', 'rfl-caino-closet-5-drawer', 'RFL-CC5D-001', 'Premium wooden drawer cabinet', 'RFL Caino Closet with 5 spacious drawers, perfect for bedroom storage. Eagle Brown finish.', 15999.00, 18999.00, 11000.00, 8, 4, 3, 1, 1, 0, 1, 5, 2, 2341, 4.60, 312, 0, GETUTCDATE(), 'system'),
(5, 'Samsung 43 inch Smart TV', 'samsung-43-smart-tv', 'SAMS-43TV-001', '4K UHD Smart LED Television', 'Samsung 43 inch 4K UHD Smart TV with Crystal Processor, HDR, and Smart Hub.', 54999.00, 62999.00, 45000.00, 5, 1, 1, 1, 0, 0, 1, 5, 3, 1567, 4.40, 198, 0, GETUTCDATE(), 'system'),
(6, 'Surf Excel Liquid Detergent 1L', 'surf-excel-liquid-detergent', 'UNILEVER-SEL-1L', 'Advanced stain removal detergent', 'Surf Excel Liquid Detergent for top load machines. Removes tough stains in one wash.', 246.00, 400.00, 150.00, 3, 5, 4, 1, 1, 0, 1, 50, 20, 3456, 4.70, 567, 0, GETUTCDATE(), 'system'),
(7, 'Walton Refrigerator 253L', 'walton-refrigerator-253l', 'WALTON-RFG-253', 'Frost Free Double Door Refrigerator', 'Walton 253L frost free refrigerator with inverter technology and digital display.', 64999.00, 72999.00, 55000.00, 5, 6, 5, 1, 0, 0, 1, 3, 2, 892, 4.30, 134, 0, GETUTCDATE(), 'system'),
(8, 'BMW Motorsport Umbrella', 'bmw-motorsport-umbrella', 'AUTO-BMW-UMB-001', 'Premium car umbrella with BMW branding', 'BMW Motorsport umbrella - perfect for car use. Maroon color with premium Bangkok leather handle.', 592.00, 750.00, 350.00, 20, NULL, NULL, 0, 1, 0, 1, 20, 10, 456, 4.00, 45, 0, GETUTCDATE(), 'system');

SET IDENTITY_INSERT Products OFF;

PRINT 'Products seeded successfully.';

-- =============================================
-- PRODUCT IMAGES
-- =============================================

SET IDENTITY_INSERT ProductImages ON;

INSERT INTO ProductImages (Id, ProductId, ImageUrl, AltText, DisplayOrder, IsMain, IsDeleted, CreatedAt, CreatedBy)
VALUES 
(1, 1, 'https://cdn.othoba.com/images/products/samsung-s24-ultra-1.jpg', 'Samsung Galaxy S24 Ultra', 1, 1, 0, GETUTCDATE(), 'system'),
(2, 1, 'https://cdn.othoba.com/images/products/samsung-s24-ultra-2.jpg', 'Samsung Galaxy S24 Ultra Back', 2, 0, 0, GETUTCDATE(), 'system'),
(3, 2, 'https://cdn.othoba.com/images/products/iphone-15-pm-1.jpg', 'iPhone 15 Pro Max', 1, 1, 0, GETUTCDATE(), 'system'),
(4, 2, 'https://cdn.othoba.com/images/products/iphone-15-pm-2.jpg', 'iPhone 15 Pro Max Side', 2, 0, 0, GETUTCDATE(), 'system'),
(5, 3, 'https://cdn.othoba.com/images/products/redmi-n13p-1.jpg', 'Xiaomi Redmi Note 13 Pro', 1, 1, 0, GETUTCDATE(), 'system'),
(6, 4, 'https://cdn.othoba.com/images/products/rfl-caino-closet-1.jpg', 'RFL Caino Closet 5 Drawer', 1, 1, 0, GETUTCDATE(), 'system'),
(7, 4, 'https://cdn.othoba.com/images/products/rfl-caino-closet-2.jpg', 'RFL Caino Closet Drawers', 2, 0, 0, GETUTCDATE(), 'system'),
(8, 5, 'https://cdn.othoba.com/images/products/samsung-tv-1.jpg', 'Samsung Smart TV', 1, 1, 0, GETUTCDATE(), 'system'),
(9, 6, 'https://cdn.othoba.com/images/products/surf-excel-1.jpg', 'Surf Excel Liquid', 1, 1, 0, GETUTCDATE(), 'system'),
(10, 7, 'https://cdn.othoba.com/images/products/walton-fridge-1.jpg', 'Walton Refrigerator', 1, 1, 0, GETUTCDATE(), 'system'),
(11, 8, 'https://cdn.othoba.com/images/products/bmw-umbrella-1.jpg', 'BMW Umbrella', 1, 1, 0, GETUTCDATE(), 'system');

SET IDENTITY_INSERT ProductImages OFF;

PRINT 'Product images seeded successfully.';

-- =============================================
-- STOCK ITEMS
-- =============================================

SET IDENTITY_INSERT StockItems ON;

INSERT INTO StockItems (Id, ProductId, VariantId, WarehouseId, QuantityOnHand, ReservedQuantity, ReorderLevel, IsDeleted, CreatedAt, CreatedBy)
VALUES 
(1, 1, NULL, 1, 50, 0, 10, 0, GETUTCDATE(), 'system'),
(2, 2, NULL, 1, 30, 0, 10, 0, GETUTCDATE(), 'system'),
(3, 3, NULL, 1, 100, 5, 15, 0, GETUTCDATE(), 'system'),
(4, 4, NULL, 1, 25, 0, 5, 0, GETUTCDATE(), 'system'),
(5, 4, NULL, 2, 10, 0, 5, 0, GETUTCDATE(), 'system'),
(6, 5, NULL, 1, 40, 0, 10, 0, GETUTCDATE(), 'system'),
(7, 6, NULL, 1, 500, 0, 50, 0, GETUTCDATE(), 'system'),
(8, 7, NULL, 1, 20, 0, 5, 0, GETUTCDATE(), 'system'),
(9, 8, NULL, 1, 150, 0, 20, 0, GETUTCDATE(), 'system');

SET IDENTITY_INSERT StockItems OFF;

PRINT 'Stock items seeded successfully.';

-- =============================================
-- CUSTOMER ADDRESSES
-- =============================================

SET IDENTITY_INSERT Addresses ON;

INSERT INTO Addresses (Id, CustomerId, UserId, AddressType, FullName, CompanyName, PhoneNumber, AddressLine1, AddressLine2, City, State, PostalCode, Country, IsDefault, IsDeleted, CreatedAt, CreatedBy)
VALUES 
(1, 2, 2, 'Shipping', 'John Doe', NULL, '+8801712345678', 'House 12, Road 5', 'Dhanmondi', 'Dhaka', 'Dhaka', '1205', 'Bangladesh', 1, 0, GETUTCDATE(), 'system'),
(2, 2, 2, 'Billing', 'John Doe', NULL, '+8801712345678', 'House 12, Road 5', 'Dhanmondi', 'Dhaka', 'Dhaka', '1205', 'Bangladesh', 1, 0, GETUTCDATE(), 'system');

SET IDENTITY_INSERT Addresses OFF;

PRINT 'Addresses seeded successfully.';

-- =============================================
-- EMAIL TEMPLATES
-- =============================================

SET IDENTITY_INSERT EmailTemplates ON;

INSERT INTO EmailTemplates (Id, Name, Subject, Body, TemplateType, IsActive, IsDeleted, CreatedAt, CreatedBy)
VALUES 
(1, 'Welcome', 'Welcome to ShoppingCart!', 'Dear {{CustomerName}},<br><br>Welcome to ShoppingCart! We''re excited to have you as a member of our growing community.<br><br>Start exploring our wide range of products and enjoy exclusive deals!<br><br>Best regards,<br>ShoppingCart Team', 'Welcome', 1, 0, GETUTCDATE(), 'system'),
(2, 'OrderConfirmation', 'Order Confirmation - {{OrderNumber}}', 'Dear {{CustomerName}},<br><br>Thank you for your order!<br><br>Order Number: {{OrderNumber}}<br>Order Total: {{OrderTotal}}<br><br>We will notify you when your order ships.<br><br>Best regards,<br>ShoppingCart Team', 'Order', 1, 0, GETUTCDATE(), 'system'),
(3, 'PasswordReset', 'Password Reset Request', 'Dear {{CustomerName}},<br><br>We received a request to reset your password.<br><br>Click the link below to reset your password:<br><a href="{{ResetLink}}">Reset Password</a><br><br>If you didn''t request this, please ignore this email.<br><br>Best regards,<br>ShoppingCart Team', 'Password', 1, 0, GETUTCDATE(), 'system');

SET IDENTITY_INSERT EmailTemplates OFF;

PRINT 'Email templates seeded successfully.';

PRINT '';
PRINT '===========================================';
PRINT 'ALL SEED DATA INSERTED SUCCESSFULLY!';
PRINT '===========================================';
PRINT '';
PRINT 'Test Credentials:';
PRINT 'Admin: admin@shoppingcart.com / Admin@123';
PRINT 'Customer: customer@test.com / Customer@123';
PRINT '===========================================';
