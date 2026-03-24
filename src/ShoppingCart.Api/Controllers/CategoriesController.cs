using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShoppingCart.Application.DTOs.Categories;
using ShoppingCart.Application.Interfaces.Services;
using ShoppingCart.Shared.Common;

namespace ShoppingCart.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryService _categoryService;
    private readonly IValidator<CreateCategoryRequest> _createValidator;
    private readonly IValidator<UpdateCategoryRequest> _updateValidator;

    public CategoriesController(
        ICategoryService categoryService,
        IValidator<CreateCategoryRequest> createValidator,
        IValidator<UpdateCategoryRequest> updateValidator)
    {
        _categoryService = categoryService;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<CategoryDto>>>> GetCategories(
        [FromQuery] int pageIndex = 0,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null)
    {
        var categories = await _categoryService.GetCategoriesAsync(pageIndex, pageSize, search);
        return Ok(ApiResponse<PagedResult<CategoryDto>>.Success(categories));
    }

    [HttpGet("all")]
    public async Task<ActionResult<ApiResponse<List<CategoryListDto>>>> GetAllCategories()
    {
        var categories = await _categoryService.GetAllCategoriesAsync();
        return Ok(ApiResponse<List<CategoryListDto>>.Success(categories));
    }

    [HttpGet("tree")]
    public async Task<ActionResult<ApiResponse<List<CategoryDto>>>> GetCategoryTree()
    {
        var categories = await _categoryService.GetCategoryTreeAsync();
        return Ok(ApiResponse<List<CategoryDto>>.Success(categories));
    }

    [HttpGet("featured")]
    public async Task<ActionResult<ApiResponse<List<CategoryDto>>>> GetFeaturedCategories()
    {
        var categories = await _categoryService.GetFeaturedCategoriesAsync();
        return Ok(ApiResponse<List<CategoryDto>>.Success(categories));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<CategoryDto>>> GetCategory(int id)
    {
        var category = await _categoryService.GetCategoryByIdAsync(id);
        if (category == null)
        {
            return NotFound(ApiResponse<CategoryDto>.NotFound("Category not found"));
        }

        return Ok(ApiResponse<CategoryDto>.Success(category));
    }

    [HttpGet("slug/{slug}")]
    public async Task<ActionResult<ApiResponse<CategoryDto>>> GetCategoryBySlug(string slug)
    {
        var category = await _categoryService.GetCategoryBySlugAsync(slug);
        if (category == null)
        {
            return NotFound(ApiResponse<CategoryDto>.NotFound("Category not found"));
        }

        return Ok(ApiResponse<CategoryDto>.Success(category));
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<CategoryDto>>> CreateCategory([FromBody] CreateCategoryRequest request)
    {
        var validationResult = await _createValidator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            return BadRequest(ApiResponse<CategoryDto>.Fail(
                "Validation failed",
                400,
                validationResult.Errors.Select(e => e.ErrorMessage).ToList()));
        }

        var category = await _categoryService.CreateCategoryAsync(request);
        return CreatedAtAction(nameof(GetCategory), new { id = category.Id },
            ApiResponse<CategoryDto>.Created(category, "Category created successfully"));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<CategoryDto>>> UpdateCategory(int id, [FromBody] UpdateCategoryRequest request)
    {
        request.Id = id;

        var validationResult = await _updateValidator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            return BadRequest(ApiResponse<CategoryDto>.Fail(
                "Validation failed",
                400,
                validationResult.Errors.Select(e => e.ErrorMessage).ToList()));
        }

        var category = await _categoryService.UpdateCategoryAsync(request);
        return Ok(ApiResponse<CategoryDto>.Success(category, "Category updated successfully"));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse>> DeleteCategory(int id)
    {
        var result = await _categoryService.DeleteCategoryAsync(id);
        if (!result)
        {
            return NotFound(ApiResponse.Fail("Category not found"));
        }

        return Ok(ApiResponse.Success("Category deleted successfully"));
    }

    [HttpPost("{id}/toggle-featured")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse>> ToggleFeatured(int id)
    {
        var result = await _categoryService.ToggleFeaturedAsync(id);
        if (!result)
        {
            return NotFound(ApiResponse.Fail("Category not found"));
        }

        return Ok(ApiResponse.Success("Featured status toggled successfully"));
    }

    [HttpPost("reorder")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse>> ReorderCategories([FromBody] List<(int Id, int DisplayOrder)> orders)
    {
        var result = await _categoryService.ReorderCategoriesAsync(orders);
        if (!result)
        {
            return BadRequest(ApiResponse.Fail("Failed to reorder categories"));
        }

        return Ok(ApiResponse.Success("Categories reordered successfully"));
    }
}
