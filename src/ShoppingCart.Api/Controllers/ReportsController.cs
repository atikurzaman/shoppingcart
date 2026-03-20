using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShoppingCart.Application.DTOs.Reports;
using ShoppingCart.Application.DTOs.Settings;
using ShoppingCart.Application.Interfaces.Services;
using ShoppingCart.Domain.Enums;
using ShoppingCart.Persistence.Data;
using ShoppingCart.Shared.Common;

namespace ShoppingCart.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReportsController : ControllerBase
{
    private readonly IReportService _reportService;
    private readonly AppDbContext _context;

    public ReportsController(IReportService reportService, AppDbContext context)
    {
        _reportService = reportService;
        _context = context;
    }

    [HttpGet("dashboard")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<DashboardSummaryDto>>> GetDashboardSummary()
    {
        var startDate = DateTime.UtcNow.AddDays(-30);
        var endDate = DateTime.UtcNow;

        var totalRevenue = await _context.Orders
            .Where(o => o.OrderDate >= startDate && o.OrderDate <= endDate && o.Status != OrderStatus.Cancelled)
            .SumAsync(o => o.TotalAmount);

        var totalOrders = await _context.Orders
            .Where(o => o.OrderDate >= startDate && o.OrderDate <= endDate)
            .CountAsync();

        var totalProducts = await _context.Products.Where(p => p.IsActive && !p.IsDeleted).CountAsync();
        var totalCustomers = await _context.Customers.CountAsync();

        var pendingOrders = await _context.Orders
            .Where(o => o.Status == OrderStatus.Pending || o.Status == OrderStatus.Confirmed)
            .CountAsync();

        var lowStockProducts = await _context.Products
            .Where(p => p.IsActive && !p.IsDeleted && p.MinimumStockLevel > 0)
            .CountAsync();

        var recentOrders = await _context.Orders
            .Include(o => o.Customer).ThenInclude(c => c.User)
            .OrderByDescending(o => o.CreatedAt)
            .Take(5)
            .Select(o => new RecentOrderDto
            {
                Id = o.Id,
                OrderNumber = o.OrderNumber,
                CustomerName = o.Customer != null && o.Customer.User != null ? $"{o.Customer.User.FirstName} {o.Customer.User.LastName}" : "Guest",
                TotalAmount = o.TotalAmount,
                Status = o.Status.ToString(),
                CreatedAt = o.CreatedAt
            })
            .ToListAsync();

        var dailySales = await _context.Orders
            .Where(o => o.OrderDate >= startDate && o.OrderDate <= endDate && o.Status != OrderStatus.Cancelled)
            .GroupBy(o => o.OrderDate.Date)
            .Select(g => new DailySalesChartDto
            {
                Date = g.Key.ToString("yyyy-MM-dd"),
                Revenue = g.Sum(o => o.TotalAmount),
                Orders = g.Count()
            })
            .OrderBy(d => d.Date)
            .ToListAsync();

        var summary = new DashboardSummaryDto
        {
            TotalRevenue = totalRevenue,
            TotalOrders = totalOrders,
            TotalProducts = totalProducts,
            TotalCustomers = totalCustomers,
            LowStockProducts = lowStockProducts,
            PendingOrders = pendingOrders,
            RecentOrders = recentOrders,
            SalesData = dailySales
        };

        return Ok(ApiResponse<DashboardSummaryDto>.Success(summary));
    }

    [HttpGet("sales")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<SalesReportDto>>> GetSalesReport(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        var start = startDate ?? DateTime.UtcNow.AddMonths(-1);
        var end = endDate ?? DateTime.UtcNow;

        var report = await _reportService.GetSalesReportAsync(start, end);
        return Ok(ApiResponse<SalesReportDto>.Success(report));
    }

    [HttpGet("products")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<List<TopProductDto>>>> GetProductReport(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        var start = startDate ?? DateTime.UtcNow.AddMonths(-1);
        var end = endDate ?? DateTime.UtcNow;

        var report = await _reportService.GetSalesReportAsync(start, end);
        return Ok(ApiResponse<List<TopProductDto>>.Success(report.TopProducts));
    }

    [HttpGet("customers")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<CustomerReportDto>>> GetCustomerReport(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        var start = startDate ?? DateTime.UtcNow.AddMonths(-1);
        var end = endDate ?? DateTime.UtcNow;

        var report = await _reportService.GetCustomerReportAsync(start, end);
        return Ok(ApiResponse<CustomerReportDto>.Success(report));
    }

    [HttpGet("inventory")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<InventoryReportDto>>> GetInventoryReport()
    {
        var report = await _reportService.GetInventoryReportAsync();
        return Ok(ApiResponse<InventoryReportDto>.Success(report));
    }

    [HttpGet("revenue-by-category")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<List<CategorySalesDto>>>> GetRevenueByCategory(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        var start = startDate ?? DateTime.UtcNow.AddMonths(-1);
        var end = endDate ?? DateTime.UtcNow;

        var report = await _reportService.GetSalesReportAsync(start, end);
        return Ok(ApiResponse<List<CategorySalesDto>>.Success(report.SalesByCategory));
    }

    [HttpGet("export/sales")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> ExportSalesReport(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] string format = "csv")
    {
        var start = startDate ?? DateTime.UtcNow.AddMonths(-1);
        var end = endDate ?? DateTime.UtcNow;

        var data = await _reportService.ExportSalesReportAsync(start, end, format);
        var fileName = $"sales_report_{start:yyyyMMdd}_{end:yyyyMMdd}.csv";
        
        return File(data, "text/csv", fileName);
    }

    [HttpGet("export/inventory")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> ExportInventoryReport([FromQuery] string format = "csv")
    {
        var data = await _reportService.ExportInventoryReportAsync(format);
        var fileName = $"inventory_report_{DateTime.UtcNow:yyyyMMdd}.csv";
        
        return File(data, "text/csv", fileName);
    }
}

[ApiController]
[Route("api/[controller]")]
public class SettingsController : ControllerBase
{
    private readonly ISettingsService _settingsService;

    public SettingsController(ISettingsService settingsService)
    {
        _settingsService = settingsService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<SettingGroupDto>>>> GetAllSettings()
    {
        var settings = await _settingsService.GetAllSettingsAsync();
        return Ok(ApiResponse<List<SettingGroupDto>>.Success(settings));
    }

    [HttpGet("{key}")]
    public async Task<ActionResult<ApiResponse<SettingDto>>> GetSetting(string key)
    {
        var setting = await _settingsService.GetSettingAsync(key);
        if (setting == null)
            return NotFound(ApiResponse<SettingDto>.NotFound("Setting not found"));

        return Ok(ApiResponse<SettingDto>.Success(setting));
    }

    [HttpPut]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse>> UpdateSetting([FromBody] UpdateSettingRequest request)
    {
        await _settingsService.UpdateSettingAsync(request.Key, request.Value);
        return Ok(ApiResponse.Success("Setting updated"));
    }

    [HttpPut("bulk")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse>> UpdateSettings([FromBody] Dictionary<string, string> settings)
    {
        await _settingsService.UpdateSettingsAsync(settings);
        return Ok(ApiResponse.Success("Settings updated"));
    }

    [HttpGet("general")]
    public async Task<ActionResult<ApiResponse<GeneralSettingsDto>>> GetGeneralSettings()
    {
        var settings = await _settingsService.GetGeneralSettingsAsync();
        return Ok(ApiResponse<GeneralSettingsDto>.Success(settings));
    }

    [HttpPut("general")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse>> UpdateGeneralSettings([FromBody] GeneralSettingsDto settings)
    {
        await _settingsService.UpdateGeneralSettingsAsync(settings);
        return Ok(ApiResponse.Success("General settings updated"));
    }
}
