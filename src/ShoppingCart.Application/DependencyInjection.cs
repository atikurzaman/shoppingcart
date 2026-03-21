using Microsoft.Extensions.DependencyInjection;
using ShoppingCart.Application.Interfaces.Services;

namespace ShoppingCart.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddScoped<IAuthService, Services.AuthService>();
        services.AddScoped<IUserService, Services.UserService>();
        services.AddScoped<IRoleService, Services.RoleService>();
        services.AddScoped<IProductService, Services.ProductService>();
        services.AddScoped<IVariantService, Services.VariantService>();
        services.AddScoped<ICategoryService, Services.CategoryService>();
        services.AddScoped<IBrandService, Services.BrandService>();
        services.AddScoped<ICartService, Services.CartService>();
        services.AddScoped<IWishlistService, Services.WishlistService>();
        services.AddScoped<IOrderService, Services.OrderService>();
        services.AddScoped<IInventoryService, Services.InventoryService>();
        services.AddScoped<ISupplierService, Services.SupplierService>();
        services.AddScoped<IWarehouseService, Services.WarehouseService>();
        services.AddScoped<IReviewService, Services.ReviewService>();
        services.AddScoped<IPaymentService, Services.PaymentService>();
        services.AddScoped<IShippingService, Services.ShippingService>();
        services.AddScoped<ICouponService, Services.CouponService>();
        services.AddScoped<INotificationService, Services.NotificationService>();
        services.AddScoped<IReportService, Services.ReportService>();
        services.AddScoped<ISettingsService, Services.SettingsService>();

        return services;
    }
}
