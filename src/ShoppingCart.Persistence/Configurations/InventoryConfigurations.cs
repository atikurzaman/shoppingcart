using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShoppingCart.Domain.Entities;

namespace ShoppingCart.Persistence.Configurations;

public class WarehouseConfiguration : IEntityTypeConfiguration<Warehouse>
{
    public void Configure(EntityTypeBuilder<Warehouse> builder)
    {
        builder.ToTable("Warehouses");

        builder.HasKey(w => w.Id);

        builder.Property(w => w.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(w => w.Code)
            .IsRequired()
            .HasMaxLength(20);

        builder.HasIndex(w => w.Code)
            .IsUnique()
            .HasDatabaseName("IX_Warehouses_Code");

        builder.Property(w => w.Description)
            .HasMaxLength(500);

        builder.Property(w => w.Address)
            .HasMaxLength(500);

        builder.Property(w => w.City)
            .HasMaxLength(100);

        builder.Property(w => w.Country)
            .HasMaxLength(100);

        builder.Property(w => w.Phone)
            .HasMaxLength(20);

        builder.Property(w => w.Email)
            .HasMaxLength(256);

        builder.HasMany(w => w.StockItems)
            .WithOne(si => si.Warehouse)
            .HasForeignKey(si => si.WarehouseId)
            .OnDelete(DeleteBehavior.Restrict);
        
        builder.Ignore(w => w.StockMovements);

        builder.HasQueryFilter(w => !w.IsDeleted);
    }
}

public class StockItemConfiguration : IEntityTypeConfiguration<StockItem>
{
    public void Configure(EntityTypeBuilder<StockItem> builder)
    {
        builder.ToTable("StockItems");

        builder.HasKey(si => si.Id);

        builder.Property(si => si.BatchNumber)
            .HasMaxLength(50);

        builder.Property(si => si.RowVersion)
            .IsRowVersion();

        builder.HasOne(si => si.Product)
            .WithMany(p => p.StockItems)
            .HasForeignKey(si => si.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(si => si.Variant)
            .WithMany(pv => pv.StockItems)
            .HasForeignKey(si => si.VariantId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(si => si.Warehouse)
            .WithMany(w => w.StockItems)
            .HasForeignKey(si => si.WarehouseId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(si => new { si.ProductId, si.VariantId, si.WarehouseId })
            .IsUnique()
            .HasDatabaseName("IX_StockItems_ProductId_VariantId_WarehouseId");

        builder.Ignore(si => si.AvailableQuantity);
        builder.Ignore(si => si.StockStatus);

        builder.HasQueryFilter(si => !si.IsDeleted);
    }
}

public class StockMovementConfiguration : IEntityTypeConfiguration<StockMovement>
{
    public void Configure(EntityTypeBuilder<StockMovement> builder)
    {
        builder.ToTable("StockMovements");

        builder.HasKey(sm => sm.Id);

        builder.Property(sm => sm.ReferenceNumber)
            .HasMaxLength(50);

        builder.Property(sm => sm.Notes)
            .HasMaxLength(500);

        builder.Property(sm => sm.UnitCost)
            .HasColumnType("decimal(18,2)");

        builder.Property(sm => sm.MovementType)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.HasOne(sm => sm.Product)
            .WithMany()
            .HasForeignKey(sm => sm.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(sm => sm.FromWarehouse)
            .WithMany()
            .HasForeignKey(sm => sm.FromWarehouseId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(sm => sm.ToWarehouse)
            .WithMany()
            .HasForeignKey(sm => sm.ToWarehouseId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasQueryFilter(sm => !sm.IsDeleted);
    }
}

public class StockAdjustmentConfiguration : IEntityTypeConfiguration<StockAdjustment>
{
    public void Configure(EntityTypeBuilder<StockAdjustment> builder)
    {
        builder.ToTable("StockAdjustments");

        builder.HasKey(sa => sa.Id);

        builder.Property(sa => sa.Reason)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(sa => sa.Notes)
            .HasMaxLength(500);

        builder.HasOne(sa => sa.Product)
            .WithMany()
            .HasForeignKey(sa => sa.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(sa => sa.Warehouse)
            .WithMany()
            .HasForeignKey(sa => sa.WarehouseId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasQueryFilter(sa => !sa.IsDeleted);
    }
}
