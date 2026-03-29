

using Microsoft.AspNetCore.Mvc;
using System.Net;
using System.Net.Mail;
using BACKEND.Models;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MailController : ControllerBase
    {
        private readonly SmtpService _smtpService;

        public MailController(SmtpService smtpService)
        {
            _smtpService = smtpService;
        }

        [HttpPost("send")]
        public IActionResult SendEmail([FromBody] EmailPayloadModel payload)
        {
            try
            {
                var smtp = _smtpService.GetSmtpSettings();

                using var client = new SmtpClient(smtp.Server, smtp.Port)
                {
                    Credentials = new NetworkCredential(smtp.Username, smtp.Password),
                    EnableSsl = smtp.EnableSsl
                };

                // Send to customer
                if (!string.IsNullOrWhiteSpace(payload.To))
                {
                    var userMsg = new MailMessage
                    {
                        From = new MailAddress(smtp.SenderEmail, smtp.SenderName),
                        Subject = payload.Subject,
                        Body = payload.Body,
                        IsBodyHtml = true
                    };

                    userMsg.To.Add(payload.To);
                    client.Send(userMsg);
                }

                // Send to agents
                if (payload.Agents != null && payload.Agents.Any())
                {
                    foreach (var agent in payload.Agents)
                    {
                        var agentMsg = new MailMessage
                        {
                            From = new MailAddress(smtp.SenderEmail, smtp.SenderName),
                            Subject = payload.AgentSubject ?? payload.Subject,
                            Body = payload.AgentBody ?? payload.Body,
                            IsBodyHtml = true
                        };

                        agentMsg.To.Add(agent);
                        client.Send(agentMsg);
                    }
                }

                return Ok(new { message = "✅ Email sent to customer and agents." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "❌ Failed to send emails.", error = ex.Message });
            }
        }

     
    }

    
}

// using Microsoft.AspNetCore.Mvc;
// using System.Net;
// using System.Net.Mail;
// using Microsoft.Extensions.Configuration;
// using BACKEND.Models;

// namespace Backend.Controllers
// {
//     [ApiController]
//     [Route("api/[controller]")]
//     public class MailController : ControllerBase
//     {
//         private readonly IConfiguration _config;

//         public MailController(IConfiguration config)
//         {
//             _config = config;
//         }

//         //     [HttpPost("send")]
//         //     public IActionResult SendEmail([FromBody] EmailPayload payload)
//         //     {
//         //         try
//         //         {
//         //             var smtpSettings = _config.GetSection("SmtpSettings");

//         //             var client = new SmtpClient(smtpSettings["Server"], int.Parse(smtpSettings["Port"]))
//         //             {
//         //                 Credentials = new NetworkCredential(
//         //                     smtpSettings["Username"],
//         //                     smtpSettings["Password"]
//         //                 ),
//         //                 EnableSsl = bool.Parse(smtpSettings["EnableSsl"])
//         //             };

//         //             var mailMessage = new MailMessage
//         //             {
//         //                 From = new MailAddress(smtpSettings["SenderEmail"], smtpSettings["SenderName"]),
//         //                 Subject = payload.Subject,
//         //                 Body = payload.Body,
//         //                 IsBodyHtml = true
//         //             };

//         //             //  Use the recipient from Angular
//         //             mailMessage.To.Add(payload.To);

//         //             client.Send(mailMessage);
//         //             return Ok(new { message = " Email sent successfully!" });
//         //         }
//         //         catch (Exception ex)
//         //         {
//         //             return StatusCode(500, new { message = "❌ Failed to send email.", error = ex.Message });
//         //         }
//         //     }
//         // }
//         // [HttpPost("send")]
//         // public IActionResult SendEmail([FromBody] EmailPayload payload)
//         // {
//         //     try
//         //     {
//         //         var smtpSettings = _config.GetSection("SmtpSettings");

//         //         var client = new SmtpClient(smtpSettings["Server"], int.Parse(smtpSettings["Port"]))
//         //         {
//         //             Credentials = new NetworkCredential(
//         //                 smtpSettings["Username"],
//         //                 smtpSettings["Password"]
//         //             ),
//         //             EnableSsl = bool.Parse(smtpSettings["EnableSsl"])
//         //         };

//         //         var mailMessage = new MailMessage
//         //         {
//         //             From = new MailAddress(smtpSettings["SenderEmail"], smtpSettings["SenderName"]),
//         //             Subject = payload.Subject,
//         //             Body = payload.Body,
//         //             IsBodyHtml = true
//         //         };

//         //         //  1. Send to the user
//         //         if (!string.IsNullOrWhiteSpace(payload.To))
//         //         {
//         //             mailMessage.To.Add(payload.To);
//         //         }

//         //         //  2. Send also to the assigned agents
//         //         if (payload.Agents != null)
//         //         {
//         //             foreach (var agent in payload.Agents)
//         //             {
//         //                 if (!string.IsNullOrWhiteSpace(agent))
//         //                     mailMessage.CC.Add(agent);
//         //             }
//         //         }

//         //         client.Send(mailMessage);
//         //         return Ok(new { message = " Email sent successfully to user and agents!" });
//         //     }
//         //     catch (Exception ex)
//         //     {
//         //         return StatusCode(500, new { message = "❌ Failed to send email.", error = ex.Message });
//         //     }
//         // }
//         [HttpPost("send")]
//         public IActionResult SendEmail([FromBody] EmailPayloadModel payload)
//         {
//             try
//             {
//                 var smtp = _config.GetSection("SmtpSettings");

//                 using var client = new SmtpClient(smtp["Server"], int.Parse(smtp["Port"]))
//                 {
//                     Credentials = new NetworkCredential(smtp["Username"], smtp["Password"]),
//                     EnableSsl = bool.Parse(smtp["EnableSsl"])
//                 };

//                 //  Send to the customer
//                 if (!string.IsNullOrWhiteSpace(payload.To))
//                 {
//                     var userMsg = new MailMessage
//                     {
//                         From = new MailAddress(smtp["SenderEmail"], smtp["SenderName"]),
//                         Subject = payload.Subject,
//                         Body = payload.Body,
//                         IsBodyHtml = true
//                     };
//                     userMsg.To.Add(payload.To);
//                     client.Send(userMsg);
//                 }

//                 //  Send to each agent (with their custom content)
//                 if (payload.Agents != null && payload.Agents.Any())
//                 {
//                     foreach (var agent in payload.Agents)
//                     {
//                         var agentMsg = new MailMessage
//                         {
//                             From = new MailAddress(smtp["SenderEmail"], smtp["SenderName"]),
//                             Subject = payload.AgentSubject ?? payload.Subject,
//                             Body = payload.AgentBody ?? payload.Body,
//                             IsBodyHtml = true
//                         };
//                         agentMsg.To.Add(agent);
//                         client.Send(agentMsg);
//                     }
//                 }

//                 return Ok(new { message = "✅ Email sent to customer and agents." });
//             }
//             catch (Exception ex)
//             {
//                 return StatusCode(500, new { message = "❌ Failed to send emails.", error = ex.Message });
//             }
//         }

//         // 👇 Match Angular structure


//     }
// }
