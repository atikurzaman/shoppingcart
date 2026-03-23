using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShoppingCart.Domain.Entities;

namespace ShoppingCart.Persistence.Configurations;


public class CouponUsageConfiguration : IEntityTypeConfiguration<CouponUsage>
{
    public void Configure(EntityTypeBuilder<CouponUsage> builder)
    {
        builder.ToTable("CouponUsages");

        builder.HasKey(cu => cu.Id);

        builder.HasOne(cu => cu.Coupon)
            .WithMany(c => c.Usages)
            .HasForeignKey(cu => cu.CouponId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasQueryFilter(cu => !cu.IsDeleted);
    }
}

public class TaxConfiguration : IEntityTypeConfiguration<Tax>
{
    public void Configure(EntityTypeBuilder<Tax> builder)
    {
        builder.ToTable("Taxes");

        builder.HasKey(t => t.Id);

        builder.Property(t => t.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(t => t.Code)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(t => t.Rate)
            .HasPrecision(18, 4);

        builder.HasQueryFilter(t => !t.IsDeleted);
    }
}

public class PurchaseOrderConfiguration : IEntityTypeConfiguration<PurchaseOrder>
{
    public void Configure(EntityTypeBuilder<PurchaseOrder> builder)
    {
        builder.ToTable("PurchaseOrders");

        builder.HasKey(po => po.Id);

        builder.Property(po => po.OrderNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.HasIndex(po => po.OrderNumber)
            .IsUnique();

        builder.Property(po => po.SubTotal).HasPrecision(18, 2);
        builder.Property(po => po.TaxAmount).HasPrecision(18, 2);
        builder.Property(po => po.ShippingCost).HasPrecision(18, 2);
        builder.Property(po => po.TotalAmount).HasPrecision(18, 2);

        builder.HasOne(po => po.Supplier)
            .WithMany(s => s.PurchaseOrders)
            .HasForeignKey(po => po.SupplierId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasQueryFilter(po => !po.IsDeleted);
    }
}

public class PurchaseOrderItemConfiguration : IEntityTypeConfiguration<PurchaseOrderItem>
{
    public void Configure(EntityTypeBuilder<PurchaseOrderItem> builder)
    {
        builder.ToTable("PurchaseOrderItems");

        builder.HasKey(poi => poi.Id);

        builder.Property(poi => poi.ProductName).HasMaxLength(200);
        builder.Property(poi => poi.UnitPrice).HasPrecision(18, 2);
        builder.Property(poi => poi.TotalPrice).HasPrecision(18, 2);

        builder.HasOne(poi => poi.PurchaseOrder)
            .WithMany(po => po.Items)
            .HasForeignKey(poi => poi.PurchaseOrderId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasQueryFilter(poi => !poi.IsDeleted);
    }
}

public class GoodsReceiptConfiguration : IEntityTypeConfiguration<GoodsReceipt>
{
    public void Configure(EntityTypeBuilder<GoodsReceipt> builder)
    {
        builder.ToTable("GoodsReceipts");

        builder.HasKey(gr => gr.Id);

        builder.Property(gr => gr.ReceiptNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.HasOne(gr => gr.PurchaseOrder)
            .WithMany(po => po.GoodsReceipts)
            .HasForeignKey(gr => gr.PurchaseOrderId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(gr => gr.Warehouse)
            .WithMany()
            .HasForeignKey(gr => gr.WarehouseId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasQueryFilter(gr => !gr.IsDeleted);
    }
}

public class GoodsReceiptItemConfiguration : IEntityTypeConfiguration<GoodsReceiptItem>
{
    public void Configure(EntityTypeBuilder<GoodsReceiptItem> builder)
    {
        builder.ToTable("GoodsReceiptItems");

        builder.HasKey(gri => gri.Id);

        builder.Property(gri => gri.UnitCost).HasPrecision(18, 2);
        builder.Property(gri => gri.BatchNumber).HasMaxLength(50);

        builder.HasOne(gri => gri.GoodsReceipt)
            .WithMany(gr => gr.Items)
            .HasForeignKey(gri => gri.GoodsReceiptId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasQueryFilter(gri => !gri.IsDeleted);
    }
}
