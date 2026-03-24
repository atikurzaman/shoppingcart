using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShoppingCart.Domain.Entities;
using ShoppingCart.Persistence.Data;
using ShoppingCart.Shared.Common;

namespace ShoppingCart.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,Manager")]
public class VendorsController : ControllerBase
{
    private readonly AppDbContext _context;

    public VendorsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<object>>> GetSellers()
    {
        var sellers = await _context.Sellers.Include(s => s.User).ToListAsync();
        return Ok(ApiResponse<object>.Success(sellers));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<Seller>>> CreateSeller(Seller seller)
    {
        _context.Sellers.Add(seller);
        await _context.SaveChangesAsync();
        return Ok(ApiResponse<Seller>.Success(seller));
    }
}
