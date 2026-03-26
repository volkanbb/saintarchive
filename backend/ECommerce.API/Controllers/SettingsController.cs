using ECommerce.Application.DTOs.Settings;
using ECommerce.Application.Interfaces;
using ECommerce.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SettingsController : ControllerBase
    {
        private readonly IAppDbContext _context;

        public SettingsController(IAppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<List<SystemSettingDto>>> GetSettings()
        {
            var settings = await _context.SystemSettings
                .Select(s => new SystemSettingDto
                {
                    Id = s.Id,
                    Key = s.Key,
                    Value = s.Value,
                    Description = s.Description
                })
                .ToListAsync();

            return Ok(settings);
        }

        [HttpGet("{key}")]
        public async Task<ActionResult<SystemSettingDto>> GetSetting(string key)
        {
            var setting = await _context.SystemSettings
                .Where(s => s.Key == key)
                .Select(s => new SystemSettingDto
                {
                    Id = s.Id,
                    Key = s.Key,
                    Value = s.Value,
                    Description = s.Description
                })
                .FirstOrDefaultAsync();

            if (setting == null) return NotFound();

            return Ok(setting);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{key}")]
        public async Task<IActionResult> UpdateSetting(string key, [FromBody] UpdateSettingRequest request)
        {
            var setting = await _context.SystemSettings
                .FirstOrDefaultAsync(s => s.Key == key);

            if (setting == null) return NotFound();

            setting.Value = request.Value;
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
