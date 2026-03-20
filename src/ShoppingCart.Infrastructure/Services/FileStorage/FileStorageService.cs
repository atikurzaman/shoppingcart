using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using ShoppingCart.Shared.Common;

namespace ShoppingCart.Infrastructure.Services.FileStorage;

public interface IFileStorageService
{
    Task<FileUploadResult> UploadAsync(IFormFile file, string folder, string? fileName = null);
    Task<bool> DeleteAsync(string filePath);
    string GetFileUrl(string filePath);
}

public class FileStorageService : IFileStorageService
{
    private readonly IHostEnvironment _environment;
    private readonly IConfiguration _configuration;
    private readonly ILogger<FileStorageService> _logger;

    public FileStorageService(
        IHostEnvironment environment,
        IConfiguration configuration,
        ILogger<FileStorageService> logger)
    {
        _environment = environment;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<FileUploadResult> UploadAsync(IFormFile file, string folder, string? fileName = null)
    {
        try
        {
            var basePath = _configuration["FileStorage:BasePath"] ?? "wwwroot/uploads";
            var maxFileSize = int.Parse(_configuration["FileStorage:MaxFileSizeInMb"] ?? "10") * 1024 * 1024;
            var allowedExtensions = _configuration.GetSection("FileStorage:AllowedExtensions")
                .Get<string[]>() ?? new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };

            if (file.Length > maxFileSize)
            {
                return new FileUploadResult
                {
                    Success = false,
                    ErrorMessage = $"File size exceeds maximum allowed size of {maxFileSize / 1024 / 1024}MB"
                };
            }

            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(extension))
            {
                return new FileUploadResult
                {
                    Success = false,
                    ErrorMessage = $"File extension {extension} is not allowed"
                };
            }

            fileName ??= $"{Guid.NewGuid()}{extension}";
            var relativePath = Path.Combine(basePath, folder, fileName);
            var fullPath = Path.Combine(_environment.ContentRootPath, relativePath);

            var directory = Path.GetDirectoryName(fullPath);
            if (!string.IsNullOrEmpty(directory) && !Directory.Exists(directory))
            {
                Directory.CreateDirectory(directory);
            }

            using var stream = new FileStream(fullPath, FileMode.Create);
            await file.CopyToAsync(stream);

            return new FileUploadResult
            {
                Success = true,
                FileName = fileName,
                FilePath = relativePath,
                FullPath = fullPath,
                ContentType = file.ContentType,
                FileSize = file.Length
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading file {FileName}", file.FileName);
            return new FileUploadResult
            {
                Success = false,
                ErrorMessage = ex.Message
            };
        }
    }

    public async Task<bool> DeleteAsync(string filePath)
    {
        try
        {
            var fullPath = Path.Combine(_environment.ContentRootPath, filePath);
            if (File.Exists(fullPath))
            {
                await Task.Run(() => File.Delete(fullPath));
                return true;
            }
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting file {FilePath}", filePath);
            return false;
        }
    }

    public string GetFileUrl(string filePath)
    {
        return $"/{filePath.Replace("\\", "/")}";
    }
}
