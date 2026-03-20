using Mapster;
using Microsoft.EntityFrameworkCore;
using ShoppingCart.Application.DTOs.Suppliers;
using ShoppingCart.Application.Interfaces.Services;
using ShoppingCart.Domain.Entities;
using ShoppingCart.Persistence.Data;
using ShoppingCart.Shared.Common;
using ShoppingCart.Shared.Exceptions;

namespace ShoppingCart.Application.Services;

public class SupplierService : ISupplierService
{
    private readonly AppDbContext _context;

    public SupplierService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<SupplierDto>> GetSuppliersAsync(int pageIndex, int pageSize, string? search = null)
    {
        var query = _context.Suppliers.AsQueryable();

        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(s => s.Name.Contains(search) || (s.ContactPerson != null && s.ContactPerson.Contains(search)));
        }

        var totalCount = await query.CountAsync();
        var items = await query
            .OrderBy(s => s.Name)
            .Skip(pageIndex * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResult<SupplierDto>(items.Adapt<List<SupplierDto>>(), totalCount, pageIndex, pageSize);
    }

    public async Task<List<SupplierListDto>> GetAllSuppliersAsync()
    {
        var suppliers = await _context.Suppliers
            .Where(s => s.IsActive)
            .OrderBy(s => s.Name)
            .ToListAsync();

        return suppliers.Adapt<List<SupplierListDto>>();
    }

    public async Task<SupplierDto?> GetSupplierByIdAsync(int id)
    {
        var supplier = await _context.Suppliers.FindAsync(id);
        return supplier?.Adapt<SupplierDto>();
    }

    public async Task<SupplierDto> CreateSupplierAsync(CreateSupplierRequest request)
    {
        var supplier = request.Adapt<Supplier>();
        supplier.CreatedAt = DateTime.UtcNow;
        supplier.CreatedBy = "system";

        _context.Suppliers.Add(supplier);
        await _context.SaveChangesAsync();

        return (await GetSupplierByIdAsync(supplier.Id))!;
    }

    public async Task<SupplierDto> UpdateSupplierAsync(UpdateSupplierRequest request)
    {
        var supplier = await _context.Suppliers.FindAsync(request.Id);
        if (supplier == null)
        {
            throw new NotFoundException("Supplier not found");
        }

        supplier.Name = request.Name;
        supplier.ContactPerson = request.ContactPerson;
        supplier.Email = request.Email;
        supplier.Phone = request.Phone;
        supplier.Address = request.Address;
        supplier.City = request.City;
        supplier.Country = request.Country;
        supplier.Notes = request.Description;
        supplier.IsActive = request.IsActive;
        supplier.UpdatedAt = DateTime.UtcNow;
        supplier.UpdatedBy = "system";

        await _context.SaveChangesAsync();
        return (await GetSupplierByIdAsync(supplier.Id))!;
    }

    public async Task<bool> DeleteSupplierAsync(int id)
    {
        var supplier = await _context.Suppliers.FindAsync(id);
        if (supplier == null)
        {
            return false;
        }

        supplier.IsDeleted = true;
        supplier.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }
}
