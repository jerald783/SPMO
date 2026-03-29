using System;
using System.Threading.Tasks;
using BACKEND.Hubs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using MySql.Data.MySqlClient;

namespace BACKEND.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SmtpController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly IHubContext<NotificationHub> _hubContext;

        public SmtpController(IConfiguration configuration, IHubContext<NotificationHub> hubContext)
        {
            _configuration = configuration;
            _hubContext = hubContext;
        }

        private MySqlConnection GetConnection()
        {
            return new MySqlConnection(_configuration.GetConnectionString("InvAppCon"));
        }

        // GET SMTP SETTINGS
        [HttpGet("smtp-settings")]
        public async Task<IActionResult> GetSmtpSettings()
        {
            string query = "SELECT * FROM tbl_smtp_settings LIMIT 1";

            try
            {
                using var con = GetConnection();
                using var cmd = new MySqlCommand(query, con);

                await con.OpenAsync();

                using var reader = await cmd.ExecuteReaderAsync();

                if (await reader.ReadAsync())
                {
                    var smtp = new
                    {
                        server = reader["server"].ToString(),
                        port = Convert.ToInt32(reader["port"]),
                        senderName = reader["sender_name"].ToString(),
                        senderEmail = reader["sender_email"].ToString(),
                        username = reader["username"].ToString(),
                        password = reader["password"].ToString(),
                        enableSsl = Convert.ToBoolean(reader["enable_ssl"])
                    };

                    return Ok(smtp);
                }

                return NotFound(new { message = "SMTP settings not found." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving SMTP settings.", error = ex.Message });
            }
        }
        [HttpPut("update-smtp")]
public async Task<IActionResult> UpdateSmtp([FromBody] dynamic smtp)
{
    string query = @"UPDATE tbl_smtp_settings 
                     SET server=@server,
                         port=@port,
                         sender_name=@senderName,
                         sender_email=@senderEmail,
                         username=@username,
                         password=@password,
                         enable_ssl=@enableSsl";

    try
    {
        using var con = GetConnection();
        using var cmd = new MySqlCommand(query, con);

        cmd.Parameters.AddWithValue("@server", smtp.server.ToString());
        cmd.Parameters.AddWithValue("@port", Convert.ToInt32(smtp.port));
        cmd.Parameters.AddWithValue("@senderName", smtp.senderName.ToString());
        cmd.Parameters.AddWithValue("@senderEmail", smtp.senderEmail.ToString());
        cmd.Parameters.AddWithValue("@username", smtp.username.ToString());
        cmd.Parameters.AddWithValue("@password", smtp.password.ToString());
        cmd.Parameters.AddWithValue("@enableSsl", Convert.ToBoolean(smtp.enableSsl));

        await con.OpenAsync();
        await cmd.ExecuteNonQueryAsync();

        return Ok(new { message = "SMTP settings updated successfully" });
    }
    catch (Exception ex)
    {
        return StatusCode(500, new { message = "Error updating SMTP settings", error = ex.Message });
    }
}
    }
}