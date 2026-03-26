using ECommerce.Domain.Entities;

namespace ECommerce.Application.Interfaces;

public interface IJwtProvider
{
    Task<string> GenerateAsync(User user);
}
