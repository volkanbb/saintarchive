using System.Text.Json;
using ECommerce.Application.DTOs.Import;
using ECommerce.Application.Interfaces;
using ECommerce.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.API.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/[controller]")]
public class ImportController : ControllerBase
{
    private readonly IAppDbContext _context;
    private readonly IYupooScraperService _scraperService;
    private readonly IServiceScopeFactory _scopeFactory;

    public ImportController(IAppDbContext context, IYupooScraperService scraperService, IServiceScopeFactory scopeFactory)
    {
        _context = context;
        _scraperService = scraperService;
        _scopeFactory = scopeFactory;
    }

    [HttpGet("scrape-album")]
    public async Task<IActionResult> ScrapeAlbum([FromQuery] string url)
    {
        if (string.IsNullOrWhiteSpace(url)) return BadRequest("URL is required");
        try
        {
            var result = await _scraperService.ScrapeProductAsync(url);
            if (result == null || string.IsNullOrEmpty(result.Title))
                return BadRequest("Could not find product data at this URL.");

            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest($"Scraping failed: {ex.Message}");
        }
    }

    [HttpPost]
    public async Task<IActionResult> PreviewImport([FromBody] string url)
    {
        if (string.IsNullOrWhiteSpace(url)) return BadRequest("URL is required");

        var task = new YupooScrapeTask
        {
            TargetUrl = url,
            Status = "Pending"
        };
        _context.YupooScrapeTasks.Add(task);
        await _context.SaveChangesAsync();

        // Start background extraction
        _ = Task.Run(async () =>
        {
            using var scope = _scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<IAppDbContext>();
            var scraper = scope.ServiceProvider.GetRequiredService<IYupooScraperService>();

            try
            {
                var currentTask = await db.YupooScrapeTasks.FindAsync(task.Id);
                if (currentTask == null) return;

                currentTask.Status = "Processing";
                await db.SaveChangesAsync();

                var previewIds = new List<Guid>();

                if (url.Contains("/categories/"))
                {
                    var albumUrls = await scraper.ScrapeCategoryAsync(url);
                    currentTask.TotalAlbums = albumUrls.Count;
                    await db.SaveChangesAsync();

                    if (albumUrls.Count == 0)
                    {
                        currentTask.Status = "Failed";
                        currentTask.ErrorMessage = "No albums found in this category.";
                        await db.SaveChangesAsync();
                        return;
                    }

                    foreach (var albumUrl in albumUrls.Take(500))
                    {
                        try
                        {
                            var product = await scraper.ScrapeProductAsync(albumUrl);
                            if (product != null && !string.IsNullOrEmpty(product.Title))
                            {
                                var tempProduct = new TempImportedProduct
                                {
                                    Id = Guid.NewGuid(),
                                    OriginalUrl = product.Url,
                                    Title = product.Title,
                                    Description = product.Description,
                                    ImagesJson = JsonSerializer.Serialize(product.ImageUrls),
                                    IsProcessed = false
                                };
                                db.TempImportedProducts.Add(tempProduct);
                                previewIds.Add(tempProduct.Id);
                            }
                        }
                        catch (Exception ex) { Console.WriteLine($"Error in background scrape for {albumUrl}: {ex.Message}"); }
                        
                        currentTask.ProcessedAlbums++;
                        await db.SaveChangesAsync();
                    }
                }
                else
                {
                    currentTask.TotalAlbums = 1;
                    await db.SaveChangesAsync();
                    
                    var scrapedInfo = await scraper.ScrapeProductAsync(url);
                    if (scrapedInfo != null && !string.IsNullOrEmpty(scrapedInfo.Title))
                    {
                        var tempProduct = new TempImportedProduct
                        {
                            OriginalUrl = url,
                            Title = scrapedInfo.Title,
                            Description = scrapedInfo.Description,
                            ImagesJson = JsonSerializer.Serialize(scrapedInfo.ImageUrls),
                            IsProcessed = false
                        };
                        db.TempImportedProducts.Add(tempProduct);
                        await db.SaveChangesAsync();
                        previewIds.Add(tempProduct.Id);
                        currentTask.ProcessedAlbums = 1;
                    }
                }

                currentTask.Status = "Completed";
                currentTask.SetTempProductIds(previewIds);
                await db.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                var finalTask = await db.YupooScrapeTasks.FindAsync(task.Id);
                if (finalTask != null)
                {
                    finalTask.Status = "Failed";
                    finalTask.ErrorMessage = ex.Message;
                    await db.SaveChangesAsync();
                }
            }
        });

        return Ok(new { taskId = task.Id });
    }

    [HttpGet("task/{id}")]
    public async Task<IActionResult> GetTaskStatus(Guid id)
    {
        var task = await _context.YupooScrapeTasks.FindAsync(id);
        if (task == null) return NotFound();

        return Ok(new
        {
            task.Id,
            task.Status,
            task.ErrorMessage,
            task.TotalAlbums,
            task.ProcessedAlbums,
            previewIds = task.GetTempProductIds()
        });
    }

    [HttpGet("preview/{id}")]
    public async Task<IActionResult> GetPreview(Guid id)
    {
        var tempProduct = await _context.TempImportedProducts.FindAsync(id);
        if (tempProduct == null || tempProduct.IsProcessed) return NotFound();

        var images = !string.IsNullOrEmpty(tempProduct.ImagesJson)
            ? JsonSerializer.Deserialize<List<string>>(tempProduct.ImagesJson) ?? new List<string>()
            : new List<string>();

        return Ok(new ImportPreviewDto
        {
            TempImportId = tempProduct.Id,
            OriginalUrl = tempProduct.OriginalUrl,
            Title = tempProduct.Title,
            Description = tempProduct.Description,
            Images = images
        });
    }

    [HttpPost("confirm")]
    public async Task<IActionResult> ConfirmImport(ConfirmImportRequest request)
    {
        var tempProduct = await _context.TempImportedProducts.FindAsync(request.TempImportId);
        if (tempProduct == null || tempProduct.IsProcessed) return NotFound("Temporary import not found or already processed.");

        var category = await _context.Categories.FindAsync(request.CategoryId);
        if (category == null) return BadRequest("Invalid category ID.");

        var product = new Product
        {
            Title = request.Title,
            Description = request.Description,
            Price = request.Price,
            IsFeatured = request.IsFeatured,
            CategoryId = category.Id,
            SubCategoryId = request.SubCategoryId
        };

        _context.Products.Add(product);

        // Add images
        foreach (var imgUrl in request.SelectedImages)
        {
            _context.ProductImages.Add(new ProductImage
            {
                Url = imgUrl,
                IsMain = (imgUrl == request.MainImage),
                Product = product
            });
        }

        tempProduct.IsProcessed = true;
        await _context.SaveChangesAsync();

        return Ok(new { productId = product.Id });
    }
}
