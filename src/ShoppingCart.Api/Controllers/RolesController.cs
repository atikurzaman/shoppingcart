using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShoppingCart.Application.DTOs.Users;
using ShoppingCart.Application.Interfaces.Services;
using ShoppingCart.Shared.Common;

namespace ShoppingCart.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class RolesController : ControllerBase
{
    private readonly IRoleService _roleService;
    private readonly IValidator<CreateRoleRequest> _createValidator;
    private readonly IValidator<UpdateRoleRequest> _updateValidator;

    public RolesController(
        IRoleService roleService,
        IValidator<CreateRoleRequest> createValidator,
        IValidator<UpdateRoleRequest> updateValidator)
    {
        _roleService = roleService;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<RoleDto>>>> GetRoles(
        [FromQuery] int pageIndex = 0,
        [FromQuery] int pageSize = 20)
    {
        var roles = await _roleService.GetRolesAsync(pageIndex, pageSize);
        return Ok(ApiResponse<PagedResult<RoleDto>>.Success(roles));
    }

    [HttpGet("all")]
    public async Task<ActionResult<ApiResponse<List<RoleDto>>>> GetAllRoles()
    {
        var roles = await _roleService.GetAllRolesAsync();
        return Ok(ApiResponse<List<RoleDto>>.Success(roles));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<RoleDto>>> GetRole(int id)
    {
        var role = await _roleService.GetRoleByIdAsync(id);
        if (role == null)
        {
            return NotFound(ApiResponse<RoleDto>.NotFound("Role not found"));
        }

        return Ok(ApiResponse<RoleDto>.Success(role));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<RoleDto>>> CreateRole([FromBody] CreateRoleRequest request)
    {
        var validationResult = await _createValidator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            return BadRequest(ApiResponse<RoleDto>.Fail(
                "Validation failed",
                400,
                validationResult.Errors.Select(e => e.ErrorMessage).ToList()));
        }

        var role = await _roleService.CreateRoleAsync(request);
        return CreatedAtAction(nameof(GetRole), new { id = role.Id },
            ApiResponse<RoleDto>.Created(role, "Role created successfully"));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<RoleDto>>> UpdateRole(int id, [FromBody] UpdateRoleRequest request)
    {
        request.Id = id;

        var validationResult = await _updateValidator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            return BadRequest(ApiResponse<RoleDto>.Fail(
                "Validation failed",
                400,
                validationResult.Errors.Select(e => e.ErrorMessage).ToList()));
        }

        var role = await _roleService.UpdateRoleAsync(request);
        return Ok(ApiResponse<RoleDto>.Success(role, "Role updated successfully"));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse>> DeleteRole(int id)
    {
        var result = await _roleService.DeleteRoleAsync(id);
        if (!result)
        {
            return NotFound(ApiResponse.Fail("Role not found"));
        }

        return Ok(ApiResponse.Success("Role deleted successfully"));
    }

    [HttpPost("{id}/permissions")]
    public async Task<ActionResult<ApiResponse>> AssignPermissions(int id, [FromBody] List<string> permissions)
    {
        var result = await _roleService.AssignPermissionsToRoleAsync(id, permissions);
        if (!result)
        {
            return NotFound(ApiResponse.Fail("Role not found"));
        }

        return Ok(ApiResponse.Success("Permissions assigned successfully"));
    }
}
