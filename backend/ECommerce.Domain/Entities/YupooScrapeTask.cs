using System.Text.Json;

namespace ECommerce.Domain.Entities;

public class YupooScrapeTask : BaseEntity
{
    public string TargetUrl { get; set; } = string.Empty;
    public string Status { get; set; } = "Pending"; // Pending, Processing, Completed, Failed
    public string? ErrorMessage { get; set; }
    public int TotalAlbums { get; set; }
    public int ProcessedAlbums { get; set; }
    public string? TempProductIdsJson { get; set; }

    public List<Guid> GetTempProductIds()
    {
        if (string.IsNullOrEmpty(TempProductIdsJson)) return new List<Guid>();
        return JsonSerializer.Deserialize<List<Guid>>(TempProductIdsJson) ?? new List<Guid>();
    }

    public void SetTempProductIds(List<Guid> ids)
    {
        TempProductIdsJson = JsonSerializer.Serialize(ids);
    }
}
