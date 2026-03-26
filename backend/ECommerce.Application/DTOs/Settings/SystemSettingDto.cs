using System.Text.Json.Serialization;

namespace ECommerce.Application.DTOs.Settings
{
    public class SystemSettingDto
    {
        [JsonPropertyName("id")]
        public Guid Id { get; set; }

        [JsonPropertyName("key")]
        public string Key { get; set; } = string.Empty;

        [JsonPropertyName("value")]
        public string Value { get; set; } = string.Empty;

        [JsonPropertyName("description")]
        public string? Description { get; set; }
    }

    public class UpdateSettingRequest
    {
        [JsonPropertyName("value")]
        public string Value { get; set; } = string.Empty;
    }
}
