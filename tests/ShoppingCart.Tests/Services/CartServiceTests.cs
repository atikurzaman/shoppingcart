using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using ShoppingCart.Application.DTOs.Cart;
using ShoppingCart.Application.Services;
using ShoppingCart.Domain.Entities;
using ShoppingCart.Persistence.Data;
using Xunit;

namespace ShoppingCart.Tests.Services;

public class CartServiceTests : IDisposable
{
    private readonly AppDbContext _context;
    private readonly CartService _service;

    public CartServiceTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new AppDbContext(options);
        var loggerMock = new Mock<ILogger<CartService>>();
        _service = new CartService(_context, loggerMock.Object);

        SeedData();
    }

    private void SeedData()
    {
        var user = new User
        {
            Id = 1,
            Email = "test@example.com",
            PasswordHash = "hash",
            FirstName = "John",
            LastName = "Doe",
            CreatedAt = DateTime.UtcNow
        };

        var customer = new Customer
        {
            Id = 1,
            UserId = 1,
            CreatedAt = DateTime.UtcNow
        };

        var category = new Category
        {
            Id = 1,
            Name = "Electronics",
            Slug = "electronics",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        var product = new Product
        {
            Id = 1,
            Name = "Test Product",
            Slug = "test-product",
            Price = 99.99m,
            CategoryId = 1,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        var stockItem = new StockItem
        {
            Id = 1,
            ProductId = 1,
            QuantityOnHand = 100,
            ReservedQuantity = 0,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        _context.Customers.Add(customer);
        _context.Categories.Add(category);
        _context.Products.Add(product);
        _context.StockItems.Add(stockItem);
        _context.SaveChanges();
    }

    [Fact]
    public async Task GetCartAsync_WithSessionId_ShouldReturnCart()
    {
        var cart = new Cart
        {
            SessionId = "test-session-123",
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "guest"
        };
        _context.Carts.Add(cart);
        await _context.SaveChangesAsync();

        var result = await _service.GetCartAsync(sessionId: "test-session-123");

        result.Should().NotBeNull();
        result!.SessionId.Should().Be("test-session-123");
    }

    [Fact]
    public async Task GetCartAsync_WithNoSessionOrCustomer_ShouldReturnNull()
    {
        var result = await _service.GetCartAsync();

        result.Should().BeNull();
    }

    [Fact]
    public async Task AddToCartAsync_WithNewProduct_ShouldAddItemToCart()
    {
        var request = new AddToCartRequest
        {
            ProductId = 1,
            Quantity = 2
        };

        var result = await _service.AddToCartAsync(null, "test-session", request);

        result.Should().NotBeNull();
        result.Items.Should().HaveCount(1);
        result.Items.First().ProductId.Should().Be(1);
        result.Items.First().Quantity.Should().Be(2);
        result.Items.First().UnitPrice.Should().Be(99.99m);
    }

    [Fact]
    public async Task AddToCartAsync_WithExistingProduct_ShouldIncrementQuantity()
    {
        var sessionId = "test-session";
        var cart = new Cart
        {
            SessionId = sessionId,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "guest"
        };
        _context.Carts.Add(cart);
        await _context.SaveChangesAsync();

        var cartItem = new CartItem
        {
            CartId = cart.Id,
            ProductId = 1,
            Quantity = 1,
            UnitPrice = 99.99m,
            TotalPrice = 99.99m,
            CreatedAt = DateTime.UtcNow
        };
        _context.CartItems.Add(cartItem);
        await _context.SaveChangesAsync();

        var request = new AddToCartRequest
        {
            ProductId = 1,
            Quantity = 2
        };

        var result = await _service.AddToCartAsync(null, sessionId, request);

        result.Items.Should().HaveCount(1);
        result.Items.First().Quantity.Should().Be(3);
        result.Items.First().TotalPrice.Should().Be(299.97m);
    }

    [Fact]
    public async Task RemoveCartItemAsync_WithValidItem_ShouldRemoveItem()
    {
        var sessionId = "test-session";
        var cart = new Cart
        {
            SessionId = sessionId,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "guest"
        };
        _context.Carts.Add(cart);
        await _context.SaveChangesAsync();

        var cartItem = new CartItem
        {
            CartId = cart.Id,
            ProductId = 1,
            Quantity = 1,
            UnitPrice = 99.99m,
            TotalPrice = 99.99m,
            CreatedAt = DateTime.UtcNow
        };
        _context.CartItems.Add(cartItem);
        await _context.SaveChangesAsync();

        var result = await _service.RemoveCartItemAsync(null, sessionId, cartItem.Id);

        result.Items.Should().BeEmpty();
    }

    [Fact]
    public async Task ClearCartAsync_ShouldRemoveAllItems()
    {
        var sessionId = "test-session";
        var cart = new Cart
        {
            SessionId = sessionId,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "guest"
        };
        _context.Carts.Add(cart);
        await _context.SaveChangesAsync();

        _context.CartItems.Add(new CartItem
        {
            CartId = cart.Id,
            ProductId = 1,
            Quantity = 1,
            UnitPrice = 99.99m,
            TotalPrice = 99.99m,
            CreatedAt = DateTime.UtcNow
        });
        await _context.SaveChangesAsync();

        var result = await _service.ClearCartAsync(null, sessionId);

        result.Items.Should().BeEmpty();
    }

    [Fact]
    public async Task CartTotalCalculation_ShouldIncludeTax()
    {
        var sessionId = "test-session";
        var cart = new Cart
        {
            SessionId = sessionId,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "guest"
        };
        _context.Carts.Add(cart);
        await _context.SaveChangesAsync();

        _context.CartItems.Add(new CartItem
        {
            CartId = cart.Id,
            ProductId = 1,
            Quantity = 1,
            UnitPrice = 100m,
            TotalPrice = 100m,
            CreatedAt = DateTime.UtcNow
        });
        await _context.SaveChangesAsync();

        var result = await _service.GetCartAsync(sessionId: sessionId);

        result!.SubTotal.Should().Be(100m);
        result.TaxAmount.Should().Be(15m);
        result.Total.Should().Be(115m);
    }

    public void Dispose()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
    }
}
