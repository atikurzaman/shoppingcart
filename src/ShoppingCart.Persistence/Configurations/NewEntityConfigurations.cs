using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShoppingCart.Domain.Entities;

namespace ShoppingCart.Persistence.Configurations;

public class ReviewConfiguration : IEntityTypeConfiguration<Review>
{
    public void Configure(EntityTypeBuilder<Review> builder)
    {
        builder.ToTable("Reviews");

        builder.HasOne(r => r.Product)
            .WithMany(p => p.Reviews)
            .HasForeignKey(r => r.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(r => r.Customer)
            .WithMany(c => c.Reviews)
            .HasForeignKey(r => r.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(r => r.Order)
            .WithMany()
            .HasForeignKey(r => r.OrderId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(r => new { r.ProductId, r.CustomerId }).IsUnique();
        builder.HasIndex(r => r.IsApproved);
        builder.HasIndex(r => r.Rating);
    }
}

public class ReviewHelpfulnessConfiguration : IEntityTypeConfiguration<ReviewHelpfulness>
{
    public void Configure(EntityTypeBuilder<ReviewHelpfulness> builder)
    {
        builder.ToTable("ReviewHelpfulness");

        builder.HasOne(rh => rh.Review)
            .WithMany(r => r.HelpfulVotes)
            .HasForeignKey(rh => rh.ReviewId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(rh => new { rh.ReviewId, rh.UserId }).IsUnique();
    }
}

public class ShippingMethodConfiguration : IEntityTypeConfiguration<ShippingMethod>
{
    public void Configure(EntityTypeBuilder<ShippingMethod> builder)
    {
        builder.ToTable("ShippingMethods");

        builder.Property(s => s.Name).HasMaxLength(100).IsRequired();
        builder.Property(s => s.CarrierName).HasMaxLength(100);
        builder.Property(s => s.BaseCost).HasPrecision(18, 2);
        builder.Property(s => s.CostPerKg).HasPrecision(18, 2);
        builder.Property(s => s.FreeShippingThreshold).HasPrecision(18, 2);

        builder.HasIndex(s => s.Name);
        builder.HasIndex(s => s.IsActive);
    }
}


