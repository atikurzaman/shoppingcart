using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using ShoppingCart.Shared.Common;
using ShoppingCart.Shared.Exceptions;

namespace ShoppingCart.Infrastructure.Middleware;

public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;

    public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        _logger.LogError(exception, "An error occurred: {Message}", exception.Message);

        var response = context.Response;
        response.ContentType = "application/json";

        int statusCode;
        string message;

        switch (exception)
        {
            case ValidationException validationEx:
                statusCode = 422;
                message = "Validation failed";
                break;
            case System.UnauthorizedAccessException:
                statusCode = 401;
                message = "Unauthorized access";
                break;
            case ForbiddenException:
                statusCode = 403;
                message = exception.Message;
                break;
            case NotFoundException:
                statusCode = 404;
                message = exception.Message;
                break;
            case BadRequestException:
                statusCode = 400;
                message = exception.Message;
                break;
            default:
                statusCode = 500;
                message = "An error occurred while processing your request";
                break;
        }

        response.StatusCode = statusCode;

        var apiResponse = new
        {
            Succeeded = false,
            Message = message,
            StatusCode = statusCode,
            Errors = exception is ValidationException ve ? ve.Errors.ToArray() : Array.Empty<string>()
        };

        await response.WriteAsJsonAsync(apiResponse);
    }
}
