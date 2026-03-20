using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShoppingCart.Application.DTOs.Orders;
using ShoppingCart.Application.Interfaces.Services;
using ShoppingCart.Shared.Common;

namespace ShoppingCart.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;

    public OrdersController(IOrderService orderService)
    {
        _orderService = orderService;
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

    [HttpGet]
    [Authorize]
    public async Task<ActionResult<ApiResponse<PagedResult<OrderListDto>>>> GetOrders(
        [FromQuery] int pageIndex = 0,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? status = null)
    {
        var userId = GetUserId();
        var isAdmin = User.IsInRole("Admin") || User.IsInRole("Manager");
        
        var orders = await _orderService.GetOrdersAsync(
            pageIndex, pageSize, isAdmin ? null : userId, status);
        return Ok(ApiResponse<PagedResult<OrderListDto>>.Success(orders));
    }

    [HttpGet("{id}")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<OrderDto>>> GetOrder(int id)
    {
        var userId = GetUserId();
        var isAdmin = User.IsInRole("Admin") || User.IsInRole("Manager");
        
        var order = await _orderService.GetOrderByIdAsync(id);
        if (order == null)
        {
            return NotFound(ApiResponse<OrderDto>.NotFound("Order not found"));
        }

        if (!isAdmin && order.CustomerId != userId)
        {
            return Forbid();
        }

        return Ok(ApiResponse<OrderDto>.Success(order));
    }

    [HttpGet("number/{orderNumber}")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<OrderDto>>> GetOrderByNumber(string orderNumber)
    {
        var order = await _orderService.GetOrderByNumberAsync(orderNumber);
        if (order == null)
        {
            return NotFound(ApiResponse<OrderDto>.NotFound("Order not found"));
        }

        return Ok(ApiResponse<OrderDto>.Success(order));
    }

    [HttpPost]
    [Authorize]
    public async Task<ActionResult<ApiResponse<OrderDto>>> CreateOrder([FromBody] CheckoutRequest request)
    {
        var userId = GetUserId();
        var order = await _orderService.CreateOrderAsync(userId, request);
        return CreatedAtAction(nameof(GetOrder), new { id = order.Id },
            ApiResponse<OrderDto>.Created(order, "Order created successfully"));
    }

    [HttpPut("{id}/status")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<OrderDto>>> UpdateOrderStatus(int id, [FromBody] UpdateOrderStatusRequest request)
    {
        var order = await _orderService.UpdateOrderStatusAsync(id, request);
        return Ok(ApiResponse<OrderDto>.Success(order, "Order status updated"));
    }

    [HttpPost("{id}/cancel")]
    [Authorize]
    public async Task<ActionResult<ApiResponse>> CancelOrder(int id, [FromBody] CancelOrderRequest request)
    {
        var userId = GetUserId();
        var isAdmin = User.IsInRole("Admin") || User.IsInRole("Manager");
        
        var order = await _orderService.GetOrderByIdAsync(id);
        if (order == null)
        {
            return NotFound(ApiResponse.Fail("Order not found"));
        }

        if (!isAdmin && order.CustomerId != userId)
        {
            return Forbid();
        }

        await _orderService.CancelOrderAsync(id, request.Reason);
        return Ok(ApiResponse.Success("Order cancelled successfully"));
    }

    [HttpGet("summary")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<OrderSummary>>> GetOrderSummary()
    {
        var userId = GetUserId();
        var isAdmin = User.IsInRole("Admin") || User.IsInRole("Manager");
        var summary = await _orderService.GetOrderSummaryAsync(isAdmin ? null : userId);
        return Ok(ApiResponse<OrderSummary>.Success(summary));
    }
}
