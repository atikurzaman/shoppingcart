using Microsoft.EntityFrameworkCore;
using ShoppingCart.Application.DTOs.Users;
using ShoppingCart.Application.Interfaces.Auth;
using ShoppingCart.Application.Interfaces.Services;
using ShoppingCart.Domain.Entities;
using ShoppingCart.Persistence.Data;
using ShoppingCart.Shared.Common;
using ShoppingCart.Shared.Exceptions;
using Mapster;

namespace ShoppingCart.Application.Services;

public class UserService : IUserService
{
    private readonly AppDbContext _context;
    private readonly IPasswordService _passwordService;

    public UserService(AppDbContext context, IPasswordService passwordService)
    {
        _context = context;
        _passwordService = passwordService;
    }

    public async Task<PagedResult<UserDto>> GetUsersAsync(int pageIndex, int pageSize, string? search = null, string? role = null)
    {
        var query = _context.Users
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .Include(u => u.Customer)
            .Where(u => !u.IsDeleted)
            .AsQueryable();

        if (!string.IsNullOrEmpty(search))
            query = query.Where(u => u.Email.Contains(search) || u.FirstName.Contains(search) || u.LastName.Contains(search));

        if (!string.IsNullOrEmpty(role))
            query = query.Where(u => u.UserRoles.Any(ur => ur.Role.Name == role));

        var totalCount = await query.CountAsync();
        var users = await query
            .OrderBy(u => u.Email)
            .Skip(pageIndex * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResult<UserDto>(users.Adapt<List<UserDto>>(), totalCount, pageIndex, pageSize);
    }

    public async Task<UserDto?> GetUserByIdAsync(int id)
    {
        var user = await _context.Users
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .Include(u => u.Customer)
            .FirstOrDefaultAsync(u => u.Id == id && !u.IsDeleted);

        return user?.Adapt<UserDto>();
    }

    public async Task<UserDto> CreateUserAsync(CreateUserRequest request)
    {
        var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());
        if (existingUser != null)
            throw new ConflictException("Email already exists");

        var user = new User
        {
            Email = request.Email,
            PasswordHash = _passwordService.HashPassword(request.Password),
            FirstName = request.FirstName,
            LastName = request.LastName,
            PhoneNumber = request.PhoneNumber,
            Status = Domain.Enums.UserStatus.Active,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "system"
        };

        foreach (var roleName in request.Roles)
        {
            var role = await _context.Roles.FirstOrDefaultAsync(r => r.Name == roleName);
            if (role != null)
                user.UserRoles.Add(new UserRole { RoleId = role.Id, AssignedAt = DateTime.UtcNow });
        }

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return (await GetUserByIdAsync(user.Id))!;
    }

    public async Task<UserDto> UpdateUserAsync(UpdateUserRequest request)
    {
        var user = await _context.Users
            .Include(u => u.UserRoles)
            .FirstOrDefaultAsync(u => u.Id == request.Id && !u.IsDeleted)
            ?? throw new NotFoundException("User not found");

        user.FirstName = request.FirstName;
        user.LastName = request.LastName;
        user.PhoneNumber = request.PhoneNumber;
        user.AvatarUrl = request.AvatarUrl;
        user.Status = Enum.Parse<Domain.Enums.UserStatus>(request.Status);
        user.UpdatedAt = DateTime.UtcNow;
        user.UpdatedBy = "system";

        user.UserRoles.Clear();
        foreach (var roleName in request.Roles)
        {
            var role = await _context.Roles.FirstOrDefaultAsync(r => r.Name == roleName);
            if (role != null)
                user.UserRoles.Add(new UserRole { UserId = user.Id, RoleId = role.Id, AssignedAt = DateTime.UtcNow });
        }

        await _context.SaveChangesAsync();
        return (await GetUserByIdAsync(user.Id))!;
    }

    public async Task<bool> DeleteUserAsync(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return false;
        user.IsDeleted = true;
        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ActivateUserAsync(int id)
    {
        var user = await _context.Users.FindAsync(id) ?? throw new NotFoundException("User not found");
        user.Status = Domain.Enums.UserStatus.Active;
        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeactivateUserAsync(int id)
    {
        var user = await _context.Users.FindAsync(id) ?? throw new NotFoundException("User not found");
        user.Status = Domain.Enums.UserStatus.Inactive;
        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }
}

public class RoleService : IRoleService
{
    private readonly AppDbContext _context;

    public RoleService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<RoleDto>> GetRolesAsync(int pageIndex, int pageSize)
    {
        var query = _context.Roles.Include(r => r.UserRoles).Where(r => !r.IsDeleted);
        var totalCount = await query.CountAsync();
        var roles = await query.OrderBy(r => r.Name).Skip(pageIndex * pageSize).Take(pageSize).ToListAsync();

        return new PagedResult<RoleDto>(roles.Select(r => new RoleDto
        {
            Id = r.Id,
            Name = r.Name,
            Description = r.Description,
            IsActive = r.IsActive,
            UserCount = r.UserRoles.Count,
            CreatedAt = r.CreatedAt
        }).ToList(), totalCount, pageIndex, pageSize);
    }

    public async Task<RoleDto?> GetRoleByIdAsync(int id)
    {
        var role = await _context.Roles.Include(r => r.UserRoles).FirstOrDefaultAsync(r => r.Id == id && !r.IsDeleted);
        if (role == null) return null;

        return new RoleDto
        {
            Id = role.Id,
            Name = role.Name,
            Description = role.Description,
            IsActive = role.IsActive,
            UserCount = role.UserRoles.Count,
            CreatedAt = role.CreatedAt
        };
    }

    public async Task<RoleDto> CreateRoleAsync(CreateRoleRequest request)
    {
        var role = new Role
        {
            Name = request.Name,
            Description = request.Description,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "system"
        };

        _context.Roles.Add(role);
        await _context.SaveChangesAsync();

        return (await GetRoleByIdAsync(role.Id))!;
    }

    public async Task<RoleDto> UpdateRoleAsync(UpdateRoleRequest request)
    {
        var role = await _context.Roles.FindAsync(request.Id) ?? throw new NotFoundException("Role not found");
        role.Name = request.Name;
        role.Description = request.Description;
        role.IsActive = request.IsActive;
        role.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return (await GetRoleByIdAsync(role.Id))!;
    }

    public async Task<bool> DeleteRoleAsync(int id)
    {
        var role = await _context.Roles.FindAsync(id);
        if (role == null) return false;
        role.IsDeleted = true;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<List<RoleDto>> GetAllRolesAsync()
    {
        var roles = await _context.Roles
            .Include(r => r.UserRoles)
            .Where(r => !r.IsDeleted && r.IsActive)
            .OrderBy(r => r.Name)
            .ToListAsync();

        return roles.Select(r => new RoleDto
        {
            Id = r.Id,
            Name = r.Name,
            Description = r.Description,
            IsActive = r.IsActive,
            UserCount = r.UserRoles.Count,
            CreatedAt = r.CreatedAt
        }).ToList();
    }

    public Task<bool> AssignPermissionsToRoleAsync(int roleId, List<string> permissions)
    {
        return Task.FromResult(true);
    }
}
