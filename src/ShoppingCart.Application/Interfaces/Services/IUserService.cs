using ShoppingCart.Application.DTOs.Users;
using ShoppingCart.Shared.Common;

namespace ShoppingCart.Application.Interfaces.Services;

public interface IUserService
{
    Task<PagedResult<UserDto>> GetUsersAsync(int pageIndex, int pageSize, string? search = null, string? role = null);
    Task<UserDto?> GetUserByIdAsync(int id);
    Task<UserDto> CreateUserAsync(CreateUserRequest request);
    Task<UserDto> UpdateUserAsync(UpdateUserRequest request);
    Task<bool> DeleteUserAsync(int id);
    Task<bool> ActivateUserAsync(int id);
    Task<bool> DeactivateUserAsync(int id);
}

public interface IRoleService
{
    Task<PagedResult<RoleDto>> GetRolesAsync(int pageIndex, int pageSize);
    Task<List<RoleDto>> GetAllRolesAsync();
    Task<RoleDto?> GetRoleByIdAsync(int id);
    Task<RoleDto> CreateRoleAsync(CreateRoleRequest request);
    Task<RoleDto> UpdateRoleAsync(UpdateRoleRequest request);
    Task<bool> DeleteRoleAsync(int id);
    Task<bool> AssignPermissionsToRoleAsync(int roleId, List<string> permissions);
}
