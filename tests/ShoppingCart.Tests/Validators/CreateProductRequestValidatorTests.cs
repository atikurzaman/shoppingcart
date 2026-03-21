using FluentAssertions;
using ShoppingCart.Application.DTOs.Products;
using ShoppingCart.Application.Validators;
using Xunit;

namespace ShoppingCart.Tests.Validators;

public class CreateProductRequestValidatorTests
{
    private readonly CreateProductRequestValidator _validator = new();

    [Fact]
    public void Validate_WithValidRequest_ShouldPass()
    {
        var request = new CreateProductRequest
        {
            Name = "Test Product",
            Price = 99.99m,
            CostPrice = 50m,
            CategoryId = 1,
            SKU = "TEST-001",
            ShortDescription = "A test product",
            MinimumStockLevel = 10,
            ReorderLevel = 5,
            Weight = 1.5m
        };

        var result = _validator.Validate(request);
        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void Validate_WithEmptyName_ShouldFail()
    {
        var request = new CreateProductRequest
        {
            Name = "",
            Price = 99.99m,
            CategoryId = 1
        };

        var result = _validator.Validate(request);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Name");
    }

    [Fact]
    public void Validate_WithNameExceeding200Characters_ShouldFail()
    {
        var request = new CreateProductRequest
        {
            Name = new string('A', 201),
            Price = 99.99m,
            CategoryId = 1
        };

        var result = _validator.Validate(request);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Name");
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    [InlineData(-100)]
    public void Validate_WithInvalidPrice_ShouldFail(decimal price)
    {
        var request = new CreateProductRequest
        {
            Name = "Test Product",
            Price = price,
            CategoryId = 1
        };

        var result = _validator.Validate(request);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Price");
    }

    [Theory]
    [InlineData(-1)]
    [InlineData(-50)]
    public void Validate_WithNegativeCostPrice_ShouldFail(decimal costPrice)
    {
        var request = new CreateProductRequest
        {
            Name = "Test Product",
            Price = 99.99m,
            CostPrice = costPrice,
            CategoryId = 1
        };

        var result = _validator.Validate(request);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "CostPrice");
    }

    [Fact]
    public void Validate_WithZeroCategoryId_ShouldFail()
    {
        var request = new CreateProductRequest
        {
            Name = "Test Product",
            Price = 99.99m,
            CategoryId = 0
        };

        var result = _validator.Validate(request);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "CategoryId");
    }

    [Theory]
    [InlineData("VALID-SKU-123")]
    [InlineData("VALID_SKU_456")]
    [InlineData("SKU123")]
    public void Validate_WithValidSku_ShouldPass(string sku)
    {
        var request = new CreateProductRequest
        {
            Name = "Test Product",
            Price = 99.99m,
            CategoryId = 1,
            SKU = sku
        };

        var result = _validator.Validate(request);
        result.IsValid.Should().BeTrue();
    }

    [Theory]
    [InlineData("INVALID SKU WITH SPACES")]
    [InlineData("INVALID@SKU")]
    [InlineData("INVALID#SKU")]
    public void Validate_WithInvalidSkuFormat_ShouldFail(string sku)
    {
        var request = new CreateProductRequest
        {
            Name = "Test Product",
            Price = 99.99m,
            CategoryId = 1,
            SKU = sku
        };

        var result = _validator.Validate(request);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "SKU");
    }

    [Theory]
    [InlineData(-1)]
    [InlineData(-10)]
    public void Validate_WithNegativeMinimumStockLevel_ShouldFail(int stockLevel)
    {
        var request = new CreateProductRequest
        {
            Name = "Test Product",
            Price = 99.99m,
            CategoryId = 1,
            MinimumStockLevel = stockLevel
        };

        var result = _validator.Validate(request);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "MinimumStockLevel");
    }

    [Theory]
    [InlineData(-1)]
    [InlineData(-5)]
    public void Validate_WithNegativeReorderLevel_ShouldFail(int reorderLevel)
    {
        var request = new CreateProductRequest
        {
            Name = "Test Product",
            Price = 99.99m,
            CategoryId = 1,
            ReorderLevel = reorderLevel
        };

        var result = _validator.Validate(request);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "ReorderLevel");
    }

    [Theory]
    [InlineData(-1)]
    [InlineData(-10)]
    public void Validate_WithNegativeWeight_ShouldFail(decimal weight)
    {
        var request = new CreateProductRequest
        {
            Name = "Test Product",
            Price = 99.99m,
            CategoryId = 1,
            Weight = weight
        };

        var result = _validator.Validate(request);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Weight");
    }
}
