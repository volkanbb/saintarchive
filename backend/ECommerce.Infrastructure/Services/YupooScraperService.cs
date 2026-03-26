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
            const int maxPages = 15; // Increased safety limit for large categories

            while (!string.IsNullOrEmpty(currentUrl) && pageCount < maxPages)
            {
                if (cancellationToken.IsCancellationRequested) break;

                await page.GotoAsync(currentUrl, new PageGotoOptions { WaitUntil = WaitUntilState.Load, Timeout = 60000 });
                
                // Wait for either the album list OR an empty state / closed account message
                try {
                    await page.WaitForSelectorAsync(".album__main, .album3__main, .showindex__children a, .categories__children a, .empty-state, .empty__emptytitle, .empty__main", 
                        new PageWaitForSelectorOptions { Timeout = 15000 });
                } catch {
                    // If timeout, just proceed and check what we have
                }

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

    public async Task<List<ScrapedProductInfo>> ScrapeCategoryWithProductsAsync(string categoryUrl, CancellationToken cancellationToken = default)
    {
        var products = new List<ScrapedProductInfo>();
        var albumUrls = await ScrapeCategoryAsync(categoryUrl, cancellationToken);
        if (albumUrls.Count == 0) return products;

        using var playwright = await Playwright.CreateAsync();
        await using var browser = await playwright.Chromium.LaunchAsync(_launchOptions);
        var page = await browser.NewPageAsync();

        foreach (var url in albumUrls.Take(20)) // Limit to 20 for safety
        {
            if (cancellationToken.IsCancellationRequested) break;
            try
            {
                var info = await ScrapeProductInternalAsync(page, url);
                if (info != null && !string.IsNullOrEmpty(info.Title)) products.Add(info);
                // Tiny delay to be nice to Yupoo
                await Task.Delay(500, cancellationToken);
            }
            catch (Exception ex) { Console.WriteLine($"Error in bulk scrape for {url}: {ex.Message}"); }
        }

        return products;
    }

    public async Task<ScrapedProductInfo> ScrapeProductAsync(string yupooUrl, CancellationToken cancellationToken = default)
    {
        using var playwright = await Playwright.CreateAsync();
        await using var browser = await playwright.Chromium.LaunchAsync(_launchOptions);
        var page = await browser.NewPageAsync();
        return await ScrapeProductInternalAsync(page, yupooUrl);
    }

    private async Task<ScrapedProductInfo> ScrapeProductInternalAsync(IPage page, string url)
    {
        var result = new ScrapedProductInfo { Url = url };
        try
        {
            await page.GotoAsync(url, new PageGotoOptions { WaitUntil = WaitUntilState.Load, Timeout = 60000 });
            
            // Scroll to the bottom to trigger lazy-loaded images - IMPROVED
            await page.EvaluateAsync(@"async () => {
                await new Promise((resolve) => {
                    let totalHeight = 0;
                    let distance = 600;
                    let timer = setInterval(() => {
                        let scrollHeight = document.body.scrollHeight;
                        window.scrollBy(0, distance);
                        totalHeight += distance;
                        
                        // If we reached the bottom or a very large height
                        if(totalHeight >= scrollHeight || totalHeight > 15000){
                            clearInterval(timer);
                            resolve();
                        }
                    }, 200);
                });
            }");

            // Wait for images to actually load
            await page.WaitForLoadStateAsync(LoadState.Load);
            await Task.Delay(2000); // Give it some extra time for dynamic elements

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
                    string[] strictJunk = { "logo", "icon", "avatar", "static", "user", "banner", "btn", "button", "contact", "whatsapp", "wechat", "notice", "rules", "shipping", "return" };
                    bool isStrictJunk = strictJunk.Any(k => lowerSrc.Contains(k));
                    
                    // Filter size charts only if clearly identified
                    bool isMetaJunk = System.Text.RegularExpressions.Regex.IsMatch(lowerSrc, @"[_-](size|chart|table|tablo|beden|olcu|measure|dimen|guide|spec)[._-]", System.Text.RegularExpressions.RegexOptions.IgnoreCase);
                    
                    if (isStrictJunk || isMetaJunk) continue;

                    // Specifically for Yupoo, we want photo.yupoo.com or the album images
                    bool isYupooImage = src.Contains("yupoo.com") || src.Contains("/album/");
                    if (!isYupooImage) continue;

                    // De-duplication using Base ID (ignores subdomain and size suffixes)
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
            var uri = new Uri(url);
            var path = uri.AbsolutePath.ToLower();
            
            // Remove common suffixes and extensions to get a clean ID
            // e.g. /user/123/img_small.jpg -> /user/123/img
            return System.Text.RegularExpressions.Regex.Replace(path, @"(_small|_medium|_square|_big)\.[a-z0-9]+$", "", System.Text.RegularExpressions.RegexOptions.IgnoreCase);
        }
        catch { return url; }
    }

    private string CleanTitle(string title)
    {
        if (string.IsNullOrEmpty(title)) return title;

        // Remove patterns like: 195¥, ￥195, 195yuan, 195rmb, etc.
        // Handles both standard and full-width currency symbols
        string cleaned = System.Text.RegularExpressions.Regex.Replace(title, 
            @"(\d+\s*[¥￥\u00A5\uffe5]|(?:[¥￥\u00A5\uffe5])\s*\d+|\d+\s*(?:yuan|rmb))", 
            "", 
            System.Text.RegularExpressions.RegexOptions.IgnoreCase);

        // Remove leftover double spaces and trim
        cleaned = System.Text.RegularExpressions.Regex.Replace(cleaned, @"\s+", " ").Trim();
        
        // Remove leading/trailing dashes or pipes that might be left over
        cleaned = cleaned.Trim('-', '|', ' ', '：', ':');

        return string.IsNullOrEmpty(cleaned) ? title : cleaned;
    }
}
