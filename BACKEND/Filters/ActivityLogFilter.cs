using Microsoft.AspNetCore.Mvc.Filters;
using BACKEND.Services;

namespace BACKEND.Filters
{
    public class ActivityLogFilter : IAsyncActionFilter
    {
        private readonly IActivityLogService _logService;

        public ActivityLogFilter(IActivityLogService logService)
        {
            _logService = logService;
        }

        public async Task OnActionExecutionAsync(
            ActionExecutingContext context,
            ActionExecutionDelegate next)
        {
            var controller = context.RouteData.Values["controller"]?.ToString();
            var action = context.RouteData.Values["action"]?.ToString();

            var userEmail = context.HttpContext.User?.Identity?.Name;

            await next();

            await _logService.LogAsync(
                module: controller,
                action: action,
                description: $"Executed {controller}/{action}",
                userEmail: userEmail
            );
        }
    }
}