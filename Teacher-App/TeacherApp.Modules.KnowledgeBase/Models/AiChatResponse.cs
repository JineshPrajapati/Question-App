using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TeacherApp.Modules.KnowledgeBase.Models
{
    public class AiChatResponse
    {
        public string? MessageId { get; set; }
        public string? Message { get; set; }
        public string? Answer { get; set; }
        public string? Sender { get; set; }
        public string? Content { get; set; }
    }
}
