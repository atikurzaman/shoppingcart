using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShoppingCart.Application.DTOs.Inventory;
using ShoppingCart.Application.Interfaces.Services;
using ShoppingCart.Shared.Common;

namespace ShoppingCart.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,Manager,Staff")]
public class ProcurementController : ControllerBase
{
    private readonly IProcurementService _procurementService;

    public ProcurementController(IProcurementService procurementService)
    {
        _procurementService = procurementService;
    }

    [HttpGet("purchase-orders")]
    public async Task<ActionResult<ApiResponse<PagedResult<PurchaseOrderDto>>>> GetPurchaseOrders(
        [FromQuery] int pageIndex = 0,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] int? supplierId = null,
        [FromQuery] string? status = null)
    {
        var result = await _procurementService.GetPurchaseOrdersAsync(pageIndex, pageSize, search, supplierId, status);
        return Ok(ApiResponse<PagedResult<PurchaseOrderDto>>.Success(result));
    }

    [HttpGet("purchase-orders/{id}")]
    public async Task<ActionResult<ApiResponse<PurchaseOrderDto>>> GetPurchaseOrder(int id)
    {
        var result = await _procurementService.GetPurchaseOrderAsync(id);
        if (result == null) return NotFound(ApiResponse<PurchaseOrderDto>.NotFound("Purchase order not found"));
        return Ok(ApiResponse<PurchaseOrderDto>.Success(result));
    }

    [HttpPost("purchase-orders")]
    public async Task<ActionResult<ApiResponse<PurchaseOrderDto>>> CreatePurchaseOrder([FromBody] CreatePurchaseOrderRequest request)
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
        int userId = 0;
        if (userIdClaim != null && int.TryParse(userIdClaim.Value, out var parsedId))
        {
            userId = parsedId;
        }

        var result = await _procurementService.CreatePurchaseOrderAsync(request, userId);
        return Ok(ApiResponse<PurchaseOrderDto>.Success(result, "Purchase order created successfully"));
    }

    [HttpPut("purchase-orders/{id}/status")]
    public async Task<ActionResult<ApiResponse<PurchaseOrderDto>>> UpdateStatus(int id, [FromBody] string status)
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
        int userId = 0;
        if (userIdClaim != null && int.TryParse(userIdClaim.Value, out var parsedId))
        {
            userId = parsedId;
        }

        var result = await _procurementService.UpdatePurchaseOrderStatusAsync(id, status, userId);
        return Ok(ApiResponse<PurchaseOrderDto>.Success(result, "Purchase order status updated successfully"));
    }

    [HttpPost("goods-receipts")]
    public async Task<ActionResult<ApiResponse<GoodsReceiptDto>>> CreateGoodsReceipt([FromBody] CreateGoodsReceiptRequest request)
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
        int userId = 0;
        if (userIdClaim != null && int.TryParse(userIdClaim.Value, out var parsedId))
        {
            userId = parsedId;
        }

        var result = await _procurementService.CreateGoodsReceiptAsync(request, userId);
        return Ok(ApiResponse<GoodsReceiptDto>.Success(result, "Goods receipt created successfully and stock updated"));
    }

    [HttpGet("goods-receipts")]
    public async Task<ActionResult<ApiResponse<PagedResult<GoodsReceiptDto>>>> GetGoodsReceipts(
        [FromQuery] int pageIndex = 0,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] int? warehouseId = null)
    {
        var result = await _procurementService.GetGoodsReceiptsAsync(pageIndex, pageSize, search, warehouseId);
        return Ok(ApiResponse<PagedResult<GoodsReceiptDto>>.Success(result));
    }
}
