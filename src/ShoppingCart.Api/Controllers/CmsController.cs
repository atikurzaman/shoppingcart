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
public class CmsController : ControllerBase
{
    private readonly AppDbContext _context;

    public CmsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("blogs")]
    public async Task<ActionResult<ApiResponse<object>>> GetBlogs()
    {
        var blogs = await _context.Blogs.Include(b => b.Category).ToListAsync();
        return Ok(ApiResponse<object>.Success(blogs));
    }

    [HttpPost("blogs")]
    public async Task<ActionResult<ApiResponse<Blog>>> CreateBlog(Blog blog)
    {
        _context.Blogs.Add(blog);
        await _context.SaveChangesAsync();
        return Ok(ApiResponse<Blog>.Success(blog));
    }

    [HttpGet("pages")]
    public async Task<ActionResult<ApiResponse<object>>> GetPages()
    {
        var pages = await _context.StaticPages.ToListAsync();
        return Ok(ApiResponse<object>.Success(pages));
    }

    [HttpPost("pages")]
    public async Task<ActionResult<ApiResponse<StaticPage>>> CreatePage(StaticPage page)
    {
        _context.StaticPages.Add(page);
        await _context.SaveChangesAsync();
        return Ok(ApiResponse<StaticPage>.Success(page));
    }
}
