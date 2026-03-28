namespace ECommerce.Domain.Entities;

public class Product : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    
    public bool IsFeatured { get; set; }
    public int SortOrder { get; set; }
    
    public Guid CategoryId { get; set; }
    public Category Category { get; set; } = null!;

    public Guid? SubCategoryId { get; set; }
    public Category? SubCategory { get; set; }

    public string? OriginalUrl { get; set; }
    
    public ICollection<ProductImage> Images { get; set; } = new List<ProductImage>();
    public ICollection<Favorite> Favorites { get; set; } = new List<Favorite>();
    public ICollection<Size> Sizes { get; set; } = new List<Size>();
}
