using ShoppingCart.Application.DTOs.Notifications;
using ShoppingCart.Shared.Common;

namespace ShoppingCart.Application.Interfaces.Services;

public interface INotificationService
{
    Task<PagedResult<NotificationDto>> GetUserNotificationsAsync(int userId, int pageIndex, int pageSize, bool? unreadOnly = null);
    Task<int> GetUnreadCountAsync(int userId);
    Task<bool> MarkAsReadAsync(int userId, int notificationId);
    Task<bool> MarkAllAsReadAsync(int userId);
    Task<bool> DeleteNotificationAsync(int userId, int notificationId);
    Task<bool> SendNotificationAsync(CreateNotificationRequest request);
    Task<bool> SendOrderNotificationAsync(int userId, string orderNumber, string status);
    Task<bool> SendStockAlertAsync(int productId, int currentStock);
}
