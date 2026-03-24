using Microsoft.EntityFrameworkCore;
using ShoppingCart.Domain.Entities;
using ShoppingCart.Domain.Enums;

namespace ShoppingCart.Persistence.Data;

public static class SeedData
{
    private static string HashPassword(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password, 11);
    }

    public static async Task SeedAsync(AppDbContext context)
    {
        if (context.Database.GetPendingMigrations().Any())
        {
            await context.Database.MigrateAsync();
        }

        if (!await context.Users.AnyAsync(u => u.Email == "admin@example.com"))
        {
            var adminRole = context.Roles.FirstOrDefault(r => r.Name == "Admin");
            if (adminRole == null)
            {
                adminRole = new Role { Name = "Admin", Description = "Administrator" };
                context.Roles.Add(adminRole);
                await context.SaveChangesAsync();
            }

            var managerRole = context.Roles.FirstOrDefault(r => r.Name == "Manager");
            if (managerRole == null)
            {
                managerRole = new Role { Name = "Manager", Description = "Manager" };
                context.Roles.Add(managerRole);
                await context.SaveChangesAsync();
            }

            var customerRole = context.Roles.FirstOrDefault(r => r.Name == "Customer");
            if (customerRole == null)
            {
                customerRole = new Role { Name = "Customer", Description = "Customer" };
                context.Roles.Add(customerRole);
                await context.SaveChangesAsync();
            }

            var adminUser = new User
            {
                Email = "admin@example.com",
                FirstName = "Admin",
                LastName = "User",
                PhoneNumber = "+880 1700000000",
                EmailConfirmed = true,
                Status = UserStatus.Active,
                PasswordHash = HashPassword("111111")
            };

            context.Users.Add(adminUser);
            await context.SaveChangesAsync();

            context.UserRoles.Add(new UserRole { UserId = adminUser.Id, RoleId = adminRole.Id });
            await context.SaveChangesAsync();

            var managerUser = new User
            {
                Email = "manager@shoppingcart.com",
                FirstName = "Store",
                LastName = "Manager",
                PhoneNumber = "+880 1700000001",
                EmailConfirmed = true,
                Status = UserStatus.Active,
                PasswordHash = HashPassword("Manager123!")
            };

            context.Users.Add(managerUser);
            await context.SaveChangesAsync();

            context.UserRoles.Add(new UserRole { UserId = managerUser.Id, RoleId = managerRole.Id });
            await context.SaveChangesAsync();

            var customerUser = new User
            {
                Email = "customer@shoppingcart.com",
                FirstName = "John",
                LastName = "Customer",
                PhoneNumber = "+880 1700000002",
                EmailConfirmed = true,
                Status = UserStatus.Active,
                PasswordHash = HashPassword("Customer123!")
            };

            context.Users.Add(customerUser);
            await context.SaveChangesAsync();

            context.UserRoles.Add(new UserRole { UserId = customerUser.Id, RoleId = customerRole.Id });
            await context.SaveChangesAsync();
        }

        if (!await context.ShippingMethods.AnyAsync())
        {
            context.ShippingMethods.AddRange(
                new ShippingMethod
                {
                    Name = "Standard Shipping",
                    Description = "Delivery within 5-7 business days",
                    CarrierName = "Local Courier",
                    BaseCost = 50.00m,
                    CostPerKg = 10.00m,
                    EstimatedDaysMin = 5,
                    EstimatedDaysMax = 7,
                    IsActive = true,
                    IsFreeShipping = false,
                    DisplayOrder = 1
                },
                new ShippingMethod
                {
                    Name = "Express Shipping",
                    Description = "Delivery within 2-3 business days",
                    CarrierName = "Fast Express",
                    BaseCost = 100.00m,
                    CostPerKg = 20.00m,
                    EstimatedDaysMin = 2,
                    EstimatedDaysMax = 3,
                    IsActive = true,
                    IsFreeShipping = false,
                    FreeShippingThreshold = 5000.00m,
                    DisplayOrder = 2
                },
                new ShippingMethod
                {
                    Name = "Next Day Delivery",
                    Description = "Delivery next business day",
                    CarrierName = "Express Delivery",
                    BaseCost = 200.00m,
                    CostPerKg = 30.00m,
                    EstimatedDaysMin = 1,
                    EstimatedDaysMax = 1,
                    IsActive = true,
                    IsFreeShipping = false,
                    DisplayOrder = 3
                },
                new ShippingMethod
                {
                    Name = "Free Shipping",
                    Description = "Free delivery for orders above 1000 BDT",
                    CarrierName = "Standard",
                    BaseCost = 0.00m,
                    CostPerKg = 0.00m,
                    EstimatedDaysMin = 7,
                    EstimatedDaysMax = 10,
                    IsActive = true,
                    IsFreeShipping = true,
                    FreeShippingThreshold = 1000.00m,
                    DisplayOrder = 4
                }
            );
            await context.SaveChangesAsync();
        }

        if (!await context.Coupons.AnyAsync())
        {
            context.Coupons.AddRange(
                new Coupon
                {
                    Code = "WELCOME10",
                    Name = "Welcome Discount",
                    Description = "10% off for new customers",
                    CouponType = CouponType.Percentage,
                    DiscountValue = 10.00m,
                    MinimumOrderAmount = 500.00m,
                    MaximumDiscountAmount = 200.00m,
                    StartDate = DateTime.UtcNow.AddMonths(-1),
                    EndDate = DateTime.UtcNow.AddMonths(3),
                    MaximumUsageCount = 1,
                    IsActive = true
                },
                new Coupon
                {
                    Code = "FLAT100",
                    Name = "Flat 100 BDT Off",
                    Description = "Get 100 BDT off on orders above 2000 BDT",
                    CouponType = CouponType.FixedAmount,
                    DiscountValue = 100.00m,
                    MinimumOrderAmount = 2000.00m,
                    MaximumDiscountAmount = 100.00m,
                    StartDate = DateTime.UtcNow.AddDays(-7),
                    EndDate = DateTime.UtcNow.AddDays(30),
                    MaximumUsageCount = 100,
                    CurrentUsageCount = 15,
                    IsActive = true
                },
                new Coupon
                {
                    Code = "SUMMER20",
                    Name = "Summer Sale 20%",
                    Description = "20% off on summer collection",
                    CouponType = CouponType.Percentage,
                    DiscountValue = 20.00m,
                    MinimumOrderAmount = 1000.00m,
                    MaximumDiscountAmount = 500.00m,
                    StartDate = DateTime.UtcNow,
                    EndDate = DateTime.UtcNow.AddMonths(2),
                    MaximumUsageCount = 500,
                    CurrentUsageCount = 42,
                    IsActive = true
                },
                new Coupon
                {
                    Code = "FREESHIP",
                    Name = "Free Shipping",
                    Description = "Free shipping on any order",
                    CouponType = CouponType.FreeShipping,
                    DiscountValue = 0.00m,
                    MinimumOrderAmount = 0.00m,
                    StartDate = DateTime.UtcNow.AddDays(-14),
                    EndDate = DateTime.UtcNow.AddDays(14),
                    MaximumUsageCount = 200,
                    CurrentUsageCount = 67,
                    IsActive = true
                }
            );
            await context.SaveChangesAsync();
        }

        if (!await context.AppSettings.AnyAsync())
        {
            context.AppSettings.AddRange(
                new AppSetting { Key = "StoreName", Value = "ShoppingCart Store" },
                new AppSetting { Key = "StoreEmail", Value = "support@shoppingcart.com" },
                new AppSetting { Key = "StorePhone", Value = "+880 1XXX-XXXXXX" },
                new AppSetting { Key = "TaxRate", Value = "15" },
                new AppSetting { Key = "Currency", Value = "BDT" },
                new AppSetting { Key = "CurrencySymbol", Value = "৳" },
                new AppSetting { Key = "MinOrderAmount", Value = "100" },
                new AppSetting { Key = "MaxOrderAmount", Value = "100000" }
            );
            await context.SaveChangesAsync();
        }

        // Categories Seeding (Level 1)
        if (!await context.Categories.AnyAsync())
        {
            context.Categories.AddRange(
                new Category { Name = "Electronics", Slug = "electronics", Description = "Electronic devices and accessories", IsActive = true, DisplayOrder = 1, IsFeatured = true },
                new Category { Name = "Clothing", Slug = "clothing", Description = "Fashion and apparel", IsActive = true, DisplayOrder = 2, IsFeatured = true },
                new Category { Name = "Home & Garden", Slug = "home-garden", Description = "Home decor and garden supplies", IsActive = true, DisplayOrder = 3, IsFeatured = true },
                new Category { Name = "Sports", Slug = "sports", Description = "Sports equipment and fitness", IsActive = true, DisplayOrder = 4, IsFeatured = false },
                new Category { Name = "Books", Slug = "books", Description = "Books and literature", IsActive = true, DisplayOrder = 5, IsFeatured = false }
            );
            await context.SaveChangesAsync();
        }

        // Fetch Root Categories for Hierarchical Seeding
        var electronics = await context.Categories.FirstOrDefaultAsync(c => c.Name == "Electronics");
        var clothing = await context.Categories.FirstOrDefaultAsync(c => c.Name == "Clothing");
        var home = await context.Categories.FirstOrDefaultAsync(c => c.Name == "Home & Garden");
        var sports = await context.Categories.FirstOrDefaultAsync(c => c.Name == "Sports");
        var books = await context.Categories.FirstOrDefaultAsync(c => c.Name == "Books");

        // Subcategories Seeding (Level 2 & 3)
        if (electronics != null && !await context.Categories.AnyAsync(c => c.ParentCategoryId == electronics.Id))
        {
            var computers = new Category { Name = "Computers", Slug = "computers", ParentCategoryId = electronics.Id, IsActive = true, DisplayOrder = 1 };
            var mobiles = new Category { Name = "Mobile Phones", Slug = "mobile-phones", ParentCategoryId = electronics.Id, IsActive = true, DisplayOrder = 2 };
            var gadgets = new Category { Name = "Gadgets", Slug = "gadgets", ParentCategoryId = electronics.Id, IsActive = true, DisplayOrder = 3 };
            
            context.Categories.AddRange(computers, mobiles, gadgets);
            await context.SaveChangesAsync();

            context.Categories.AddRange(
                new Category { Name = "Laptops", Slug = "laptops", ParentCategoryId = computers.Id, IsActive = true, DisplayOrder = 1 },
                new Category { Name = "Desktops", Slug = "desktops", ParentCategoryId = computers.Id, IsActive = true, DisplayOrder = 2 },
                new Category { Name = "Smartphones", Slug = "smartphones", ParentCategoryId = mobiles.Id, IsActive = true, DisplayOrder = 1 },
                new Category { Name = "Tablets", Slug = "tablets", ParentCategoryId = mobiles.Id, IsActive = true, DisplayOrder = 2 },
                new Category { Name = "Smart Watches", Slug = "smart-watches", ParentCategoryId = gadgets.Id, IsActive = true, DisplayOrder = 1 }
            );
            await context.SaveChangesAsync();
        }

        if (clothing != null && !await context.Categories.AnyAsync(c => c.ParentCategoryId == clothing.Id))
        {
            var mens = new Category { Name = "Men's Fashion", Slug = "mens-fashion", ParentCategoryId = clothing.Id, IsActive = true, DisplayOrder = 1 };
            var womens = new Category { Name = "Women's Fashion", Slug = "womens-fashion", ParentCategoryId = clothing.Id, IsActive = true, DisplayOrder = 2 };
            
            context.Categories.AddRange(mens, womens);
            await context.SaveChangesAsync();

            context.Categories.AddRange(
                new Category { Name = "T-Shirts", Slug = "t-shirts", ParentCategoryId = mens.Id, IsActive = true, DisplayOrder = 1 },
                new Category { Name = "Jeans", Slug = "jeans", ParentCategoryId = mens.Id, IsActive = true, DisplayOrder = 2 },
                new Category { Name = "Dresses", Slug = "dresses", ParentCategoryId = womens.Id, IsActive = true, DisplayOrder = 1 },
                new Category { Name = "Handbags", Slug = "handbags", ParentCategoryId = womens.Id, IsActive = true, DisplayOrder = 2 }
            );
            await context.SaveChangesAsync();
        }

        // Products Seeding
        if (!await context.Products.AnyAsync() && electronics != null && clothing != null && home != null && sports != null && books != null)
        {
            var products = new[]
            {
                new Product { Name = "Wireless Bluetooth Headphones", Slug = "wireless-bluetooth-headphones", SKU = "ELEC-001", Price = 2499.00m, CostPrice = 1500.00m, CategoryId = electronics.Id, ShortDescription = "Premium wireless headphones with noise cancellation", Description = "Experience high-quality sound with our premium wireless Bluetooth headphones featuring active noise cancellation, 30-hour battery life, and comfortable over-ear design.", IsActive = true, IsFeatured = true, MinimumStockLevel = 10, RatingAverage = 4.5m, ReviewCount = 128 },
                new Product { Name = "Smart Watch Pro", Slug = "smart-watch-pro", SKU = "ELEC-002", Price = 4999.00m, CostPrice = 3000.00m, CategoryId = electronics.Id, ShortDescription = "Advanced smartwatch with health monitoring", Description = "Track your fitness and stay connected with our advanced smartwatch featuring heart rate monitoring, GPS, and water resistance.", IsActive = true, IsFeatured = true, MinimumStockLevel = 5, RatingAverage = 4.3m, ReviewCount = 89 },
                new Product { Name = "Portable Power Bank 20000mAh", Slug = "power-bank-20000mah", SKU = "ELEC-003", Price = 1299.00m, CostPrice = 700.00m, CategoryId = electronics.Id, ShortDescription = "High capacity portable charger", Description = "Never run out of battery with this 20000mAh power bank featuring fast charging support.", IsActive = true, IsFeatured = false, MinimumStockLevel = 15, RatingAverage = 4.1m, ReviewCount = 256 },
                new Product { Name = "USB-C Hub Adapter", Slug = "usb-c-hub-adapter", SKU = "ELEC-004", Price = 899.00m, CostPrice = 500.00m, CategoryId = electronics.Id, ShortDescription = "Multi-port USB-C hub", Description = "Expand your laptop's connectivity with this 7-in-1 USB-C hub.", IsActive = true, IsFeatured = false, MinimumStockLevel = 20, RatingAverage = 4.0m, ReviewCount = 67 },

                new Product { Name = "Premium Cotton T-Shirt", Slug = "premium-cotton-tshirt", SKU = "CLOTH-001", Price = 599.00m, CostPrice = 300.00m, CategoryId = clothing.Id, ShortDescription = "Soft and comfortable cotton t-shirt", Description = "Stay comfortable with our premium cotton t-shirt, perfect for everyday wear.", IsActive = true, IsFeatured = true, MinimumStockLevel = 25, RatingAverage = 4.6m, ReviewCount = 342 },
                new Product { Name = "Denim Jeans Classic", Slug = "denim-jeans-classic", SKU = "CLOTH-002", Price = 1599.00m, CostPrice = 800.00m, CategoryId = clothing.Id, ShortDescription = "Classic fit denim jeans", Description = "Timeless style with our classic fit denim jeans made from premium quality denim.", IsActive = true, IsFeatured = true, MinimumStockLevel = 15, RatingAverage = 4.4m, ReviewCount = 178 },
                new Product { Name = "Sports Running Shoes", Slug = "sports-running-shoes", SKU = "CLOTH-003", Price = 2999.00m, CostPrice = 1800.00m, CategoryId = clothing.Id, ShortDescription = "Lightweight running shoes", Description = "Enhance your performance with our lightweight running shoes featuring cushioned soles.", IsActive = true, IsFeatured = false, MinimumStockLevel = 10, RatingAverage = 4.7m, ReviewCount = 421 },

                new Product { Name = "LED Desk Lamp", Slug = "led-desk-lamp", SKU = "HOME-001", Price = 1299.00m, CostPrice = 700.00m, CategoryId = home.Id, ShortDescription = "Adjustable LED desk lamp", Description = "Brighten your workspace with our adjustable LED desk lamp featuring multiple brightness levels.", IsActive = true, IsFeatured = true, MinimumStockLevel = 10, RatingAverage = 4.2m, ReviewCount = 156 },
                new Product { Name = "Memory Foam Pillow", Slug = "memory-foam-pillow", SKU = "HOME-002", Price = 899.00m, CostPrice = 450.00m, CategoryId = home.Id, ShortDescription = "Ergonomic memory foam pillow", Description = "Enjoy a comfortable sleep with our ergonomic memory foam pillow.", IsActive = true, IsFeatured = false, MinimumStockLevel = 20, RatingAverage = 4.5m, ReviewCount = 234 },
                new Product { Name = "Indoor Plant Set", Slug = "indoor-plant-set", SKU = "HOME-003", Price = 1499.00m, CostPrice = 800.00m, CategoryId = home.Id, ShortDescription = "Set of 3 indoor plants", Description = "Add greenery to your home with this beautiful set of 3 easy-care indoor plants.", IsActive = true, IsFeatured = true, MinimumStockLevel = 8, RatingAverage = 4.8m, ReviewCount = 89 },

                new Product { Name = "Yoga Mat Premium", Slug = "yoga-mat-premium", SKU = "SPORT-001", Price = 799.00m, CostPrice = 400.00m, CategoryId = sports.Id, ShortDescription = "Non-slip yoga mat", Description = "Perfect for your yoga practice with our non-slip premium yoga mat.", IsActive = true, IsFeatured = false, MinimumStockLevel = 15, RatingAverage = 4.3m, ReviewCount = 198 },
                new Product { Name = "Adjustable Dumbbells Set", Slug = "adjustable-dumbbells-set", SKU = "SPORT-002", Price = 4999.00m, CostPrice = 3000.00m, CategoryId = sports.Id, ShortDescription = "Space-saving adjustable dumbbells", Description = "Build your home gym with our adjustable dumbbells set ranging from 2kg to 20kg.", IsActive = true, IsFeatured = true, MinimumStockLevel = 5, RatingAverage = 4.6m, ReviewCount = 145 },

                new Product { Name = "Programming Masterclass", Slug = "programming-masterclass", SKU = "BOOK-001", Price = 499.00m, CostPrice = 250.00m, CategoryId = books.Id, ShortDescription = "Learn programming from scratch", Description = "Master programming with this comprehensive guide covering multiple languages.", IsActive = true, IsFeatured = false, MinimumStockLevel = 10, RatingAverage = 4.9m, ReviewCount = 567 },
                new Product { Name = "Business Strategy Guide", Slug = "business-strategy-guide", SKU = "BOOK-002", Price = 399.00m, CostPrice = 200.00m, CategoryId = books.Id, ShortDescription = "Essential business strategies", Description = "Learn essential business strategies for success in today's market.", IsActive = true, IsFeatured = false, MinimumStockLevel = 10, RatingAverage = 4.4m, ReviewCount = 234 },
            };

            context.Products.AddRange(products);
            await context.SaveChangesAsync();
        }
    }
}
