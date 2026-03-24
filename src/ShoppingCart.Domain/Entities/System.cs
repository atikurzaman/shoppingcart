using ShoppingCart.Domain.Entities.Base;

namespace ShoppingCart.Domain.Entities;

public class Notification : AuditableEntity<int>
{
    public int? UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Type { get; set; } = "Info";
    public string? Link { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsRead { get; set; } = false;
    public DateTime? ReadAt { get; set; }
    public bool IsSent { get; set; } = false;
    public DateTime? SentAt { get; set; }
    public string? TargetRole { get; set; }
    public bool SendEmail { get; set; } = false;
    public bool SendSms { get; set; } = false;

    public virtual User? User { get; set; }
}

public class AuditLog : AuditableEntity<int>
{
    public int? UserId { get; set; }
    public string Action { get; set; } = string.Empty;
    public string EntityName { get; set; } = string.Empty;
    public int? EntityId { get; set; }
    public string? OldValues { get; set; }
    public string? NewValues { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public string? Details { get; set; }

    public virtual User? User { get; set; }
}

public class AppSetting : AuditableEntity<int>
{
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Category { get; set; } = "General";
    public bool IsPublic { get; set; } = true;
    public string DataType { get; set; } = "String";
}

public class EmailTemplate : AuditableEntity<int>
{
    public string Name { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public string TemplateType { get; set; } = "General";
    public bool IsActive { get; set; } = true;
}

public class ActivityLog : AuditableEntity<int>
{
    public int UserId { get; set; }
    public string ActivityType { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? EntityType { get; set; }
    public int? EntityId { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }

    public virtual User User { get; set; } = null!;
}

public class SupportTicket : AuditableEntity<int>
{
    public string TicketNumber { get; set; } = string.Empty;
    public int? UserId { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Priority { get; set; } = "Low"; // Low, Medium, High
    public string Status { get; set; } = "Open"; // Open, Pending, Resolved, Closed
    public string? AdminNote { get; set; }

    public virtual User? User { get; set; }
    public virtual ICollection<SupportTicketMessage> Messages { get; set; } = new List<SupportTicketMessage>();
}

public class SupportTicketMessage : AuditableEntity<int>
{
    public int SupportTicketId { get; set; }
    public string Message { get; set; } = string.Empty;
    public bool IsFromAdmin { get; set; } = false;

    public virtual SupportTicket SupportTicket { get; set; } = null!;
}
