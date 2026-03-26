using ECommerce.Application.DTOs.Admin;
using ECommerce.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.API.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/admin/users")]
public class AdminUsersController : ControllerBase
{
    private readonly UserManager<User> _userManager;

    public AdminUsersController(UserManager<User> userManager)
    {
        _userManager = userManager;
    }

    [HttpGet]
    public async Task<IActionResult> GetAdmins()
    {
        var admins = await _userManager.Users
            .Where(u => u.IsAdmin)
            .Select(u => new
            {
                u.Id,
                u.Email,
                u.FullName,
                u.UserName
            })
            .ToListAsync();

        return Ok(admins);
    }

    [HttpPost]
    public async Task<IActionResult> CreateAdmin([FromBody] CreateAdminRequest request)
    {
        if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
            return BadRequest("Email and Password are required.");

        var existingUser = await _userManager.FindByEmailAsync(request.Email);
        if (existingUser != null)
            return BadRequest("User already exists.");

        var user = new User
        {
            UserName = request.Email,
            Email = request.Email,
            FullName = request.FullName,
            EmailConfirmed = true,
            IsAdmin = true // Set the flag
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (result.Succeeded)
        {
            await _userManager.AddToRoleAsync(user, "Admin");
            return Ok(new { user.Id, user.Email, user.FullName });
        }

        return BadRequest(result.Errors);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAdmin(Guid id)
    {
        var user = await _userManager.FindByIdAsync(id.ToString());
        if (user == null)
            return NotFound();

        // Prevent self-deletion if needed, or just allow it (dangerous)
        // For now, allow but maybe add a check against the current user ID later.

        var result = await _userManager.DeleteAsync(user);
        if (result.Succeeded)
            return Ok();

        return BadRequest(result.Errors);
    }
}
