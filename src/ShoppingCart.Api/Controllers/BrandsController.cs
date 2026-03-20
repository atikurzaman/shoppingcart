using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShoppingCart.Application.DTOs.Brands;
using ShoppingCart.Application.Interfaces.Services;
using ShoppingCart.Shared.Common;

namespace ShoppingCart.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BrandsController : ControllerBase
{
    private readonly IBrandService _brandService;
    private readonly IValidator<CreateBrandRequest> _createValidator;
    private readonly IValidator<UpdateBrandRequest> _updateValidator;

    public BrandsController(
        IBrandService brandService,
        IValidator<CreateBrandRequest> createValidator,
        IValidator<UpdateBrandRequest> updateValidator)
    {
        _brandService = brandService;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<BrandDto>>>> GetBrands(
        [FromQuery] int pageIndex = 0,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null)
    {
        var brands = await _brandService.GetBrandsAsync(pageIndex, pageSize, search);
        return Ok(ApiResponse<PagedResult<BrandDto>>.Success(brands));
    }

    [HttpGet("all")]
    public async Task<ActionResult<ApiResponse<List<BrandListDto>>>> GetAllBrands()
    {
        var brands = await _brandService.GetAllBrandsAsync();
        return Ok(ApiResponse<List<BrandListDto>>.Success(brands));
    }

    [HttpGet("featured")]
    public async Task<ActionResult<ApiResponse<List<BrandListDto>>>> GetFeaturedBrands()
    {
        var brands = await _brandService.GetFeaturedBrandsAsync();
        return Ok(ApiResponse<List<BrandListDto>>.Success(brands));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<BrandDto>>> GetBrand(int id)
    {
        var brand = await _brandService.GetBrandByIdAsync(id);
        if (brand == null)
        {
            return NotFound(ApiResponse<BrandDto>.NotFound("Brand not found"));
        }

        return Ok(ApiResponse<BrandDto>.Success(brand));
    }

    [HttpGet("slug/{slug}")]
    public async Task<ActionResult<ApiResponse<BrandDto>>> GetBrandBySlug(string slug)
    {
        var brand = await _brandService.GetBrandBySlugAsync(slug);
        if (brand == null)
        {
            return NotFound(ApiResponse<BrandDto>.NotFound("Brand not found"));
        }

        return Ok(ApiResponse<BrandDto>.Success(brand));
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<BrandDto>>> CreateBrand([FromBody] CreateBrandRequest request)
    {
        var validationResult = await _createValidator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            return BadRequest(ApiResponse<BrandDto>.Fail(
                "Validation failed",
                400,
                validationResult.Errors.Select(e => e.ErrorMessage).ToList()));
        }

        var brand = await _brandService.CreateBrandAsync(request);
        return CreatedAtAction(nameof(GetBrand), new { id = brand.Id },
            ApiResponse<BrandDto>.Created(brand, "Brand created successfully"));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<BrandDto>>> UpdateBrand(int id, [FromBody] UpdateBrandRequest request)
    {
        request.Id = id;

        var validationResult = await _updateValidator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            return BadRequest(ApiResponse<BrandDto>.Fail(
                "Validation failed",
                400,
                validationResult.Errors.Select(e => e.ErrorMessage).ToList()));
        }

        var brand = await _brandService.UpdateBrandAsync(request);
        return Ok(ApiResponse<BrandDto>.Success(brand, "Brand updated successfully"));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse>> DeleteBrand(int id)
    {
        var result = await _brandService.DeleteBrandAsync(id);
        if (!result)
        {
            return NotFound(ApiResponse.Fail("Brand not found"));
        }

        return Ok(ApiResponse.Success("Brand deleted successfully"));
    }

    [HttpPost("{id}/toggle-featured")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse>> ToggleFeatured(int id)
    {
        var result = await _brandService.ToggleFeaturedAsync(id);
        if (!result)
        {
            return NotFound(ApiResponse.Fail("Brand not found"));
        }

        return Ok(ApiResponse.Success("Featured status toggled successfully"));
    }
}
