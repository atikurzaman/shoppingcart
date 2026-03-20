using ShoppingCart.Application.DTOs.Inventory;
using ShoppingCart.Shared.Common;

namespace ShoppingCart.Application.Interfaces.Services;

public interface IInventoryService
{
    Task<PagedResult<StockItemDto>> GetStockItemsAsync(int pageIndex, int pageSize, string? search = null, int? warehouseId = null, bool? lowStock = null);
    Task<StockItemDetailDto?> GetStockItemAsync(int productId, int? warehouseId = null);
    Task<int> GetStockQuantityAsync(int productId, int? variantId = null, int? warehouseId = null);
    Task<bool> ReserveStockAsync(int productId, int? variantId, int quantity, string reference, int referenceId);
    Task<bool> ReleaseStockAsync(int productId, int? variantId, int quantity, string reference, int referenceId);
    Task<bool> AdjustStockAsync(int productId, int? variantId, int warehouseId, int quantity, string reason, int userId);
    Task<StockAdjustmentDto> CreateStockAdjustmentAsync(CreateStockAdjustmentRequest request);
    Task<DashboardSummary> GetDashboardSummaryAsync();
    Task<List<LowStockAlertDto>> GetLowStockAlertsAsync();
}
