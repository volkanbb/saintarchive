namespace ECommerce.Application.DTOs.Import;

public class ConfirmImportRequest
{
    public Guid TempImportId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public Guid CategoryId { get; set; }
    public Guid? SubCategoryId { get; set; }
    public bool IsFeatured { get; set; }
    public List<string> SelectedImages { get; set; } = new();
    public string MainImage { get; set; } = string.Empty;
}
