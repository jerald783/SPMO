using Microsoft.Extensions.FileProviders;
using Newtonsoft.Json.Serialization;
using BACKEND.Hubs;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Backend.Models;
using BACKEND.Services;
using BACKEND.Filters;

var builder = WebApplication.CreateBuilder(args);

// =============================
// Activity Log Service
// =============================
builder.Services.AddScoped<IActivityLogService, ActivityLogService>();
builder.Services.AddScoped<ActivityLogFilter>();

builder.Services.AddControllers(options =>
{
    options.Filters.Add<ActivityLogFilter>();
});


// =============================
// SMTP Email Service
// =============================
builder.Services.AddScoped<SmtpService>();

builder.Configuration.AddJsonFile("appsettings.json");

var jwtSettings = builder.Configuration.GetSection("JwtSettings");

builder.Services.Configure<SmtpSettingsModel>(
    builder.Configuration.GetSection("SmtpSettings"));

// =============================
// CORS Configuration
// =============================
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowOrigin", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// =============================
// JSON Configuration
// =============================
builder.Services.AddControllersWithViews()
    .AddNewtonsoftJson(options =>
    {
        options.SerializerSettings.ReferenceLoopHandling =
            Newtonsoft.Json.ReferenceLoopHandling.Ignore;

        options.SerializerSettings.ContractResolver =
            new DefaultContractResolver();
    });

// =============================
// SignalR
// =============================
builder.Services.AddSignalR();

// =============================
// JWT Authentication
// =============================
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,

            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],

            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtSettings["SecretKey"]!))
        };

        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;

                if (!string.IsNullOrEmpty(accessToken) &&
                    path.StartsWithSegments("/hubs/notification"))
                {
                    context.Token = accessToken;
                }

                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

// =============================
// Development
// =============================
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

// =============================
// Security Headers
// =============================

// app.Use(async (context, next) =>
// {
//     context.Response.Headers.Append("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
//     context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
//     context.Response.Headers.Append("X-Frame-Options", "DENY");
//     context.Response.Headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");
//     context.Response.Headers.Append("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
//     context.Response.Headers.Append("Cross-Origin-Resource-Policy", "same-origin");
//     context.Response.Headers.Append("Cross-Origin-Embedder-Policy", "require-corp");
//     context.Response.Headers.Append("Cross-Origin-Opener-Policy", "same-origin");
//     context.Response.Headers.Append("Content-Security-Policy",
//         "default-src 'self'; script-src 'self' https://code.jquery.com https://cdn.jsdelivr.net; " +
//         "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
//         "font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:;");
    
//     await next();
// });

// =============================
// Middleware Pipeline
// =============================
app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseCors("AllowOrigin");

// ✅ MUST be in this order
app.UseAuthentication();
app.UseAuthorization();

// =============================
// Static File Serving
// =============================
var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "Assets", "webinar-uploads");
Directory.CreateDirectory(uploadsPath);

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(uploadsPath),
    RequestPath = "/webinar-uploads"
});

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(Directory.GetCurrentDirectory(), "Assets")),
    RequestPath = "/Assets"
});

var chatFilesPath = Path.Combine(
    Directory.GetCurrentDirectory(), "Assets", "ChatFiles");

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(chatFilesPath),
    RequestPath = "/ChatFiles"
});

// =============================
// Endpoints
// =============================
app.MapControllers();

// ✅ SIGNALR (NOW WORKS)
app.MapHub<NotificationHub>("/hubs/notification");
app.MapHub<ChatHub>("/chathub");

// =============================
// Run
// =============================
app.Run();

