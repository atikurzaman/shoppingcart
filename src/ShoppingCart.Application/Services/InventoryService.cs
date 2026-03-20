using Mapster;
using Microsoft.EntityFrameworkCore;
using ShoppingCart.Application.DTOs.Inventory;
using ShoppingCart.Application.Interfaces.Services;
using ShoppingCart.Domain.Entities;
using ShoppingCart.Domain.Enums;
using ShoppingCart.Persistence.Data;
using ShoppingCart.Shared.Common;

namespace ShoppingCart.Application.Services;

public class InventoryService : IInventoryService
{
    private readonly AppDbContext _context;

    public InventoryService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<StockItemDto>> GetStockItemsAsync(int pageIndex, int pageSize, string? search, int? warehouseId, bool? lowStock)
    {
        var query = _context.StockItems
            .Include(si => si.Product)
            .ThenInclude(p => p!.Images)
            .Include(si => si.Warehouse)
            .Where(si => !si.Product!.IsDeleted)
            .AsQueryable();

        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(si => si.Product!.Name.Contains(search) || (si.Product!.SKU != null && si.Product.SKU.Contains(search)));
        }

        if (warehouseId.HasValue)
        {
            query = query.Where(si => si.WarehouseId == warehouseId.Value);
        }

        if (lowStock == true)
        {
            query = query.Where(si => si.QuantityOnHand > 0 && si.QuantityOnHand <= si.Product!.MinimumStockLevel);
        }
        else if (lowStock == false)
        {
            query = query.Where(si => si.QuantityOnHand == 0);
        }

        var totalCount = await query.CountAsync();
        var items = await query
            .OrderBy(si => si.Product!.Name)
            .Skip(pageIndex * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var result = items.Select(si => new StockItemDto
        {
            Id = si.Id,
            ProductId = si.ProductId,
            ProductName = si.Product!.Name,
            ProductSKU = si.Product.SKU,
            ProductImageUrl = si.Product.Images?.FirstOrDefault(pi => pi.IsMain)?.ImageUrl ?? si.Product.Images?.FirstOrDefault()?.ImageUrl,
            WarehouseId = si.WarehouseId,
            WarehouseName = si.Warehouse!.Name,
            Quantity = si.QuantityOnHand,
            ReservedQuantity = si.ReservedQuantity,
            Price = si.Product.Price,
            LastUpdated = si.UpdatedAt ?? si.CreatedAt
        }).ToList();

        return new PagedResult<StockItemDto>(result, totalCount, pageIndex, pageSize);
    }

    public async Task<StockItemDetailDto?> GetStockItemAsync(int productId, int? warehouseId = null)
    {
        var query = _context.StockItems
            .Include(si => si.Product)
            .ThenInclude(p => p!.Images)
            .Include(si => si.Warehouse)
            .Include(si => si.StockMovements.OrderByDescending(sm => sm.CreatedAt).Take(20))
            .Where(si => si.ProductId == productId);

        if (warehouseId.HasValue)
        {
            query = query.Where(si => si.WarehouseId == warehouseId.Value);
        }

        var item = await query.FirstOrDefaultAsync();
        if (item == null) return null;

        var result = new StockItemDetailDto
        {
            Id = item.Id,
            ProductId = item.ProductId,
            ProductName = item.Product!.Name,
            ProductSKU = item.Product.SKU,
            ProductImageUrl = item.Product.Images?.FirstOrDefault(pi => pi.IsMain)?.ImageUrl ?? item.Product.Images?.FirstOrDefault()?.ImageUrl,
            WarehouseId = item.WarehouseId,
            WarehouseName = item.Warehouse!.Name,
            Quantity = item.QuantityOnHand,
            ReservedQuantity = item.ReservedQuantity,
            Price = item.Product.Price,
            LastUpdated = item.UpdatedAt ?? item.CreatedAt,
            RecentMovements = item.StockMovements.Select(sm => new StockMovementDto
            {
                Id = sm.Id,
                ProductId = sm.ProductId,
                WarehouseId = sm.ToWarehouseId ?? 0,
                MovementType = sm.MovementType.ToString(),
                Quantity = sm.Quantity,
                Reference = sm.ReferenceNumber ?? "",
                ReferenceId = sm.ReferenceId ?? 0,
                Notes = sm.Notes,
                CreatedAt = sm.CreatedAt,
                CreatedBy = sm.CreatedBy
            }).ToList()
        };

        return result;
    }

    public async Task<int> GetStockQuantityAsync(int productId, int? variantId = null, int? warehouseId = null)
    {
        var query = _context.StockItems
            .Where(si => si.ProductId == productId && (variantId == null || si.VariantId == variantId));

        if (warehouseId.HasValue)
        {
            query = query.Where(si => si.WarehouseId == warehouseId.Value);
        }

        return await query.SumAsync(si => si.QuantityOnHand - si.ReservedQuantity);
    }

    public async Task<bool> ReserveStockAsync(int productId, int? variantId, int quantity, string reference, int referenceId)
    {
        var stockItem = await _context.StockItems
            .FirstOrDefaultAsync(si => si.ProductId == productId && (variantId == null || si.VariantId == variantId));

        if (stockItem == null || (stockItem.QuantityOnHand - stockItem.ReservedQuantity) < quantity)
        {
            return false;
        }

        stockItem.ReservedQuantity += quantity;
        stockItem.UpdatedAt = DateTime.UtcNow;

        var movement = new StockMovement
        {
            ProductId = productId,
            VariantId = variantId,
            ToWarehouseId = stockItem.WarehouseId,
            MovementType = StockMovementType.Sale,
            Quantity = quantity,
            ReferenceNumber = reference,
            ReferenceId = referenceId,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "system"
        };

        _context.StockMovements.Add(movement);
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> ReleaseStockAsync(int productId, int? variantId, int quantity, string reference, int referenceId)
    {
        var stockItem = await _context.StockItems
            .FirstOrDefaultAsync(si => si.ProductId == productId && (variantId == null || si.VariantId == variantId));

        if (stockItem == null || stockItem.ReservedQuantity < quantity)
        {
            return false;
        }

        stockItem.ReservedQuantity -= quantity;
        stockItem.UpdatedAt = DateTime.UtcNow;

        var movement = new StockMovement
        {
            ProductId = productId,
            VariantId = variantId,
            ToWarehouseId = stockItem.WarehouseId,
            MovementType = StockMovementType.Return,
            Quantity = quantity,
            ReferenceNumber = reference,
            ReferenceId = referenceId,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "system"
        };

        _context.StockMovements.Add(movement);
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> AdjustStockAsync(int productId, int? variantId, int warehouseId, int quantity, string reason, int userId)
    {
        var stockItem = await _context.StockItems
            .FirstOrDefaultAsync(si => si.ProductId == productId && (variantId == null || si.VariantId == variantId) && si.WarehouseId == warehouseId);

        if (stockItem == null)
        {
            return false;
        }

        var previousQuantity = stockItem.QuantityOnHand;
        stockItem.QuantityOnHand = quantity;
        stockItem.UpdatedAt = DateTime.UtcNow;

        var movement = new StockMovement
        {
            ProductId = productId,
            VariantId = variantId,
            ToWarehouseId = warehouseId,
            MovementType = StockMovementType.Adjustment,
            Quantity = Math.Abs(quantity - previousQuantity),
            ReferenceNumber = "Manual Adjustment",
            ReferenceId = 0,
            Notes = reason,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = userId.ToString()
        };

        _context.StockMovements.Add(movement);
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<StockAdjustmentDto> CreateStockAdjustmentAsync(CreateStockAdjustmentRequest request)
    {
        var stockItem = await _context.StockItems
            .Include(si => si.Product)
            .Include(si => si.Warehouse)
            .FirstOrDefaultAsync(si => si.ProductId == request.ProductId && 
                                       (request.VariantId == null || si.VariantId == request.VariantId) && 
                                       si.WarehouseId == request.WarehouseId);

        var previousQuantity = stockItem?.QuantityOnHand ?? 0;
        var newQuantity = request.Quantity;

        if (stockItem != null)
        {
            stockItem.QuantityOnHand = newQuantity;
            stockItem.UpdatedAt = DateTime.UtcNow;
        }
        else
        {
            stockItem = new StockItem
            {
                ProductId = request.ProductId,
                VariantId = request.VariantId,
                WarehouseId = request.WarehouseId,
                QuantityOnHand = newQuantity,
                ReservedQuantity = 0,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "system"
            };
            _context.StockItems.Add(stockItem);
        }

        var movement = new StockMovement
        {
            ProductId = request.ProductId,
            VariantId = request.VariantId,
            ToWarehouseId = request.WarehouseId,
            MovementType = StockMovementType.Adjustment,
            Quantity = Math.Abs(newQuantity - previousQuantity),
            ReferenceNumber = "Manual Adjustment",
            ReferenceId = 0,
            Notes = request.Notes,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "system"
        };

        _context.StockMovements.Add(movement);
        await _context.SaveChangesAsync();

        var product = await _context.Products.FindAsync(request.ProductId);
        var warehouse = await _context.Warehouses.FindAsync(request.WarehouseId);

        return new StockAdjustmentDto
        {
            Id = movement.Id,
            ProductId = request.ProductId,
            ProductName = product?.Name ?? "",
            VariantId = request.VariantId,
            WarehouseId = request.WarehouseId,
            WarehouseName = warehouse?.Name ?? "",
            PreviousQuantity = previousQuantity,
            AdjustedQuantity = Math.Abs(newQuantity - previousQuantity),
            NewQuantity = newQuantity,
            Reason = request.Reason,
            Notes = request.Notes,
            CreatedAt = movement.CreatedAt,
            CreatedBy = movement.CreatedBy
        };
    }

    public async Task<DashboardSummary> GetDashboardSummaryAsync()
    {
        var today = DateTime.UtcNow.Date;
        var startOfMonth = new DateTime(today.Year, today.Month, 1);

        var totalProducts = await _context.Products.CountAsync(p => p.IsActive && !p.IsDeleted);
        var lowStockProducts = await _context.StockItems.CountAsync(si => si.Product!.IsActive && !si.Product.IsDeleted && si.QuantityOnHand > 0 && si.QuantityOnHand <= si.Product.MinimumStockLevel);
        var outOfStockProducts = await _context.Products.CountAsync(p => p.IsActive && !p.IsDeleted && p.StockItems.All(si => si.QuantityOnHand == 0));
        var totalOrders = await _context.Orders.CountAsync(o => o.OrderDate >= startOfMonth);
        var pendingOrders = await _context.Orders.CountAsync(o => o.Status == Domain.Enums.OrderStatus.Pending);
        var todayRevenue = await _context.Orders.Where(o => o.OrderDate >= today && o.Status != Domain.Enums.OrderStatus.Cancelled).SumAsync(o => o.TotalAmount);
        var monthlyRevenue = await _context.Orders.Where(o => o.OrderDate >= startOfMonth && o.Status != Domain.Enums.OrderStatus.Cancelled).SumAsync(o => o.TotalAmount);
        var newCustomers = await _context.Customers.CountAsync(c => c.CreatedAt >= startOfMonth);

        var topProducts = await _context.OrderItems
            .Where(oi => oi.Order!.OrderDate >= startOfMonth && oi.Order.Status != Domain.Enums.OrderStatus.Cancelled)
            .GroupBy(oi => new { oi.ProductId, oi.Product!.Name })
            .Select(g => new TopProduct
            {
                ProductId = g.Key.ProductId,
                ProductName = g.Key.Name,
                QuantitySold = g.Sum(oi => oi.Quantity),
                Revenue = g.Sum(oi => oi.UnitPrice * oi.Quantity)
            })
            .OrderByDescending(tp => tp.Revenue)
            .Take(5)
            .ToListAsync();

        var recentOrders = await _context.Orders
            .Include(o => o.Customer).ThenInclude(c => c!.User)
            .OrderByDescending(o => o.OrderDate)
            .Take(5)
            .Select(o => new RecentOrder
            {
                OrderId = o.Id,
                OrderNumber = o.OrderNumber,
                CustomerName = o.Customer!.User != null ? $"{o.Customer.User.FirstName} {o.Customer.User.LastName}" : "Unknown",
                TotalAmount = o.TotalAmount,
                Status = o.Status.ToString(),
                OrderDate = o.OrderDate
            })
            .ToListAsync();

        return new DashboardSummary
        {
            TotalProducts = totalProducts,
            LowStockProducts = lowStockProducts,
            OutOfStockProducts = outOfStockProducts,
            TotalOrders = totalOrders,
            PendingOrders = pendingOrders,
            TodayRevenue = todayRevenue,
            MonthlyRevenue = monthlyRevenue,
            NewCustomers = newCustomers,
            TopProducts = topProducts,
            RecentOrders = recentOrders
        };
    }

    public async Task<List<LowStockAlertDto>> GetLowStockAlertsAsync()
    {
        var alerts = await _context.StockItems
            .Include(si => si.Product)
            .Include(si => si.Warehouse)
            .Where(si => !si.Product!.IsDeleted && si.Product.IsActive && si.QuantityOnHand <= si.Product.MinimumStockLevel)
            .OrderBy(si => si.QuantityOnHand)
            .ToListAsync();

        return alerts.Select(si => new LowStockAlertDto
        {
            ProductId = si.ProductId,
            ProductName = si.Product!.Name,
            ProductSKU = si.Product.SKU,
            ProductImageUrl = si.Product.Images?.FirstOrDefault(pi => pi.IsMain)?.ImageUrl,
            CurrentStock = si.QuantityOnHand,
            MinimumStockLevel = si.Product.MinimumStockLevel,
            ReorderLevel = si.Product.ReorderLevel,
            WarehouseId = si.WarehouseId,
            WarehouseName = si.Warehouse!.Name,
            NeedsReorder = si.QuantityOnHand <= si.Product.ReorderLevel
        }).ToList();
    }
}
