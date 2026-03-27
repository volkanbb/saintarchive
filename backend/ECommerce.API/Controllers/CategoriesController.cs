using ECommerce.Application.DTOs.Categories;
using ECommerce.Application.Interfaces;
using ECommerce.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly IAppDbContext _context;

    public CategoriesController(IAppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetCategories()
    {
        var categories = await _context.Categories
            .Where(c => c.ParentCategoryId == null)
            .Select(c => new CategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description,
                Slug = c.Slug,
                ImageUrl = c.ImageUrl,
                SubCategories = c.SubCategories.Select(s => new CategoryDto
                {
                    Id = s.Id,
                    Name = s.Name,
                    Description = s.Description,
                    Slug = s.Slug,
                    ImageUrl = s.ImageUrl,
                    ParentCategoryId = s.ParentCategoryId
                }).ToList()
            })
            .ToListAsync();

        return Ok(categories);
    }

    [HttpGet("all")]
    public async Task<IActionResult> GetAllCategories()
    {
        var categories = await _context.Categories
            .Select(c => new CategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description,
                Slug = c.Slug,
                ImageUrl = c.ImageUrl,
                ParentCategoryId = c.ParentCategoryId
            })
            .ToListAsync();

        return Ok(categories);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetCategory(Guid id)
    {
        var category = await _context.Categories
            .Select(c => new CategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description,
                Slug = c.Slug,
                ImageUrl = c.ImageUrl,
                ParentCategoryId = c.ParentCategoryId,
                SubCategories = c.SubCategories.Select(s => new CategoryDto
                {
                    Id = s.Id,
                    Name = s.Name,
                    Description = s.Description,
                    Slug = s.Slug,
                    ImageUrl = s.ImageUrl,
                    ParentCategoryId = s.ParentCategoryId
                }).ToList()
            })
            .FirstOrDefaultAsync(c => c.Id == id);

        if (category == null) return NotFound();

        return Ok(category);
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> CreateCategory([FromBody] CategoryDto request)
    {
        Console.WriteLine($"[API] Creating category: {request.Name}, Parent: {request.ParentCategoryId}");
        
        var category = new Category
        {
            Name = request.Name,
            Description = request.Description,
            Slug = request.Name.ToLower().Replace(" ", "-"),
            ImageUrl = request.ImageUrl,
            ParentCategoryId = request.ParentCategoryId
        };

        _context.Categories.Add(category);

        // If sub-categories are provided as strings (names), we'll handle them 
        // Note: This matches the "Add sub-categories" requirement during creation
        if (request.SubCategories != null && request.SubCategories.Any())
        {
            foreach (var sub in request.SubCategories)
            {
                _context.Categories.Add(new Category
                {
                    Name = sub.Name,
                    Description = sub.Description,
                    Slug = sub.Name.ToLower().Replace(" ", "-"),
                    ImageUrl = sub.ImageUrl,
                    ParentCategory = category
                });
            }
        }

        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, request);
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCategory(Guid id, [FromBody] CategoryDto request)
    {
        Console.WriteLine($"[API] Updating category {id}: {request.Name}, ImageUrl: {request.ImageUrl}");
        
        var category = await _context.Categories
            .Include(c => c.SubCategories)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (category == null) return NotFound();

        category.Name = request.Name;
        category.Description = request.Description;
        category.Slug = request.Name.ToLower().Replace(" ", "-");
        category.ImageUrl = request.ImageUrl;
        category.UpdatedAt = DateTime.UtcNow;

        // Bulk add sub-categories if provided
        if (request.SubCategories != null && request.SubCategories.Any())
        {
            foreach (var subDto in request.SubCategories)
            {
                // Simple duplicate check by name within this parent
                if (!category.SubCategories.Any(s => s.Name.Equals(subDto.Name, StringComparison.OrdinalIgnoreCase)))
                {
                    _context.Categories.Add(new Category
                    {
                        Name = subDto.Name,
                        Description = subDto.Description,
                        Slug = subDto.Name.ToLower().Replace(" ", "-"),
                        ImageUrl = subDto.ImageUrl,
                        ParentCategory = category
                    });
                }
            }
        }

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCategory(Guid id)
    {
        var category = await _context.Categories.FindAsync(id);
        if (category == null) return NotFound();

        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("bulk-delete")]
    public async Task<IActionResult> BulkDeleteCategories([FromBody] List<Guid> ids)
    {
        var categories = await _context.Categories.Where(c => ids.Contains(c.Id)).ToListAsync();
        _context.Categories.RemoveRange(categories);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("bulk-update-details")]
    public async Task<IActionResult> BulkUpdateCategoryDetails([FromBody] BulkUpdateCategoryDetailsRequest request)
    {
        foreach (var item in request.Items)
        {
            var category = await _context.Categories.FindAsync(item.Id);
            if (category != null)
            {
                category.Name = item.Name;
                category.Description = item.Description;
                category.Slug = item.Name.ToLower().Replace(" ", "-");
            }
        }

        await _context.SaveChangesAsync();
        return NoContent();
    }
}

public class BulkUpdateCategoryDetailsRequest
{
    public List<CategoryDetailUpdateItem> Items { get; set; } = new();
}

public class CategoryDetailUpdateItem
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}
