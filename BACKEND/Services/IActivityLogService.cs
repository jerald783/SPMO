namespace BACKEND.Services
{
    public interface IActivityLogService
    {
        Task LogAsync(
            string module,
            string action,
            string description,
            int? userId = null,
            string? userEmail = null,
            string? referenceId = null);
    }
}