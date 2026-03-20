namespace ShoppingCart.Shared.Common;

public static class Roles
{
    public const string Admin = "Admin";
    public const string Manager = "Manager";
    public const string Staff = "Staff";
    public const string Customer = "Customer";

    public static readonly string[] AllRoles = { Admin, Manager, Staff, Customer };
}

public static class Permissions
{
    public const string Dashboard_View = "dashboard:view";
    
    public const string Users_View = "users:view";
    public const string Users_Create = "users:create";
    public const string Users_Update = "users:update";
    public const string Users_Delete = "users:delete";
    
    public const string Roles_View = "roles:view";
    public const string Roles_Create = "roles:create";
    public const string Roles_Update = "roles:update";
    public const string Roles_Delete = "roles:delete";
    
    public const string Products_View = "products:view";
    public const string Products_Create = "products:create";
    public const string Products_Update = "products:update";
    public const string Products_Delete = "products:delete";
    
    public const string Categories_View = "categories:view";
    public const string Categories_Create = "categories:create";
    public const string Categories_Update = "categories:update";
    public const string Categories_Delete = "categories:delete";
    
    public const string Brands_View = "brands:view";
    public const string Brands_Create = "brands:create";
    public const string Brands_Update = "brands:update";
    public const string Brands_Delete = "brands:delete";
    
    public const string Orders_View = "orders:view";
    public const string Orders_Create = "orders:create";
    public const string Orders_Update = "orders:update";
    public const string Orders_Delete = "orders:delete";
    public const string Orders_Process = "orders:process";
    
    public const string Inventory_View = "inventory:view";
    public const string Inventory_Adjust = "inventory:adjust";
    
    public const string Coupons_View = "coupons:view";
    public const string Coupons_Create = "coupons:create";
    public const string Coupons_Update = "coupons:update";
    public const string Coupons_Delete = "coupons:delete";
    
    public const string Reports_View = "reports:view";
    public const string Reports_Export = "reports:export";
    
    public const string Settings_View = "settings:view";
    public const string Settings_Update = "settings:update";
}

public static class CacheKeys
{
    public const string Categories = "categories";
    public const string Brands = "brands";
    public const string Products = "products";
    public const string ProductPrefix = "product:";
    public const string UserPrefix = "user:";
    public const string SettingsPrefix = "settings:";
}

public static class ClaimTypes
{
    public const string UserId = "uid";
    public const string Email = "email";
    public const string Role = "role";
    public const string Permissions = "permissions";
}
