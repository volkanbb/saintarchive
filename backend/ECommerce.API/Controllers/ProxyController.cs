using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProxyController : ControllerBase
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<ProxyController> _logger;

    public ProxyController(IHttpClientFactory httpClientFactory, ILogger<ProxyController> logger)
    {
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    [HttpGet("image")]
    public async Task<IActionResult> ProxyImage([FromQuery] string url)
    {
        if (string.IsNullOrEmpty(url)) return BadRequest("URL is required");

        _logger.LogInformation("Proxying image request for URL: {Url}", url);

        try
        {
            var client = _httpClientFactory.CreateClient();
            
            // Extract host and username to be more specific with headers
            var uri = new Uri(url);
            var host = uri.Host;
            // Yupoo photo URLs are usually https://photo.yupoo.com/USERNAME/ALBUM_ID/IMAGE_ID.jpg
            var username = uri.Segments.Length > 1 ? uri.Segments[1].Trim('/') : null;

            // Set headers to mimic a modern browser
            client.DefaultRequestHeaders.UserAgent.ParseAdd("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36");
            client.DefaultRequestHeaders.Accept.ParseAdd("image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8");
            client.DefaultRequestHeaders.Add("Sec-Fetch-Dest", "image");
            client.DefaultRequestHeaders.Add("Sec-Fetch-Mode", "no-cors");
            client.DefaultRequestHeaders.Add("Sec-Fetch-Site", "cross-site");
            client.DefaultRequestHeaders.Connection.Add("keep-alive");
            
            // Construct a specific Referer if username is found, otherwise fallback to generic
            string referer = !string.IsNullOrEmpty(username) && !username.Equals("static", StringComparison.OrdinalIgnoreCase)
                ? $"https://{username}.x.yupoo.com/"
                : $"https://{host.Replace("photo.", "")}/";

            client.DefaultRequestHeaders.Referrer = new Uri(referer);
            
            var response = await client.GetAsync(url);
            if (!response.IsSuccessStatusCode) 
            {
                // Second attempt with generic root yupoo.com
                _logger.LogInformation("Retrying proxy for {Url} with generic yupoo referer", url);
                client.DefaultRequestHeaders.Referrer = new Uri("https://yupoo.com/");
                response = await client.GetAsync(url);
            }

            if (!response.IsSuccessStatusCode)
            {
                // Third attempt with photo.yupoo.com as referer
                _logger.LogInformation("Retrying proxy for {Url} with photo.yupoo.com referer", url);
                client.DefaultRequestHeaders.Referrer = new Uri("https://photo.yupoo.com/");
                response = await client.GetAsync(url);
            }

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Yupoo returned status {StatusCode} for URL {Url} with Referer {Referer}", response.StatusCode, url, referer);
                return StatusCode((int)response.StatusCode);
            }

            var content = await response.Content.ReadAsByteArrayAsync();
            var contentType = response.Content.Headers.ContentType?.ToString() ?? "image/jpeg";

            // Add caching headers for 7 days
            Response.Headers.Append("Cache-Control", "public, max-age=604800");

            return File(content, contentType);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error proxying image for {Url}", url);
            return StatusCode(500, ex.Message);
        }
    }
}
