using Microsoft.EntityFrameworkCore;
using ShoppingCart.Application.DTOs.Reports;
using ShoppingCart.Application.Interfaces.Services;
using ShoppingCart.Domain.Enums;
using ShoppingCart.Persistence.Data;

namespace ShoppingCart.Application.Services;

public class ReportService : IReportService
{
    private readonly AppDbContext _context;

    public ReportService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<SalesReportDto> GetSalesReportAsync(DateTime startDate, DateTime endDate)
    {
        var orders = await _context.Orders
            .Include(o => o.Items)
            .ThenInclude(i => i.Product)
            .ThenInclude(p => p!.Category)
            .Include(o => o.Items)
            .ThenInclude(i => i.Product)
            .ThenInclude(p => p!.Images)
            .Where(o => o.OrderDate >= startDate && o.OrderDate <= endDate && o.Status != OrderStatus.Cancelled)
            .ToListAsync();

        var totalSales = orders.Sum(o => o.SubTotal);
        var totalRevenue = orders.Sum(o => o.TotalAmount);
        var totalDiscounts = orders.Sum(o => o.DiscountAmount);
        var totalShipping = orders.Sum(o => o.ShippingAmount);

        var dailySales = orders
            .GroupBy(o => o.OrderDate.Date)
            .Select(g => new DailySalesDto
            {
                Date = g.Key,
                Orders = g.Count(),
                Revenue = g.Sum(o => o.TotalAmount),
                ItemsSold = g.SelectMany(o => o.Items).Sum(i => i.Quantity)
            })
            .OrderBy(d => d.Date)
            .ToList();

        var topProducts = orders
            .SelectMany(o => o.Items)
            .GroupBy(i => new { i.ProductId, i.ProductName, i.Product!.Images })
            .Select(g => new TopProductDto
            {
                ProductId = g.Key.ProductId,
                ProductName = g.Key.ProductName,
                ProductImageUrl = g.Key.Images?.FirstOrDefault(img => img.IsMain)?.ImageUrl ?? g.Key.Images?.FirstOrDefault()?.ImageUrl,
                UnitsSold = g.Sum(i => i.Quantity),
                Revenue = g.Sum(i => i.UnitPrice * i.Quantity)
            })
            .OrderByDescending(p => p.Revenue)
            .Take(10)
            .ToList();

        var salesByCategory = orders
            .SelectMany(o => o.Items)
            .Where(i => i.Product?.Category != null)
            .GroupBy(i => new { i.Product!.CategoryId, i.Product!.Category!.Name })
            .Select(g => new CategorySalesDto
            {
                CategoryId = g.Key.CategoryId,
                CategoryName = g.Key.Name,
                ProductsSold = g.Sum(i => i.Quantity),
                Revenue = g.Sum(i => i.UnitPrice * i.Quantity),
                Percentage = totalSales > 0 ? (g.Sum(i => i.UnitPrice * i.Quantity) / totalSales) * 100 : 0
            })
            .OrderByDescending(c => c.Revenue)
            .ToList();

        return new SalesReportDto
        {
            TotalSales = totalSales,
            TotalRevenue = totalRevenue,
            TotalOrders = orders.Count,
            AverageOrderValue = orders.Count > 0 ? (int)(totalRevenue / orders.Count) : 0,
            TotalDiscounts = totalDiscounts,
            TotalShipping = totalShipping,
            DailySales = dailySales,
            TopProducts = topProducts,
            SalesByCategory = salesByCategory
        };
    }

    public async Task<CustomerReportDto> GetCustomerReportAsync(DateTime startDate, DateTime endDate)
    {
        var allCustomers = await _context.Customers
            .Include(c => c.User)
            .Include(c => c.Orders)
            .ToListAsync();

        var newCustomers = allCustomers.Count(c => c.CreatedAt >= startDate && c.CreatedAt <= endDate);
        var customersWithOrders = allCustomers.Count(c => c.Orders.Any(o => o.Status != OrderStatus.Cancelled));
        var returningCustomers = allCustomers.Count(c => c.Orders.Count(o => o.Status != OrderStatus.Cancelled) > 1);

        var totalSpent = allCustomers
            .SelectMany(c => c.Orders.Where(o => o.Status != OrderStatus.Cancelled))
            .Sum(o => o.TotalAmount);

        var avgLifetimeValue = customersWithOrders > 0 ? totalSpent / customersWithOrders : 0;

        var topCustomers = allCustomers
            .Select(c => new
            {
                Customer = c,
                TotalOrders = c.Orders.Count(o => o.Status != OrderStatus.Cancelled),
                TotalSpent = c.Orders.Where(o => o.Status != OrderStatus.Cancelled).Sum(o => o.TotalAmount)
            })
            .Where(x => x.TotalOrders > 0)
            .OrderByDescending(x => x.TotalSpent)
            .Take(10)
            .Select(x => new TopCustomerDto
            {
                CustomerId = x.Customer.Id,
                CustomerName = x.Customer.User != null ? $"{x.Customer.User.FirstName} {x.Customer.User.LastName}" : "Customer",
                Email = x.Customer.User?.Email ?? "",
                TotalOrders = x.TotalOrders,
                TotalSpent = x.TotalSpent
            })
            .ToList();

        return new CustomerReportDto
        {
            TotalCustomers = allCustomers.Count,
            NewCustomers = newCustomers,
            ReturningCustomers = returningCustomers,
            CustomersWithOrders = customersWithOrders,
            AverageLifetimeValue = avgLifetimeValue,
            TopCustomers = topCustomers
        };
    }

    public async Task<InventoryReportDto> GetInventoryReportAsync()
    {
        var stockItems = await _context.StockItems
            .Include(si => si.Product)
            .ThenInclude(p => p!.Images)
            .Where(si => !si.Product!.IsDeleted && si.Product.IsActive)
            .ToListAsync();

        var totalInventoryValue = stockItems.Sum(si => si.QuantityOnHand * (si.Product?.Price ?? 0));

        var lowStock = stockItems
            .Where(si => si.QuantityOnHand > 0 && si.QuantityOnHand <= (si.Product?.MinimumStockLevel ?? 10))
            .Select(si => new LowStockProductDto
            {
                ProductId = si.ProductId,
                ProductName = si.Product!.Name,
                SKU = si.Product.SKU,
                CurrentStock = si.QuantityOnHand,
                MinimumStockLevel = si.Product.MinimumStockLevel,
                UnitPrice = si.Product.Price
            })
            .ToList();

        var outOfStock = stockItems
            .Where(si => si.QuantityOnHand == 0)
            .Select(si => new OutOfStockProductDto
            {
                ProductId = si.ProductId,
                ProductName = si.Product!.Name,
                SKU = si.Product.SKU,
                ReorderLevel = si.Product.ReorderLevel
            })
            .ToList();

        return new InventoryReportDto
        {
            TotalProducts = stockItems.Select(si => si.ProductId).Distinct().Count(),
            TotalStockItems = stockItems.Count,
            TotalInventoryValue = totalInventoryValue,
            LowStockCount = lowStock.Count,
            OutOfStockCount = outOfStock.Count,
            OverstockedProducts = stockItems.Count(si => si.QuantityOnHand > 100),
            LowStockItems = lowStock,
            OutOfStockItems = outOfStock
        };
    }

    public async Task<byte[]> ExportSalesReportAsync(DateTime startDate, DateTime endDate, string format = "excel")
    {
        var report = await GetSalesReportAsync(startDate, endDate);
        
        var csv = new System.Text.StringBuilder();
        csv.AppendLine("Sales Report");
        csv.AppendLine($"Period: {startDate:yyyy-MM-dd} to {endDate:yyyy-MM-dd}");
        csv.AppendLine();
        csv.AppendLine("Summary");
        csv.AppendLine($"Total Sales,{report.TotalSales}");
        csv.AppendLine($"Total Revenue,{report.TotalRevenue}");
        csv.AppendLine($"Total Orders,{report.TotalOrders}");
        csv.AppendLine($"Average Order Value,{report.AverageOrderValue}");
        csv.AppendLine();
        csv.AppendLine("Top Products");
        csv.AppendLine("Product Name,Units Sold,Revenue");
        foreach (var product in report.TopProducts)
        {
            csv.AppendLine($"{product.ProductName},{product.UnitsSold},{product.Revenue}");
        }

        return System.Text.Encoding.UTF8.GetBytes(csv.ToString());
    }

    public async Task<byte[]> ExportInventoryReportAsync(string format = "excel")
    {
        var report = await GetInventoryReportAsync();
        
        var csv = new System.Text.StringBuilder();
        csv.AppendLine("Inventory Report");
        csv.AppendLine($"Generated: {DateTime.UtcNow:yyyy-MM-dd HH:mm}");
        csv.AppendLine();
        csv.AppendLine("Summary");
        csv.AppendLine($"Total Products,{report.TotalProducts}");
        csv.AppendLine($"Total Inventory Value,{report.TotalInventoryValue}");
        csv.AppendLine($"Low Stock Products,{report.LowStockCount}");
        csv.AppendLine($"Out of Stock Products,{report.OutOfStockCount}");
        csv.AppendLine();
        csv.AppendLine("Low Stock Items");
        csv.AppendLine("Product Name,SKU,Current Stock,Minimum Level");
        foreach (var product in report.LowStockItems)
        {
            csv.AppendLine($"{product.ProductName},{product.SKU},{product.CurrentStock},{product.MinimumStockLevel}");
        }

        return System.Text.Encoding.UTF8.GetBytes(csv.ToString());
    }
}
