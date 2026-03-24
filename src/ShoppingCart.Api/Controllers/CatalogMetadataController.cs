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
public class CatalogMetadataController : ControllerBase
{
    private readonly AppDbContext _context;

    public CatalogMetadataController(AppDbContext context)
    {
        _context = context;
    }

    // Units
    [HttpGet("units")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<List<Unit>>>> GetUnits()
    {
        var units = await _context.Units.ToListAsync();
        return Ok(ApiResponse<List<Unit>>.Success(units));
    }

    [HttpPost("units")]
    public async Task<ActionResult<ApiResponse<Unit>>> CreateUnit([FromBody] Unit unit)
    {
        _context.Units.Add(unit);
        await _context.SaveChangesAsync();
        return Ok(ApiResponse<Unit>.Created(unit, "Unit created successfully"));
    }

    // Collections
    [HttpGet("collections")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<List<ProductCollection>>>> GetCollections()
    {
        var collections = await _context.ProductCollections
            .Include(c => c.Items)
            .ToListAsync();
        return Ok(ApiResponse<List<ProductCollection>>.Success(collections));
    }

    [HttpPost("collections")]
    public async Task<ActionResult<ApiResponse<ProductCollection>>> CreateCollection([FromBody] ProductCollection collection)
    {
        _context.ProductCollections.Add(collection);
        await _context.SaveChangesAsync();
        return Ok(ApiResponse<ProductCollection>.Created(collection, "Collection created successfully"));
    }

    // Attributes
    [HttpGet("attributes")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<List<ProductAttribute>>>> GetAttributes()
    {
        var attributes = await _context.ProductAttributes.ToListAsync();
        return Ok(ApiResponse<List<ProductAttribute>>.Success(attributes));
    }

    [HttpPost("attributes")]
    public async Task<ActionResult<ApiResponse<ProductAttribute>>> CreateAttribute([FromBody] ProductAttribute attribute)
    {
        _context.ProductAttributes.Add(attribute);
        await _context.SaveChangesAsync();
        return Ok(ApiResponse<ProductAttribute>.Created(attribute, "Attribute created successfully"));
    }

    // Colors
    [HttpGet("colors")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<List<Color>>>> GetColors()
    {
        var colors = await _context.Colors.ToListAsync();
        return Ok(ApiResponse<List<Color>>.Success(colors));
    }

    [HttpPost("colors")]
    public async Task<ActionResult<ApiResponse<Color>>> CreateColor([FromBody] Color color)
    {
        _context.Colors.Add(color);
        await _context.SaveChangesAsync();
        return Ok(ApiResponse<Color>.Created(color, "Color created successfully"));
    }

    // Tags
    [HttpGet("tags")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<List<Tag>>>> GetTags()
    {
        var tags = await _context.Tags.ToListAsync();
        return Ok(ApiResponse<List<Tag>>.Success(tags));
    }
}
