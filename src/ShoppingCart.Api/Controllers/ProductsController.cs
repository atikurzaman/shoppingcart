using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShoppingCart.Application.DTOs.Products;
using ShoppingCart.Application.Interfaces.Services;
using ShoppingCart.Shared.Common;

namespace ShoppingCart.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;
    private readonly IValidator<CreateProductRequest> _createValidator;
    private readonly IValidator<UpdateProductRequest> _updateValidator;

    public ProductsController(
        IProductService productService,
        IValidator<CreateProductRequest> createValidator,
        IValidator<UpdateProductRequest> updateValidator)
    {
        _productService = productService;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<ProductListDto>>>> GetProducts(
        [FromQuery] int pageIndex = 0,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        [FromQuery] int? categoryId = null,
        [FromQuery] int? brandId = null,
        [FromQuery] string? sortBy = null,
        [FromQuery] bool? isFeatured = null,
        [FromQuery] bool? isBestSeller = null,
        [FromQuery] bool? isNewArrival = null)
    {
        var products = await _productService.GetProductsAsync(
            pageIndex, pageSize, search, categoryId, brandId, sortBy, isFeatured, isBestSeller, isNewArrival);
        return Ok(ApiResponse<PagedResult<ProductListDto>>.Success(products));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<ProductDto>>> GetProduct(int id)
    {
        var product = await _productService.GetProductByIdAsync(id);
        if (product == null)
        {
            return NotFound(ApiResponse<ProductDto>.NotFound("Product not found"));
        }

        return Ok(ApiResponse<ProductDto>.Success(product));
    }

    [HttpGet("slug/{slug}")]
    public async Task<ActionResult<ApiResponse<ProductDto>>> GetProductBySlug(string slug)
    {
        var product = await _productService.GetProductBySlugAsync(slug);
        if (product == null)
        {
            return NotFound(ApiResponse<ProductDto>.NotFound("Product not found"));
        }

        return Ok(ApiResponse<ProductDto>.Success(product));
    }

    [HttpGet("featured")]
    public async Task<ActionResult<ApiResponse<List<ProductListDto>>>> GetFeaturedProducts([FromQuery] int count = 10)
    {
        var products = await _productService.GetFeaturedProductsAsync(count);
        return Ok(ApiResponse<List<ProductListDto>>.Success(products));
    }

    [HttpGet("best-sellers")]
    public async Task<ActionResult<ApiResponse<List<ProductListDto>>>> GetBestSellers([FromQuery] int count = 10)
    {
        var products = await _productService.GetBestSellersAsync(count);
        return Ok(ApiResponse<List<ProductListDto>>.Success(products));
    }

    [HttpGet("new-arrivals")]
    public async Task<ActionResult<ApiResponse<List<ProductListDto>>>> GetNewArrivals([FromQuery] int count = 10)
    {
        var products = await _productService.GetNewArrivalsAsync(count);
        return Ok(ApiResponse<List<ProductListDto>>.Success(products));
    }

    [HttpGet("{id}/related")]
    public async Task<ActionResult<ApiResponse<List<ProductListDto>>>> GetRelatedProducts(int id, [FromQuery] int count = 8)
    {
        var products = await _productService.GetRelatedProductsAsync(id, count);
        return Ok(ApiResponse<List<ProductListDto>>.Success(products));
    }

    [HttpGet("search")]
    public async Task<ActionResult<ApiResponse<List<ProductListDto>>>> SearchProducts([FromQuery] string query, [FromQuery] int count = 20)
    {
        var products = await _productService.SearchProductsAsync(query, count);
        return Ok(ApiResponse<List<ProductListDto>>.Success(products));
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<ProductDto>>> CreateProduct([FromBody] CreateProductRequest request)
    {
        var validationResult = await _createValidator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            return BadRequest(ApiResponse<ProductDto>.Fail(
                "Validation failed",
                400,
                validationResult.Errors.Select(e => e.ErrorMessage).ToList()));
        }

        var product = await _productService.CreateProductAsync(request);
        return CreatedAtAction(nameof(GetProduct), new { id = product.Id },
            ApiResponse<ProductDto>.Created(product, "Product created successfully"));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<ProductDto>>> UpdateProduct(int id, [FromBody] UpdateProductRequest request)
    {
        request.Id = id;

        var validationResult = await _updateValidator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            return BadRequest(ApiResponse<ProductDto>.Fail(
                "Validation failed",
                400,
                validationResult.Errors.Select(e => e.ErrorMessage).ToList()));
        }

        var product = await _productService.UpdateProductAsync(request);
        return Ok(ApiResponse<ProductDto>.Success(product, "Product updated successfully"));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse>> DeleteProduct(int id)
    {
        var result = await _productService.DeleteProductAsync(id);
        if (!result)
        {
            return NotFound(ApiResponse.Fail("Product not found"));
        }

        return Ok(ApiResponse.Success("Product deleted successfully"));
    }

    [HttpPost("{id}/toggle-featured")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse>> ToggleFeatured(int id)
    {
        var result = await _productService.ToggleFeaturedAsync(id);
        if (!result)
        {
            return NotFound(ApiResponse.Fail("Product not found"));
        }

        return Ok(ApiResponse.Success("Featured status toggled successfully"));
    }

    [HttpPost("{id}/increment-view")]
    public async Task<ActionResult> IncrementViewCount(int id)
    {
        await _productService.IncrementViewCountAsync(id);
        return NoContent();
    }
}
