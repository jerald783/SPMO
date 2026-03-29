using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BACKEND.Models
{
    public class UserModel
    {


        public string? FullName { get; set; }
        public string? Password { get; set; }
        public string? Email { get; set; }
        public int? RoleId { get; set; }  // RoleId for RBAC

        // NEW: who created this user
        public int? CreatedById { get; set; }
        public string? CreatedByEmail { get; set; }
        // NEW: security/lockout fields
        public int FailedAttempts { get; set; } = 0;  // How many times login failed
        public DateTime? LockoutEnd { get; set; }     // Until when the account is locked
    }
    public class UserLoginModel
    {
        public string Email { get; set; } = "";
        public string Password { get; set; } = "";
    }
    public class LogoutRequestModel
    {
        public int UserId { get; set; }
        public string? Email { get; set; }
    }

    public class EmailRequestModel
    {
        public string Email { get; set; } = string.Empty;
    }


}
