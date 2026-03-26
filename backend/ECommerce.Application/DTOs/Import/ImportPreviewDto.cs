namespace ECommerce.Application.DTOs.Import;

public class ImportPreviewDto
{
    public Guid TempImportId { get; set; }
    public string OriginalUrl { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; } = 0;
    public List<string> Images { get; set; } = new();
}
