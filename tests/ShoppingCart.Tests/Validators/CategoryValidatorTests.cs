using FluentAssertions;
using ShoppingCart.Application.DTOs.Categories;
using ShoppingCart.Application.Validators;
using Xunit;

namespace ShoppingCart.Tests.Validators;

public class CategoryValidatorTests
{
    private readonly CreateCategoryRequestValidator _createValidator = new();
    private readonly UpdateCategoryRequestValidator _updateValidator = new();

    [Fact]
    public void CreateValidator_WithValidRequest_ShouldPass()
    {
        var request = new CreateCategoryRequest
        {
            Name = "Electronics",
            Description = "Electronic products",
            DisplayOrder = 1,
            IsFeatured = true
        };

        var result = _createValidator.Validate(request);
        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void CreateValidator_WithEmptyName_ShouldFail()
    {
        var request = new CreateCategoryRequest
        {
            Name = "",
            DisplayOrder = 1
        };

        var result = _createValidator.Validate(request);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Name");
    }

    [Fact]
    public void CreateValidator_WithNameExceeding100Characters_ShouldFail()
    {
        var request = new CreateCategoryRequest
        {
            Name = new string('A', 101),
            DisplayOrder = 1
        };

        var result = _createValidator.Validate(request);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Name");
    }

    [Fact]
    public void CreateValidator_WithDescriptionExceeding500Characters_ShouldFail()
    {
        var request = new CreateCategoryRequest
        {
            Name = "Test",
            Description = new string('A', 501),
            DisplayOrder = 1
        };

        var result = _createValidator.Validate(request);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Description");
    }

    [Theory]
    [InlineData(-1)]
    [InlineData(-10)]
    public void CreateValidator_WithNegativeDisplayOrder_ShouldFail(int displayOrder)
    {
        var request = new CreateCategoryRequest
        {
            Name = "Test Category",
            DisplayOrder = displayOrder
        };

        var result = _createValidator.Validate(request);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "DisplayOrder");
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public void CreateValidator_WithInvalidParentCategoryId_ShouldFail(int? parentCategoryId)
    {
        var request = new CreateCategoryRequest
        {
            Name = "Test Category",
            ParentCategoryId = parentCategoryId,
            DisplayOrder = 1
        };

        var result = _createValidator.Validate(request);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "ParentCategoryId");
    }

    [Fact]
    public void UpdateValidator_WithValidRequest_ShouldPass()
    {
        var request = new UpdateCategoryRequest
        {
            Id = 1,
            Name = "Updated Category",
            DisplayOrder = 2
        };

        var result = _updateValidator.Validate(request);
        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void UpdateValidator_WithInvalidId_ShouldFail()
    {
        var request = new UpdateCategoryRequest
        {
            Id = 0,
            Name = "Test Category",
            DisplayOrder = 1
        };

        var result = _updateValidator.Validate(request);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Id");
    }

    [Fact]
    public void UpdateValidator_WithNegativeId_ShouldFail()
    {
        var request = new UpdateCategoryRequest
        {
            Id = -5,
            Name = "Test Category",
            DisplayOrder = 1
        };

        var result = _updateValidator.Validate(request);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Id");
    }
}
