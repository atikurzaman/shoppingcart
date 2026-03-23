using ShoppingCart.Application.DTOs.Inventory;
using ShoppingCart.Shared.Common;

namespace ShoppingCart.Application.Interfaces.Services;

public interface IProcurementService
{
    Task<PagedResult<PurchaseOrderDto>> GetPurchaseOrdersAsync(int pageIndex, int pageSize, string? search = null, int? supplierId = null, string? status = null);
    Task<PurchaseOrderDto?> GetPurchaseOrderAsync(int id);
    Task<PurchaseOrderDto> CreatePurchaseOrderAsync(CreatePurchaseOrderRequest request, int userId);
    Task<PurchaseOrderDto> UpdatePurchaseOrderStatusAsync(int id, string status, int userId);
    Task<GoodsReceiptDto> CreateGoodsReceiptAsync(CreateGoodsReceiptRequest request, int userId);
    Task<PagedResult<GoodsReceiptDto>> GetGoodsReceiptsAsync(int pageIndex, int pageSize, string? search = null, int? warehouseId = null);
}
