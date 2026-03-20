using ShoppingCart.Application.DTOs.Reports;
using ShoppingCart.Application.DTOs.Settings;

namespace ShoppingCart.Application.Interfaces.Services;

public interface IReportService
{
    Task<SalesReportDto> GetSalesReportAsync(DateTime startDate, DateTime endDate);
    Task<CustomerReportDto> GetCustomerReportAsync(DateTime startDate, DateTime endDate);
    Task<InventoryReportDto> GetInventoryReportAsync();
    Task<byte[]> ExportSalesReportAsync(DateTime startDate, DateTime endDate, string format = "excel");
    Task<byte[]> ExportInventoryReportAsync(string format = "excel");
}
