using Microsoft.EntityFrameworkCore;
using ECommerce.Domain.Entities;

namespace ECommerce.Application.Interfaces;

public interface IAppDbContext
{
    DbSet<Category> Categories { get; set; }
    DbSet<Product> Products { get; set; }
    DbSet<ProductImage> ProductImages { get; set; }
    DbSet<TempImportedProduct> TempImportedProducts { get; set; }
    DbSet<SystemSetting> SystemSettings { get; set; }
    DbSet<YupooScrapeTask> YupooScrapeTasks { get; set; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
