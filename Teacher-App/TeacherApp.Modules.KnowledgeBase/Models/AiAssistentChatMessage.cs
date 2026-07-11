using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TeacherApp.Modules.KnowledgeBase.Models
{
    public class AiAssistentChatMessage
    {
        public string? MessageId { get; set; }

        public int? AcademicYearId { get; set; }

        public string? UserId { get; set; }

        public int? SchoolId { get; set; }

        public string? ThreadId { get; set; }

        public string? Sender { get; set; }

        public string? Content { get; set; }

        public DateTime? CreatedAt { get; set; }

    }
}
