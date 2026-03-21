using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShoppingCart.Application.DTOs.Products;
using ShoppingCart.Application.Interfaces.Services;
using ShoppingCart.Shared.Common;

namespace ShoppingCart.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VariantsController : ControllerBase
{
    private readonly IVariantService _variantService;

    public VariantsController(IVariantService variantService)
    {
        _variantService = variantService;
    }

    [HttpGet("product/{productId}")]
    public async Task<ActionResult<ApiResponse<List<ProductVariantDto>>>> GetVariantsByProduct(int productId)
    {
        var variants = await _variantService.GetVariantsByProductIdAsync(productId);
        return Ok(ApiResponse<List<ProductVariantDto>>.Success(variants));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<ProductVariantDto>>> GetVariant(int id)
    {
        var variant = await _variantService.GetVariantByIdAsync(id);
        if (variant == null)
        {
            return NotFound(ApiResponse<ProductVariantDto>.NotFound("Variant not found"));
        }
        return Ok(ApiResponse<ProductVariantDto>.Success(variant));
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<ProductVariantDto>>> CreateVariant([FromBody] CreateVariantRequest request)
    {
        var variant = await _variantService.CreateVariantAsync(request);
        return CreatedAtAction(nameof(GetVariant), new { id = variant.Id },
            ApiResponse<ProductVariantDto>.Created(variant, "Variant created successfully"));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<ProductVariantDto>>> UpdateVariant(int id, [FromBody] UpdateVariantRequest request)
    {
        var variant = await _variantService.UpdateVariantAsync(id, request);
        return Ok(ApiResponse<ProductVariantDto>.Success(variant, "Variant updated successfully"));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse>> DeleteVariant(int id)
    {
        var result = await _variantService.DeleteVariantAsync(id);
        if (!result)
        {
            return NotFound(ApiResponse.Fail("Variant not found"));
        }
        return Ok(ApiResponse.Success("Variant deleted successfully"));
    }
}
