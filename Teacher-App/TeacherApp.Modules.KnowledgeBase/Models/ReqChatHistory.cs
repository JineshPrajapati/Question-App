using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TeacherApp.Modules.KnowledgeBase.Models
{
    public class ReqChatHistory
    {
        public string? UserId { get; set; }

        public string? ThreadId { get; set; }

        public int? SchoolId { get; set; }

        public int? AcademicYearId { get; set; }

        public int? PageSize { get; set; }

        public int? Offset { get; set; }
        public string? Timestamp { get; set; }
        public string? SearchText { get; set; }

    }
}
