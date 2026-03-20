using ShoppingCart.Application.DTOs.Settings;

namespace ShoppingCart.Application.Interfaces.Services;

public interface ISettingsService
{
    Task<SettingDto?> GetSettingAsync(string key);
    Task<string?> GetSettingValueAsync(string key, string? defaultValue = null);
    Task<List<SettingGroupDto>> GetAllSettingsAsync();
    Task<bool> UpdateSettingAsync(string key, string value);
    Task<bool> UpdateSettingsAsync(Dictionary<string, string> settings);
    Task<GeneralSettingsDto> GetGeneralSettingsAsync();
    Task<bool> UpdateGeneralSettingsAsync(GeneralSettingsDto settings);
}
