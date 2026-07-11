using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TeacherApp.Modules.Admin.Entities
{
    public class ChatMessagesEntity
    {
        public int MessageId { get; set; }
        public string SenderId { get; set; }
        public string ReceiverId { get; set; }
        public string MessageText { get; set; }
        public global::System.DateTime Time { get; set; }
        public bool IsRead { get; set; }

        public string FilePath { get; set; }
        public string FileName { get; set; }
        public string FileIdentityId { get; set; }

        public int? ReplyToMessageId { get; set; }
        public string ReplyToMessageText { get; set; }
        public string ReplyToFileName { get; set; }
        public int ReplyToFileIdentityId { get; set; }
        public bool IsBroadcast { get; set; }
    }

    public class SendMessage
    {

        public string SenderId { get; set; }
        public string ReceiverId { get; set; }
        public string MessageText { get; set; }

        public string Base64File { get; set; }     
        public string FileName { get; set; }      
        public string FileType { get; set; }     
        public string? StorePath { get; set; }      
        public int? SchoolId { get; set; }
        public int? ReplyToMessageId { get; set; }

        public string? ReceiverIds { get; set; }
        public bool? IsGroupMessage { get; set; } 
        public int? GradeId { get; set; }
    }

    public class ExportChatHistoryEntity 
    {
        public string UserName { get; set; }
        public string ChatUserName { get; set; }
        public string SenderName { get; set; }
        public string ReceiverName { get; set; }
        public string? MessageText { get; set; }
        public string? FileName { get; set; }
        public DateTime Time { get; set; }
        public string? ReplyToMessage { get; set; }
        public string? ReplyToFile { get; set; }
    }
}
