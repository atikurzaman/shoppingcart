using Microsoft.EntityFrameworkCore;
using ShoppingCart.Application.DTOs.Inventory;
using ShoppingCart.Application.Interfaces.Services;
using ShoppingCart.Domain.Entities;
using ShoppingCart.Persistence.Data;
using ShoppingCart.Shared.Common;
using ShoppingCart.Shared.Exceptions;
using Mapster;

namespace ShoppingCart.Application.Services;

public class ProcurementService : IProcurementService
{
    private readonly AppDbContext _context;
    private readonly IInventoryService _inventoryService;

    public ProcurementService(AppDbContext context, IInventoryService inventoryService)
    {
        _context = context;
        _inventoryService = inventoryService;
    }

    public async Task<PagedResult<PurchaseOrderDto>> GetPurchaseOrdersAsync(int pageIndex, int pageSize, string? search = null, int? supplierId = null, string? status = null)
    {
        var query = _context.PurchaseOrders.Include(po => po.Supplier).AsQueryable();

        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(po => po.OrderNumber.Contains(search) || po.Supplier.Name.Contains(search));
        }

        if (supplierId.HasValue)
        {
            query = query.Where(po => po.SupplierId == supplierId.Value);
        }

        if (!string.IsNullOrEmpty(status))
        {
            query = query.Where(po => po.Status == status);
        }

        var totalCount = await query.CountAsync();
        var items = await query.OrderByDescending(po => po.OrderDate)
            .Skip(pageIndex * pageSize)
            .Take(pageSize)
            .ProjectToType<PurchaseOrderDto>()
            .ToListAsync();

        return new PagedResult<PurchaseOrderDto>(items, totalCount, pageIndex, pageSize);
    }

    public async Task<PurchaseOrderDto?> GetPurchaseOrderAsync(int id)
    {
        return await _context.PurchaseOrders
            .Include(po => po.Supplier)
            .Include(po => po.Items)
            .ProjectToType<PurchaseOrderDto>()
            .FirstOrDefaultAsync(po => po.Id == id);
    }

    public async Task<PurchaseOrderDto> CreatePurchaseOrderAsync(CreatePurchaseOrderRequest request, int userId)
    {
        var po = new PurchaseOrder
        {
            OrderNumber = $"PO-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..4].ToUpper()}",
            SupplierId = request.SupplierId,
            OrderDate = DateTime.UtcNow,
            ExpectedDeliveryDate = request.ExpectedDeliveryDate,
            Status = "Pending",
            Notes = request.Notes,
            CreatedBy = userId.ToString()
        };

        foreach (var item in request.Items)
        {
            var poItem = new PurchaseOrderItem
            {
                ProductId = item.ProductId,
                VariantId = item.VariantId,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice,
                TotalPrice = item.Quantity * item.UnitPrice,
                CreatedBy = userId.ToString()
            };
            po.Items.Add(poItem);
        }

        po.SubTotal = po.Items.Sum(i => i.TotalPrice);
        po.TotalAmount = po.SubTotal; // simplified

        _context.PurchaseOrders.Add(po);
        await _context.SaveChangesAsync();

        return po.Adapt<PurchaseOrderDto>();
    }

    public async Task<PurchaseOrderDto> UpdatePurchaseOrderStatusAsync(int id, string status, int userId)
    {
        var po = await _context.PurchaseOrders.FirstOrDefaultAsync(p => p.Id == id);
        if (po == null) throw new NotFoundException("Purchase order not found");

        po.Status = status;
        po.UpdatedBy = userId.ToString();
        po.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return po.Adapt<PurchaseOrderDto>();
    }

    public async Task<GoodsReceiptDto> CreateGoodsReceiptAsync(CreateGoodsReceiptRequest request, int userId)
    {
        var po = await _context.PurchaseOrders.Include(p => p.Items).FirstOrDefaultAsync(p => p.Id == request.PurchaseOrderId);
        if (po == null) throw new NotFoundException("Purchase order not found");

        var gr = new GoodsReceipt
        {
            PurchaseOrderId = request.PurchaseOrderId,
            ReceiptNumber = $"GR-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..4].ToUpper()}",
            ReceiptDate = DateTime.UtcNow,
            WarehouseId = request.WarehouseId,
            Notes = request.Notes,
            ReceivedByUserId = userId,
            CreatedBy = userId.ToString()
        };

        foreach (var item in request.Items)
        {
            var grItem = new GoodsReceiptItem
            {
                PurchaseOrderItemId = item.PurchaseOrderItemId,
                ProductId = item.ProductId,
                VariantId = item.VariantId,
                Quantity = item.Quantity,
                BatchNumber = item.BatchNumber,
                ExpiryDate = item.ExpiryDate,
                CreatedBy = userId.ToString()
            };
            gr.Items.Add(grItem);

            // Update PO item received quantity
            var poItem = po.Items.FirstOrDefault(i => i.Id == item.PurchaseOrderItemId);
            if (poItem != null)
            {
                poItem.ReceivedQuantity += item.Quantity;
            }

            // Sync with inventory
            await _inventoryService.AdjustStockAsync(item.ProductId, item.VariantId, request.WarehouseId, item.Quantity, $"Received PO {po.OrderNumber}", userId);
        }

        // Check if PO is fully received
        if (po.Items.All(i => i.ReceivedQuantity >= i.Quantity))
        {
            po.Status = "Completed";
            po.ActualDeliveryDate = DateTime.UtcNow;
        }
        else
        {
            po.Status = "PartiallyReceived";
        }

        _context.GoodsReceipts.Add(gr);
        await _context.SaveChangesAsync();

        return gr.Adapt<GoodsReceiptDto>();
    }

    public async Task<PagedResult<GoodsReceiptDto>> GetGoodsReceiptsAsync(int pageIndex, int pageSize, string? search = null, int? warehouseId = null)
    {
        var query = _context.GoodsReceipts
            .Include(gr => gr.Warehouse)
            .Include(gr => gr.PurchaseOrder)
            .AsQueryable();

        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(gr => gr.ReceiptNumber.Contains(search) || gr.PurchaseOrder.OrderNumber.Contains(search));
        }

        if (warehouseId.HasValue)
        {
            query = query.Where(gr => gr.WarehouseId == warehouseId.Value);
        }

        var totalCount = await query.CountAsync();
        var items = await query.OrderByDescending(gr => gr.ReceiptDate)
            .Skip(pageIndex * pageSize)
            .Take(pageSize)
            .ProjectToType<GoodsReceiptDto>()
            .ToListAsync();

        return new PagedResult<GoodsReceiptDto>(items, totalCount, pageIndex, pageSize);
    }
}
