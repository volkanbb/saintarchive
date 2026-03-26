namespace ECommerce.Domain.Entities;

public class TempImportedProduct : BaseEntity
{
    public string OriginalUrl { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    
    // We can store images as JSON string for temporary preview,
    // or create a separate table. JSON is easier for temp storage.
    public string ImagesJson { get; set; } = string.Empty;
    
    public bool IsProcessed { get; set; }
}
