namespace ECommerce.Application.DTOs.Products;

public class ProductImageDto
{
    public Guid Id { get; set; }
    public string Url { get; set; } = string.Empty;
    public bool IsMain { get; set; }
    public int SortOrder { get; set; }
}
