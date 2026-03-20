using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShoppingCart.Application.DTOs.Payments;
using ShoppingCart.Application.Interfaces.Services;
using ShoppingCart.Shared.Common;

namespace ShoppingCart.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentService _paymentService;

    public PaymentsController(IPaymentService paymentService)
    {
        _paymentService = paymentService;
    }

    private int? GetUserId()
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
        if (userIdClaim != null && int.TryParse(userIdClaim.Value, out var userId))
        {
            return userId;
        }
        return null;
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<PaymentDto>>> GetPayment(int id)
    {
        var payment = await _paymentService.GetPaymentByIdAsync(id);
        if (payment == null)
            return NotFound(ApiResponse<PaymentDto>.NotFound("Payment not found"));

        return Ok(ApiResponse<PaymentDto>.Success(payment));
    }

    [HttpGet("order/{orderId}")]
    public async Task<ActionResult<ApiResponse<PaymentDto>>> GetPaymentByOrder(int orderId)
    {
        var payment = await _paymentService.GetPaymentByOrderIdAsync(orderId);
        if (payment == null)
            return NotFound(ApiResponse<PaymentDto>.NotFound("Payment not found"));

        return Ok(ApiResponse<PaymentDto>.Success(payment));
    }

    [HttpPost("initiate")]
    public async Task<ActionResult<ApiResponse<PaymentDto>>> InitiatePayment([FromBody] InitiatePaymentRequest request)
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        var payment = await _paymentService.InitiatePaymentAsync(userId.Value, request);
        return Ok(ApiResponse<PaymentDto>.Success(payment));
    }

    [HttpPost("callback")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<PaymentDto>>> PaymentCallback([FromBody] PaymentCallbackRequest request)
    {
        var payment = await _paymentService.ProcessPaymentCallbackAsync(request);
        return Ok(ApiResponse<PaymentDto>.Success(payment));
    }

    [HttpGet("history")]
    public async Task<ActionResult<ApiResponse<List<PaymentDto>>>> GetPaymentHistory()
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        var payments = await _paymentService.GetPaymentHistoryAsync(userId.Value);
        return Ok(ApiResponse<List<PaymentDto>>.Success(payments));
    }

    // Admin endpoints
    [HttpGet("admin/all")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<PagedResult<PaymentListDto>>>> GetAllPayments(
        [FromQuery] int pageIndex = 0,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? status = null)
    {
        var payments = await _paymentService.GetAllPaymentsAsync(pageIndex, pageSize, status);
        return Ok(ApiResponse<PagedResult<PaymentListDto>>.Success(payments));
    }

    [HttpGet("admin/summary")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<PaymentSummaryDto>>> GetPaymentSummary()
    {
        var summary = await _paymentService.GetPaymentSummaryAsync();
        return Ok(ApiResponse<PaymentSummaryDto>.Success(summary));
    }

    [HttpPost("admin/refund")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<PaymentDto>>> ProcessRefund([FromBody] RefundRequest request)
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        var payment = await _paymentService.ProcessRefundAsync(userId.Value, request);
        return Ok(ApiResponse<PaymentDto>.Success(payment, "Refund processed successfully"));
    }
}
