
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using BACKEND.Models;
using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using Google.Apis.Auth;
namespace BACKEND.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        public UserController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        private MySqlConnection GetConnection()
        {
            return new MySqlConnection(_configuration.GetConnectionString("InvAppCon"));
        }

        // ========================
        // GET ALL USERS
        // ========================
        [HttpGet("all")]
        public async Task<IActionResult> GetAllUsers()
        {
            string query = @"SELECT UserId, FullName, Email, RoleId FROM tbl_users";
            DataTable table = new();

            try
            {
                using var con = GetConnection();
                using var cmd = new MySqlCommand(query, con);

                await con.OpenAsync();
                using var reader = await cmd.ExecuteReaderAsync();
                table.Load(reader);

                return Ok(table);
            }
            catch
            {
                return StatusCode(500, new { message = "Error retrieving all users." });
            }
        }

        // ========================
        // GET ROLES
        // ========================
        [HttpGet("roles")]
        public async Task<IActionResult> GetRoles()
        {
            string query = "SELECT RoleId AS id, RoleName AS name FROM tbl_roles";
            DataTable table = new();

            try
            {
                using var con = GetConnection();
                using var cmd = new MySqlCommand(query, con);

                await con.OpenAsync();
                using var reader = await cmd.ExecuteReaderAsync();
                table.Load(reader);

                var roles = table.AsEnumerable().Select(row => new
                {
                    id = row.Field<int>("id"),
                    name = row.Field<string>("name")
                });

                return Ok(roles);
            }
            catch
            {
                return StatusCode(500, new { message = "Error retrieving roles." });
            }
        }



        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] UserModel user)
        {
            if (string.IsNullOrWhiteSpace(user.FullName) ||
                string.IsNullOrWhiteSpace(user.Password) ||
                string.IsNullOrWhiteSpace(user.Email))
            {
                return BadRequest(new { message = "All fields are required." });
            }

            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(user.Password);

            string query = @"INSERT INTO tbl_users (FullName, Password, Email, RoleId) 
                     VALUES (@FullName, @Password, @Email, @RoleId);
                     SELECT LAST_INSERT_ID();";

            try
            {
                using var con = GetConnection();
                using var cmd = new MySqlCommand(query, con);

                cmd.Parameters.Add("@FullName", MySqlDbType.VarChar).Value = user.FullName;
                cmd.Parameters.Add("@Password", MySqlDbType.VarChar).Value = hashedPassword;
                cmd.Parameters.Add("@Email", MySqlDbType.VarChar).Value = user.Email;
                cmd.Parameters.Add("@RoleId", MySqlDbType.Int32).Value = user.RoleId ?? 2;

                await con.OpenAsync();
                var newUserId = Convert.ToInt32(await cmd.ExecuteScalarAsync());

                //  Log who created this account
                var (currentUserId, currentUserEmail) = GetCurrentUser();

                await LogAudit(
                    currentUserId,
                    currentUserEmail,
                    "Register",
                    $"Created new user: {user.Email} (FullName: {user.FullName}, RoleId: {user.RoleId})"
                );

                return Ok(new { message = "User registered successfully.", userId = newUserId });
            }
            catch
            {
                return StatusCode(500, new { message = "Error registering user." });
            }
        }
        private (int? userId, string? email) GetCurrentUser()
        {
            var identity = HttpContext.User.Identity as ClaimsIdentity;
            if (identity == null || !identity.IsAuthenticated)
                return (null, null);

            var userIdClaim = identity.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var emailClaim = identity.FindFirst(ClaimTypes.Name)?.Value; // or ClaimTypes.Email if you used that in JWT

            int? userId = null;
            if (int.TryParse(userIdClaim, out var parsedId))
            {
                userId = parsedId;
            }

            return (userId, emailClaim);
        }

        // ========================
        // UPDATE USER
        // ========================
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UserModel user)
        {
            if (string.IsNullOrWhiteSpace(user.Email) || string.IsNullOrWhiteSpace(user.Password))
            {
                return BadRequest(new { message = "Email and Password are required." });
            }

            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(user.Password);

            string query = @"UPDATE tbl_users 
                             SET FullName = @FullName, Password = @Password, RoleId = @RoleId 
                             WHERE UserId = @UserId";

            try
            {
                using var con = GetConnection();
                using var cmd = new MySqlCommand(query, con);

                cmd.Parameters.Add("@FullName", MySqlDbType.VarChar).Value = user.FullName;
                cmd.Parameters.Add("@Password", MySqlDbType.VarChar).Value = hashedPassword;
                cmd.Parameters.Add("@RoleId", MySqlDbType.Int32).Value = user.RoleId ?? 2;
                cmd.Parameters.Add("@UserId", MySqlDbType.Int32).Value = id;

                await con.OpenAsync();
                int rowsAffected = await cmd.ExecuteNonQueryAsync();

                if (rowsAffected > 0)
                    return Ok(new { message = "User updated successfully." });
                else
                    return NotFound(new { message = "User not found." });
            }
            catch
            {
                return StatusCode(500, new { message = "Error updating user." });
            }
        }


        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] UserLoginModel user)
        {
            if (string.IsNullOrWhiteSpace(user.Email) || string.IsNullOrWhiteSpace(user.Password))
            {
                return BadRequest(new { message = "Email and Password are required." });
            }

            string query = @"SELECT u.UserId,  u.FullName,u.Password, u.FailedAttempts, u.LockoutEnd, r.RoleName
                     FROM tbl_users u
                     JOIN tbl_roles r ON u.RoleId = r.RoleId
                     WHERE u.Email = @Email";

            try
            {
                using var con = GetConnection();
                using var cmd = new MySqlCommand(query, con);
                cmd.Parameters.Add("@Email", MySqlDbType.VarChar).Value = user.Email;

                await con.OpenAsync();

                int userId = 0;
                string? fullName = null;
                string? storedPassword = null;
                string? roleName = null;
                int failedAttempts = 0;
                DateTime? lockoutEnd = null;

                using (var reader = await cmd.ExecuteReaderAsync())
                {
                    if (await reader.ReadAsync())
                    {
                        userId = Convert.ToInt32(reader["UserId"]);
                        fullName = reader["FullName"].ToString();
                        storedPassword = reader["Password"].ToString();
                        roleName = reader["RoleName"].ToString();
                        failedAttempts = Convert.ToInt32(reader["FailedAttempts"]);
                        lockoutEnd = reader.IsDBNull(reader.GetOrdinal("LockoutEnd"))
                                        ? null
                                        : reader.GetDateTime("LockoutEnd");
                    }
                    else
                    {
                        await LogAudit(null, user.Email, "LoginFailed", "Email not found");
                        return Unauthorized(new { message = "Invalid email or password." });
                    }
                }

                // 🔒 Check lockout
                if (lockoutEnd.HasValue && lockoutEnd.Value > DateTime.UtcNow)
                {
                    var remaining = lockoutEnd.Value - DateTime.UtcNow;
                    return Unauthorized(new
                    {
                        message = $"Account locked. Try again in {remaining.Minutes:D2}:{remaining.Seconds:D2}"
                    });
                }

                //  Correct password
                if (!string.IsNullOrEmpty(storedPassword) && BCrypt.Net.BCrypt.Verify(user.Password, storedPassword))
                {
                    // Reset attempts
                    string resetSql = "UPDATE tbl_users SET FailedAttempts = 0, LockoutEnd = NULL WHERE UserId = @UserId";
                    using (var resetCmd = new MySqlCommand(resetSql, con))
                    {
                        resetCmd.Parameters.AddWithValue("@UserId", userId);
                        await resetCmd.ExecuteNonQueryAsync();
                    }

                    await LogAudit(userId, user.Email, "LoginSuccess", "User logged in successfully");

                    // Generate JWT
                    var secretKey = _configuration["JwtSettings:SecretKey"];
                    var issuer = _configuration["JwtSettings:Issuer"];
                    var audience = _configuration["JwtSettings:Audience"];
                    var expiration = _configuration["JwtSettings:ExpirationMinutes"];

                    var claims = new[]
                    {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
                new Claim(ClaimTypes.Name, user.Email),
 new Claim("FullName", fullName ?? ""),   // 👈 Add FullName claim
                new Claim(ClaimTypes.Role, roleName ?? "User")
            };

                    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
                    var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

                    var token = new JwtSecurityToken(
                        issuer: issuer,
                        audience: audience,
                        claims: claims,
                        expires: DateTime.UtcNow.AddMinutes(Convert.ToDouble(expiration)),
                        signingCredentials: creds
                    );

                    var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

                    return Ok(new { token = tokenString, role = roleName, userId, fullName });
                }
                else
                {
                    // ❌ Wrong password
                    failedAttempts++;
                    DateTime? newLockoutEnd = null;

                    if (failedAttempts >= 5)
                    {
                        // 🔒 Lockout for 3 minutes
                        newLockoutEnd = DateTime.UtcNow.AddMinutes(3);
                    }

                    string updateSql = "UPDATE tbl_users SET FailedAttempts = @Attempts, LockoutEnd = @LockoutEnd WHERE UserId = @UserId";
                    using (var updateCmd = new MySqlCommand(updateSql, con))
                    {
                        updateCmd.Parameters.AddWithValue("@Attempts", failedAttempts);
                        updateCmd.Parameters.AddWithValue("@LockoutEnd", (object?)newLockoutEnd ?? DBNull.Value);
                        updateCmd.Parameters.AddWithValue("@UserId", userId);
                        await updateCmd.ExecuteNonQueryAsync();
                    }

                    await LogAudit(userId, user.Email, "LoginFailed", "Invalid password");

                    if (newLockoutEnd.HasValue)
                    {
                        return Unauthorized(new { message = "Too many failed attempts. Account locked for 3 minutes." });
                    }

                    return Unauthorized(new { message = $"Invalid email or password. Attempts left: {5 - failedAttempts}" });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Login error: {ex.Message}\n{ex.StackTrace}");
                return StatusCode(500, new { message = "Error during login.", error = ex.Message });
            }
        }

[HttpGet("agents")]
public async Task<IActionResult> GetAgents()
{
    string query = @"SELECT Email 
                     FROM tbl_users u
                     JOIN tbl_roles r ON u.RoleId = r.RoleId
                     WHERE r.RoleName = 'Agent' OR r.RoleName = 'IT Support'";

    List<string> agents = new();

    try
    {
        using var con = GetConnection();
        using var cmd = new MySqlCommand(query, con);

        await con.OpenAsync();
        using var reader = await cmd.ExecuteReaderAsync();

        while (await reader.ReadAsync())
        {
            agents.Add(reader["Email"].ToString());
        }

        return Ok(agents);
    }
    catch
    {
        return StatusCode(500, new { message = "Error retrieving agents." });
    }
}


[HttpGet("zoom-recipients")]
public async Task<IActionResult> GetZoomRecipients()
{
    string query = @"SELECT Email
                     FROM tbl_users u
                     JOIN tbl_roles r ON u.RoleId = r.RoleId
                     WHERE r.RoleName IN ('Agent','Admin')";

    List<string> recipients = new();

    try
    {
        using var con = GetConnection();
        using var cmd = new MySqlCommand(query, con);

        await con.OpenAsync();
        using var reader = await cmd.ExecuteReaderAsync();

        while (await reader.ReadAsync())
        {
            recipients.Add(reader["Email"].ToString());
        }

        return Ok(recipients);
    }
    catch
    {
        return StatusCode(500, new { message = "Error retrieving zoom recipients." });
    }
}
        // ========================
        // CHECK EMAIL
        // ========================
        [HttpPost("check-email")]
        public async Task<IActionResult> CheckEmail([FromBody] EmailRequestModel request)
        {
            if (string.IsNullOrWhiteSpace(request.Email))
            {
                return BadRequest(new { message = "Email is required." });
            }

            string query = "SELECT RoleId FROM tbl_users WHERE Email = @Email";
            try
            {
                using var con = GetConnection();
                using var cmd = new MySqlCommand(query, con);
                cmd.Parameters.Add("@Email", MySqlDbType.VarChar).Value = request.Email;

                await con.OpenAsync();
                using var reader = await cmd.ExecuteReaderAsync();

                if (await reader.ReadAsync())
                {
                    int roleId = Convert.ToInt32(reader["RoleId"]);
                    return Ok(new { exists = true, roleId });
                }

                return Ok(new { exists = false });
            }
            catch
            {
                return StatusCode(500, new { message = "Error checking email." });
            }
        }

        // ========================
        // HELPER: Log Audit Trail
        // ========================
        //     private async Task LogAudit(int? userId, string email, string action, string details)
        //     {
        //         string query = @"INSERT INTO log_user (UserId, Email, Action, Details) 
        //                          VALUES (@UserId, @Email, @Action, @Details)";

        //         try
        //         {
        //             using var con = GetConnection();
        //             using var cmd = new MySqlCommand(query, con);

        //             if (userId.HasValue)
        //                 cmd.Parameters.Add("@UserId", MySqlDbType.Int32).Value = userId.Value;
        //             else
        //                 cmd.Parameters.Add("@UserId", MySqlDbType.Int32).Value = DBNull.Value;

        //             cmd.Parameters.Add("@Email", MySqlDbType.VarChar).Value = email;
        //             cmd.Parameters.Add("@Action", MySqlDbType.VarChar).Value = action;
        //             cmd.Parameters.Add("@Details", MySqlDbType.Text).Value = details;

        //             await con.OpenAsync();
        //             await cmd.ExecuteNonQueryAsync();
        //         }
        //         catch
        //         {
        //             // ⚠️ Ignore logging errors (do not break main logic)
        //         }
        //     }
        // }

        
        private async Task LogAudit(int? userId, string email, string action, string details)
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
                // ⚠️ Ignore logging errors (do not break main logic)

            }
        }


        
    }
    

}

