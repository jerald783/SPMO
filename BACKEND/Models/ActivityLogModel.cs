using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BACKEND.Models
{
    public class ActivityLogModel
    {
        public string Module { get; set; } = "";
        public string Action { get; set; } = "";
        public string Description { get; set; } = "";
        public int? UserId { get; set; }
        public string? UserEmail { get; set; }
        public string? ReferenceId { get; set; }
    }
}