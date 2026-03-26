using Microsoft.AspNetCore.Identity;

namespace ECommerce.Domain.Entities;

public class User : IdentityUser<Guid>
{
    public string FullName { get; set; } = string.Empty;
    public bool IsAdmin { get; set; } = false;
}
