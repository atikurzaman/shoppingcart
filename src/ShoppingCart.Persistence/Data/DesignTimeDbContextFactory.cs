using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using ShoppingCart.Persistence.Data;

namespace ShoppingCart.Persistence.Data;

public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
        optionsBuilder.UseSqlServer("Server=.;Database=ShoppingCartDb;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true");
        
        return new AppDbContext(optionsBuilder.Options);
    }
}
