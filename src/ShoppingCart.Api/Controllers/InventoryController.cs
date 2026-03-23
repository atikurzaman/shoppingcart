using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShoppingCart.Application.DTOs.Inventory;
using ShoppingCart.Application.Interfaces.Services;
using ShoppingCart.Shared.Common;

namespace ShoppingCart.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,Manager,Staff")]
public class InventoryController : ControllerBase
{
    private readonly IInventoryService _inventoryService;

    public InventoryController(IInventoryService inventoryService)
    {
        _inventoryService = inventoryService;
    }

    [HttpGet("stock-items")]
    public async Task<ActionResult<ApiResponse<PagedResult<StockItemDto>>>> GetStockItems(
        [FromQuery] int pageIndex = 0,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] int? warehouseId = null,
        [FromQuery] bool? lowStock = null)
    {
        var items = await _inventoryService.GetStockItemsAsync(pageIndex, pageSize, search, warehouseId, lowStock);
        return Ok(ApiResponse<PagedResult<StockItemDto>>.Success(items));
    }

    [HttpGet("stock-items/{productId}")]
    public async Task<ActionResult<ApiResponse<StockItemDetailDto>>> GetStockItem(
        int productId,
        [FromQuery] int? warehouseId = null)
    {
        var item = await _inventoryService.GetStockItemAsync(productId, warehouseId);
        if (item == null)
        {
            return NotFound(ApiResponse<StockItemDetailDto>.NotFound("Stock item not found"));
        }

        return Ok(ApiResponse<StockItemDetailDto>.Success(item));
    }

    [HttpGet("quantity/{productId}")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<int>>> GetStockQuantity(
        int productId,
        [FromQuery] int? variantId = null,
        [FromQuery] int? warehouseId = null)
    {
        var quantity = await _inventoryService.GetStockQuantityAsync(productId, variantId, warehouseId);
        return Ok(ApiResponse<int>.Success(quantity));
    }

    [HttpPost("adjust")]
    public async Task<ActionResult<ApiResponse<StockAdjustmentDto>>> AdjustStock([FromBody] StockAdjustmentRequest request)
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
        int userId = 0;
        if (userIdClaim != null && int.TryParse(userIdClaim.Value, out var parsedId))
        {
            userId = parsedId;
        }

        var result = await _inventoryService.CreateStockAdjustmentAsync(new CreateStockAdjustmentRequest
        {
            ProductId = request.ProductId,
            VariantId = request.VariantId,
            WarehouseId = request.WarehouseId,
            Quantity = request.Quantity,
            Reason = request.Reason,
            Notes = request.Notes
        });

        return Ok(ApiResponse<StockAdjustmentDto>.Success(result, "Stock adjusted successfully"));
    }

    [HttpGet("low-stock-alerts")]
    public async Task<ActionResult<ApiResponse<List<LowStockAlertDto>>>> GetLowStockAlerts()
    {
        var alerts = await _inventoryService.GetLowStockAlertsAsync();
        return Ok(ApiResponse<List<LowStockAlertDto>>.Success(alerts));
    }

    [HttpGet("dashboard")]
    public async Task<ActionResult<ApiResponse<DashboardSummary>>> GetDashboardSummary()
    {
        var summary = await _inventoryService.GetDashboardSummaryAsync();
        return Ok(ApiResponse<DashboardSummary>.Success(summary));
    }
}
