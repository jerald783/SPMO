using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.Models
{
    public class SmtpSettingsModel
    {
            public string? Server { get; set; } 
    public int Port { get; set; }
    public string? SenderName { get; set; }
    public string? SenderEmail { get; set; }
    public string? Username { get; set; } 
    public string? Password { get; set; } 
    public bool EnableSsl { get; set; }
    }
}