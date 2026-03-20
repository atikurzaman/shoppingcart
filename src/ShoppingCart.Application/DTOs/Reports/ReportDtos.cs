namespace ShoppingCart.Application.DTOs.Reports;

public class SalesReportDto
{
    public decimal TotalSales { get; set; }
    public decimal TotalRevenue { get; set; }
    public int TotalOrders { get; set; }
    public int AverageOrderValue { get; set; }
    public decimal TotalDiscounts { get; set; }
    public decimal TotalShipping { get; set; }
    public List<DailySalesDto> DailySales { get; set; } = new();
    public List<TopProductDto> TopProducts { get; set; } = new();
    public List<CategorySalesDto> SalesByCategory { get; set; } = new();
}

public class DailySalesDto
{
    public DateTime Date { get; set; }
    public int Orders { get; set; }
    public decimal Revenue { get; set; }
    public int ItemsSold { get; set; }
}

public class TopProductDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string? ProductImageUrl { get; set; }
    public int UnitsSold { get; set; }
    public decimal Revenue { get; set; }
}

public class CategorySalesDto
{
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public int ProductsSold { get; set; }
    public decimal Revenue { get; set; }
    public decimal Percentage { get; set; }
}

public class CustomerReportDto
{
    public int TotalCustomers { get; set; }
    public int NewCustomers { get; set; }
    public int ReturningCustomers { get; set; }
    public int CustomersWithOrders { get; set; }
    public decimal AverageLifetimeValue { get; set; }
    public List<TopCustomerDto> TopCustomers { get; set; } = new();
}

public class TopCustomerDto
{
    public int CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public int TotalOrders { get; set; }
    public decimal TotalSpent { get; set; }
}

public class InventoryReportDto
{
    public int TotalProducts { get; set; }
    public int TotalStockItems { get; set; }
    public decimal TotalInventoryValue { get; set; }
    public int LowStockCount { get; set; }
    public int OutOfStockCount { get; set; }
    public int OverstockedProducts { get; set; }
    public List<LowStockProductDto> LowStockItems { get; set; } = new();
    public List<OutOfStockProductDto> OutOfStockItems { get; set; } = new();
}

public class LowStockProductDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string? SKU { get; set; }
    public int CurrentStock { get; set; }
    public int MinimumStockLevel { get; set; }
    public decimal UnitPrice { get; set; }
}

public class OutOfStockProductDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string? SKU { get; set; }
    public string? LastRestockedDate { get; set; }
    public int ReorderLevel { get; set; }
}

public class ReportFilterDto
{
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string? GroupBy { get; set; }
    public int? CategoryId { get; set; }
    public int? WarehouseId { get; set; }
}

public class DashboardSummaryDto
{
    public decimal TotalRevenue { get; set; }
    public int TotalOrders { get; set; }
    public int TotalProducts { get; set; }
    public int TotalCustomers { get; set; }
    public int LowStockProducts { get; set; }
    public int PendingOrders { get; set; }
    public List<RecentOrderDto> RecentOrders { get; set; } = new();
    public List<DailySalesChartDto> SalesData { get; set; } = new();
}

public class RecentOrderDto
{
    public int Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class DailySalesChartDto
{
    public string Date { get; set; } = string.Empty;
    public decimal Revenue { get; set; }
    public int Orders { get; set; }
}
