using FluentAssertions;
using ShoppingCart.Application.DTOs.Auth;
using ShoppingCart.Application.Validators.Auth;
using Xunit;

namespace ShoppingCart.Tests.Validators;

public class AuthValidatorTests
{
    private readonly LoginRequestValidator _loginValidator = new();
    private readonly RegisterRequestValidator _registerValidator = new();
    private readonly ChangePasswordRequestValidator _changePasswordValidator = new();

    [Fact]
    public void LoginValidator_WithValidRequest_ShouldPass()
    {
        var request = new LoginRequest
        {
            Email = "test@example.com",
            Password = "password123"
        };

        var result = _loginValidator.Validate(request);
        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void LoginValidator_WithEmptyEmail_ShouldFail()
    {
        var request = new LoginRequest
        {
            Email = "",
            Password = "password123"
        };

        var result = _loginValidator.Validate(request);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Email");
    }

    [Theory]
    [InlineData("invalid-email")]
    [InlineData("no@domain")]
    [InlineData("@nodomain.com")]
    [InlineData("spaces in@email.com")]
    public void LoginValidator_WithInvalidEmailFormat_ShouldFail(string email)
    {
        var request = new LoginRequest
        {
            Email = email,
            Password = "password123"
        };

        var result = _loginValidator.Validate(request);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Email");
    }

    [Fact]
    public void LoginValidator_WithEmptyPassword_ShouldFail()
    {
        var request = new LoginRequest
        {
            Email = "test@example.com",
            Password = ""
        };

        var result = _loginValidator.Validate(request);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Password");
    }

    [Theory]
    [InlineData("12345")]
    [InlineData("abc")]
    public void LoginValidator_WithShortPassword_ShouldFail(string password)
    {
        var request = new LoginRequest
        {
            Email = "test@example.com",
            Password = password
        };

        var result = _loginValidator.Validate(request);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Password");
    }

    [Fact]
    public void RegisterValidator_WithValidRequest_ShouldPass()
    {
        var request = new RegisterRequest
        {
            Email = "test@example.com",
            Password = "Password123",
            ConfirmPassword = "Password123",
            FirstName = "John",
            LastName = "Doe",
            PhoneNumber = "+1234567890"
        };

        var result = _registerValidator.Validate(request);
        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void RegisterValidator_WithEmptyEmail_ShouldFail()
    {
        var request = new RegisterRequest
        {
            Email = "",
            Password = "Password123",
            ConfirmPassword = "Password123",
            FirstName = "John",
            LastName = "Doe"
        };

        var result = _registerValidator.Validate(request);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Email");
    }

    [Theory]
    [InlineData("password")]
    [InlineData("alllowercase123")]
    [InlineData("ALLUPPERCASE123")]
    [InlineData("NoNumbersHere")]
    [InlineData("NoUppercase123")]
    public void RegisterValidator_WithWeakPassword_ShouldFail(string password)
    {
        var request = new RegisterRequest
        {
            Email = "test@example.com",
            Password = password,
            ConfirmPassword = password,
            FirstName = "John",
            LastName = "Doe"
        };

        var result = _registerValidator.Validate(request);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Password");
    }

    [Theory]
    [InlineData(7)]
    [InlineData(5)]
    [InlineData(3)]
    public void RegisterValidator_WithPasswordTooShort_ShouldFail(int length)
    {
        var request = new RegisterRequest
        {
            Email = "test@example.com",
            Password = new string('A', length) + "a1",
            ConfirmPassword = new string('A', length) + "a1",
            FirstName = "John",
            LastName = "Doe"
        };

        var result = _registerValidator.Validate(request);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Password");
    }

    [Fact]
    public void RegisterValidator_WithMismatchedPasswords_ShouldFail()
    {
        var request = new RegisterRequest
        {
            Email = "test@example.com",
            Password = "Password123",
            ConfirmPassword = "DifferentPassword123",
            FirstName = "John",
            LastName = "Doe"
        };

        var result = _registerValidator.Validate(request);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "ConfirmPassword");
    }

    [Fact]
    public void RegisterValidator_WithEmptyFirstName_ShouldFail()
    {
        var request = new RegisterRequest
        {
            Email = "test@example.com",
            Password = "Password123",
            ConfirmPassword = "Password123",
            FirstName = "",
            LastName = "Doe"
        };

        var result = _registerValidator.Validate(request);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "FirstName");
    }

    [Fact]
    public void RegisterValidator_WithEmptyLastName_ShouldFail()
    {
        var request = new RegisterRequest
        {
            Email = "test@example.com",
            Password = "Password123",
            ConfirmPassword = "Password123",
            FirstName = "John",
            LastName = ""
        };

        var result = _registerValidator.Validate(request);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "LastName");
    }

    [Fact]
    public void RegisterValidator_WithFirstNameExceeding50Characters_ShouldFail()
    {
        var request = new RegisterRequest
        {
            Email = "test@example.com",
            Password = "Password123",
            ConfirmPassword = "Password123",
            FirstName = new string('A', 51),
            LastName = "Doe"
        };

        var result = _registerValidator.Validate(request);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "FirstName");
    }

    [Theory]
    [InlineData("12345")]
    [InlineData("abc-def")]
    [InlineData("(123) 456-7890")]
    [InlineData("+1 234 567 8901")]
    public void RegisterValidator_WithInvalidPhoneNumber_ShouldFail(string phone)
    {
        var request = new RegisterRequest
        {
            Email = "test@example.com",
            Password = "Password123",
            ConfirmPassword = "Password123",
            FirstName = "John",
            LastName = "Doe",
            PhoneNumber = phone
        };

        var result = _registerValidator.Validate(request);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "PhoneNumber");
    }

    [Fact]
    public void ChangePasswordValidator_WithValidRequest_ShouldPass()
    {
        var request = new ChangePasswordRequest
        {
            CurrentPassword = "OldPassword123",
            NewPassword = "NewPassword456",
            ConfirmPassword = "NewPassword456"
        };

        var result = _changePasswordValidator.Validate(request);
        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void ChangePasswordValidator_WithSamePassword_ShouldFail()
    {
        var request = new ChangePasswordRequest
        {
            CurrentPassword = "SamePassword123",
            NewPassword = "SamePassword123",
            ConfirmPassword = "SamePassword123"
        };

        var result = _changePasswordValidator.Validate(request);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "NewPassword");
    }

    [Fact]
    public void ChangePasswordValidator_WithEmptyCurrentPassword_ShouldFail()
    {
        var request = new ChangePasswordRequest
        {
            CurrentPassword = "",
            NewPassword = "NewPassword123",
            ConfirmPassword = "NewPassword123"
        };

        var result = _changePasswordValidator.Validate(request);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "CurrentPassword");
    }
}
