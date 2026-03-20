using Microsoft.EntityFrameworkCore;
using ShoppingCart.Application.DTOs.Shipping;
using ShoppingCart.Application.Interfaces.Services;
using ShoppingCart.Domain.Entities;
using ShoppingCart.Domain.Enums;
using ShoppingCart.Persistence.Data;
using ShoppingCart.Shared.Common;
using ShoppingCart.Shared.Exceptions;

namespace ShoppingCart.Application.Services;

public class ShippingService : IShippingService
{
    private readonly AppDbContext _context;

    public ShippingService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<ShippingRateDto>> CalculateShippingRatesAsync(int orderId)
    {
        var order = await _context.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == orderId);

        if (order == null)
            throw new NotFoundException("Order not found");

        var totalWeight = order.Items.Sum(i => i.Quantity * 0.5m);
        var subtotal = order.SubTotal;

        var methods = await _context.ShippingMethods
            .Where(m => m.IsActive)
            .OrderBy(m => m.DisplayOrder)
            .ToListAsync();

        var rates = methods.Select(m =>
        {
            var cost = m.BaseCost + (totalWeight * m.CostPerKg);
            
            if (m.IsFreeShipping && subtotal >= (m.FreeShippingThreshold ?? 0))
            {
                cost = 0;
            }

            return new ShippingRateDto
            {
                ShippingMethodId = m.Id,
                Name = m.Name,
                Cost = cost,
                DeliveryTime = $"{m.EstimatedDaysMin}-{m.EstimatedDaysMax} days",
                IsFreeShipping = m.IsFreeShipping && subtotal >= (m.FreeShippingThreshold ?? 0)
            };
        }).ToList();

        return rates;
    }

    public async Task<ShipmentDto?> GetShipmentByIdAsync(int id)
    {
        var shipment = await _context.Shipments
            .Include(s => s.Order)
            .Include(s => s.ShippingMethod)
            .FirstOrDefaultAsync(s => s.Id == id);

        return shipment == null ? null : MapToDto(shipment);
    }

    public async Task<ShipmentDto?> GetShipmentByOrderIdAsync(int orderId)
    {
        var shipment = await _context.Shipments
            .Include(s => s.Order)
            .Include(s => s.ShippingMethod)
            .FirstOrDefaultAsync(s => s.OrderId == orderId);

        return shipment == null ? null : MapToDto(shipment);
    }

    public async Task<ShipmentDto> CreateShipmentAsync(CreateShipmentRequest request)
    {
        var order = await _context.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == request.OrderId)
            ?? throw new NotFoundException("Order not found");

        var method = await _context.ShippingMethods.FindAsync(request.ShippingMethodId)
            ?? throw new NotFoundException("Shipping method not found");

        var totalWeight = order.Items.Sum(i => i.Quantity * 0.5m);
        var shippingCost = method.BaseCost + (totalWeight * method.CostPerKg);

        if (method.IsFreeShipping && order.SubTotal >= (method.FreeShippingThreshold ?? 0))
        {
            shippingCost = 0;
        }

        var shipment = new Shipment
        {
            OrderId = request.OrderId,
            ShippingMethodId = request.ShippingMethodId,
            TrackingNumber = request.TrackingNumber ?? string.Empty,
            CarrierName = request.CarrierName,
            Status = ShippingStatus.NotShipped,
            ShippingCost = shippingCost,
            Weight = totalWeight,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "system"
        };

        _context.Shipments.Add(shipment);

        order.ShippingAmount = shippingCost;
        order.TotalAmount = order.SubTotal + order.TaxAmount - order.DiscountAmount + shippingCost;
        order.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return (await GetShipmentByIdAsync(shipment.Id))!;
    }

    public async Task<ShipmentDto> UpdateShipmentStatusAsync(int adminId, UpdateShipmentStatusRequest request)
    {
        var shipment = await _context.Shipments
            .Include(s => s.Order)
            .FirstOrDefaultAsync(s => s.Id == request.ShipmentId)
            ?? throw new NotFoundException("Shipment not found");

        if (Enum.TryParse<ShippingStatus>(request.Status, true, out var newStatus))
        {
            shipment.Status = newStatus;
        }

        if (!string.IsNullOrEmpty(request.TrackingNumber))
            shipment.TrackingNumber = request.TrackingNumber;
        if (!string.IsNullOrEmpty(request.TrackingUrl))
            shipment.TrackingUrl = request.TrackingUrl;
        if (!string.IsNullOrEmpty(request.Notes))
            shipment.DeliveryNotes = request.Notes;

        if (shipment.Status == ShippingStatus.Shipped)
        {
            shipment.ShippedDate = DateTime.UtcNow;
            shipment.Order.ShippedDate = DateTime.UtcNow;
        }
        else if (shipment.Status == ShippingStatus.Delivered)
        {
            shipment.DeliveredDate = DateTime.UtcNow;
            shipment.Order.DeliveredDate = DateTime.UtcNow;
        }

        shipment.UpdatedAt = DateTime.UtcNow;
        shipment.UpdatedBy = adminId.ToString();

        await _context.SaveChangesAsync();

        return (await GetShipmentByIdAsync(shipment.Id))!;
    }

    public async Task<List<ShippingMethodDto>> GetActiveShippingMethodsAsync()
    {
        var methods = await _context.ShippingMethods
            .Where(m => m.IsActive)
            .OrderBy(m => m.DisplayOrder)
            .ToListAsync();

        return methods.Select(MapMethodToDto).ToList();
    }

    public async Task<PagedResult<ShippingMethodDto>> GetAllShippingMethodsAsync(int pageIndex, int pageSize)
    {
        var query = _context.ShippingMethods.AsQueryable();
        var totalCount = await query.CountAsync();
        var items = await query
            .OrderBy(m => m.DisplayOrder)
            .Skip(pageIndex * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResult<ShippingMethodDto>(
            items.Select(MapMethodToDto).ToList(),
            totalCount, pageIndex, pageSize);
    }

    public async Task<ShippingMethodDto?> GetShippingMethodByIdAsync(int id)
    {
        var method = await _context.ShippingMethods.FindAsync(id);
        return method == null ? null : MapMethodToDto(method);
    }

    public async Task<ShippingMethodDto> CreateShippingMethodAsync(CreateShippingMethodRequest request)
    {
        var method = new ShippingMethod
        {
            Name = request.Name,
            Description = request.Description,
            CarrierName = request.CarrierName,
            BaseCost = request.BaseCost,
            CostPerKg = request.CostPerKg,
            EstimatedDaysMin = request.EstimatedDaysMin,
            EstimatedDaysMax = request.EstimatedDaysMax,
            IsFreeShipping = request.IsFreeShipping,
            FreeShippingThreshold = request.FreeShippingThreshold,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "system"
        };

        _context.ShippingMethods.Add(method);
        await _context.SaveChangesAsync();

        return MapMethodToDto(method);
    }

    public async Task<ShippingMethodDto> UpdateShippingMethodAsync(UpdateShippingMethodRequest request)
    {
        var method = await _context.ShippingMethods.FindAsync(request.Id)
            ?? throw new NotFoundException("Shipping method not found");

        method.Name = request.Name;
        method.Description = request.Description;
        method.CarrierName = request.CarrierName;
        method.BaseCost = request.BaseCost;
        method.CostPerKg = request.CostPerKg;
        method.EstimatedDaysMin = request.EstimatedDaysMin;
        method.EstimatedDaysMax = request.EstimatedDaysMax;
        method.IsFreeShipping = request.IsFreeShipping;
        method.FreeShippingThreshold = request.FreeShippingThreshold;
        method.IsActive = request.IsActive;
        method.UpdatedAt = DateTime.UtcNow;
        method.UpdatedBy = "system";

        await _context.SaveChangesAsync();

        return MapMethodToDto(method);
    }

    public async Task<bool> DeleteShippingMethodAsync(int id)
    {
        var method = await _context.ShippingMethods.FindAsync(id);
        if (method == null) return false;

        method.IsActive = false;
        method.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<PagedResult<ShipmentListDto>> GetAllShipmentsAsync(int pageIndex, int pageSize, string? status = null)
    {
        var query = _context.Shipments
            .Include(s => s.Order)
            .ThenInclude(o => o.Customer)
            .ThenInclude(c => c.User)
            .AsQueryable();

        if (!string.IsNullOrEmpty(status) && Enum.TryParse<ShippingStatus>(status, true, out var shippingStatus))
            query = query.Where(s => s.Status == shippingStatus);

        var totalCount = await query.CountAsync();
        var items = await query
            .OrderByDescending(s => s.CreatedAt)
            .Skip(pageIndex * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var result = items.Select(s => new ShipmentListDto
        {
            Id = s.Id,
            OrderNumber = s.Order.OrderNumber,
            CustomerName = $"{s.Order.Customer.User.FirstName} {s.Order.Customer.User.LastName}",
            Status = s.Status.ToString(),
            TrackingNumber = s.TrackingNumber,
            CarrierName = s.CarrierName,
            ShippedDate = s.ShippedDate,
            DeliveredDate = s.DeliveredDate
        }).ToList();

        return new PagedResult<ShipmentListDto>(result, totalCount, pageIndex, pageSize);
    }

    private static ShipmentDto MapToDto(Shipment shipment)
    {
        return new ShipmentDto
        {
            Id = shipment.Id,
            OrderId = shipment.OrderId,
            OrderNumber = shipment.Order?.OrderNumber ?? "",
            Status = shipment.Status.ToString(),
            TrackingNumber = shipment.TrackingNumber,
            TrackingUrl = shipment.TrackingUrl,
            CarrierName = shipment.CarrierName,
            ShippedDate = shipment.ShippedDate,
            DeliveredDate = shipment.DeliveredDate,
            DeliveryNotes = shipment.DeliveryNotes,
            ShippingCost = shipment.ShippingCost,
            ShippingMethod = shipment.ShippingMethod != null ? MapMethodToDto(shipment.ShippingMethod) : null
        };
    }

    private static ShippingMethodDto MapMethodToDto(ShippingMethod method)
    {
        return new ShippingMethodDto
        {
            Id = method.Id,
            Name = method.Name,
            Description = method.Description,
            CarrierName = method.CarrierName,
            BaseCost = method.BaseCost,
            CostPerKg = method.CostPerKg,
            EstimatedDaysMin = method.EstimatedDaysMin,
            EstimatedDaysMax = method.EstimatedDaysMax,
            IsActive = method.IsActive,
            IsFreeShipping = method.IsFreeShipping,
            FreeShippingThreshold = method.FreeShippingThreshold
        };
    }
}
