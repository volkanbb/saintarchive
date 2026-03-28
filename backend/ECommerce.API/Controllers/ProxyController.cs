using Microsoft.AspNetCore.Mvc;
using System.Security.Cryptography;
using System.Text;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProxyController : ControllerBase
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<ProxyController> _logger;
    private readonly string _cachePath;

    public ProxyController(IHttpClientFactory httpClientFactory, ILogger<ProxyController> logger, IWebHostEnvironment env)
    {
        _httpClientFactory = httpClientFactory;
        _logger = logger;
        
        // Define cache path in the content root
        _cachePath = Path.Combine(env.ContentRootPath, "image_cache");
        if (!Directory.Exists(_cachePath))
        {
            Directory.CreateDirectory(_cachePath);
        }
    }

    [HttpGet("image")]
    public async Task<IActionResult> ProxyImage([FromQuery] string url)
    {
        if (string.IsNullOrEmpty(url)) return BadRequest("URL is required");

        // 1. Check Cache
        string cacheKey = GetCacheKey(url);
        string filePath = Path.Combine(_cachePath, cacheKey);

        if (System.IO.File.Exists(filePath))
        {
            // Serve from cache
            var cachedData = await System.IO.File.ReadAllBytesAsync(filePath);
            string cachedContentType = GetContentType(filePath);
            
            // Add caching headers for 7 days
            Response.Headers.Append("Cache-Control", "public, max-age=604800");
            return File(cachedData, cachedContentType);
        }

        _logger.LogInformation("Cache miss. Proxying image request for URL: {Url}", url);

        try
        {
            var client = _httpClientFactory.CreateClient();
            var uri = new Uri(url);
            var host = uri.Host;
            var username = uri.Segments.Length > 1 ? uri.Segments[1].Trim('/') : null;

            client.DefaultRequestHeaders.UserAgent.ParseAdd("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36");
            client.DefaultRequestHeaders.Accept.ParseAdd("image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8");
            client.DefaultRequestHeaders.Add("Sec-Fetch-Dest", "image");
            client.DefaultRequestHeaders.Add("Sec-Fetch-Mode", "no-cors");
            client.DefaultRequestHeaders.Add("Sec-Fetch-Site", "cross-site");
            client.DefaultRequestHeaders.Connection.Add("keep-alive");
            
            string referer = !string.IsNullOrEmpty(username) && !username.Equals("static", StringComparison.OrdinalIgnoreCase)
                ? $"https://{username}.x.yupoo.com/"
                : $"https://{host.Replace("photo.", "")}/";

            client.DefaultRequestHeaders.Referrer = new Uri(referer);
            
            var response = await client.GetAsync(url);
            if (!response.IsSuccessStatusCode) 
            {
                client.DefaultRequestHeaders.Referrer = new Uri("https://yupoo.com/");
                response = await client.GetAsync(url);
            }

            if (!response.IsSuccessStatusCode)
            {
                client.DefaultRequestHeaders.Referrer = new Uri("https://photo.yupoo.com/");
                response = await client.GetAsync(url);
            }

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Yupoo returned status {StatusCode} for URL {Url}", response.StatusCode, url);
                return StatusCode((int)response.StatusCode);
            }

            var content = await response.Content.ReadAsByteArrayAsync();
            var contentType = response.Content.Headers.ContentType?.ToString() ?? "image/jpeg";

            // 2. Save to Cache
            try
            {
                await System.IO.File.WriteAllBytesAsync(filePath, content);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to write image to cache: {FilePath}", filePath);
            }

            Response.Headers.Append("Cache-Control", "public, max-age=604800");
            return File(content, contentType);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error proxying image for {Url}", url);
            return StatusCode(500, ex.Message);
        }
    }

    private string GetCacheKey(string url)
    {
        using var sha256 = SHA256.Create();
        var hash = sha256.ComputeHash(Encoding.UTF8.GetBytes(url));
        return Convert.ToHexString(hash).ToLower() + GetExtension(url);
    }

    private string GetExtension(string url)
    {
        var cleanUrl = url.Split('?')[0].ToLower();
        if (cleanUrl.EndsWith(".png")) return ".png";
        if (cleanUrl.EndsWith(".webp")) return ".webp";
        if (cleanUrl.EndsWith(".gif")) return ".gif";
        return ".jpg";
    }

    private string GetContentType(string filePath)
    {
        if (filePath.EndsWith(".png")) return "image/png";
        if (filePath.EndsWith(".webp")) return "image/webp";
        if (filePath.EndsWith(".gif")) return "image/gif";
        return "image/jpeg";
    }
}
