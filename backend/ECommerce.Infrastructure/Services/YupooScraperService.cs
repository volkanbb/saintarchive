using ECommerce.Application.Interfaces;
using Microsoft.Playwright;

namespace ECommerce.Infrastructure.Services;

public class YupooScraperService : IYupooScraperService
{
    private readonly BrowserTypeLaunchOptions _launchOptions = new()
    {
        Headless = true,
        Args = new[] { "--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--disable-software-rasterizer" }
    };

    public async Task<List<string>> ScrapeCategoryAsync(string categoryUrl, CancellationToken cancellationToken = default)
    {
        var albumUrls = new List<string>();
        using var playwright = await Playwright.CreateAsync();
        await using var browser = await playwright.Chromium.LaunchAsync(_launchOptions);
        var page = await browser.NewPageAsync();

        try
        {
            var currentUrl = categoryUrl;
            int pageCount = 0;
            const int maxPages = 50; // Increased to 50 for 2000+ products

            while (!string.IsNullOrEmpty(currentUrl) && pageCount < maxPages)
            {
                if (cancellationToken.IsCancellationRequested) break;

                // Block slow analytics/trackers to prevent timeouts
                await page.RouteAsync("**/*baidu.com*", route => route.AbortAsync());
                await page.RouteAsync("**/*googletagmanager.com*", route => route.AbortAsync());
                await page.RouteAsync("**/*doubleclick.net*", route => route.AbortAsync());

                await page.GotoAsync(currentUrl, new PageGotoOptions { WaitUntil = WaitUntilState.DOMContentLoaded, Timeout = 120000 });
                
                // Wait for the main album container
                try {
                    await page.WaitForSelectorAsync(".album__main, .album3__main, .showindex__children, .empty-state, .empty__main", 
                        new PageWaitForSelectorOptions { Timeout = 10000 });
                } catch { /* proceed and see what we have */ }

                // Check for "homepage closed" message
                var emptyTitle = await page.QuerySelectorAsync(".empty__emptytitle");
                if (emptyTitle != null)
                {
                    var text = await emptyTitle.InnerTextAsync();
                    if (text.Contains("temporarily closed") || text.Contains("kapalı"))
                    {
                        throw new KeyNotFoundException("This Yupoo account is temporarily closed or restricted.");
                    }
                }

                // SCROLL to ensure all lazy elements are rendered
                await page.EvaluateAsync(@"async () => {
                    await new Promise((resolve) => {
                        let totalHeight = 0;
                        let distance = 800;
                        let timer = setInterval(() => {
                            let scrollHeight = document.body.scrollHeight;
                            window.scrollBy(0, distance);
                            totalHeight += distance;
                            if(totalHeight >= scrollHeight || totalHeight > 10000){
                                clearInterval(timer);
                                resolve();
                            }
                        }, 100);
                    });
                }");
                
                var albumElements = await page.QuerySelectorAllAsync(".album__main, .album3__main, .showindex__children a, .categories__children a");
                foreach (var element in albumElements)
                {
                    var href = await element.GetAttributeAsync("href");
                    if (!string.IsNullOrEmpty(href))
                    {
                        var fullUrl = href.StartsWith("http") ? href : $"https://{new Uri(categoryUrl).Host}{href}";
                        if (!albumUrls.Contains(fullUrl)) albumUrls.Add(fullUrl);
                    }
                }

                // Check for next page
                var nextButton = await page.QuerySelectorAsync(".categories__box-right-pagination-button-next, a.next, .pagination__next");
                if (nextButton != null)
                {
                    var isDisabled = await nextButton.GetAttributeAsync("disabled");
                    var nextHref = await nextButton.GetAttributeAsync("href");

                    if (string.IsNullOrEmpty(isDisabled) && !string.IsNullOrEmpty(nextHref))
                    {
                        currentUrl = nextHref.StartsWith("http") ? nextHref : $"https://{new Uri(categoryUrl).Host}{nextHref}";
                        pageCount++;
                    }
                    else
                    {
                        currentUrl = null;
                    }
                }
                else
                {
                    currentUrl = null;
                }
            }
        }
        catch (KeyNotFoundException) { throw; }
        catch (Exception ex) 
        { 
            Console.WriteLine($"Error scraping Yupoo category: {ex.Message}"); 
            throw new Exception($"Scraping failed: {ex.Message}");
        }
        return albumUrls;
    }

    public async Task ScrapeBulkAsync(IEnumerable<string> urls, Func<ScrapedProductInfo, Task> onProductScraped, int maxConcurrency = 5, CancellationToken ct = default)
    {
        using var playwright = await Playwright.CreateAsync();
        await using var browser = await playwright.Chromium.LaunchAsync(_launchOptions);

        await Parallel.ForEachAsync(urls, new ParallelOptions { MaxDegreeOfParallelism = maxConcurrency, CancellationToken = ct }, async (url, token) =>
        {
            var page = await browser.NewPageAsync();
            try
            {
                var info = await ScrapeProductWithPageAsync(page, url, token);
                if (info != null && !string.IsNullOrEmpty(info.Title))
                {
                    await onProductScraped(info);
                }
            }
            finally
            {
                await page.CloseAsync();
            }
        });
    }

    public async Task<List<ScrapedProductInfo>> ScrapeCategoryWithProductsAsync(string categoryUrl, CancellationToken cancellationToken = default)

    public async Task<ScrapedProductInfo> ScrapeProductAsync(string yupooUrl, CancellationToken cancellationToken = default)
    {
        using var playwright = await Playwright.CreateAsync();
        await using var browser = await playwright.Chromium.LaunchAsync(_launchOptions);
        var page = await browser.NewPageAsync();
        return await ScrapeProductWithPageAsync(page, yupooUrl, cancellationToken);
    }

    public async Task<ScrapedProductInfo> ScrapeProductWithPageAsync(IPage page, string url, CancellationToken cancellationToken = default)
    {
        return await ScrapeProductInternalAsync(page, url);
    }

    private async Task<ScrapedProductInfo> ScrapeProductInternalAsync(IPage page, string url)
    {
        var result = new ScrapedProductInfo { Url = url };
        try
        {
            // Block slow analytics/trackers
            await page.RouteAsync("**/*baidu.com*", route => route.AbortAsync());
            await page.RouteAsync("**/*googletagmanager.com*", route => route.AbortAsync());
            
            await page.GotoAsync(url, new PageGotoOptions { WaitUntil = WaitUntilState.DOMContentLoaded, Timeout = 90000 });
            
            // Scroll to the bottom to trigger lazy-loaded images - OPTIMIZED for speed
            await page.EvaluateAsync(@"async () => {
                await new Promise((resolve) => {
                    let totalHeight = 0;
                    let distance = 800; // Increased distance
                    let timer = setInterval(() => {
                        let scrollHeight = document.body.scrollHeight;
                        window.scrollBy(0, distance);
                        totalHeight += distance;
                        
                        if(totalHeight >= scrollHeight || totalHeight > 10000){
                            clearInterval(timer);
                            resolve();
                        }
                    }, 100); // Shorter interval
                });
            }");

            // Wait for images - Reduced delay but ensuring DOM content is loaded
            await page.WaitForLoadStateAsync(LoadState.DOMContentLoaded);
            await Task.Delay(500); // Small buffer instead of 2000ms

            var titleElement = await page.QuerySelectorAsync(".showalbumheader__gallerytitle, .showindex__title");
            var rawTitle = titleElement != null ? (await titleElement.InnerTextAsync()).Trim() : (await page.TitleAsync()).Replace(" - Yupoo", "").Trim();
            result.Title = CleanTitle(rawTitle);

            // Broadened approach: Get ALL images and filter for Yupoo sources
            var allImages = await page.QuerySelectorAllAsync("img");
            var host = new Uri(url).Host;
            var seenBaseIds = new HashSet<string>();

            foreach (var img in allImages)
            {
                var src = await img.GetAttributeAsync("data-origin-src") ?? 
                          await img.GetAttributeAsync("data-src") ?? 
                          await img.GetAttributeAsync("src");
                
                if (!string.IsNullOrEmpty(src))
                {
                    // protocol handling
                    if (src.StartsWith("//")) src = "https:" + src;
                    else if (src.StartsWith("/")) src = $"https://{host}{src}";
                    else if (!src.Contains("://")) src = $"https://{host}/{src}";

                    // Yupoo Resolution Optimization: Try to get the highest resolution
                    // Yupoo patterns: _small.jpg -> _big.jpg, or removing suffixes
                    if (src.Contains("yupoo.com"))
                    {
                        // Replace common thumbnail suffixes with big version
                        src = src.Replace("_small.", "_big.")
                                 .Replace("_medium.", "_big.")
                                 .Replace("_square.", "_big.");
                    }

                    // Extension check
                    var lowerSrc = src.ToLower();
                    bool hasValidExtension = lowerSrc.EndsWith(".jpg") || lowerSrc.EndsWith(".jpeg") || 
                                           lowerSrc.EndsWith(".png") || lowerSrc.EndsWith(".webp");
                    
                    if (!hasValidExtension) continue;

                    // Keyword check for non-product assets (Size charts, logos, etc.)
                    string[] strictJunk = { 
                        "logo", "icon", "avatar", "static", "user", "banner", "btn", "button", "contact", 
                        "whatsapp", "wechat", "notice", "rules", "shipping", "return", "homepage"
                    };
                    bool isStrictJunk = strictJunk.Any(k => lowerSrc.Contains(k));
                    
                    // Filter size charts (English and Chinese: 尺寸, 尺码, 厘米, 表)
                    bool isMetaJunk = System.Text.RegularExpressions.Regex.IsMatch(lowerSrc, 
                        @"[_-](size|chart|table|tablo|beden|olcu|measure|dimen|guide|spec|chizhi|chicun|guige|[\u4e00-\u9fa5])[._-]", 
                        System.Text.RegularExpressions.RegexOptions.IgnoreCase);
                    
                    if (isStrictJunk || isMetaJunk) continue;

                    // Specifically for Yupoo, we want photo.yupoo.com or the album images
                    bool isYupooImage = src.Contains("yupoo.com") || src.Contains("/album/");
                    if (!isYupooImage) continue;

                    // De-duplication using Base ID (ignores subdomain and size suffixes)
                    // We use the parent folder ID segment as the unique identifier
                    var baseId = GetImageBaseId(src);
                    if (seenBaseIds.Contains(baseId)) continue;
                    seenBaseIds.Add(baseId);

                    if (!result.ImageUrls.Contains(src)) result.ImageUrls.Add(src);
                }
            }

            Console.WriteLine($"[Scraper] Found {result.ImageUrls.Count} unique images for: {result.Title}");
        }
        catch (Exception ex) { Console.WriteLine($"[Scraper] Error scraping product {url}: {ex.Message}"); }
        return result;
    }

    private string GetImageBaseId(string url)
    {
        try
        {
            // Remove query parameters first
            var cleanUrl = url.Split('?')[0];
            var parts = cleanUrl.Split('/');
            
            // Yupoo patterns: photo.yupoo.com/user/ID_SEGMENT/FILENAME.jpg
            if (parts.Length >= 2)
            {
                // The segment immediately before the filename is the stable asset ID
                return parts[parts.Length - 2];
            }
            return cleanUrl.ToLower();
        }
        catch { return url.ToLower(); }
    }

    private string CleanTitle(string title)
    {
        if (string.IsNullOrEmpty(title)) return title;

        // 1. Remove price patterns (195¥, ￥195, 200rmb, etc.)
        // Handles both standard and full-width currency symbols
        string cleaned = System.Text.RegularExpressions.Regex.Replace(title, 
            @"(\d+\s*[¥￥\u00A5\uffe5]|(?:[¥￥\u00A5\uffe5])\s*\d+|\d+\s*(?:yuan|rmb))", 
            "", 
            System.Text.RegularExpressions.RegexOptions.IgnoreCase);

        // 2. Remove Chinese characters (CJK range)
        cleaned = System.Text.RegularExpressions.Regex.Replace(cleaned, @"[\u4e00-\u9fa5]+", "");

        // 3. Final cleanup of spaces and punctuation
        cleaned = System.Text.RegularExpressions.Regex.Replace(cleaned, @"\s+", " ").Trim();
        cleaned = cleaned.Trim('-', '|', ' ', '：', ':', '[', ']', '(', ')', '{', '}');

        return string.IsNullOrEmpty(cleaned) ? title : cleaned;
    }
}
