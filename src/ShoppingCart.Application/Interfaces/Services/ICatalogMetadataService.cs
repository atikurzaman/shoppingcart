using System.Collections.Generic;
using System.Threading.Tasks;
using ShoppingCart.Domain.Entities;

namespace ShoppingCart.Application.Interfaces.Services;

public interface ICatalogMetadataService
{
    // Units
    Task<List<Unit>> GetAllUnitsAsync();
    Task<Unit?> GetUnitByIdAsync(int id);
    Task<Unit> CreateUnitAsync(Unit unit);
    Task<Unit> UpdateUnitAsync(Unit unit);
    Task<bool> DeleteUnitAsync(int id);

    // Colors
    Task<List<Color>> GetAllColorsAsync();
    Task<Color?> GetColorByIdAsync(int id);
    Task<Color> CreateColorAsync(Color color);
    Task<Color> UpdateColorAsync(Color color);
    Task<bool> DeleteColorAsync(int id);

    // Tags
    Task<List<Tag>> GetAllTagsAsync();
    Task<Tag?> GetTagByIdAsync(int id);
    Task<Tag> CreateTagAsync(Tag tag);
    Task<Tag> UpdateTagAsync(Tag tag);
    Task<bool> DeleteTagAsync(int id);

    // Collections
    Task<List<ProductCollection>> GetAllCollectionsAsync();
    Task<ProductCollection?> GetCollectionByIdAsync(int id);
    Task<ProductCollection> CreateCollectionAsync(ProductCollection collection);
    Task<ProductCollection> UpdateCollectionAsync(ProductCollection collection);
    Task<bool> DeleteCollectionAsync(int id);
}
