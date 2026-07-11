using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TeacherApp.Modules.KnowledgeBase.Models
{
    public class AiAssistentChatEntity
    {
        public string? Id {  get; set; }
        public string ThreadId {  get; set; }
        public string Title { get; set; }

        public string? Timestamp { get; set; }
        public DateTime? CreatedAt { get; set; }
        public string LastSender { get; set; }
        public string? Sender { get; set; }
        public string? Content { get; set; }
        public string LastMessagePreview { get; set; }
        public DateTime? LastActivityAt { get; set; }
        public int? MessageCount { get; set; }

    }
}
