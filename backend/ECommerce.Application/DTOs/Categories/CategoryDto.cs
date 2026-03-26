using System.Text.Json.Serialization;

namespace ECommerce.Application.DTOs.Categories;

public class CategoryDto
{
    [JsonPropertyName("id")]
    public Guid Id { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("description")]
    public string Description { get; set; } = string.Empty;

    [JsonPropertyName("slug")]
    public string Slug { get; set; } = string.Empty;

    [JsonPropertyName("imageUrl")]
    public string? ImageUrl { get; set; }

    [JsonPropertyName("parentCategoryId")]
    public Guid? ParentCategoryId { get; set; }

    [JsonPropertyName("subCategories")]
    public List<CategoryDto> SubCategories { get; set; } = new();
}
