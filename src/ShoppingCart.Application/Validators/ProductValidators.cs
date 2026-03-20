using FluentValidation;
using ShoppingCart.Application.DTOs.Products;

namespace ShoppingCart.Application.Validators;

public class CreateProductRequestValidator : AbstractValidator<CreateProductRequest>
{
    public CreateProductRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Product name is required")
            .MaximumLength(200).WithMessage("Product name cannot exceed 200 characters");

        RuleFor(x => x.Price)
            .GreaterThan(0).WithMessage("Price must be greater than 0");

        RuleFor(x => x.CostPrice)
            .GreaterThanOrEqualTo(0).WithMessage("Cost price cannot be negative");

        RuleFor(x => x.CategoryId)
            .GreaterThan(0).WithMessage("Category is required");

        RuleFor(x => x.SKU)
            .MaximumLength(50).When(x => !string.IsNullOrEmpty(x.SKU))
            .Matches(@"^[A-Za-z0-9\-_]+$").When(x => !string.IsNullOrEmpty(x.SKU))
            .WithMessage("SKU can only contain alphanumeric characters, hyphens, and underscores");

        RuleFor(x => x.Barcode)
            .MaximumLength(50).When(x => !string.IsNullOrEmpty(x.Barcode));

        RuleFor(x => x.ShortDescription)
            .MaximumLength(500).When(x => !string.IsNullOrEmpty(x.ShortDescription));

        RuleFor(x => x.MinimumStockLevel)
            .GreaterThanOrEqualTo(0).WithMessage("Minimum stock level cannot be negative");

        RuleFor(x => x.ReorderLevel)
            .GreaterThanOrEqualTo(0).WithMessage("Reorder level cannot be negative");

        RuleFor(x => x.Weight)
            .GreaterThanOrEqualTo(0).WithMessage("Weight cannot be negative");
    }
}

public class UpdateProductRequestValidator : AbstractValidator<UpdateProductRequest>
{
    public UpdateProductRequestValidator()
    {
        Include(new CreateProductRequestValidator());

        RuleFor(x => x.Id)
            .GreaterThan(0).WithMessage("Invalid product ID");
    }
}
