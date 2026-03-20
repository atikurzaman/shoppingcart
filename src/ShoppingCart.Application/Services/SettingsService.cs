using Microsoft.EntityFrameworkCore;
using ShoppingCart.Application.DTOs.Settings;
using ShoppingCart.Application.Interfaces.Services;
using ShoppingCart.Domain.Entities;
using ShoppingCart.Persistence.Data;
using ShoppingCart.Shared.Exceptions;

namespace ShoppingCart.Application.Services;

public class SettingsService : ISettingsService
{
    private readonly AppDbContext _context;
    private static readonly Dictionary<string, string> DefaultSettings = new()
    {
        { "SiteName", "Shopping Cart" },
        { "SiteUrl", "https://localhost:5001" },
        { "SupportEmail", "support@example.com" },
        { "Currency", "USD" },
        { "TaxRate", "0.15" },
        { "ItemsPerPage", "12" },
        { "EnableReviews", "true" },
        { "EnableWishlist", "true" },
        { "LowStockThreshold", "10" }
    };

    public SettingsService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<SettingDto?> GetSettingAsync(string key)
    {
        var setting = await _context.AppSettings.FirstOrDefaultAsync(s => s.Key == key);
        return setting == null ? null : MapToDto(setting);
    }

    public async Task<string?> GetSettingValueAsync(string key, string? defaultValue = null)
    {
        var setting = await _context.AppSettings.FirstOrDefaultAsync(s => s.Key == key);
        return setting?.Value ?? (defaultValue ?? (DefaultSettings.TryGetValue(key, out var def) ? def : null));
    }

    public async Task<List<SettingGroupDto>> GetAllSettingsAsync()
    {
        var settings = await _context.AppSettings.ToListAsync();

        var groups = settings
            .GroupBy(s => s.Category)
            .Select(g => new SettingGroupDto
            {
                Category = g.Key,
                DisplayName = GetCategoryDisplayName(g.Key),
                Settings = g.Select(MapToDto).ToList()
            })
            .ToList();

        return groups;
    }

    public async Task<bool> UpdateSettingAsync(string key, string value)
    {
        var setting = await _context.AppSettings.FirstOrDefaultAsync(s => s.Key == key);
        
        if (setting == null)
        {
            setting = new AppSetting
            {
                Key = key,
                Value = value,
                Category = "General",
                IsPublic = false,
                CreatedAt = DateTime.UtcNow
            };
            _context.AppSettings.Add(setting);
        }
        else
        {
            setting.Value = value;
            setting.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UpdateSettingsAsync(Dictionary<string, string> settings)
    {
        foreach (var (key, value) in settings)
        {
            await UpdateSettingAsync(key, value);
        }
        return true;
    }

    public async Task<GeneralSettingsDto> GetGeneralSettingsAsync()
    {
        return new GeneralSettingsDto
        {
            SiteName = await GetSettingValueAsync("SiteName", "Shopping Cart") ?? "Shopping Cart",
            SiteUrl = await GetSettingValueAsync("SiteUrl", "https://localhost:5001") ?? "https://localhost:5001",
            SupportEmail = await GetSettingValueAsync("SupportEmail", "support@example.com") ?? "support@example.com",
            Currency = await GetSettingValueAsync("Currency", "USD") ?? "USD",
            TaxRate = decimal.TryParse(await GetSettingValueAsync("TaxRate", "0.15"), out var taxRate) ? taxRate : 0.15m
        };
    }

    public async Task<bool> UpdateGeneralSettingsAsync(GeneralSettingsDto settings)
    {
        await UpdateSettingAsync("SiteName", settings.SiteName);
        await UpdateSettingAsync("SiteUrl", settings.SiteUrl);
        await UpdateSettingAsync("SupportEmail", settings.SupportEmail);
        await UpdateSettingAsync("Currency", settings.Currency);
        await UpdateSettingAsync("TaxRate", settings.TaxRate.ToString());
        return true;
    }

    private static SettingDto MapToDto(AppSetting setting)
    {
        return new SettingDto
        {
            Id = setting.Id,
            Key = setting.Key,
            Value = setting.Value,
            Description = setting.Description,
            Category = setting.Category,
            IsPublic = setting.IsPublic
        };
    }

    private static string GetCategoryDisplayName(string category)
    {
        return category switch
        {
            "General" => "General Settings",
            "Email" => "Email Settings",
            "Payment" => "Payment Settings",
            "Shipping" => "Shipping Settings",
            "Tax" => "Tax Settings",
            "Inventory" => "Inventory Settings",
            "Security" => "Security Settings",
            _ => category
        };
    }
}
