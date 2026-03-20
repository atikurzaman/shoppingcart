using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShoppingCart.Application.DTOs.Suppliers;
using ShoppingCart.Application.Interfaces.Services;
using ShoppingCart.Shared.Common;

namespace ShoppingCart.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SuppliersController : ControllerBase
{
    private readonly ISupplierService _supplierService;
    private readonly IValidator<CreateSupplierRequest> _createValidator;
    private readonly IValidator<UpdateSupplierRequest> _updateValidator;

    public SuppliersController(
        ISupplierService supplierService,
        IValidator<CreateSupplierRequest> createValidator,
        IValidator<UpdateSupplierRequest> updateValidator)
    {
        _supplierService = supplierService;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Manager,Staff")]
    public async Task<ActionResult<ApiResponse<PagedResult<SupplierDto>>>> GetSuppliers(
        [FromQuery] int pageIndex = 0,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null)
    {
        var suppliers = await _supplierService.GetSuppliersAsync(pageIndex, pageSize, search);
        return Ok(ApiResponse<PagedResult<SupplierDto>>.Success(suppliers));
    }

    [HttpGet("all")]
    public async Task<ActionResult<ApiResponse<List<SupplierListDto>>>> GetAllSuppliers()
    {
        var suppliers = await _supplierService.GetAllSuppliersAsync();
        return Ok(ApiResponse<List<SupplierListDto>>.Success(suppliers));
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "Admin,Manager,Staff")]
    public async Task<ActionResult<ApiResponse<SupplierDto>>> GetSupplier(int id)
    {
        var supplier = await _supplierService.GetSupplierByIdAsync(id);
        if (supplier == null)
        {
            return NotFound(ApiResponse<SupplierDto>.NotFound("Supplier not found"));
        }

        return Ok(ApiResponse<SupplierDto>.Success(supplier));
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<SupplierDto>>> CreateSupplier([FromBody] CreateSupplierRequest request)
    {
        var validationResult = await _createValidator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            return BadRequest(ApiResponse<SupplierDto>.Fail(
                "Validation failed",
                400,
                validationResult.Errors.Select(e => e.ErrorMessage).ToList()));
        }

        var supplier = await _supplierService.CreateSupplierAsync(request);
        return CreatedAtAction(nameof(GetSupplier), new { id = supplier.Id },
            ApiResponse<SupplierDto>.Created(supplier, "Supplier created successfully"));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<SupplierDto>>> UpdateSupplier(int id, [FromBody] UpdateSupplierRequest request)
    {
        request.Id = id;

        var validationResult = await _updateValidator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            return BadRequest(ApiResponse<SupplierDto>.Fail(
                "Validation failed",
                400,
                validationResult.Errors.Select(e => e.ErrorMessage).ToList()));
        }

        var supplier = await _supplierService.UpdateSupplierAsync(request);
        return Ok(ApiResponse<SupplierDto>.Success(supplier, "Supplier updated successfully"));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse>> DeleteSupplier(int id)
    {
        var result = await _supplierService.DeleteSupplierAsync(id);
        if (!result)
        {
            return NotFound(ApiResponse.Fail("Supplier not found"));
        }

        return Ok(ApiResponse.Success("Supplier deleted successfully"));
    }
}
