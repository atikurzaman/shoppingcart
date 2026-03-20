using Mapster;
using Microsoft.EntityFrameworkCore;
using ShoppingCart.Application.DTOs.Warehouses;
using ShoppingCart.Application.Interfaces.Services;
using ShoppingCart.Domain.Entities;
using ShoppingCart.Persistence.Data;
using ShoppingCart.Shared.Common;
using ShoppingCart.Shared.Exceptions;

namespace ShoppingCart.Application.Services;

public class WarehouseService : IWarehouseService
{
    private readonly AppDbContext _context;

    public WarehouseService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<WarehouseDto>> GetWarehousesAsync(int pageIndex, int pageSize, string? search = null)
    {
        var query = _context.Warehouses.AsQueryable();

        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(w => w.Name.Contains(search) || w.Code.Contains(search));
        }

        var totalCount = await query.CountAsync();
        var items = await query
            .OrderBy(w => w.Name)
            .Skip(pageIndex * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResult<WarehouseDto>(items.Adapt<List<WarehouseDto>>(), totalCount, pageIndex, pageSize);
    }

    public async Task<List<WarehouseListDto>> GetAllWarehousesAsync()
    {
        var warehouses = await _context.Warehouses
            .Where(w => w.IsActive)
            .OrderBy(w => w.Name)
            .ToListAsync();

        return warehouses.Adapt<List<WarehouseListDto>>();
    }

    public async Task<WarehouseDto?> GetMainWarehouseAsync()
    {
        var warehouse = await _context.Warehouses.FirstOrDefaultAsync(w => w.IsDefault && w.IsActive);
        return warehouse?.Adapt<WarehouseDto>();
    }

    public async Task<WarehouseDto?> GetWarehouseByIdAsync(int id)
    {
        var warehouse = await _context.Warehouses
            .Include(w => w.StockItems)
            .FirstOrDefaultAsync(w => w.Id == id);
        
        return warehouse?.Adapt<WarehouseDto>();
    }

    public async Task<WarehouseDto> CreateWarehouseAsync(CreateWarehouseRequest request)
    {
        var warehouse = request.Adapt<Warehouse>();
        warehouse.CreatedAt = DateTime.UtcNow;
        warehouse.CreatedBy = "system";

        _context.Warehouses.Add(warehouse);
        await _context.SaveChangesAsync();

        return (await GetWarehouseByIdAsync(warehouse.Id))!;
    }

    public async Task<WarehouseDto> UpdateWarehouseAsync(UpdateWarehouseRequest request)
    {
        var warehouse = await _context.Warehouses.FindAsync(request.Id);
        if (warehouse == null)
        {
            throw new NotFoundException("Warehouse not found");
        }

        warehouse.Name = request.Name;
        warehouse.Code = request.Code;
        warehouse.Description = request.Description;
        warehouse.Address = request.Address;
        warehouse.City = request.City;
        warehouse.Country = request.Country;
        warehouse.Phone = request.Phone;
        warehouse.Email = request.Email;
        warehouse.IsDefault = request.IsMainWarehouse;
        warehouse.IsActive = request.IsActive;
        warehouse.UpdatedAt = DateTime.UtcNow;
        warehouse.UpdatedBy = "system";

        await _context.SaveChangesAsync();
        return (await GetWarehouseByIdAsync(warehouse.Id))!;
    }

    public async Task<bool> DeleteWarehouseAsync(int id)
    {
        var warehouse = await _context.Warehouses.FindAsync(id);
        if (warehouse == null)
        {
            return false;
        }

        warehouse.IsActive = false;
        warehouse.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }
}
