// using System;
// using System.Collections.Generic;
// using System.IdentityModel.Tokens.Jwt;
// using System.Linq;
// using System.Security.Claims;
// using System.Text;
// using System.Threading.Tasks;
// using BACKEND.Models;
// using Google.Apis.Auth;
// using Microsoft.AspNetCore.Mvc;
// using Microsoft.IdentityModel.Tokens;
// using MySql.Data.MySqlClient;

// namespace BACKEND.Controllers
// {
//     [ApiController]
//     [Route("api/[controller]")]
//     public class GoogleLoginController : ControllerBase
//     {

//         private IConfiguration _configuration;

//         public GoogleLoginController(IConfiguration configuration)
//         {
//             _configuration = configuration;
//         }

//         private MySqlConnection GetConnection()
//         {
//             return new MySqlConnection(_configuration.GetConnectionString("InvAppCon"));
//         }
//           [HttpGet("google-client-id")]
// public async Task<IActionResult> GetGoogleClientId()
// {
//     string query = "SELECT SettingValue FROM tbl_googlelogin WHERE SettingKey = 'google_client_id' LIMIT 1";

//     try
//     {
//         using var con = GetConnection();
//         using var cmd = new MySqlCommand(query, con);

//         await con.OpenAsync();
//         var result = await cmd.ExecuteScalarAsync();

//         if (result == null)
//         {
//             return NotFound(new { message = "Google Client ID not found." });
//         }

//         return Ok(new { clientId = result.ToString() });
//     }
//     catch
//     {
//         return StatusCode(500, new { message = "Error retrieving Google Client ID." });
//     }
// }
//        [HttpPost("google-login")]
// public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginRequest request)
// {
//     try
//     {
//         // Validate Google token
//         var payload = await GoogleJsonWebSignature.ValidateAsync(request.Token);

//         string email = payload.Email;
//         string fullName = payload.Name;

//         string query = @"SELECT u.UserId, u.FullName, r.RoleName
//                          FROM tbl_users u
//                          JOIN tbl_roles r ON u.RoleId = r.RoleId
//                          WHERE u.Email = @Email";

//         using var con = GetConnection();
//         using var cmd = new MySqlCommand(query, con);

//         cmd.Parameters.AddWithValue("@Email", email);

//         await con.OpenAsync();

//         int userId = 0;
//         string roleName = "";
//         string dbFullName = "";

//         using (var reader = await cmd.ExecuteReaderAsync())
//         {
//             if (!await reader.ReadAsync())
//             {
//                 return Unauthorized(new
//                 {
//                     message = "This Google account is not registered in the system."
//                 });
//             }

//             userId = Convert.ToInt32(reader["UserId"]);
//             roleName = reader["RoleName"].ToString();
//             dbFullName = reader["FullName"].ToString();
//         }

//         // Generate JWT
//         var claims = new[]
//         {
//             new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
//             new Claim(ClaimTypes.Name, email),
//             new Claim("FullName", dbFullName),
//             new Claim(ClaimTypes.Role, roleName)
//         };

//         var key = new SymmetricSecurityKey(
//             Encoding.UTF8.GetBytes(_configuration["JwtSettings:SecretKey"])
//         );

//         var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

//         var token = new JwtSecurityToken(
//             issuer: _configuration["JwtSettings:Issuer"],
//             audience: _configuration["JwtSettings:Audience"],
//             claims: claims,
//             expires: DateTime.UtcNow.AddMinutes(
//                 Convert.ToDouble(_configuration["JwtSettings:ExpirationMinutes"])
//             ),
//             signingCredentials: creds
//         );

//         var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

//         return Ok(new
//         {
//             token = tokenString,
//             email,
//             fullName = dbFullName,
//             role = roleName
//         });
//     }
//     catch
//     {
//         return Unauthorized(new { message = "Invalid Google token." });
//     }
// }
// [HttpPut("update-google-client-id")]
// public async Task<IActionResult> UpdateGoogleClientId([FromBody] dynamic data)
// {
//     string query = @"UPDATE tbl_googlelogin 
//                      SET SettingValue=@clientId
//                      WHERE SettingKey='google_client_id'";

//     try
//     {
//         using var con = GetConnection();
//         using var cmd = new MySqlCommand(query, con);

//         cmd.Parameters.AddWithValue("@clientId", data.clientId.ToString());

//         await con.OpenAsync();
//         await cmd.ExecuteNonQueryAsync();

//         return Ok(new { message = "Google Client ID updated successfully" });
//     }
//     catch
//     {
//         return StatusCode(500, new { message = "Error updating Google Client ID" });
//     }
// }
       
//     }
// }

using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using BACKEND.Models;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using MySql.Data.MySqlClient;

namespace BACKEND.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GoogleLoginController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        public GoogleLoginController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        private MySqlConnection GetConnection()
        {
            return new MySqlConnection(_configuration.GetConnectionString("InvAppCon"));
        }

        // ========================
        // GET GOOGLE CLIENT ID
        // ========================
        [HttpGet("google-client-id")]
        public async Task<IActionResult> GetGoogleClientId()
        {
            string query = "SELECT SettingValue FROM tbl_googlelogin WHERE SettingKey = 'google_client_id' LIMIT 1";

            try
            {
                using var con = GetConnection();
                using var cmd = new MySqlCommand(query, con);

                await con.OpenAsync();
                var result = await cmd.ExecuteScalarAsync();

                if (result == null)
                    return NotFound(new { message = "Google Client ID not found." });

                return Ok(new { clientId = result.ToString() });
            }
            catch
            {
                return StatusCode(500, new { message = "Error retrieving Google Client ID." });
            }
        }

        // ========================
        // GOOGLE LOGIN
        // ========================
        [HttpPost("google-login")]
        public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginRequest request)
        {
            try
            {
                // Validate Google token
                var payload = await GoogleJsonWebSignature.ValidateAsync(request.Token);

                string email = payload.Email;
                string fullName = payload.Name;

                string query = @"SELECT u.UserId, u.FullName, r.RoleName
                                 FROM tbl_users u
                                 JOIN tbl_roles r ON u.RoleId = r.RoleId
                                 WHERE u.Email = @Email";

                using var con = GetConnection();
                using var cmd = new MySqlCommand(query, con);
                cmd.Parameters.AddWithValue("@Email", email);

                await con.OpenAsync();

                int userId = 0;
                string roleName = "";
                string dbFullName = "";

                using (var reader = await cmd.ExecuteReaderAsync())
                {
                    if (!await reader.ReadAsync())
                    {
                        // ❌ Log failed Google login
                        await LogAudit(null, email, "GoogleLoginFailed", "Google account not registered in the system");
                        return Unauthorized(new
                        {
                            message = "This Google account is not registered in the system."
                        });
                    }

                    userId = Convert.ToInt32(reader["UserId"]);
                    roleName = reader["RoleName"].ToString();
                    dbFullName = reader["FullName"].ToString();
                }

                // ✅ Log successful Google login
                await LogAudit(userId, email, "GoogleLoginSuccess", $"User logged in with Google: {dbFullName}");

                // Generate JWT
                var claims = new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
                    new Claim(ClaimTypes.Name, email),
                    new Claim("FullName", dbFullName),
                    new Claim(ClaimTypes.Role, roleName)
                };

                var key = new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(_configuration["JwtSettings:SecretKey"])
                );

                var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

                var token = new JwtSecurityToken(
                    issuer: _configuration["JwtSettings:Issuer"],
                    audience: _configuration["JwtSettings:Audience"],
                    claims: claims,
                    expires: DateTime.UtcNow.AddMinutes(
                        Convert.ToDouble(_configuration["JwtSettings:ExpirationMinutes"])
                    ),
                    signingCredentials: creds
                );

                var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

                return Ok(new
                {
                    token = tokenString,
                    email,
                    fullName = dbFullName,
                    role = roleName
                });
            }
            catch
            {
                // ❌ Log invalid token attempt
                await LogAudit(null, null, "GoogleLoginFailed", "Invalid Google token");
                return Unauthorized(new { message = "Invalid Google token." });
            }
        }

        // ========================
        // UPDATE GOOGLE CLIENT ID
        // ========================
        [HttpPut("update-google-client-id")]
        public async Task<IActionResult> UpdateGoogleClientId([FromBody] dynamic data)
        {
            string query = @"UPDATE tbl_googlelogin 
                             SET SettingValue=@clientId
                             WHERE SettingKey='google_client_id'";

            try
            {
                using var con = GetConnection();
                using var cmd = new MySqlCommand(query, con);

                cmd.Parameters.AddWithValue("@clientId", data.clientId.ToString());

                await con.OpenAsync();
                await cmd.ExecuteNonQueryAsync();

                // ✅ Log client ID update
                await LogAudit(null, "System", "UpdateGoogleClientID", $"Updated Google Client ID to: {data.clientId}");

                return Ok(new { message = "Google Client ID updated successfully" });
            }
            catch
            {
                return StatusCode(500, new { message = "Error updating Google Client ID" });
            }
        }

        // ========================
        // HELPER: Log Audit Trail
        // ========================
        private async Task LogAudit(int? userId, string? email, string action, string details)
        {
            string query = @"INSERT INTO log_user (UserId, Email, Action, Details) 
                             VALUES (@UserId, @Email, @Action, @Details)";

            try
            {
                using var con = GetConnection();
                using var cmd = new MySqlCommand(query, con);

                cmd.Parameters.Add("@UserId", MySqlDbType.Int32).Value = userId ?? (object)DBNull.Value;
                cmd.Parameters.Add("@Email", MySqlDbType.VarChar).Value = email ?? "Unknown";
                cmd.Parameters.Add("@Action", MySqlDbType.VarChar).Value = action;
                cmd.Parameters.Add("@Details", MySqlDbType.Text).Value = details;

                await con.OpenAsync();
                await cmd.ExecuteNonQueryAsync();
            }
            catch
            {
                // ⚠️ Ignore logging errors
            }
        }
    }
}