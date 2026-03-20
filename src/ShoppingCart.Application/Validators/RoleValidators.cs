using FluentValidation;
using ShoppingCart.Application.DTOs.Users;

namespace ShoppingCart.Application.Validators;

public class RoleValidators : AbstractValidator<CreateRoleRequest>
{
    public RoleValidators()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Role name is required")
            .MaximumLength(100).WithMessage("Role name cannot exceed 100 characters")
            .Matches(@"^[a-zA-Z\s]+$").WithMessage("Role name can only contain letters and spaces");
    }
}

public class UpdateRoleValidator : AbstractValidator<UpdateRoleRequest>
{
    public UpdateRoleValidator()
    {
        RuleFor(x => x.Id)
            .GreaterThan(0).WithMessage("Valid role ID is required");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Role name is required")
            .MaximumLength(100).WithMessage("Role name cannot exceed 100 characters")
            .Matches(@"^[a-zA-Z\s]+$").WithMessage("Role name can only contain letters and spaces");
    }
}
