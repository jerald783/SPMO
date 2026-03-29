using MySql.Data.MySqlClient;
using BACKEND.Models;

namespace BACKEND.Services
{
    public class ActivityLogService : IActivityLogService
    {
        private readonly IConfiguration _configuration;

        public ActivityLogService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        private MySqlConnection GetConnection()
        {
            return new MySqlConnection(
                _configuration.GetConnectionString("InvAppCon"));
        }

        public async Task LogAsync(
            string module,
            string action,
            string description,
            int? userId = null,
            string? userEmail = null,
            string? referenceId = null)
        {
            string query = @"
                INSERT INTO tbl_activity_logs
                (Module, Action, Description, UserId, UserEmail, ReferenceId)
                VALUES
                (@Module, @Action, @Description, @UserId, @UserEmail, @ReferenceId)";

            using var con = GetConnection();
            using var cmd = new MySqlCommand(query, con);

            cmd.Parameters.AddWithValue("@Module", module ?? "");
            cmd.Parameters.AddWithValue("@Action", action ?? "");
            cmd.Parameters.AddWithValue("@Description", description ?? "");
            cmd.Parameters.AddWithValue("@UserId", userId);
            cmd.Parameters.AddWithValue("@UserEmail", userEmail ?? "");
            cmd.Parameters.AddWithValue("@ReferenceId", referenceId ?? "");

            await con.OpenAsync();
            await cmd.ExecuteNonQueryAsync();
        }
    }
}