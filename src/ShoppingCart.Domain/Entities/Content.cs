using ShoppingCart.Domain.Entities.Base;

namespace ShoppingCart.Domain.Entities;

public class Blog : AuditableEntity<int>
{
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string? ShortDescription { get; set; }
    public string? ThumbnailUrl { get; set; }
    public string? BannerUrl { get; set; }
    public int CategoryId { get; set; }
    public bool IsPublished { get; set; } = false;
    public DateTime? PublishedAt { get; set; }
    
    // SEO
    public string? MetaTitle { get; set; }
    public string? MetaDescription { get; set; }

    public virtual BlogCategory Category { get; set; } = null!;
    public virtual ICollection<BlogTagMapping> Tags { get; set; } = new List<BlogTagMapping>();
    public virtual ICollection<BlogComment> Comments { get; set; } = new List<BlogComment>();
}

public class BlogCategory : AuditableEntity<int>
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }

    public virtual ICollection<Blog> Blogs { get; set; } = new List<Blog>();
}

public class BlogTag : AuditableEntity<int>
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;

    public virtual ICollection<BlogTagMapping> Blogs { get; set; } = new List<BlogTagMapping>();
}

public class BlogTagMapping : AuditableEntity<int>
{
    public int BlogId { get; set; }
    public int BlogTagId { get; set; }

    public virtual Blog Blog { get; set; } = null!;
    public virtual BlogTag Tag { get; set; } = null!;
}

public class BlogComment : AuditableEntity<int>
{
    public int BlogId { get; set; }
    public int? UserId { get; set; }
    public string Name { get; set; } = string.Empty; // Guest name
    public string Email { get; set; } = string.Empty; // Guest email
    public string Content { get; set; } = string.Empty;
    public bool IsApproved { get; set; } = false;

    public virtual Blog Blog { get; set; } = null!;
    public virtual User? User { get; set; }
}

public class StaticPage : AuditableEntity<int>
{
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public bool IsPublished { get; set; } = true;

    // SEO
    public string? MetaTitle { get; set; }
    public string? MetaDescription { get; set; }
}

public class MediaAsset : AuditableEntity<int>
{
    public string FileName { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty; // e.g. image/jpeg
    public long FileSizeBytes { get; set; }
    public string? OriginalName { get; set; }
    public string? AltText { get; set; }
}

public class ContactMessage : AuditableEntity<int>
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public bool IsRead { get; set; } = false;
    public bool IsReplied { get; set; } = false;
    public string? ReplyMessage { get; set; }
}

public class SearchHistory : AuditableEntity<int>
{
    public string Keyword { get; set; } = string.Empty;
    public int SearchCount { get; set; } = 1;
    public DateTime LastSearchedAt { get; set; } = DateTime.UtcNow;
}
