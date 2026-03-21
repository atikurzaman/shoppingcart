using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using ShoppingCart.Application.DTOs.Products;
using ShoppingCart.Application.Services;
using ShoppingCart.Domain.Entities;
using ShoppingCart.Persistence.Data;
using Xunit;

namespace ShoppingCart.Tests.Services;

public class ProductServiceTests : IDisposable
{
    private readonly AppDbContext _context;
    private readonly ProductService _service;

    public ProductServiceTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new AppDbContext(options);
        _service = new ProductService(_context);

        SeedData();
    }

    private void SeedData()
    {
        var category = new Category
        {
            Id = 1,
            Name = "Electronics",
            Slug = "electronics",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        var brand = new Brand
        {
            Id = 1,
            Name = "TestBrand",
            Slug = "testbrand",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        var products = new List<Product>
        {
            new Product
            {
                Id = 1,
                Name = "Laptop",
                Slug = "laptop",
                Price = 999.99m,
                CostPrice = 500m,
                CategoryId = 1,
                BrandId = 1,
                IsActive = true,
                IsFeatured = true,
                CreatedAt = DateTime.UtcNow
            },
            new Product
            {
                Id = 2,
                Name = "Smartphone",
                Slug = "smartphone",
                Price = 599.99m,
                CostPrice = 300m,
                CategoryId = 1,
                BrandId = 1,
                IsActive = true,
                IsFeatured = false,
                CreatedAt = DateTime.UtcNow
            },
            new Product
            {
                Id = 3,
                Name = "Deleted Product",
                Slug = "deleted-product",
                Price = 99.99m,
                CategoryId = 1,
                IsActive = false,
                IsDeleted = true,
                CreatedAt = DateTime.UtcNow
            }
        };

        _context.Categories.Add(category);
        _context.Brands.Add(brand);
        _context.Products.AddRange(products);
        _context.SaveChanges();
    }

    [Fact]
    public async Task GetProductsAsync_WithNoFilters_ShouldReturnActiveProducts()
    {
        var result = await _service.GetProductsAsync(0, 10, null, null, null, null, null);

        result.Should().NotBeNull();
        result.Items.Should().HaveCount(2);
        result.TotalCount.Should().Be(2);
    }

    [Fact]
    public async Task GetProductsAsync_WithSearchFilter_ShouldReturnMatchingProducts()
    {
        var result = await _service.GetProductsAsync(0, 10, "Laptop", null, null, null, null);

        result.Should().NotBeNull();
        result.Items.Should().HaveCount(1);
        result.Items.First().Name.Should().Be("Laptop");
    }

    [Fact]
    public async Task GetProductsAsync_WithCategoryFilter_ShouldReturnFilteredProducts()
    {
        var result = await _service.GetProductsAsync(0, 10, null, 1, null, null, null);

        result.Should().NotBeNull();
        result.Items.Should().HaveCount(2);
    }

    [Fact]
    public async Task GetProductsAsync_WithFeaturedFilter_ShouldReturnOnlyFeaturedProducts()
    {
        var result = await _service.GetProductsAsync(0, 10, null, null, null, null, true);

        result.Should().NotBeNull();
        result.Items.Should().HaveCount(1);
        result.Items.First().IsFeatured.Should().BeTrue();
    }

    [Fact]
    public async Task GetProductsAsync_WithPagination_ShouldReturnCorrectPage()
    {
        var result = await _service.GetProductsAsync(0, 1, null, null, null, null, null);

        result.Should().NotBeNull();
        result.Items.Should().HaveCount(1);
        result.PageIndex.Should().Be(0);
        result.PageSize.Should().Be(1);
        result.TotalCount.Should().Be(2);
    }

    [Fact]
    public async Task GetProductsAsync_SortedByPriceAsc_ShouldReturnCorrectOrder()
    {
        var result = await _service.GetProductsAsync(0, 10, null, null, null, "price_asc", null);

        result.Items.First().Price.Should().BeLessThanOrEqualTo(result.Items.Last().Price);
    }

    [Fact]
    public async Task GetProductsAsync_SortedByPriceDesc_ShouldReturnCorrectOrder()
    {
        var result = await _service.GetProductsAsync(0, 10, null, null, null, "price_desc", null);

        result.Items.First().Price.Should().BeGreaterThanOrEqualTo(result.Items.Last().Price);
    }

    [Fact]
    public async Task GetProductByIdAsync_WithValidId_ShouldReturnProduct()
    {
        var result = await _service.GetProductByIdAsync(1);

        result.Should().NotBeNull();
        result!.Name.Should().Be("Laptop");
    }

    [Fact]
    public async Task GetProductByIdAsync_WithInvalidId_ShouldReturnNull()
    {
        var result = await _service.GetProductByIdAsync(999);

        result.Should().BeNull();
    }

    [Fact]
    public async Task GetProductBySlugAsync_WithValidSlug_ShouldReturnProduct()
    {
        var result = await _service.GetProductBySlugAsync("laptop");

        result.Should().NotBeNull();
        result!.Name.Should().Be("Laptop");
    }

    [Fact]
    public async Task GetProductBySlugAsync_WithInvalidSlug_ShouldReturnNull()
    {
        var result = await _service.GetProductBySlugAsync("nonexistent");

        result.Should().BeNull();
    }

    [Fact]
    public async Task CreateProductAsync_WithValidRequest_ShouldCreateProduct()
    {
        var request = new CreateProductRequest
        {
            Name = "New Product",
            Price = 199.99m,
            CostPrice = 100m,
            CategoryId = 1,
            BrandId = 1
        };

        var result = await _service.CreateProductAsync(request);

        result.Should().NotBeNull();
        result.Name.Should().Be("New Product");
        result.Price.Should().Be(199.99m);
        result.Id.Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task CreateProductAsync_ShouldGenerateUniqueSlug()
    {
        var request = new CreateProductRequest
        {
            Name = "Laptop",
            Price = 199.99m,
            CategoryId = 1
        };

        var result = await _service.CreateProductAsync(request);

        result.Slug.Should().Contain("laptop");
    }

    [Fact]
    public async Task UpdateProductAsync_WithValidRequest_ShouldUpdateProduct()
    {
        var request = new UpdateProductRequest
        {
            Id = 1,
            Name = "Updated Laptop",
            Price = 1099.99m,
            CostPrice = 600m,
            CategoryId = 1,
            BrandId = 1
        };

        var result = await _service.UpdateProductAsync(request);

        result.Should().NotBeNull();
        result.Name.Should().Be("Updated Laptop");
        result.Price.Should().Be(1099.99m);
    }

    [Fact]
    public async Task DeleteProductAsync_WithValidId_ShouldSoftDelete()
    {
        var result = await _service.DeleteProductAsync(1);

        result.Should().BeTrue();

        var product = await _context.Products.FindAsync(1);
        product!.IsDeleted.Should().BeTrue();
    }

    [Fact]
    public async Task DeleteProductAsync_WithInvalidId_ShouldReturnFalse()
    {
        var result = await _service.DeleteProductAsync(999);

        result.Should().BeFalse();
    }

    [Fact]
    public async Task ToggleFeaturedAsync_WithValidId_ShouldToggleFeatureStatus()
    {
        var initialProduct = await _service.GetProductByIdAsync(2);
        var initialFeatured = initialProduct!.IsFeatured;

        var result = await _service.ToggleFeaturedAsync(2);

        result.Should().BeTrue();
        var updatedProduct = await _service.GetProductByIdAsync(2);
        updatedProduct!.IsFeatured.Should().Be(!initialFeatured);
    }

    [Fact]
    public async Task ToggleFeaturedAsync_WithInvalidId_ShouldReturnFalse()
    {
        var result = await _service.ToggleFeaturedAsync(999);

        result.Should().BeFalse();
    }

    [Fact]
    public async Task GetFeaturedProductsAsync_ShouldReturnOnlyFeaturedProducts()
    {
        var result = await _service.GetFeaturedProductsAsync(10);

        result.Should().NotBeNull();
        result.Should().OnlyContain(p => p.IsFeatured);
    }

    [Fact]
    public async Task SearchProductsAsync_WithQuery_ShouldReturnMatchingProducts()
    {
        var result = await _service.SearchProductsAsync("phone");

        result.Should().NotBeNull();
        result.Should().HaveCount(1);
        result.First().Name.Should().Contain("Phone");
    }

    [Fact]
    public async Task IncrementViewCountAsync_ShouldIncrementCount()
    {
        var product = await _context.Products.FindAsync(1);
        var initialCount = product!.ViewCount;

        await _service.IncrementViewCountAsync(1);

        var updatedProduct = await _context.Products.FindAsync(1);
        updatedProduct!.ViewCount.Should().Be(initialCount + 1);
    }

    public void Dispose()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
    }
}
