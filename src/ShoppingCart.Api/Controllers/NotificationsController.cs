using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShoppingCart.Application.DTOs.Notifications;
using ShoppingCart.Application.Interfaces.Services;
using ShoppingCart.Shared.Common;

namespace ShoppingCart.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _notificationService;

    public NotificationsController(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    private int? GetUserId()
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
        if (userIdClaim != null && int.TryParse(userIdClaim.Value, out var userId))
        {
            return userId;
        }
        return null;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<NotificationDto>>>> GetNotifications(
        [FromQuery] int pageIndex = 0,
        [FromQuery] int pageSize = 20,
        [FromQuery] bool? unreadOnly = null)
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        var notifications = await _notificationService.GetUserNotificationsAsync(userId.Value, pageIndex, pageSize, unreadOnly);
        return Ok(ApiResponse<PagedResult<NotificationDto>>.Success(notifications));
    }

    [HttpGet("unread-count")]
    public async Task<ActionResult<ApiResponse<int>>> GetUnreadCount()
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        var count = await _notificationService.GetUnreadCountAsync(userId.Value);
        return Ok(ApiResponse<int>.Success(count));
    }

    [HttpPut("{id}/read")]
    public async Task<ActionResult<ApiResponse>> MarkAsRead(int id)
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        var result = await _notificationService.MarkAsReadAsync(userId.Value, id);
        if (!result)
            return NotFound(ApiResponse.Fail("Notification not found"));

        return Ok(ApiResponse.Success("Notification marked as read"));
    }

    [HttpPut("read-all")]
    public async Task<ActionResult<ApiResponse>> MarkAllAsRead()
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        await _notificationService.MarkAllAsReadAsync(userId.Value);
        return Ok(ApiResponse.Success("All notifications marked as read"));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse>> DeleteNotification(int id)
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        var result = await _notificationService.DeleteNotificationAsync(userId.Value, id);
        if (!result)
            return NotFound(ApiResponse.Fail("Notification not found"));

        return Ok(ApiResponse.Success("Notification deleted"));
    }

    // Admin endpoints
    [HttpPost("send")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse>> SendNotification([FromBody] CreateNotificationRequest request)
    {
        await _notificationService.SendNotificationAsync(request);
        return Ok(ApiResponse.Success("Notification sent"));
    }
}
