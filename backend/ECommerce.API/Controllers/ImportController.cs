using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Linq;
using System.Threading.Tasks;
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

                var previewIds = new System.Collections.Concurrent.ConcurrentBag<Guid>();

                if (url.Contains("/categories/"))
                {
                    var albumUrls = (await scraper.ScrapeCategoryAsync(url)).Distinct().ToList();
                    
                    // Deduplication: Only exclude products already published to the main catalog.
                    // We allow re-scraping of products in TempImportedProducts if they haven't been confirmed yet.
                    var existingUrls = await db.Products.Select(p => p.OriginalUrl).Where(u => u != null).ToListAsync();
                    var processedSet = new HashSet<string>(existingUrls, StringComparer.OrdinalIgnoreCase);

                    var finalUrls = albumUrls.Where(u => !processedSet.Contains(u)).Take(3000).ToList();
                    currentTask.TotalAlbums = finalUrls.Count;
                    await db.SaveChangesAsync();

                    if (finalUrls.Count == 0)
                    {
                        currentTask.Status = "Completed";
                        currentTask.ErrorMessage = albumUrls.Count > 0 ? "All products from this category are already in the system." : "No albums found.";
                        await db.SaveChangesAsync();
                        return;
                    }

                    await scraper.ScrapeBulkAsync(finalUrls, async (product) =>
                    {
                        try
                        {
                            using var subScope = _scopeFactory.CreateScope();
                            var subDb = subScope.ServiceProvider.GetRequiredService<IAppDbContext>();
                            
                            var tempProduct = new TempImportedProduct
                            {
                                Id = Guid.NewGuid(),
                                OriginalUrl = product.Url,
                                Title = product.Title,
                                Description = product.Description,
                                ImagesJson = JsonSerializer.Serialize(product.ImageUrls),
                                IsProcessed = false
                            };
                            subDb.TempImportedProducts.Add(tempProduct);
                            await subDb.SaveChangesAsync();
                            
                            previewIds.Add(tempProduct.Id);
                            
                            // Thread-safe progress update
                            using var progressScope = _scopeFactory.CreateScope();
                            var progressDb = progressScope.ServiceProvider.GetRequiredService<IAppDbContext>();
                            var taskRow = await progressDb.YupooScrapeTasks.FindAsync(task.Id);
                            if (taskRow != null)
                            {
                                taskRow.ProcessedAlbums++;
                                await progressDb.SaveChangesAsync();
                            }
                        }
                        catch (Exception ex) { Console.WriteLine($"Error saving background scraper result for {product.Url}: {ex.Message}"); }
                    }, maxConcurrency: 5);
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
                currentTask.SetTempProductIds(previewIds.ToList());
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
            SubCategoryId = request.SubCategoryId,
            OriginalUrl = tempProduct.OriginalUrl
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

    [HttpGet("pending")]
    public async Task<IActionResult> GetPendingImports()
    {
        var pending = await _context.TempImportedProducts
            .Where(p => !p.IsProcessed)
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new ImportPreviewDto
            {
                TempImportId = p.Id,
                OriginalUrl = p.OriginalUrl,
                Title = p.Title,
                Description = p.Description,
                Images = !string.IsNullOrEmpty(p.ImagesJson) 
                    ? JsonSerializer.Deserialize<List<string>>(p.ImagesJson) ?? new List<string>() 
                    : new List<string>()
            })
            .ToListAsync();

        return Ok(pending);
    }
}
