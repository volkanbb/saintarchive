namespace ECommerce.Application.DTOs.Products;

public class ProductDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public Guid CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public Guid? SubCategoryId { get; set; }
    public string? SubCategoryName { get; set; }
    public bool IsFeatured { get; set; }
    public List<ProductImageDto> Images { get; set; } = new();
}
