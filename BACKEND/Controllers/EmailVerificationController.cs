using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BACKEND.Models;
using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;

namespace BACKEND.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EmailVerificationController : ControllerBase
    {

        private readonly IConfiguration _configuration;
        public EmailVerificationController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        private MySqlConnection GetConnection()
        {
            return new MySqlConnection(_configuration.GetConnectionString("InvAppCon"));
        }

        // [HttpPost("send-verification")]
        // public async Task<IActionResult> SendVerification([FromBody] EmailRequestModel request)
        // {
        //     if (string.IsNullOrWhiteSpace(request.Email))
        //         return BadRequest(new { message = "Email required." });

        //     string otp = new Random().Next(100000, 999999).ToString();
        //     DateTime expiry = DateTime.UtcNow.AddMinutes(5);

        //     string insertOtp = @"INSERT INTO tbl_email_verification (Email, OtpCode, Expiry)
        //                  VALUES (@Email,@Otp,@Expiry)";

        //     try
        //     {
        //         using var con = GetConnection();
        //         using var cmd = new MySqlCommand(insertOtp, con);

        //         cmd.Parameters.AddWithValue("@Email", request.Email);
        //         cmd.Parameters.AddWithValue("@Otp", otp);
        //         cmd.Parameters.AddWithValue("@Expiry", expiry);

        //         await con.OpenAsync();
        //         await cmd.ExecuteNonQueryAsync();

        //         // Send email
        //         var smtpService = HttpContext.RequestServices.GetRequiredService<SmtpService>();
        //         var smtp = smtpService.GetSmtpSettings();

        //         using var client = new System.Net.Mail.SmtpClient(smtp.Server, smtp.Port)
        //         {
        //             Credentials = new System.Net.NetworkCredential(smtp.Username, smtp.Password),
        //             EnableSsl = smtp.EnableSsl
        //         };

        //         var msg = new System.Net.Mail.MailMessage
        //         {
        //             From = new System.Net.Mail.MailAddress(smtp.SenderEmail, smtp.SenderName),
        //             Subject = "UP Helpdesk Email Verification",
        //             Body = $"Your verification code is <b>{otp}</b><br>This code expires in 5 minutes.",
        //             IsBodyHtml = true
        //         };

        //         msg.To.Add(request.Email);

        //         client.Send(msg);

        //         return Ok(new { message = "Verification email sent." });
        //     }
        //     catch (Exception ex)
        //     {
        //         return StatusCode(500, new { message = "Error sending verification email.", error = ex.Message });
        //     }
        // }
        
        [HttpPost("send-verification")]
public async Task<IActionResult> SendVerification([FromBody] EmailRequestModel request)
{
    if (string.IsNullOrWhiteSpace(request.Email))
        return BadRequest(new { message = "Email required." });

    try
    {
        using var con = GetConnection();
        await con.OpenAsync();

        // ✅ CHECK IF EMAIL ALREADY EXISTS
        string checkUser = "SELECT COUNT(*) FROM tbl_users WHERE Email=@Email";

        using (var checkCmd = new MySqlCommand(checkUser, con))
        {
            checkCmd.Parameters.AddWithValue("@Email", request.Email);

            int userExists = Convert.ToInt32(await checkCmd.ExecuteScalarAsync());

            if (userExists > 0)
            {
                return BadRequest(new { message = "Email is already registered." });
            }
        }

        // GENERATE OTP
        string otp = new Random().Next(100000, 999999).ToString();
        DateTime expiry = DateTime.UtcNow.AddMinutes(5);

        string insertOtp = @"INSERT INTO tbl_email_verification (Email, OtpCode, Expiry)
                             VALUES (@Email,@Otp,@Expiry)";

        using var cmd = new MySqlCommand(insertOtp, con);

        cmd.Parameters.AddWithValue("@Email", request.Email);
        cmd.Parameters.AddWithValue("@Otp", otp);
        cmd.Parameters.AddWithValue("@Expiry", expiry);

        await cmd.ExecuteNonQueryAsync();

        // SEND EMAIL
        var smtpService = HttpContext.RequestServices.GetRequiredService<SmtpService>();
        var smtp = smtpService.GetSmtpSettings();

        using var client = new System.Net.Mail.SmtpClient(smtp.Server, smtp.Port)
        {
            Credentials = new System.Net.NetworkCredential(smtp.Username, smtp.Password),
            EnableSsl = smtp.EnableSsl
        };

        var msg = new System.Net.Mail.MailMessage
        {
            From = new System.Net.Mail.MailAddress(smtp.SenderEmail, smtp.SenderName),
            Subject = "UP Helpdesk Email Verification",
            Body = $"Your verification code is <b>{otp}</b><br>This code expires in 5 minutes.",
            IsBodyHtml = true
        };

        msg.To.Add(request.Email);

        await client.SendMailAsync(msg);

        return Ok(new { message = "Verification email sent." });
    }
    catch (Exception ex)
    {
        return StatusCode(500, new { message = "Error sending verification email.", error = ex.Message });
    }
}
        
        [HttpPost("verify-register")]
        public async Task<IActionResult> VerifyAndRegister([FromBody] RegisterVerificationModel model)
        {
            string checkOtp = @"SELECT OtpCode, Expiry 
                        FROM tbl_email_verification
                        WHERE Email = @Email
                        ORDER BY Id DESC LIMIT 1";

            try
            {
                using var con = GetConnection();
                using var cmd = new MySqlCommand(checkOtp, con);

                cmd.Parameters.AddWithValue("@Email", model.Email);

                await con.OpenAsync();

                string dbOtp = "";
                DateTime expiry = DateTime.UtcNow;

                using (var reader = await cmd.ExecuteReaderAsync())
                {
                    if (await reader.ReadAsync())
                    {
                        dbOtp = reader["OtpCode"].ToString();
                        expiry = Convert.ToDateTime(reader["Expiry"]);
                    }
                    else
                    {
                        return BadRequest(new { message = "No verification found." });
                    }
                }

                if (expiry < DateTime.UtcNow)
                    return BadRequest(new { message = "OTP expired." });

                if (dbOtp != model.Otp)
                    return BadRequest(new { message = "Invalid OTP." });

                // REGISTER USER
                string hashedPassword = BCrypt.Net.BCrypt.HashPassword(model.Password);

                string query = @"INSERT INTO tbl_users (FullName,Password,Email,RoleId)
                         VALUES (@FullName,@Password,@Email,@RoleId)";

                using var insertCmd = new MySqlCommand(query, con);

                insertCmd.Parameters.AddWithValue("@FullName", model.FullName);
                insertCmd.Parameters.AddWithValue("@Password", hashedPassword);
                insertCmd.Parameters.AddWithValue("@Email", model.Email);
                insertCmd.Parameters.AddWithValue("@RoleId", model.RoleId ?? 2);

                await insertCmd.ExecuteNonQueryAsync();

                return Ok(new { message = "User registered successfully." });
            }
            catch
            {
                return StatusCode(500, new { message = "Registration failed." });
            }
        }

        // =====================================================
        // FORGOT PASSWORD
        // =====================================================
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] EmailRequestModel request)
        {
            if (string.IsNullOrWhiteSpace(request.Email))
                return BadRequest(new { message = "Email required." });

            string token = Guid.NewGuid().ToString();
            DateTime expiry = DateTime.UtcNow.AddMinutes(15);

            string query = @"INSERT INTO tbl_password_reset (Email, ResetToken, Expiry)
                             VALUES (@Email,@Token,@Expiry)";

            try
            {
                using var con = GetConnection();
                using var cmd = new MySqlCommand(query, con);

                cmd.Parameters.AddWithValue("@Email", request.Email);
                cmd.Parameters.AddWithValue("@Token", token);
                cmd.Parameters.AddWithValue("@Expiry", expiry);

                await con.OpenAsync();
                await cmd.ExecuteNonQueryAsync();

                string frontendUrl = _configuration["FrontendUrl"] ?? "http://localhost:4200";
                string resetLink = $"{frontendUrl}/#/reset-password?token={token}";

                var smtpService = HttpContext.RequestServices.GetRequiredService<SmtpService>();
                var smtp = smtpService.GetSmtpSettings();

                using var client = new System.Net.Mail.SmtpClient(smtp.Server, smtp.Port)
                {
                    Credentials = new System.Net.NetworkCredential(smtp.Username, smtp.Password),
                    EnableSsl = smtp.EnableSsl
                };

                var msg = new System.Net.Mail.MailMessage
                {
                    From = new System.Net.Mail.MailAddress(smtp.SenderEmail, smtp.SenderName),
                    Subject = "Password Reset Request",
                    Body = $"Click the link to reset your password:<br><a href='{resetLink}'>Reset Password</a><br>This link expires in 15 minutes.",
                    IsBodyHtml = true
                };

                msg.To.Add(request.Email);

                await client.SendMailAsync(msg);

                return Ok(new { message = "If the email exists, a reset link was sent." });
            }
            catch
            {
                return StatusCode(500, new { message = "Error sending reset email." });
            }
        }

        // =====================================================
        // RESET PASSWORD
        // =====================================================
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordModel model)
        {
            string query = @"SELECT Email, Expiry
                             FROM tbl_password_reset
                             WHERE ResetToken=@Token
                             ORDER BY Id DESC LIMIT 1";

            try
            {
                using var con = GetConnection();
                using var cmd = new MySqlCommand(query, con);

                cmd.Parameters.AddWithValue("@Token", model.Token);

                await con.OpenAsync();

                string email = "";
                DateTime expiry;

                using (var reader = await cmd.ExecuteReaderAsync())
                {
                    if (!await reader.ReadAsync())
                        return BadRequest(new { message = "Invalid token." });

                    email = reader["Email"].ToString();
                    expiry = Convert.ToDateTime(reader["Expiry"]);
                }

                if (expiry < DateTime.UtcNow)
                    return BadRequest(new { message = "Token expired." });

                string hashedPassword = BCrypt.Net.BCrypt.HashPassword(model.NewPassword);

                string updateQuery = @"UPDATE tbl_users
                                       SET Password=@Password
                                       WHERE Email=@Email";

                using var updateCmd = new MySqlCommand(updateQuery, con);

                updateCmd.Parameters.AddWithValue("@Password", hashedPassword);
                updateCmd.Parameters.AddWithValue("@Email", email);

                await updateCmd.ExecuteNonQueryAsync();

                // Delete token after reset
                string deleteQuery = "DELETE FROM tbl_password_reset WHERE ResetToken=@Token";

                using var deleteCmd = new MySqlCommand(deleteQuery, con);

                deleteCmd.Parameters.AddWithValue("@Token", model.Token);

                await deleteCmd.ExecuteNonQueryAsync();

                return Ok(new { message = "Password reset successfully." });
            }
            catch
            {
                return StatusCode(500, new { message = "Reset failed." });
            }
        }
    }
}