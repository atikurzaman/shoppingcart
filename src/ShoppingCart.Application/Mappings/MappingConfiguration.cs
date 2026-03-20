using Mapster;
using ShoppingCart.Application.DTOs.Auth;
using ShoppingCart.Application.DTOs.Products;
using ShoppingCart.Application.DTOs.Orders;
using ShoppingCart.Application.DTOs.Categories;
using ShoppingCart.Application.DTOs.Brands;
using ShoppingCart.Domain.Entities;

namespace ShoppingCart.Application.Mappings;

public static class MappingConfiguration
{
    public static void RegisterMappings()
    {
        TypeAdapterConfig<User, UserDto>
            .NewConfig()
            .Map(dest => dest.FullName, src => $"{src.FirstName} {src.LastName}")
            .Map(dest => dest.Roles, src => src.UserRoles.Select(ur => ur.Role.Name).ToList());

        TypeAdapterConfig<Product, ProductDto>
            .NewConfig()
            .Map(dest => dest.CategoryName, src => src.Category.Name)
            .Map(dest => dest.BrandName, src => src.Brand != null ? src.Brand.Name : null)
            .Map(dest => dest.StockQuantity, src => src.StockItems.Sum(s => s.AvailableQuantity))
            .Map(dest => dest.Images, src => src.Images != null ? src.Images.Adapt<List<ProductImageDto>>() : new List<ProductImageDto>());

        TypeAdapterConfig<Product, ProductListDto>
            .NewConfig()
            .Map(dest => dest.CategoryName, src => src.Category.Name)
            .Map(dest => dest.BrandName, src => src.Brand != null ? src.Brand.Name : null)
            .Map(dest => dest.MainImageUrl, src => GetMainImageUrl(src));

        TypeAdapterConfig<Category, CategoryDto>
            .NewConfig()
            .Map(dest => dest.ParentCategoryName, src => src.ParentCategory != null ? src.ParentCategory.Name : null)
            .Map(dest => dest.ProductCount, src => src.Products.Count);

        TypeAdapterConfig<Brand, BrandDto>
            .NewConfig()
            .Map(dest => dest.ProductCount, src => src.Products.Count);

        TypeAdapterConfig<Order, OrderDto>
            .NewConfig()
            .Map(dest => dest.CustomerName, src => $"{src.Customer.User.FirstName} {src.Customer.User.LastName}")
            .Map(dest => dest.CustomerEmail, src => src.Customer.User.Email);

        TypeAdapterConfig<Order, OrderListDto>
            .NewConfig()
            .Map(dest => dest.CustomerName, src => $"{src.Customer.User.FirstName} {src.Customer.User.LastName}")
            .Map(dest => dest.ItemCount, src => src.Items.Count);
    }

    private static string? GetMainImageUrl(Product product)
    {
        var mainImage = product.Images?.FirstOrDefault(i => i.IsMain);
        return mainImage?.ImageUrl ?? product.Images?.FirstOrDefault()?.ImageUrl;
    }
}
