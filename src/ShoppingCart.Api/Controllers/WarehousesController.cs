using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShoppingCart.Application.DTOs.Warehouses;
using ShoppingCart.Application.Interfaces.Services;
using ShoppingCart.Shared.Common;

namespace ShoppingCart.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class WarehousesController : ControllerBase
{
    private readonly IWarehouseService _warehouseService;
    private readonly IValidator<CreateWarehouseRequest> _createValidator;
    private readonly IValidator<UpdateWarehouseRequest> _updateValidator;

    public WarehousesController(
        IWarehouseService warehouseService,
        IValidator<CreateWarehouseRequest> createValidator,
        IValidator<UpdateWarehouseRequest> updateValidator)
    {
        _warehouseService = warehouseService;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Manager,Staff")]
    public async Task<ActionResult<ApiResponse<PagedResult<WarehouseDto>>>> GetWarehouses(
        [FromQuery] int pageIndex = 0,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null)
    {
        var warehouses = await _warehouseService.GetWarehousesAsync(pageIndex, pageSize, search);
        return Ok(ApiResponse<PagedResult<WarehouseDto>>.Success(warehouses));
    }

    [HttpGet("all")]
    public async Task<ActionResult<ApiResponse<List<WarehouseListDto>>>> GetAllWarehouses()
    {
        var warehouses = await _warehouseService.GetAllWarehousesAsync();
        return Ok(ApiResponse<List<WarehouseListDto>>.Success(warehouses));
    }

    [HttpGet("main")]
    public async Task<ActionResult<ApiResponse<WarehouseDto>>> GetMainWarehouse()
    {
        var warehouse = await _warehouseService.GetMainWarehouseAsync();
        if (warehouse == null)
        {
            return NotFound(ApiResponse<WarehouseDto>.NotFound("Main warehouse not found"));
        }

        return Ok(ApiResponse<WarehouseDto>.Success(warehouse));
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "Admin,Manager,Staff")]
    public async Task<ActionResult<ApiResponse<WarehouseDto>>> GetWarehouse(int id)
    {
        var warehouse = await _warehouseService.GetWarehouseByIdAsync(id);
        if (warehouse == null)
        {
            return NotFound(ApiResponse<WarehouseDto>.NotFound("Warehouse not found"));
        }

        return Ok(ApiResponse<WarehouseDto>.Success(warehouse));
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<WarehouseDto>>> CreateWarehouse([FromBody] CreateWarehouseRequest request)
    {
        var validationResult = await _createValidator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            return BadRequest(ApiResponse<WarehouseDto>.Fail(
                "Validation failed",
                400,
                validationResult.Errors.Select(e => e.ErrorMessage).ToList()));
        }

        var warehouse = await _warehouseService.CreateWarehouseAsync(request);
        return CreatedAtAction(nameof(GetWarehouse), new { id = warehouse.Id },
            ApiResponse<WarehouseDto>.Created(warehouse, "Warehouse created successfully"));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<WarehouseDto>>> UpdateWarehouse(int id, [FromBody] UpdateWarehouseRequest request)
    {
        request.Id = id;

        var validationResult = await _updateValidator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            return BadRequest(ApiResponse<WarehouseDto>.Fail(
                "Validation failed",
                400,
                validationResult.Errors.Select(e => e.ErrorMessage).ToList()));
        }

        var warehouse = await _warehouseService.UpdateWarehouseAsync(request);
        return Ok(ApiResponse<WarehouseDto>.Success(warehouse, "Warehouse updated successfully"));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse>> DeleteWarehouse(int id)
    {
        var result = await _warehouseService.DeleteWarehouseAsync(id);
        if (!result)
        {
            return NotFound(ApiResponse.Fail("Warehouse not found"));
        }

        return Ok(ApiResponse.Success("Warehouse deleted successfully"));
    }
}
