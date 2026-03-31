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
    public async Task<IActionResult> GetProducts([FromQuery] string? search, [FromQuery] Guid? categoryId, [FromQuery] Guid? subCategoryId)
    {
        var query = _context.Products
            .Include(p => p.Category)
            .Include(p => p.Images)
            .Include(p => p.Sizes)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(p => 
                p.Title.Contains(search) || 
                p.Category.Name.Contains(search) || 
                (p.SubCategory != null && p.SubCategory.Name.Contains(search)));
        }

        if (subCategoryId.HasValue)
        {
            query = query.Where(p => p.SubCategoryId == subCategoryId.Value);
        }
        else if (categoryId.HasValue)
        {
            query = query.Where(p => p.CategoryId == categoryId.Value);
        }

        var products = await query
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
                    .OrderBy(i => i.SortOrder)
                    .ThenByDescending(i => i.IsMain)
                    .Select(i => new ProductImageDto
                    {
                        Id = i.Id,
                        Url = i.Url,
                        IsMain = i.IsMain,
                        SortOrder = i.SortOrder
                    }).ToList(),
                Sizes = p.Sizes.Select(s => new SizeDto { Id = s.Id, Name = s.Name }).ToList()
            })
            .ToListAsync();

        return Ok(products);
    }

    [HttpGet("sizes")]
    public async Task<IActionResult> GetSizes()
    {
        var sizes = await _context.Sizes
            .OrderBy(s => s.Name)
            .Select(s => new SizeDto { Id = s.Id, Name = s.Name })
            .ToListAsync();
        return Ok(sizes);
    }

    [HttpGet("featured")]
    public async Task<IActionResult> GetFeaturedProducts()
    {
        var products = await _context.Products
            .Include(p => p.Category)
            .Include(p => p.SubCategory)
            .Include(p => p.Images)
            .Include(p => p.Sizes)
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
                    .OrderBy(i => i.SortOrder)
                    .ThenByDescending(i => i.IsMain)
                    .Select(i => new ProductImageDto
                    {
                        Id = i.Id,
                        Url = i.Url,
                        IsMain = i.IsMain,
                        SortOrder = i.SortOrder
                    }).ToList(),
                Sizes = p.Sizes.Select(s => new SizeDto { Id = s.Id, Name = s.Name }).ToList()
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
            .Include(p => p.Sizes)
            .Where(p => p.Id == id)
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
                    .OrderBy(i => i.SortOrder)
                    .ThenByDescending(i => i.IsMain)
                    .Select(i => new ProductImageDto
                    {
                        Id = i.Id,
                        Url = i.Url,
                        IsMain = i.IsMain,
                        SortOrder = i.SortOrder
                    }).ToList(),
                Sizes = p.Sizes.Select(s => new SizeDto { Id = s.Id, Name = s.Name }).ToList()
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
            .Include(p => p.Sizes)
            .Where(p => p.CategoryId == categoryId || p.SubCategoryId == categoryId)
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
                    .OrderBy(i => i.SortOrder)
                    .ThenByDescending(i => i.IsMain)
                    .Select(i => new ProductImageDto
                    {
                        Id = i.Id,
                        Url = i.Url,
                        IsMain = i.IsMain,
                        SortOrder = i.SortOrder
                    }).ToList(),
                Sizes = p.Sizes.Select(s => new SizeDto { Id = s.Id, Name = s.Name }).ToList()
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

        // Update Sizes
        if (productDto.Sizes != null)
        {
            var sizeIds = productDto.Sizes.Select(s => s.Id).ToList();
            var sizes = await _context.Sizes.Where(s => sizeIds.Contains(s.Id)).ToListAsync();
            product.Sizes = sizes;
        }

        if (productDto.Images != null && productDto.Images.Any())
        {
            var existingImages = _context.ProductImages.Where(i => i.ProductId == id);
            _context.ProductImages.RemoveRange(existingImages);

            int currentOrder = 0;
            foreach (var img in productDto.Images)
            {
                _context.ProductImages.Add(new Domain.Entities.ProductImage
                {
                    ProductId = id,
                    Url = img.Url,
                    IsMain = img.IsMain,
                    SortOrder = currentOrder++
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

        if (productDto.Sizes != null && productDto.Sizes.Any())
        {
            var sizeIds = productDto.Sizes.Select(s => s.Id).ToList();
            var sizes = await _context.Sizes.Where(s => sizeIds.Contains(s.Id)).ToListAsync();
            product.Sizes = sizes;
        }

        _context.Products.Add(product);

        if (productDto.Images != null && productDto.Images.Any())
        {
            int currentOrder = 0;
            foreach (var img in productDto.Images)
            {
                _context.ProductImages.Add(new Domain.Entities.ProductImage
                {
                    ProductId = product.Id,
                    Url = img.Url,
                    IsMain = img.IsMain,
                    SortOrder = currentOrder++
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

    [Authorize(Roles = "Admin")]
    [HttpPost("bulk-delete")]
    public async Task<IActionResult> BulkDelete([FromBody] List<Guid> ids)
    {
        var products = await _context.Products.Where(p => ids.Contains(p.Id)).ToListAsync();
        _context.Products.RemoveRange(products);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("bulk-update-sizes")]
    public async Task<IActionResult> BulkUpdateSizes([FromBody] BulkUpdateSizesRequest request)
    {
        var products = await _context.Products
            .Include(p => p.Sizes)
            .Where(p => request.ProductIds.Contains(p.Id))
            .ToListAsync();

        var sizes = await _context.Sizes
            .Where(s => request.SizeIds.Contains(s.Id))
            .ToListAsync();

        foreach (var product in products)
        {
            product.Sizes = sizes;
        }

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("bulk-update-categories")]
    public async Task<IActionResult> BulkUpdateCategories([FromBody] BulkUpdateCategoriesRequest request)
    {
        var products = await _context.Products
            .Where(p => request.ProductIds.Contains(p.Id))
            .ToListAsync();

        foreach (var product in products)
        {
            product.CategoryId = request.CategoryId;
            product.SubCategoryId = request.SubCategoryId;
        }

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("bulk-update-details")]
    public async Task<IActionResult> BulkUpdateDetails([FromBody] BulkUpdateDetailsRequest request)
    {
        var productIds = request.Items.Select(i => i.Id).ToList();
        var products = await _context.Products.Where(p => productIds.Contains(p.Id)).ToListAsync();

        foreach (var item in request.Items)
        {
            var product = products.FirstOrDefault(p => p.Id == item.Id);
            if (product != null)
            {
                product.Title = item.Title;
                product.Price = item.Price;
                product.Description = item.Description;
                product.IsFeatured = item.IsFeatured;
            }
        }

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("bulk-delete-images")]
    public async Task<IActionResult> BulkDeleteImages([FromBody] List<Guid> imageIds)
    {
        var images = await _context.ProductImages
            .Where(i => imageIds.Contains(i.Id))
            .ToListAsync();

        if (!images.Any()) return NoContent();

        // Group by ProductId to handle "Main" image logic
        var productIds = images.Select(i => i.ProductId).Distinct().ToList();

        _context.ProductImages.RemoveRange(images);

        // For each affected product, ensure there's still a main image if any images remain
        foreach (var productId in productIds)
        {
            var remainingImages = await _context.ProductImages
                .Where(i => i.ProductId == productId && !imageIds.Contains(i.Id))
                .OrderBy(i => i.Id)
                .ToListAsync();

            if (remainingImages.Any() && !remainingImages.Any(i => i.IsMain))
            {
                remainingImages.First().IsMain = true;
            }
        }

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("sizes")]
    public async Task<IActionResult> CreateSize([FromBody] SizeDto sizeDto)
    {
        if (string.IsNullOrWhiteSpace(sizeDto.Name)) return BadRequest("Size name is required.");

        var existing = await _context.Sizes.AnyAsync(s => s.Name == sizeDto.Name);
        if (existing) return BadRequest("Size already exists.");

        var size = new Domain.Entities.Size
        {
            Id = Guid.NewGuid(),
            Name = sizeDto.Name
        };

        _context.Sizes.Add(size);
        await _context.SaveChangesAsync();

        sizeDto.Id = size.Id;
        return CreatedAtAction(nameof(GetSizes), new { }, sizeDto);
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("sizes/{id}")]
    public async Task<IActionResult> DeleteSize(Guid id)
    {
        var size = await _context.Sizes.FindAsync(id);
        if (size == null) return NotFound();

        // Check if any products are using this size
        var inUse = await _context.Products.AnyAsync(p => p.Sizes.Any(s => s.Id == id));
        if (inUse) return BadRequest("Cannot delete size that is currently assigned to products.");

        _context.Sizes.Remove(size);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}

public class BulkUpdateSizesRequest
{
    public List<Guid> ProductIds { get; set; } = new();
    public List<Guid> SizeIds { get; set; } = new();
}

public class BulkUpdateCategoriesRequest
{
    public List<Guid> ProductIds { get; set; } = new();
    public Guid CategoryId { get; set; }
    public Guid? SubCategoryId { get; set; }
}

public class BulkUpdateDetailsRequest
{
    public List<ProductDetailUpdateItem> Items { get; set; } = new();
}

public class ProductDetailUpdateItem
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Description { get; set; } = string.Empty;
    public bool IsFeatured { get; set; }
}
