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

    public ImportController(IAppDbContext context, IYupooScraperService scraperService)
    {
        _context = context;
        _scraperService = scraperService;
    }

    [HttpPost]
    public async Task<IActionResult> PreviewImport([FromBody] string url)
    {
        if (string.IsNullOrWhiteSpace(url)) return BadRequest("URL is required");

        var previewIds = new List<Guid>();

        try
        {
            if (url.Contains("/categories/"))
            {
                var products = await _scraperService.ScrapeCategoryWithProductsAsync(url);
                if (products.Count == 0) return BadRequest("No products found in this category.");

                foreach (var product in products)
                {
                    var tempProduct = new TempImportedProduct
                    {
                        Id = Guid.NewGuid(), // Explicitly set ID
                        OriginalUrl = product.Url,
                        Title = product.Title,
                        Description = product.Description,
                        ImagesJson = JsonSerializer.Serialize(product.ImageUrls),
                        IsProcessed = false
                    };
                    _context.TempImportedProducts.Add(tempProduct);
                    previewIds.Add(tempProduct.Id);
                }
                await _context.SaveChangesAsync();
                // No need to query again! We have the IDs in previewIds list.
            }
            else
            {
                var scrapedInfo = await _scraperService.ScrapeProductAsync(url);
                if (scrapedInfo == null || string.IsNullOrEmpty(scrapedInfo.Title))
                    return BadRequest("Could not scrape product information.");

                var tempProduct = new TempImportedProduct
                {
                    OriginalUrl = url,
                    Title = scrapedInfo.Title,
                    Description = scrapedInfo.Description,
                    ImagesJson = JsonSerializer.Serialize(scrapedInfo.ImageUrls),
                    IsProcessed = false
                };

                _context.TempImportedProducts.Add(tempProduct);
                await _context.SaveChangesAsync();
                previewIds.Add(tempProduct.Id);
            }
        }
        catch (KeyNotFoundException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }

        if (previewIds.Count == 0) return BadRequest("Could not scrape any products.");

        return Ok(new { previewId = previewIds[0], previewIds = previewIds, count = previewIds.Count });
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
