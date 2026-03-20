namespace ShoppingCart.Domain.Entities.Base;

public abstract class BaseEntity<TId> where TId : struct
{
    public TId Id { get; set; } = default!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }
}

public abstract class AuditableEntity<TId> : BaseEntity<TId> where TId : struct
{
    public bool IsDeleted { get; set; } = false;
    public byte[]? RowVersion { get; set; }
}
