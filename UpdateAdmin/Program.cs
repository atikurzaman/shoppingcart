using Microsoft.EntityFrameworkCore;
using ShoppingCart.Persistence.Data;
using ShoppingCart.Domain.Entities;
using ShoppingCart.Domain.Enums;

var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
optionsBuilder.UseSqlServer("Server=localhost;Database=ShoppingCartDb;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True");

using var context = new AppDbContext(optionsBuilder.Options);

Console.WriteLine("Creating categories...\n");

var categoriesToCreate = new[]
{
    new { Name = "Electronics", Description = "Electronic devices and accessories", Slug = "electronics", DisplayOrder = 1, IsFeatured = true },
    new { Name = "Clothing", Description = "Fashion and apparel", Slug = "clothing", DisplayOrder = 2, IsFeatured = true },
    new { Name = "Home & Garden", Description = "Home decor and garden supplies", Slug = "home-garden", DisplayOrder = 3, IsFeatured = true },
    new { Name = "Sports", Description = "Sports equipment and fitness", Slug = "sports", DisplayOrder = 4, IsFeatured = false },
    new { Name = "Books", Description = "Books and literature", Slug = "books", DisplayOrder = 5, IsFeatured = false },
};

foreach (var cat in categoriesToCreate)
{
    var existingCategory = context.Categories.FirstOrDefault(c => c.Slug == cat.Slug && !c.IsDeleted);
    if (existingCategory != null)
    {
        Console.WriteLine($"Category '{cat.Name}' already exists (ID: {existingCategory.Id})");
        continue;
    }

    var category = new Category
    {
        Name = cat.Name,
        Description = cat.Description,
        Slug = cat.Slug,
        DisplayOrder = cat.DisplayOrder,
        IsFeatured = cat.IsFeatured,
        IsActive = true,
        CreatedAt = DateTime.UtcNow,
        CreatedBy = "system"
    };

    context.Categories.Add(category);
    context.SaveChanges();
    Console.WriteLine($"Created category: {cat.Name} (ID: {category.Id})");
}

Console.WriteLine("\nCategories created successfully!");
