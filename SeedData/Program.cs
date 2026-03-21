using Microsoft.EntityFrameworkCore;
using ShoppingCart.Persistence.Data;
using ShoppingCart.Domain.Entities;
using ShoppingCart.Domain.Enums;

Console.WriteLine("Starting seed data generation...\n");

var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
optionsBuilder.UseSqlServer("Server=localhost;Database=ShoppingCartDb;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True");

using var context = new AppDbContext(optionsBuilder.Options);

// Clear existing data using SQL
Console.WriteLine("Clearing existing data...");
try { context.Database.ExecuteSqlRaw("DELETE FROM StockItems"); } catch { }
try { context.Database.ExecuteSqlRaw("DELETE FROM OrderItems"); } catch { }
try { context.Database.ExecuteSqlRaw("DELETE FROM Orders"); } catch { }
try { context.Database.ExecuteSqlRaw("DELETE FROM Products"); } catch { }
try { context.Database.ExecuteSqlRaw("DELETE FROM Categories"); } catch { }
try { context.Database.ExecuteSqlRaw("DELETE FROM Brands"); } catch { }
try { context.Database.ExecuteSqlRaw("DELETE FROM Suppliers"); } catch { }
try { context.Database.ExecuteSqlRaw("DELETE FROM Coupons"); } catch { }
try { context.Database.ExecuteSqlRaw("DELETE FROM Customers"); } catch { }
try { context.Database.ExecuteSqlRaw("DELETE FROM ShippingMethods"); } catch { }
try { context.Database.ExecuteSqlRaw("DELETE FROM Warehouses"); } catch { }
try { context.Database.ExecuteSqlRaw("DELETE FROM Carts"); } catch { }
try { context.Database.ExecuteSqlRaw("DELETE FROM Wishlists"); } catch { }
context.SaveChanges();

// Seed Categories
Console.WriteLine("Seeding Categories...");
var categories = new List<Category>();
var categoryNames = new[] { "Electronics", "Clothing", "Home & Garden", "Sports", "Books", "Toys", "Beauty", "Automotive", "Food", "Health" };
for (int i = 0; i < categoryNames.Length; i++)
{
    categories.Add(new Category
    {
        Name = categoryNames[i],
        Slug = categoryNames[i].ToLowerInvariant().Replace(" & ", "-").Replace(" ", "-"),
        Description = $"Products in the {categoryNames[i]} category",
        DisplayOrder = i + 1,
        IsFeatured = i < 5,
        IsActive = true,
        CreatedAt = DateTime.UtcNow,
        CreatedBy = "seed"
    });
}
context.Categories.AddRange(categories);
context.SaveChanges();

// Seed Brands
Console.WriteLine("Seeding Brands...");
var brands = new List<Brand>();
var brandNames = new[] { "Apple", "Samsung", "Nike", "Adidas", "Sony", "LG", "Dell", "HP", "Levis", "Gap" };
for (int i = 0; i < brandNames.Length; i++)
{
    brands.Add(new Brand
    {
        Name = brandNames[i],
        Slug = brandNames[i].ToLowerInvariant(),
        Description = $"{brandNames[i]} brand products",
        IsFeatured = i < 5,
        IsActive = true,
        CreatedAt = DateTime.UtcNow,
        CreatedBy = "seed"
    });
}
context.Brands.AddRange(brands);
context.SaveChanges();

// Seed Suppliers
Console.WriteLine("Seeding Suppliers...");
var suppliers = new List<Supplier>();
for (int i = 1; i <= 20; i++)
{
    suppliers.Add(new Supplier
    {
        Name = $"Supplier {i}",
        ContactPerson = $"Contact Person {i}",
        Email = $"supplier{i}@example.com",
        Phone = $"+880 1{i:D9}",
        Address = $"{i} Supplier Street",
        City = "Dhaka",
        Country = "Bangladesh",
        IsActive = true,
        CreatedAt = DateTime.UtcNow,
        CreatedBy = "seed"
    });
}
context.Suppliers.AddRange(suppliers);
context.SaveChanges();

// Seed Shipping Methods
Console.WriteLine("Seeding Shipping Methods...");
var shippingMethods = new List<ShippingMethod>
{
    new ShippingMethod { Name = "Standard Shipping", Description = "5-7 business days", CarrierName = "Local Courier", BaseCost = 50, CostPerKg = 10, EstimatedDaysMin = 5, EstimatedDaysMax = 7, IsActive = true, IsFreeShipping = false, CreatedAt = DateTime.UtcNow, CreatedBy = "seed" },
    new ShippingMethod { Name = "Express Shipping", Description = "2-3 business days", CarrierName = "Fast Express", BaseCost = 100, CostPerKg = 20, EstimatedDaysMin = 2, EstimatedDaysMax = 3, IsActive = true, IsFreeShipping = false, FreeShippingThreshold = 5000, CreatedAt = DateTime.UtcNow, CreatedBy = "seed" },
    new ShippingMethod { Name = "Next Day Delivery", Description = "Next business day", CarrierName = "Express Delivery", BaseCost = 200, CostPerKg = 30, EstimatedDaysMin = 1, EstimatedDaysMax = 1, IsActive = true, IsFreeShipping = false, CreatedAt = DateTime.UtcNow, CreatedBy = "seed" },
    new ShippingMethod { Name = "Free Shipping", Description = "Free for orders above 1000 BDT", CarrierName = "Standard", BaseCost = 0, CostPerKg = 0, EstimatedDaysMin = 7, EstimatedDaysMax = 10, IsActive = true, IsFreeShipping = true, FreeShippingThreshold = 1000, CreatedAt = DateTime.UtcNow, CreatedBy = "seed" }
};
context.ShippingMethods.AddRange(shippingMethods);
context.SaveChanges();

// Seed Products (50 products)
Console.WriteLine("Seeding Products...");
var products = new List<Product>();
var productNames = new Dictionary<string, List<string>>
{
    { "Electronics", new List<string> { "Smartphone", "Laptop", "Tablet", "Smartwatch", "Headphones", "Camera", "Speaker", "Charger", "Power Bank", "USB Cable", "Keyboard", "Mouse", "Monitor", "Webcam", "Microphone" } },
    { "Clothing", new List<string> { "T-Shirt", "Jeans", "Dress", "Jacket", "Shoes", "Hat", "Socks", "Sweater", "Pants", "Shorts", "Shirt", "Coat", "Skirt", "Blouse", "Sandals" } },
    { "Home & Garden", new List<string> { "Lamp", "Chair", "Table", "Plant Pot", "Cushion", "Curtain", "Rug", "Mirror", "Vase", "Clock", "Shelf", "Frame", "Basket", "Planter", "Towel" } },
    { "Sports", new List<string> { "Dumbbells", "Yoga Mat", "Tennis Racket", "Football", "Basketball", "Running Shoes", "Water Bottle", "Gym Bag", "Resistance Band", "Jump Rope", "Cricket Bat", "Badminton Racket", "Swimming Goggles", "Cycling Helmet", "Boxing Gloves" } },
    { "Books", new List<string> { "Novel", "Textbook", "Biography", "Cookbook", "Travel Guide", "Science Fiction", "Mystery", "Self Help", "History", "Poetry", "Romance", "Thriller", "Fantasy", "Horror", "Art" } },
    { "Toys", new List<string> { "LEGO Set", "Puzzle", "Board Game", "Action Figure", "Doll", "Remote Car", "Plush Toy", "Building Blocks", "Art Set", "Science Kit" } },
    { "Beauty", new List<string> { "Face Cream", "Shampoo", "Perfume", "Lipstick", "Nail Polish", "Face Mask", "Body Lotion", "Hair Dryer", "Makeup Kit", "Sunscreen" } },
    { "Food", new List<string> { "Chocolate", "Coffee", "Tea", "Snacks", "Honey", "Olive Oil", "Spices", "Cookies", "Chips", "Nuts" } }
};

int productId = 1;
foreach (var category in categories.Where(c => productNames.ContainsKey(c.Name)))
{
    var names = productNames[category.Name];
    foreach (var name in names)
    {
        var brand = brands[Random.Shared.Next(brands.Count)];
        var supplier = suppliers[Random.Shared.Next(suppliers.Count)];
        var price = Math.Round((decimal)(Random.Shared.NextDouble() * 9000 + 1000), 2);
        products.Add(new Product
        {
            Name = $"{brand.Name} {name}",
            Slug = $"{brand.Name.ToLower()}-{name.ToLower()}-{productId}",
            SKU = $"{category.Name.ToUpper().Substring(0, 4)}-{productId:D3}",
            Barcode = $"{productId:D13}",
            ShortDescription = $"High quality {name.ToLower()} from {brand.Name}",
            Description = $"This is a premium quality {name.ToLower()} manufactured by {brand.Name}. Perfect for everyday use with excellent durability and style.",
            Price = price,
            OldPrice = Math.Round(price * 1.2m, 2),
            CostPrice = Math.Round(price * 0.6m, 2),
            CategoryId = category.Id,
            BrandId = brand.Id,
            SupplierId = supplier.Id,
            IsFeatured = productId <= 15,
            IsBestSeller = productId <= 10,
            IsNewArrival = productId > 40,
            IsActive = true,
            MinimumStockLevel = 10,
            ReorderLevel = 5,
            Weight = Math.Round((decimal)(Random.Shared.NextDouble() * 5), 2),
            RatingAverage = Math.Round((decimal)(Random.Shared.NextDouble() * 2 + 3), 1),
            ReviewCount = Random.Shared.Next(0, 100),
            ViewCount = Random.Shared.Next(0, 500),
            CreatedAt = DateTime.UtcNow.AddDays(-Random.Shared.Next(1, 90)),
            CreatedBy = "seed"
        });
        productId++;
    }
}
context.Products.AddRange(products);
context.SaveChanges();
Console.WriteLine($"Created {products.Count} products");

// Seed Warehouses
Console.WriteLine("Seeding Warehouses...");
var warehouses = new List<Warehouse>
{
    new Warehouse { Name = "Main Warehouse Dhaka", Code = "WH001", Address = "123 Main Street", City = "Dhaka", Country = "Bangladesh", Email = "warehouse1@shopping.com", Phone = "+880 1700000001", IsDefault = true, IsActive = true, CreatedAt = DateTime.UtcNow, CreatedBy = "seed" },
    new Warehouse { Name = "Chittagong Warehouse", Code = "WH002", Address = "456 Port Road", City = "Chittagong", Country = "Bangladesh", Email = "warehouse2@shopping.com", Phone = "+880 1700000002", IsDefault = false, IsActive = true, CreatedAt = DateTime.UtcNow, CreatedBy = "seed" }
};
context.Warehouses.AddRange(warehouses);
context.SaveChanges();

// Seed Stock Items
Console.WriteLine("Seeding Stock Items...");
var stockItems = new List<StockItem>();
foreach (var product in products)
{
    stockItems.Add(new StockItem
    {
        ProductId = product.Id,
        WarehouseId = warehouses[Random.Shared.Next(warehouses.Count)].Id,
        QuantityOnHand = Random.Shared.Next(0, 100),
        ReservedQuantity = Random.Shared.Next(0, 10),
        ReorderLevel = 10,
        CreatedAt = DateTime.UtcNow,
        CreatedBy = "seed"
    });
}
context.StockItems.AddRange(stockItems);
context.SaveChanges();
Console.WriteLine($"Created {stockItems.Count} stock items");

// Seed Product Images
Console.WriteLine("Seeding Product Images...");
var productImages = new List<ProductImage>();
foreach (var product in products.Take(40))
{
    productImages.Add(new ProductImage
    {
        ProductId = product.Id,
        ImageUrl = $"https://picsum.photos/seed/{product.Id}/400/400",
        AltText = product.Name,
        DisplayOrder = 0,
        IsMain = true,
        CreatedAt = DateTime.UtcNow,
        CreatedBy = "seed"
    });
}
context.ProductImages.AddRange(productImages);
context.SaveChanges();
Console.WriteLine($"Created {productImages.Count} product images");

// Seed Customers - create users first if needed
Console.WriteLine("Seeding Customers...");
var existingUserIds = context.Users.Select(u => u.Id).ToList();

// Create additional users if needed
var usersToCreate = 50 - existingUserIds.Count;
if (usersToCreate > 0)
{
    Console.WriteLine($"Creating {usersToCreate} additional users...");
    var newUsers = new List<User>();
    for (int i = 1; i <= usersToCreate; i++)
    {
        newUsers.Add(new User
        {
            Email = $"customer{i}@example.com",
            FirstName = $"Customer{i}",
            LastName = "User",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Customer123!"),
            Status = UserStatus.Active,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "seed"
        });
    }
    context.Users.AddRange(newUsers);
    context.SaveChanges();
    existingUserIds = context.Users.Select(u => u.Id).ToList();
}

Console.WriteLine($"Total users available: {existingUserIds.Count}");
var customers = new List<Customer>();
for (int i = 0; i < Math.Min(50, existingUserIds.Count); i++)
{
    customers.Add(new Customer
    {
        UserId = existingUserIds[i],
        CompanyName = $"Customer Company {i + 1}",
        CreatedAt = DateTime.UtcNow.AddDays(-Random.Shared.Next(1, 60)),
        CreatedBy = "seed"
    });
}
context.Customers.AddRange(customers);
context.SaveChanges();
Console.WriteLine($"Created {customers.Count} customers");

// Seed Coupons
Console.WriteLine("Seeding Coupons...");
var coupons = new List<Coupon>
{
    new Coupon { Code = "WELCOME10", Name = "Welcome Discount", CouponType = CouponType.Percentage, DiscountValue = 10, MinimumOrderAmount = 500, MaximumDiscountAmount = 100, MaximumUsageCount = 1000, StartDate = DateTime.UtcNow.AddMonths(-1), EndDate = DateTime.UtcNow.AddMonths(6), IsActive = true, CreatedAt = DateTime.UtcNow, CreatedBy = "seed" },
    new Coupon { Code = "SAVE20", Name = "20% Off", CouponType = CouponType.Percentage, DiscountValue = 20, MinimumOrderAmount = 1000, MaximumDiscountAmount = 500, MaximumUsageCount = 500, StartDate = DateTime.UtcNow.AddMonths(-1), EndDate = DateTime.UtcNow.AddMonths(3), IsActive = true, CreatedAt = DateTime.UtcNow, CreatedBy = "seed" },
    new Coupon { Code = "FLAT100", Name = "Flat 100 BDT Off", CouponType = CouponType.FixedAmount, DiscountValue = 100, MinimumOrderAmount = 500, MaximumUsageCount = 200, StartDate = DateTime.UtcNow.AddMonths(-1), EndDate = DateTime.UtcNow.AddMonths(2), IsActive = true, CreatedAt = DateTime.UtcNow, CreatedBy = "seed" },
    new Coupon { Code = "FREESHIP", Name = "Free Shipping", CouponType = CouponType.FreeShipping, DiscountValue = 0, MinimumOrderAmount = 500, MaximumUsageCount = 300, StartDate = DateTime.UtcNow.AddMonths(-1), EndDate = DateTime.UtcNow.AddMonths(1), IsActive = true, CreatedAt = DateTime.UtcNow, CreatedBy = "seed" }
};
context.Coupons.AddRange(coupons);
context.SaveChanges();

// Seed Orders
Console.WriteLine("Seeding Orders...");
var addresses = new List<Address>();
for (int i = 1; i <= 50; i++)
{
    addresses.Add(new Address
    {
        CustomerId = customers[i - 1].Id,
        AddressType = "Shipping",
        FullName = $"Customer {i}",
        PhoneNumber = $"+880 1{Random.Shared.Next(100000000, 999999999)}",
        AddressLine1 = $"{i} Main Street",
        City = "Dhaka",
        State = "Dhaka",
        PostalCode = $"{1200 + i}",
        Country = "Bangladesh",
        CreatedAt = DateTime.UtcNow,
        CreatedBy = "seed"
    });
}
context.Addresses.AddRange(addresses);
context.SaveChanges();

var orders = new List<Order>();
var orderStatuses = new[] { OrderStatus.Pending, OrderStatus.Confirmed, OrderStatus.Processing, OrderStatus.Shipped, OrderStatus.Delivered };
var paymentMethods = new[] { PaymentMethod.CashOnDelivery, PaymentMethod.Card, PaymentMethod.MobileBanking };
var shippingMethodList = shippingMethods.ToList();

for (int i = 1; i <= 50; i++)
{
    var customer = customers[Random.Shared.Next(customers.Count)];
    var address = addresses[Random.Shared.Next(addresses.Count)];
    var orderProducts = products.OrderBy(x => Random.Shared.Next()).Take(Random.Shared.Next(1, 4)).ToList();
    var subTotal = orderProducts.Sum(p => p.Price);
    var shippingCost = shippingMethodList[Random.Shared.Next(shippingMethodList.Count)];
    var shippingAmount = shippingCost.BaseCost + (decimal)(orderProducts.Sum(p => (double)p.Weight) * (double)shippingCost.CostPerKg);
    var taxAmount = subTotal * 0.15m;
    var discountAmount = Random.Shared.Next(0, 10) > 7 ? subTotal * 0.1m : 0;
    
    orders.Add(new Order
    {
        OrderNumber = $"ORD-2026-{i:D6}",
        CustomerId = customer.Id,
        ShippingAddressId = address.Id,
        BillingAddressId = address.Id,
        Status = orderStatuses[Random.Shared.Next(orderStatuses.Length)],
        OrderDate = DateTime.UtcNow.AddDays(-Random.Shared.Next(1, 60)),
        SubTotal = subTotal,
        ShippingAmount = (decimal)shippingAmount,
        TaxAmount = taxAmount,
        DiscountAmount = discountAmount,
        TotalAmount = subTotal + (decimal)shippingAmount + taxAmount - discountAmount,
        PaymentMethod = paymentMethods[Random.Shared.Next(paymentMethods.Length)],
        PaymentStatus = PaymentStatus.Pending,
        CreatedAt = DateTime.UtcNow.AddDays(-Random.Shared.Next(1, 60)),
        CreatedBy = "seed"
    });
}
context.Orders.AddRange(orders);
context.SaveChanges();
Console.WriteLine($"Created {orders.Count} orders");

// Seed Order Items
Console.WriteLine("Seeding Order Items...");
var orderItems = new List<OrderItem>();
foreach (var order in orders)
{
    var orderProducts = products.OrderBy(x => Random.Shared.Next()).Take(Random.Shared.Next(1, 4)).ToList();
    foreach (var op in orderProducts)
    {
        var quantity = Random.Shared.Next(1, 4);
        orderItems.Add(new OrderItem
        {
            OrderId = order.Id,
            ProductId = op.Id,
            ProductName = op.Name,
            SKU = op.SKU,
            Quantity = quantity,
            UnitPrice = op.Price,
            TotalPrice = op.Price * quantity,
            UnitCost = op.CostPrice,
            TotalCost = op.CostPrice * quantity,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "seed"
        });
    }
}
context.OrderItems.AddRange(orderItems);
context.SaveChanges();
Console.WriteLine($"Created {orderItems.Count} order items");

// Seed Reviews
Console.WriteLine("Seeding Reviews...");
var reviews = new List<Review>();
var reviewTitles = new[] { "Great product!", "Good quality", "Worth the price", "Exceeded expectations", "Recommended", "Not bad", "Good value", "Excellent!" };
var reviewComments = new[] { "Very satisfied with this product. Highly recommended!", "Good quality for the price. Would buy again.", "Product arrived quickly and exactly as described.", "Decent product, does what it says.", "Excellent quality, very happy with my purchase.", "Good value for money. Recommended!" };

var allOrderItems = context.OrderItems.ToList();
var productToOrderMap = allOrderItems.GroupBy(oi => oi.ProductId).ToDictionary(g => g.Key, g => g.First().OrderId);
var usedCustomerProducts = new HashSet<(int ProductId, int CustomerId)>();

foreach (var product in products.Take(30))
{
    var numReviews = Random.Shared.Next(1, 6);
    for (int i = 0; i < numReviews; i++)
    {
        int customerIdx;
        do { customerIdx = Random.Shared.Next(customers.Count); }
        while (usedCustomerProducts.Contains((product.Id, customers[customerIdx].Id)));
        
        usedCustomerProducts.Add((product.Id, customers[customerIdx].Id));
        var orderId = productToOrderMap.ContainsKey(product.Id) ? productToOrderMap[product.Id] : orders[Random.Shared.Next(orders.Count)].Id;
        reviews.Add(new Review
        {
            ProductId = product.Id,
            CustomerId = customers[customerIdx].Id,
            OrderId = orderId,
            Rating = Random.Shared.Next(3, 6),
            Title = reviewTitles[Random.Shared.Next(reviewTitles.Length)],
            Comment = reviewComments[Random.Shared.Next(reviewComments.Length)],
            IsVerifiedPurchase = true,
            IsApproved = true,
            CreatedAt = DateTime.UtcNow.AddDays(-Random.Shared.Next(1, 30)),
            CreatedBy = "seed"
        });
    }
}
context.Reviews.AddRange(reviews);
context.SaveChanges();
Console.WriteLine($"Created {reviews.Count} reviews");

Console.WriteLine($"\n=== Final Seed Data Summary ===");
Console.WriteLine($"Categories: {context.Categories.Count()}");
Console.WriteLine($"Brands: {context.Brands.Count()}");
Console.WriteLine($"Suppliers: {context.Suppliers.Count()}");
Console.WriteLine($"Shipping Methods: {context.ShippingMethods.Count()}");
Console.WriteLine($"Products: {context.Products.Count()}");
Console.WriteLine($"Customers: {context.Customers.Count()}");
Console.WriteLine($"Coupons: {context.Coupons.Count()}");
Console.WriteLine($"Orders: {context.Orders.Count()}");
Console.WriteLine($"Order Items: {context.OrderItems.Count()}");
Console.WriteLine($"Warehouses: {context.Warehouses.Count()}");
Console.WriteLine($"Stock Items: {context.StockItems.Count()}");
Console.WriteLine($"Product Images: {context.ProductImages.Count()}");
Console.WriteLine($"Reviews: {context.Reviews.Count()}");
Console.WriteLine("\nSeed data generation completed!");
