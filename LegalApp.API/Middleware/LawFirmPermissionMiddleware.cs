using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using LegalApp.API.Data;

namespace LegalApp.API.Middleware
{
    public class LawFirmPermissionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<LawFirmPermissionMiddleware> _logger;

        public LawFirmPermissionMiddleware(RequestDelegate next, ILogger<LawFirmPermissionMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context, LegalAppDbContext dbContext)
        {
            // Skip for non-authenticated requests
            if (!context.User.Identity?.IsAuthenticated ?? true)
            {
                await _next(context);
                return;
            }

            // Skip for auth endpoints
            if (context.Request.Path.StartsWithSegments("/api/auth"))
            {
                await _next(context);
                return;
            }

            // Get user ID from JWT
            var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!Guid.TryParse(userIdClaim, out var userId))
            {
                context.Response.StatusCode = 401;
                await context.Response.WriteAsync("Invalid user token");
                return;
            }

            // Get user's law firms
            var userLawFirms = await dbContext.UserLawFirms
                .Where(ulf => ulf.UserId == userId)
                .Select(ulf => ulf.LawFirmId)
                .ToListAsync();

            // Check if request contains lawFirmId parameter and validate access
            var lawFirmIdParam = ExtractLawFirmId(context);
            if (lawFirmIdParam.HasValue)
            {
                // Master users can access any law firm
                var userRole = context.User.FindFirst(ClaimTypes.Role)?.Value;
                if (userRole != "Master" && !userLawFirms.Contains(lawFirmIdParam.Value))
                {
                    _logger.LogWarning($"User {userId} attempted to access LawFirm {lawFirmIdParam.Value} without permission");
                    context.Response.StatusCode = 403;
                    await context.Response.WriteAsync("Access denied to this law firm");
                    return;
                }
            }

            // Add accessible law firms to context for controllers
            context.Items["UserLawFirms"] = userLawFirms;
            context.Items["UserId"] = userId;

            await _next(context);
        }

        private Guid? ExtractLawFirmId(HttpContext context)
        {
            // Check query parameters
            if (context.Request.Query.TryGetValue("lawFirmId", out var queryValue))
            {
                if (Guid.TryParse(queryValue, out var lawFirmId))
                    return lawFirmId;
            }

            // Check route parameters
            if (context.Request.RouteValues.TryGetValue("lawFirmId", out var routeValue))
            {
                if (Guid.TryParse(routeValue?.ToString(), out var lawFirmId))
                    return lawFirmId;
            }

            // Check request body (for POST/PUT requests)
            // Note: This is a simplified check - in production you might want to parse JSON
            // For now, we'll rely on controller-level validation

            return null;
        }
    }
}
