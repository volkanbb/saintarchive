namespace ECommerce.Application.Interfaces;

public class ScrapedProductInfo
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public List<string> ImageUrls { get; set; } = new();
}

public interface IYupooScraperService
{
    Task<ScrapedProductInfo> ScrapeProductAsync(string yupooUrl, CancellationToken cancellationToken = default);
    Task<ScrapedProductInfo> ScrapeProductWithPageAsync(IPage page, string url, CancellationToken cancellationToken = default);
    Task<List<string>> ScrapeCategoryAsync(string categoryUrl, CancellationToken cancellationToken = default);
    Task ScrapeBulkAsync(IEnumerable<string> urls, Func<ScrapedProductInfo, Task> onProductScraped, int maxConcurrency = 5, CancellationToken ct = default);
    Task<List<ScrapedProductInfo>> ScrapeCategoryWithProductsAsync(string categoryUrl, CancellationToken cancellationToken = default);
}
