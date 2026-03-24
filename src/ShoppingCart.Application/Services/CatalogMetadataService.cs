using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ShoppingCart.Application.Interfaces.Services;
using ShoppingCart.Domain.Entities;
using ShoppingCart.Persistence.Data;

namespace ShoppingCart.Application.Services;

public class CatalogMetadataService : ICatalogMetadataService
{
    private readonly AppDbContext _context;

    public CatalogMetadataService(AppDbContext context)
    {
        _context = context;
    }

    // Units
    public async Task<List<Unit>> GetAllUnitsAsync() => await _context.Units.ToListAsync();
    public async Task<Unit?> GetUnitByIdAsync(int id) => await _context.Units.FindAsync(id);
    public async Task<Unit> CreateUnitAsync(Unit unit) 
    { 
        _context.Units.Add(unit); 
        await _context.SaveChangesAsync(); 
        return unit; 
    }
    public async Task<Unit> UpdateUnitAsync(Unit unit) 
    { 
        _context.Units.Update(unit); 
        await _context.SaveChangesAsync(); 
        return unit; 
    }
    public async Task<bool> DeleteUnitAsync(int id) 
    {
        var unit = await _context.Units.FindAsync(id);
        if (unit == null) return false;
        _context.Units.Remove(unit);
        await _context.SaveChangesAsync();
        return true;
    }

    // Colors
    public async Task<List<Color>> GetAllColorsAsync() => await _context.Colors.ToListAsync();
    public async Task<Color?> GetColorByIdAsync(int id) => await _context.Colors.FindAsync(id);
    public async Task<Color> CreateColorAsync(Color color) 
    { 
        _context.Colors.Add(color); 
        await _context.SaveChangesAsync(); 
        return color; 
    }
    public async Task<Color> UpdateColorAsync(Color color) 
    { 
        _context.Colors.Update(color); 
        await _context.SaveChangesAsync(); 
        return color; 
    }
    public async Task<bool> DeleteColorAsync(int id) 
    {
        var color = await _context.Colors.FindAsync(id);
        if (color == null) return false;
        _context.Colors.Remove(color);
        await _context.SaveChangesAsync();
        return true;
    }

    // Tags
    public async Task<List<Tag>> GetAllTagsAsync() => await _context.Tags.ToListAsync();
    public async Task<Tag?> GetTagByIdAsync(int id) => await _context.Tags.FindAsync(id);
    public async Task<Tag> CreateTagAsync(Tag tag) 
    { 
        _context.Tags.Add(tag); 
        await _context.SaveChangesAsync(); 
        return tag; 
    }
    public async Task<Tag> UpdateTagAsync(Tag tag) 
    { 
        _context.Tags.Update(tag); 
        await _context.SaveChangesAsync(); 
        return tag; 
    }
    public async Task<bool> DeleteTagAsync(int id) 
    {
        var tag = await _context.Tags.FindAsync(id);
        if (tag == null) return false;
        _context.Tags.Remove(tag);
        await _context.SaveChangesAsync();
        return true;
    }

    // Collections
    public async Task<List<ProductCollection>> GetAllCollectionsAsync() => await _context.ProductCollections.Include(c => c.Items).ToListAsync();
    public async Task<ProductCollection?> GetCollectionByIdAsync(int id) => await _context.ProductCollections.Include(c => c.Items).FirstOrDefaultAsync(c => c.Id == id);
    public async Task<ProductCollection> CreateCollectionAsync(ProductCollection collection) 
    { 
        _context.ProductCollections.Add(collection); 
        await _context.SaveChangesAsync(); 
        return collection; 
    }
    public async Task<ProductCollection> UpdateCollectionAsync(ProductCollection collection) 
    { 
        _context.ProductCollections.Update(collection); 
        await _context.SaveChangesAsync(); 
        return collection; 
    }
    public async Task<bool> DeleteCollectionAsync(int id) 
    {
        var collection = await _context.ProductCollections.FindAsync(id);
        if (collection == null) return false;
        _context.ProductCollections.Remove(collection);
        await _context.SaveChangesAsync();
        return true;
    }
}
