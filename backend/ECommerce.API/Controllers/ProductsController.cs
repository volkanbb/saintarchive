using ECommerce.Application.DTOs.Products;
using ECommerce.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IAppDbContext _context;

    public ProductsController(IAppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetProducts([FromQuery] string? search)
    {
        var query = _context.Products
            .Include(p => p.Category)
            .Include(p => p.Images)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(p => p.Title.Contains(search));
        }

        var products = await query
            .Select(p => new ProductDto
            {
                Id = p.Id,
                Title = p.Title,
                Description = p.Description,
                Price = p.Price,
                IsFeatured = p.IsFeatured,
                CategoryId = p.CategoryId,
                CategoryName = p.Category.Name,
                SubCategoryId = p.SubCategoryId,
                SubCategoryName = p.SubCategory != null ? p.SubCategory.Name : null,
                Images = p.Images
                    .OrderByDescending(i => i.IsMain)
                    .ThenBy(i => i.Id)
                    .Select(i => new ProductImageDto
                    {
                        Id = i.Id,
                        Url = i.Url,
                        IsMain = i.IsMain
                    }).ToList()
            })
            .ToListAsync();

        return Ok(products);
    }

    [HttpGet("featured")]
    public async Task<IActionResult> GetFeaturedProducts()
    {
        var products = await _context.Products
            .Include(p => p.Category)
            .Include(p => p.SubCategory)
            .Include(p => p.Images)
            .Where(p => p.IsFeatured)
            .OrderBy(p => p.SortOrder)
            .Select(p => new ProductDto
            {
                Id = p.Id,
                Title = p.Title,
                Description = p.Description,
                Price = p.Price,
                IsFeatured = p.IsFeatured,
                SortOrder = p.SortOrder,
                CategoryId = p.CategoryId,
                CategoryName = p.Category.Name,
                SubCategoryId = p.SubCategoryId,
                SubCategoryName = p.SubCategory != null ? p.SubCategory.Name : null,
                Images = p.Images
                    .OrderByDescending(i => i.IsMain)
                    .ThenBy(i => i.Id)
                    .Select(i => new ProductImageDto
                    {
                        Id = i.Id,
                        Url = i.Url,
                        IsMain = i.IsMain
                    }).ToList()
            })
            .ToListAsync();

        return Ok(products);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetProduct(Guid id)
    {
        var product = await _context.Products
            .Include(p => p.Category)
            .Include(p => p.SubCategory)
            .Include(p => p.Images)
            .Where(p => p.Id == id)
            .Select(p => new ProductDto
            {
                Id = p.Id,
                Title = p.Title,
                Description = p.Description,
                Price = p.Price,
                IsFeatured = p.IsFeatured,
                CategoryId = p.CategoryId,
                CategoryName = p.Category.Name,
                SubCategoryId = p.SubCategoryId,
                SubCategoryName = p.SubCategory != null ? p.SubCategory.Name : null,
                Images = p.Images
                    .OrderByDescending(i => i.IsMain)
                    .ThenBy(i => i.Id)
                    .Select(i => new ProductImageDto
                    {
                        Id = i.Id,
                        Url = i.Url,
                        IsMain = i.IsMain
                    }).ToList()
            })
            .FirstOrDefaultAsync();

        if (product == null) return NotFound();

        return Ok(product);
    }

    [HttpGet("category/{categoryId}")]
    public async Task<IActionResult> GetProductsByCategory(Guid categoryId)
    {
        var products = await _context.Products
            .Include(p => p.Category)
            .Include(p => p.SubCategory)
            .Include(p => p.Images)
            .Where(p => p.CategoryId == categoryId || p.SubCategoryId == categoryId)
            .Select(p => new ProductDto
            {
                Id = p.Id,
                Title = p.Title,
                Description = p.Description,
                Price = p.Price,
                IsFeatured = p.IsFeatured,
                CategoryId = p.CategoryId,
                CategoryName = p.Category.Name,
                SubCategoryId = p.SubCategoryId,
                SubCategoryName = p.SubCategory != null ? p.SubCategory.Name : null,
                Images = p.Images
                    .OrderByDescending(i => i.IsMain)
                    .ThenBy(i => i.Id)
                    .Select(i => new ProductImageDto
                    {
                        Id = i.Id,
                        Url = i.Url,
                        IsMain = i.IsMain
                    }).ToList()
            })
            .ToListAsync();

        return Ok(products);
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProduct(Guid id, [FromBody] ProductDto productDto)
    {
        var product = await _context.Products
            .Include(p => p.Images)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product == null) return NotFound();

        product.Title = productDto.Title;
        product.Description = productDto.Description;
        product.Price = productDto.Price;
        product.IsFeatured = productDto.IsFeatured;
        product.CategoryId = productDto.CategoryId;
        product.SubCategoryId = productDto.SubCategoryId;

        if (productDto.Images != null && productDto.Images.Any())
        {
            var existingImages = _context.ProductImages.Where(i => i.ProductId == id);
            _context.ProductImages.RemoveRange(existingImages);

            foreach (var img in productDto.Images)
            {
                _context.ProductImages.Add(new Domain.Entities.ProductImage
                {
                    ProductId = id,
                    Url = img.Url,
                    IsMain = img.IsMain
                });
            }
        }

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> CreateProduct([FromBody] ProductDto productDto)
    {
        var product = new Domain.Entities.Product
        {
            Id = Guid.NewGuid(),
            Title = productDto.Title,
            Description = productDto.Description,
            Price = productDto.Price,
            IsFeatured = productDto.IsFeatured,
            CategoryId = productDto.CategoryId,
            SubCategoryId = productDto.SubCategoryId
        };

        _context.Products.Add(product);

        if (productDto.Images != null && productDto.Images.Any())
        {
            foreach (var img in productDto.Images)
            {
                _context.ProductImages.Add(new Domain.Entities.ProductImage
                {
                    ProductId = product.Id,
                    Url = img.Url,
                    IsMain = img.IsMain
                });
            }
        }

        await _context.SaveChangesAsync();

        // Map back to DTO for response
        productDto.Id = product.Id;
        return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, productDto);
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProduct(Guid id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null) return NotFound();

        _context.Products.Remove(product);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("update-order")]
    public async Task<IActionResult> UpdateSortOrder([FromBody] List<Guid> productIds)
    {
        for (int i = 0; i < productIds.Count; i++)
        {
            var id = productIds[i];
            var product = await _context.Products.FindAsync(id);
            if (product != null)
            {
                product.SortOrder = i;
            }
        }

        await _context.SaveChangesAsync();
        return NoContent();
    }
}
