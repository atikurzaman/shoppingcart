using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using ShoppingCart.Application.DTOs.Categories;
using ShoppingCart.Application.Services;
using ShoppingCart.Domain.Entities;
using ShoppingCart.Persistence.Data;
using Xunit;

namespace ShoppingCart.Tests.Services;

public class CategoryServiceTests : IDisposable
{
    private readonly AppDbContext _context;
    private readonly CategoryService _service;

    public CategoryServiceTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new AppDbContext(options);
        _service = new CategoryService(_context);

        SeedData();
    }

    private void SeedData()
    {
        var parentCategory = new Category
        {
            Id = 1,
            Name = "Electronics",
            Slug = "electronics",
            Description = "Electronic products",
            IsActive = true,
            IsFeatured = true,
            DisplayOrder = 1,
            CreatedAt = DateTime.UtcNow
        };

        var subCategory = new Category
        {
            Id = 2,
            Name = "Smartphones",
            Slug = "smartphones",
            ParentCategoryId = 1,
            IsActive = true,
            DisplayOrder = 1,
            CreatedAt = DateTime.UtcNow
        };

        var inactiveCategory = new Category
        {
            Id = 3,
            Name = "Inactive Category",
            Slug = "inactive-category",
            IsActive = false,
            IsDeleted = true,
            DisplayOrder = 99,
            CreatedAt = DateTime.UtcNow
        };

        _context.Categories.AddRange(parentCategory, subCategory, inactiveCategory);
        _context.SaveChanges();
    }

    [Fact]
    public async Task GetCategoriesAsync_WithNoFilters_ShouldReturnActiveCategories()
    {
        var result = await _service.GetCategoriesAsync(0, 10, null);

        result.Should().NotBeNull();
        result.Items.Should().HaveCount(2);
        result.TotalCount.Should().Be(2);
    }

    [Fact]
    public async Task GetCategoriesAsync_WithSearchFilter_ShouldReturnMatchingCategories()
    {
        var result = await _service.GetCategoriesAsync(0, 10, "Smart");

        result.Should().NotBeNull();
        result.Items.Should().HaveCount(1);
        result.Items.First().Name.Should().Be("Smartphones");
    }

    [Fact]
    public async Task GetCategoriesAsync_WithPagination_ShouldReturnCorrectPage()
    {
        var result = await _service.GetCategoriesAsync(0, 1, null);

        result.Items.Should().HaveCount(1);
        result.PageIndex.Should().Be(0);
        result.PageSize.Should().Be(1);
    }

    [Fact]
    public async Task GetAllCategoriesAsync_ShouldReturnAllActiveCategories()
    {
        var result = await _service.GetAllCategoriesAsync();

        result.Should().NotBeNull();
        result.Should().HaveCount(2);
        result.Should().OnlyContain(c => c.IsActive);
    }

    [Fact]
    public async Task GetFeaturedCategoriesAsync_ShouldReturnOnlyFeaturedCategories()
    {
        var result = await _service.GetFeaturedCategoriesAsync();

        result.Should().NotBeNull();
        result.Should().HaveCount(1);
        result.First().Name.Should().Be("Electronics");
        result.First().IsFeatured.Should().BeTrue();
    }

    [Fact]
    public async Task GetCategoryByIdAsync_WithValidId_ShouldReturnCategory()
    {
        var result = await _service.GetCategoryByIdAsync(1);

        result.Should().NotBeNull();
        result!.Name.Should().Be("Electronics");
    }

    [Fact]
    public async Task GetCategoryByIdAsync_WithInvalidId_ShouldReturnNull()
    {
        var result = await _service.GetCategoryByIdAsync(999);

        result.Should().BeNull();
    }

    [Fact]
    public async Task GetCategoryBySlugAsync_WithValidSlug_ShouldReturnCategory()
    {
        var result = await _service.GetCategoryBySlugAsync("electronics");

        result.Should().NotBeNull();
        result!.Name.Should().Be("Electronics");
    }

    [Fact]
    public async Task GetCategoryBySlugAsync_WithInvalidSlug_ShouldReturnNull()
    {
        var result = await _service.GetCategoryBySlugAsync("nonexistent");

        result.Should().BeNull();
    }

    [Fact]
    public async Task CreateCategoryAsync_WithValidRequest_ShouldCreateCategory()
    {
        var request = new CreateCategoryRequest
        {
            Name = "New Category",
            Description = "A new category",
            DisplayOrder = 5,
            IsFeatured = false
        };

        var result = await _service.CreateCategoryAsync(request);

        result.Should().NotBeNull();
        result.Name.Should().Be("New Category");
        result.Id.Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task CreateCategoryAsync_ShouldGenerateUniqueSlug()
    {
        var request = new CreateCategoryRequest
        {
            Name = "Electronics",
            DisplayOrder = 1
        };

        var result = await _service.CreateCategoryAsync(request);

        result.Slug.Should().Contain("electronics");
    }

    [Fact]
    public async Task UpdateCategoryAsync_WithValidRequest_ShouldUpdateCategory()
    {
        var request = new UpdateCategoryRequest
        {
            Id = 1,
            Name = "Updated Electronics",
            Description = "Updated description",
            DisplayOrder = 2,
            IsFeatured = false
        };

        var result = await _service.UpdateCategoryAsync(request);

        result.Should().NotBeNull();
        result.Name.Should().Be("Updated Electronics");
        result.Description.Should().Be("Updated description");
    }

    [Fact]
    public async Task DeleteCategoryAsync_WithValidId_ShouldSoftDelete()
    {
        var result = await _service.DeleteCategoryAsync(1);

        result.Should().BeTrue();

        var category = await _context.Categories.FindAsync(1);
        category!.IsDeleted.Should().BeTrue();
    }

    [Fact]
    public async Task DeleteCategoryAsync_WithInvalidId_ShouldReturnFalse()
    {
        var result = await _service.DeleteCategoryAsync(999);

        result.Should().BeFalse();
    }

    [Fact]
    public async Task ToggleFeaturedAsync_WithValidId_ShouldToggleFeaturedStatus()
    {
        var initialCategory = await _service.GetCategoryByIdAsync(2);
        var initialFeatured = initialCategory!.IsFeatured;

        var result = await _service.ToggleFeaturedAsync(2);

        result.Should().BeTrue();
        var updatedCategory = await _service.GetCategoryByIdAsync(2);
        updatedCategory!.IsFeatured.Should().Be(!initialFeatured);
    }

    [Fact]
    public async Task ToggleFeaturedAsync_WithInvalidId_ShouldReturnFalse()
    {
        var result = await _service.ToggleFeaturedAsync(999);

        result.Should().BeFalse();
    }

    [Fact]
    public async Task ReorderCategoriesAsync_ShouldUpdateDisplayOrders()
    {
        var orders = new List<(int Id, int DisplayOrder)>
        {
            (1, 10),
            (2, 20)
        };

        var result = await _service.ReorderCategoriesAsync(orders);

        result.Should().BeTrue();

        var category1 = await _context.Categories.FindAsync(1);
        var category2 = await _context.Categories.FindAsync(2);

        category1!.DisplayOrder.Should().Be(10);
        category2!.DisplayOrder.Should().Be(20);
    }

    public void Dispose()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
    }
}
