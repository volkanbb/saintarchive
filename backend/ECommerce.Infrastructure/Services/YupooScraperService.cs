using ECommerce.Application.Interfaces;
using Microsoft.Playwright;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace ECommerce.Infrastructure.Services;

public class YupooScraperService : IYupooScraperService, IDisposable
{
    private readonly BrowserTypeLaunchOptions _launchOptions = new()
    {
        Headless = true,
        Args = new[] { "--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--disable-software-rasterizer" }
    };

    private static IPlaywright? _playwright;
    private static IBrowser? _browser;
    private static readonly SemaphoreSlim _initializationSemaphore = new(1, 1);
    private bool _disposed = false;

    private async Task<IBrowser> GetBrowserAsync()
    {
        if (_browser != null && _browser.IsConnected)
            return _browser;

        await _initializationSemaphore.WaitAsync();
        try
        {
            if (_browser != null && _browser.IsConnected)
                return _browser;

            if (_playwright == null)
                _playwright = await Playwright.CreateAsync();

            _browser = await _playwright.Chromium.LaunchAsync(_launchOptions);
            return _browser;
        }
        finally
        {
            _initializationSemaphore.Release();
        }
    }

    public async Task<List<string>> ScrapeCategoryAsync(string categoryUrl, CancellationToken cancellationToken = default)
    {
        var albumUrls = new List<string>();
        var browser = await GetBrowserAsync();
        var page = await browser.NewPageAsync();

        try
        {
            var currentUrl = categoryUrl;
            int pageCount = 0;
            const int maxPages = 50; 

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
                        let distance = 1000;
                        let timer = setInterval(() => {
                            let scrollHeight = document.body.scrollHeight;
                            window.scrollBy(0, distance);
                            totalHeight += distance;
                            if(totalHeight >= scrollHeight || totalHeight > 15000){
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
        finally
        {
            await page.CloseAsync();
        }
        return albumUrls;
    }

    public async Task ScrapeBulkAsync(IEnumerable<string> urls, Func<ScrapedProductInfo, Task> onProductScraped, int maxConcurrency = 3, CancellationToken ct = default)
    {
        var browser = await GetBrowserAsync();
        
        // Use a smaller degree of parallelism to keep the server responsive
        await Parallel.ForEachAsync(urls, new ParallelOptions { MaxDegreeOfParallelism = maxConcurrency, CancellationToken = ct }, async (url, token) =>
        {
            // Context per task to isolate cookies/cache if needed
            var context = await browser.NewContextAsync();
            var page = await context.NewPageAsync();
            try
            {
                var info = await ScrapeProductInternalAsync(page, url);
                if (info != null && !string.IsNullOrEmpty(info.Title))
                {
                    await onProductScraped(info);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Scraper] Bulk operation failed for {url}: {ex.Message}");
            }
            finally
            {
                await page.CloseAsync();
                await context.CloseAsync();
            }
        });
    }

    public async Task<List<ScrapedProductInfo>> ScrapeCategoryWithProductsAsync(string categoryUrl, CancellationToken cancellationToken = default)
    {
        var products = new ConcurrentBag<ScrapedProductInfo>();
        var albumUrls = await ScrapeCategoryAsync(categoryUrl, cancellationToken);
        if (albumUrls.Count == 0) return products.ToList();

        // Optimized concurrency for full category pull
        await ScrapeBulkAsync(albumUrls.Take(3000), (info) =>
        {
            products.Add(info);
            return Task.CompletedTask;
        }, maxConcurrency: 3, ct: cancellationToken);

        return products.ToList();
    }

    public async Task<ScrapedProductInfo> ScrapeProductAsync(string yupooUrl, CancellationToken cancellationToken = default)
    {
        var browser = await GetBrowserAsync();
        var page = await browser.NewPageAsync();
        try
        {
            return await ScrapeProductInternalAsync(page, yupooUrl);
        }
        finally
        {
            await page.CloseAsync();
        }
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
            
            // Scroll to the bottom to trigger lazy-loaded images
            await page.EvaluateAsync(@"async () => {
                await new Promise((resolve) => {
                    let totalHeight = 0;
                    let distance = 1000;
                    let timer = setInterval(() => {
                        let scrollHeight = document.body.scrollHeight;
                        window.scrollBy(0, distance);
                        totalHeight += distance;
                        if(totalHeight >= scrollHeight || totalHeight > 15000){
                            clearInterval(timer);
                            resolve();
                        }
                    }, 100);
                });
            }");

            await page.WaitForLoadStateAsync(LoadState.DOMContentLoaded);
            await Task.Delay(300); // Minimal buffer

            var titleElement = await page.QuerySelectorAsync(".showalbumheader__gallerytitle, .showindex__title");
            var rawTitle = titleElement != null ? (await titleElement.InnerTextAsync()).Trim() : (await page.TitleAsync()).Replace(" - Yupoo", "").Trim();
            result.Title = CleanTitle(rawTitle);

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
                    if (src.StartsWith("//")) src = "https:" + src;
                    else if (src.StartsWith("/")) src = $"https://{host}{src}";
                    else if (!src.Contains("://")) src = $"https://{host}/{src}";

                    if (src.Contains("yupoo.com"))
                    {
                        src = src.Replace("_small.", "_big.")
                                 .Replace("_medium.", "_big.")
                                 .Replace("_square.", "_big.");
                    }

                    var lowerSrc = src.ToLower();
                    bool hasValidExtension = lowerSrc.EndsWith(".jpg") || lowerSrc.EndsWith(".jpeg") || 
                                           lowerSrc.EndsWith(".png") || lowerSrc.EndsWith(".webp");
                    
                    if (!hasValidExtension) continue;

                    string[] strictJunk = { 
                        "logo", "icon", "avatar", "static", "user", "banner", "btn", "button", "contact", 
                        "whatsapp", "wechat", "notice", "rules", "shipping", "return", "homepage"
                    };
                    bool isStrictJunk = strictJunk.Any(k => lowerSrc.Contains(k));
                    
                    bool isMetaJunk = System.Text.RegularExpressions.Regex.IsMatch(lowerSrc, 
                        @"[_-](size|chart|table|tablo|beden|olcu|measure|dimen|guide|spec|chizhi|chicun|guige|[\u4e00-\u9fa5])[._-]", 
                        System.Text.RegularExpressions.RegexOptions.IgnoreCase);
                    
                    if (isStrictJunk || isMetaJunk) continue;

                    bool isYupooImage = src.Contains("yupoo.com") || src.Contains("/album/");
                    if (!isYupooImage) continue;

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
            var cleanUrl = url.Split('?')[0];
            var parts = cleanUrl.Split('/');
            if (parts.Length >= 2)
            {
                return parts[parts.Length - 2];
            }
            return cleanUrl.ToLower();
        }
        catch { return url.ToLower(); }
    }

    private string CleanTitle(string title)
    {
        if (string.IsNullOrEmpty(title)) return title;
        string cleaned = System.Text.RegularExpressions.Regex.Replace(title, 
            @"(\d+\s*[¥￥\u00A5\uffe5]|(?:[¥￥\u00A5\uffe5])\s*\d+|\d+\s*(?:yuan|rmb))", 
            "", 
            System.Text.RegularExpressions.RegexOptions.IgnoreCase);
        cleaned = System.Text.RegularExpressions.Regex.Replace(cleaned, @"[\u4e00-\u9fa5]+", "");
        cleaned = System.Text.RegularExpressions.Regex.Replace(cleaned, @"\s+", " ").Trim();
        cleaned = cleaned.Trim('-', '|', ' ', '：', ':', '[', ']', '(', ')', '{', '}');
        return string.IsNullOrEmpty(cleaned) ? title : cleaned;
    }

    public void Dispose()
    {
        if (!_disposed)
        {
            _browser?.CloseAsync().Wait();
            _playwright?.Dispose();
            _disposed = true;
        }
    }
}
