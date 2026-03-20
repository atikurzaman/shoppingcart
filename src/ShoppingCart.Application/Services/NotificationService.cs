using Microsoft.EntityFrameworkCore;
using ShoppingCart.Application.DTOs.Notifications;
using ShoppingCart.Application.Interfaces.Services;
using ShoppingCart.Domain.Entities;
using ShoppingCart.Persistence.Data;
using ShoppingCart.Shared.Common;

namespace ShoppingCart.Application.Services;

public class NotificationService : INotificationService
{
    private readonly AppDbContext _context;

    public NotificationService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<NotificationDto>> GetUserNotificationsAsync(int userId, int pageIndex, int pageSize, bool? unreadOnly = null)
    {
        var query = _context.Notifications
            .Include(n => n.User)
            .Where(n => n.UserId == userId)
            .AsQueryable();

        if (unreadOnly == true)
            query = query.Where(n => !n.IsRead);

        var totalCount = await query.CountAsync();
        var items = await query
            .OrderByDescending(n => n.CreatedAt)
            .Skip(pageIndex * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var result = items.Select(n => new NotificationDto
        {
            Id = n.Id,
            UserId = n.UserId ?? 0,
            UserName = n.User?.FirstName + " " + n.User?.LastName ?? "System",
            Title = n.Title,
            Message = n.Message,
            Type = n.Type,
            Link = n.Link,
            IsRead = n.IsRead,
            CreatedAt = n.CreatedAt
        }).ToList();

        return new PagedResult<NotificationDto>(result, totalCount, pageIndex, pageSize);
    }

    public async Task<int> GetUnreadCountAsync(int userId)
    {
        return await _context.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .CountAsync();
    }

    public async Task<bool> MarkAsReadAsync(int userId, int notificationId)
    {
        var notification = await _context.Notifications
            .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId);

        if (notification == null)
            return false;

        notification.IsRead = true;
        notification.ReadAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> MarkAllAsReadAsync(int userId)
    {
        var notifications = await _context.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ToListAsync();

        foreach (var n in notifications)
        {
            n.IsRead = true;
            n.ReadAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteNotificationAsync(int userId, int notificationId)
    {
        var notification = await _context.Notifications
            .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId);

        if (notification == null)
            return false;

        _context.Notifications.Remove(notification);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> SendNotificationAsync(CreateNotificationRequest request)
    {
        var userIds = new List<int>();

        if (request.IsSystemWide)
        {
            userIds = await _context.Users.Select(u => u.Id).ToListAsync();
        }
        else if (request.UserIds != null && request.UserIds.Any())
        {
            userIds = request.UserIds;
        }
        else if (request.UserId.HasValue)
        {
            userIds.Add(request.UserId.Value);
        }

        foreach (var userId in userIds)
        {
            var notification = new Notification
            {
                UserId = userId,
                Title = request.Title,
                Message = request.Message,
                Type = request.Type,
                Link = request.Link,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };
            _context.Notifications.Add(notification);
        }

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> SendOrderNotificationAsync(int userId, string orderNumber, string status)
    {
        var notification = new Notification
        {
            UserId = userId,
            Title = $"Order #{orderNumber} Updated",
            Message = $"Your order #{orderNumber} status has been updated to: {status}",
            Type = "Order",
            Link = $"/orders/{orderNumber}",
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };

        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> SendStockAlertAsync(int productId, int currentStock)
    {
        var product = await _context.Products.FindAsync(productId);
        if (product == null)
            return false;

        var admins = await _context.UserRoles
            .Where(ur => ur.Role.Name == "Admin" || ur.Role.Name == "Manager")
            .Select(ur => ur.UserId)
            .Distinct()
            .ToListAsync();

        foreach (var adminId in admins)
        {
            var notification = new Notification
            {
                UserId = adminId,
                Title = "Low Stock Alert",
                Message = $"{product.Name} (SKU: {product.SKU}) is running low. Current stock: {currentStock}",
                Type = "StockAlert",
                Link = $"/admin/inventory?productId={productId}",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };
            _context.Notifications.Add(notification);
        }

        await _context.SaveChangesAsync();
        return true;
    }
}
