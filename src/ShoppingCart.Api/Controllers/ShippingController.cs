using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShoppingCart.Application.DTOs.Shipping;
using ShoppingCart.Application.Interfaces.Services;
using ShoppingCart.Shared.Common;

namespace ShoppingCart.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ShippingController : ControllerBase
{
    private readonly IShippingService _shippingService;

    public ShippingController(IShippingService shippingService)
    {
        _shippingService = shippingService;
    }

    [HttpGet("rates/{orderId}")]
    public async Task<ActionResult<ApiResponse<List<ShippingRateDto>>>> GetShippingRates(int orderId)
    {
        var rates = await _shippingService.CalculateShippingRatesAsync(orderId);
        return Ok(ApiResponse<List<ShippingRateDto>>.Success(rates));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<ShipmentDto>>> GetShipment(int id)
    {
        var shipment = await _shippingService.GetShipmentByIdAsync(id);
        if (shipment == null)
            return NotFound(ApiResponse<ShipmentDto>.NotFound("Shipment not found"));

        return Ok(ApiResponse<ShipmentDto>.Success(shipment));
    }

    [HttpGet("order/{orderId}")]
    public async Task<ActionResult<ApiResponse<ShipmentDto>>> GetShipmentByOrder(int orderId)
    {
        var shipment = await _shippingService.GetShipmentByOrderIdAsync(orderId);
        if (shipment == null)
            return NotFound(ApiResponse<ShipmentDto>.NotFound("Shipment not found"));

        return Ok(ApiResponse<ShipmentDto>.Success(shipment));
    }

    // Admin endpoints
    [HttpGet("admin/all")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<PagedResult<ShipmentListDto>>>> GetAllShipments(
        [FromQuery] int pageIndex = 0,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? status = null)
    {
        var shipments = await _shippingService.GetAllShipmentsAsync(pageIndex, pageSize, status);
        return Ok(ApiResponse<PagedResult<ShipmentListDto>>.Success(shipments));
    }

    [HttpPost("admin/create")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<ShipmentDto>>> CreateShipment([FromBody] CreateShipmentRequest request)
    {
        var shipment = await _shippingService.CreateShipmentAsync(request);
        return CreatedAtAction(nameof(GetShipment), new { id = shipment.Id },
            ApiResponse<ShipmentDto>.Created(shipment, "Shipment created successfully"));
    }

    [HttpPut("admin/status")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<ShipmentDto>>> UpdateShipmentStatus([FromBody] UpdateShipmentStatusRequest request)
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
        var adminId = int.TryParse(userIdClaim?.Value, out var id) ? id : 0;

        var shipment = await _shippingService.UpdateShipmentStatusAsync(adminId, request);
        return Ok(ApiResponse<ShipmentDto>.Success(shipment, "Shipment status updated"));
    }

    [HttpGet("admin/methods")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<PagedResult<ShippingMethodDto>>>> GetAllMethods(
        [FromQuery] int pageIndex = 0,
        [FromQuery] int pageSize = 20)
    {
        var methods = await _shippingService.GetAllShippingMethodsAsync(pageIndex, pageSize);
        return Ok(ApiResponse<PagedResult<ShippingMethodDto>>.Success(methods));
    }

    [HttpGet("methods")]
    public async Task<ActionResult<ApiResponse<List<ShippingMethodDto>>>> GetActiveMethods()
    {
        var methods = await _shippingService.GetActiveShippingMethodsAsync();
        return Ok(ApiResponse<List<ShippingMethodDto>>.Success(methods));
    }

    [HttpPost("admin/methods")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<ShippingMethodDto>>> CreateMethod([FromBody] CreateShippingMethodRequest request)
    {
        var method = await _shippingService.CreateShippingMethodAsync(request);
        return CreatedAtAction(nameof(GetShipment), new { id = method.Id },
            ApiResponse<ShippingMethodDto>.Created(method, "Shipping method created"));
    }

    [HttpPut("admin/methods/{id}")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<ShippingMethodDto>>> UpdateMethod(int id, [FromBody] UpdateShippingMethodRequest request)
    {
        request.Id = id;
        var method = await _shippingService.UpdateShippingMethodAsync(request);
        return Ok(ApiResponse<ShippingMethodDto>.Success(method, "Shipping method updated"));
    }

    [HttpDelete("admin/methods/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse>> DeleteMethod(int id)
    {
        var result = await _shippingService.DeleteShippingMethodAsync(id);
        if (!result)
            return NotFound(ApiResponse.Fail("Shipping method not found"));

        return Ok(ApiResponse.Success("Shipping method deleted"));
    }
}
