using ShoppingCart.Application.DTOs.Warehouses;
using ShoppingCart.Shared.Common;

namespace ShoppingCart.Application.Interfaces.Services;

public interface IWarehouseService
{
    Task<PagedResult<WarehouseDto>> GetWarehousesAsync(int pageIndex, int pageSize, string? search = null);
    Task<List<WarehouseListDto>> GetAllWarehousesAsync();
    Task<WarehouseDto?> GetMainWarehouseAsync();
    Task<WarehouseDto?> GetWarehouseByIdAsync(int id);
    Task<WarehouseDto> CreateWarehouseAsync(CreateWarehouseRequest request);
    Task<WarehouseDto> UpdateWarehouseAsync(UpdateWarehouseRequest request);
    Task<bool> DeleteWarehouseAsync(int id);
}
