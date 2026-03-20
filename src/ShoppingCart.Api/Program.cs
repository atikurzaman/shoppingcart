using Serilog;
using FluentValidation;
using ShoppingCart.Application;
using ShoppingCart.Application.Mappings;
using ShoppingCart.Infrastructure.Extensions;
using ShoppingCart.Infrastructure.Middleware;
using ShoppingCart.Persistence.Data;

var builder = WebApplication.CreateBuilder(args);

// Serilog Configuration
builder.Host.UseSerilog((context, configuration) =>
    configuration
        .ReadFrom.Configuration(context.Configuration)
        .Enrich.FromLogContext()
        .Enrich.WithProperty("Application", "ShoppingCart.Api")
        .WriteTo.Console()
        .WriteTo.File("logs/shoppingcart-.log", rollingInterval: RollingInterval.Day));

// Add Services
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new() 
    { 
        Title = "Shopping Cart API", 
        Version = "v1",
        Description = "Enterprise Shopping Cart and Inventory Management System API"
    });

    options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token.",
        Name = "Authorization",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Add Infrastructure Services
builder.Services.AddPersistenceServices(
    builder.Configuration.GetConnectionString("DefaultConnection")!);

builder.Services.AddJwtAuthentication(builder.Configuration);
builder.Services.AddAuthorizationPolicies();

// Add Application Services
builder.Services.AddApplicationServices();

// Register Mappings
MappingConfiguration.RegisterMappings();

// CORS Configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });

    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// SignalR
builder.Services.AddSignalR();

// Validation
builder.Services.AddValidatorsFromAssemblyContaining<Program>();
builder.Services.AddTransient<FluentValidation.IValidator<ShoppingCart.Application.DTOs.Auth.LoginRequest>, ShoppingCart.Application.Validators.Auth.LoginRequestValidator>();
builder.Services.AddTransient<FluentValidation.IValidator<ShoppingCart.Application.DTOs.Auth.RegisterRequest>, ShoppingCart.Application.Validators.Auth.RegisterRequestValidator>();
builder.Services.AddTransient<FluentValidation.IValidator<ShoppingCart.Application.DTOs.Auth.ChangePasswordRequest>, ShoppingCart.Application.Validators.Auth.ChangePasswordRequestValidator>();
builder.Services.AddTransient<FluentValidation.IValidator<ShoppingCart.Application.DTOs.Categories.CreateCategoryRequest>, ShoppingCart.Application.Validators.CreateCategoryRequestValidator>();
builder.Services.AddTransient<FluentValidation.IValidator<ShoppingCart.Application.DTOs.Categories.UpdateCategoryRequest>, ShoppingCart.Application.Validators.UpdateCategoryRequestValidator>();
builder.Services.AddTransient<FluentValidation.IValidator<ShoppingCart.Application.DTOs.Products.CreateProductRequest>, ShoppingCart.Application.Validators.CreateProductRequestValidator>();
builder.Services.AddTransient<FluentValidation.IValidator<ShoppingCart.Application.DTOs.Products.UpdateProductRequest>, ShoppingCart.Application.Validators.UpdateProductRequestValidator>();
builder.Services.AddTransient<FluentValidation.IValidator<ShoppingCart.Application.DTOs.Brands.CreateBrandRequest>, ShoppingCart.Application.Validators.CreateBrandRequestValidator>();
builder.Services.AddTransient<FluentValidation.IValidator<ShoppingCart.Application.DTOs.Brands.UpdateBrandRequest>, ShoppingCart.Application.Validators.UpdateBrandRequestValidator>();
builder.Services.AddTransient<FluentValidation.IValidator<ShoppingCart.Application.DTOs.Suppliers.CreateSupplierRequest>, ShoppingCart.Application.Validators.SupplierValidators>();
builder.Services.AddTransient<FluentValidation.IValidator<ShoppingCart.Application.DTOs.Suppliers.UpdateSupplierRequest>, ShoppingCart.Application.Validators.UpdateSupplierValidator>();
builder.Services.AddTransient<FluentValidation.IValidator<ShoppingCart.Application.DTOs.Warehouses.CreateWarehouseRequest>, ShoppingCart.Application.Validators.WarehouseValidators>();
builder.Services.AddTransient<FluentValidation.IValidator<ShoppingCart.Application.DTOs.Warehouses.UpdateWarehouseRequest>, ShoppingCart.Application.Validators.UpdateWarehouseValidator>();

var app = builder.Build();

// Configure Pipeline
app.UseMiddleware<ExceptionMiddleware>();
app.UseMiddleware<RequestLoggingMiddleware>();

app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "Shopping Cart API v1");
    options.RoutePrefix = "swagger";
});

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<ShoppingCart.Api.Hubs.NotificationHub>("/hubs/notifications");

// Create uploads directory
var uploadsPath = Path.Combine(app.Environment.ContentRootPath, "wwwroot", "uploads");
if (!Directory.Exists(uploadsPath))
{
    Directory.CreateDirectory(uploadsPath);
}

// Seed data
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await SeedData.SeedAsync(context);
}

app.Run();
