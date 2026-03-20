using ShoppingCart.Application.DTOs.Shipping;
using ShoppingCart.Shared.Common;

namespace ShoppingCart.Application.Interfaces.Services;

public interface IShippingService
{
    Task<List<ShippingRateDto>> CalculateShippingRatesAsync(int orderId);
    Task<ShipmentDto?> GetShipmentByIdAsync(int id);
    Task<ShipmentDto?> GetShipmentByOrderIdAsync(int orderId);
    Task<ShipmentDto> CreateShipmentAsync(CreateShipmentRequest request);
    Task<ShipmentDto> UpdateShipmentStatusAsync(int adminId, UpdateShipmentStatusRequest request);
    
    // Shipping Methods (Admin)
    Task<List<ShippingMethodDto>> GetActiveShippingMethodsAsync();
    Task<PagedResult<ShippingMethodDto>> GetAllShippingMethodsAsync(int pageIndex, int pageSize);
    Task<ShippingMethodDto?> GetShippingMethodByIdAsync(int id);
    Task<ShippingMethodDto> CreateShippingMethodAsync(CreateShippingMethodRequest request);
    Task<ShippingMethodDto> UpdateShippingMethodAsync(UpdateShippingMethodRequest request);
    Task<bool> DeleteShippingMethodAsync(int id);
    
    // Admin Shipments
    Task<PagedResult<ShipmentListDto>> GetAllShipmentsAsync(int pageIndex, int pageSize, string? status = null);
}
