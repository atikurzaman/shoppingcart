using ShoppingCart.Application.DTOs.Suppliers;
using ShoppingCart.Shared.Common;

namespace ShoppingCart.Application.Interfaces.Services;

public interface ISupplierService
{
    Task<PagedResult<SupplierDto>> GetSuppliersAsync(int pageIndex, int pageSize, string? search = null);
    Task<List<SupplierListDto>> GetAllSuppliersAsync();
    Task<SupplierDto?> GetSupplierByIdAsync(int id);
    Task<SupplierDto> CreateSupplierAsync(CreateSupplierRequest request);
    Task<SupplierDto> UpdateSupplierAsync(UpdateSupplierRequest request);
    Task<bool> DeleteSupplierAsync(int id);
}
