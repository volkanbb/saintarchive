using System.Text;
using ECommerce.API.Middleware;
using ECommerce.Infrastructure;
using ECommerce.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Serilog;
using Microsoft.AspNetCore.Identity;
using ECommerce.Domain.Entities;

var builder = WebApplication.CreateBuilder(args);

// Setup Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .CreateLogger();

builder.Host.UseSerilog();

// Add layers
builder.Services.AddPersistenceServices(builder.Configuration);
builder.Services.AddInfrastructureServices();
builder.Services.AddHttpClient();

// Add Controllers
builder.Services.AddControllers();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        b => b.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

// Setup JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Secret"]!))
        };
    });

// Setup Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "ECommerce API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement()
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                },
                Scheme = "oauth2",
                Name = "Bearer",
                In = ParameterLocation.Header,
            },
            new List<string>()
        }
    });
});

var app = builder.Build();

app.UseMiddleware<ErrorHandlingMiddleware>();

app.UseSerilogRequestLogging();

app.UseSwagger();
app.UseSwaggerUI();

app.MapGet("/", () => Results.Redirect("/swagger"));

app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole<Guid>>>();
    
    int retries = 10;
    while (retries > 0)
    {
        try
        {
            db.Database.Migrate();
            logger.LogInformation("Database migration successful.");
            
            // Seed Roles
            var roles = new[] { "Admin", "User" };
            foreach (var role in roles)
            {
                if (!roleManager.RoleExistsAsync(role).Result)
                {
                    roleManager.CreateAsync(new IdentityRole<Guid>(role)).Wait();
                }
            }

            // Seed Admin User
            var adminEmail = "admin@admin.com";
            var adminUser = userManager.FindByEmailAsync(adminEmail).Result;
            var newPassword = "obDs9gP4F9@";

            if (adminUser == null)
            {
                var user = new User
                {
                    UserName = adminEmail,
                    Email = adminEmail,
                    FullName = "System Admin",
                    EmailConfirmed = true,
                    IsAdmin = true // Set the flag
                };
                var result = userManager.CreateAsync(user, newPassword).Result;
                if (result.Succeeded)
                {
                    userManager.AddToRoleAsync(user, "Admin").Wait();
                    logger.LogInformation("Default Admin user seeded successfully.");
                }
            }
            else
            {
                // Simple password check/update. 
                // We don't use tokens here because they might fail if DataProtection is not fully configured.
                if (!userManager.CheckPasswordAsync(adminUser, newPassword).Result)
                {
                    userManager.RemovePasswordAsync(adminUser).Wait();
                    userManager.AddPasswordAsync(adminUser, newPassword).Wait();
                    logger.LogInformation("Admin password updated to the latest requested value.");
                }

                if (!adminUser.IsAdmin)
                {
                    adminUser.IsAdmin = true;
                    userManager.UpdateAsync(adminUser).Wait();
                    logger.LogInformation("Admin flag set for existing admin user.");
                }
            }

            // Seed System Settings
            var defaultSettings = new List<SystemSetting>
            {
                new SystemSetting { Key = "WhatsAppNumber", Value = "33612345678", Description = "Store contact WhatsApp number (International format without +)" },
                new SystemSetting { Key = "InstagramUrl", Value = "https://instagram.com/saintarchive", Description = "Instagram profile URL" },
                new SystemSetting { Key = "TikTokUrl", Value = "https://tiktok.com/@saintarchive", Description = "TikTok profile URL" },
                new SystemSetting { Key = "ContactEmail", Value = "info@saintarchive.com.tr", Description = "Public contact email address" },
                new SystemSetting { Key = "PrivacyPolicy", Value = "Gizlilik politikası içeriği buraya gelecek.", Description = "Gizlilik Politikası metni" },
                new SystemSetting { Key = "TermsAndConditions", Value = "Kullanım şartları içeriği buraya gelecek.", Description = "Kullanım Şartları metni" },
                new SystemSetting { Key = "ShippingInfo", Value = "Kargo ve teslimat bilgileri buraya gelecek.", Description = "Kargo ve Teslimat Bilgileri metni" }
            };

            // Remove deprecated settings
            var deprecatedKeys = new[] { "TelegramUrl", "StoreAddress" };
            var deprecatedSettings = db.SystemSettings.Where(s => deprecatedKeys.Contains(s.Key)).ToList();
            if (deprecatedSettings.Any())
            {
                db.SystemSettings.RemoveRange(deprecatedSettings);
                logger.LogInformation("Removed deprecated Telegram and Address settings.");
            }

            foreach (var setting in defaultSettings)
            {
                if (!db.SystemSettings.Any(s => s.Key == setting.Key))
                {
                    setting.Id = Guid.NewGuid();
                    db.SystemSettings.Add(setting);
                    logger.LogInformation($"Default setting {setting.Key} seeded.");
                }
            }
            db.SaveChanges();

            break;
        }
        catch (Exception ex)
        {
            retries--;
            if (retries == 0)
            {
                logger.LogCritical(ex, "Database migration/seeding failed after multiple attempts.");
                throw;
            }
            logger.LogWarning("Database migration failed, retrying in 5 seconds... ({Message})", ex.Message);
            Thread.Sleep(5000);
        }
    }
}

app.Run();
