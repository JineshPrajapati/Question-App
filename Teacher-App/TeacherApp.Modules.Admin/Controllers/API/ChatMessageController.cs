using iText.IO.Font.Constants;
using iText.Kernel.Font;
using iText.Kernel.Pdf;
using iText.Layout;
using iText.Layout.Element;
using iText.Layout.Properties;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TeacherApp.Modules.Admin.Entities;
using TeacherApp.Modules.Admin.Modules;
using TeacherApp.Modules.Admin.Services;
using TeacherApp.Modules.Helper.Controllers;


namespace TeacherApp.Modules.Admin.Controllers.API
{
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [Route("api/ChatMessage/")]
    public class ChatMessageController : BaseController
    {
        private readonly ChatMessageService _chatMessageService;
        private readonly IHubContext<ChatHub> _hubContext;
        public ChatMessageController(ChatMessageService chatMessageService
            , IHttpContextAccessor httpContextAccessor, IConfiguration configuration, IHubContext<ChatHub> hubContext) : base(httpContextAccessor, configuration)
        {
            this._chatMessageService = chatMessageService;
            _hubContext = hubContext;

        }

        [HttpPost("SendMessage")]
        public async Task<IActionResult> SendMessage([FromBody] SendMessage sendMessage)
        {

            var response = _chatMessageService.SentMessage(sendMessage);


            if (response.IsSuccess && response.Data is List<ChatMessagesEntity> messages)
            {
              

                foreach (var message in messages)
                {
                    await _hubContext.Clients.Group(message.ReceiverId)
                        .SendAsync("ReceiveMessage", message);
                }

                // Send a single broadcast message back to the sender (teacher)
                var broadcastMessage = new ChatMessagesEntity
                {
                    SenderId = messages[0].SenderId,
                    ReceiverId = string.Join(",", messages.Select(m => m.ReceiverId)),
                    MessageText = messages[0].MessageText,
                    FilePath = messages[0].FilePath,
                    FileName = messages[0].FileName,
                    Time = messages[0].Time,
                    FileIdentityId = messages[0].FileIdentityId,
                    IsBroadcast = true
                };

                await _hubContext.Clients.Group(messages[0].SenderId)
                    .SendAsync("ReceiveMessage", broadcastMessage);
            }
            return Ok(response);
        }

        [HttpGet("GetChatByUserId/{SenderId}/{ReceiverId}")]
        public IActionResult GetChatByUserId(string SenderId, string ReceiverId)
        {
            var response = _chatMessageService.GetChatByUserId(SenderId, ReceiverId);

            if (response.IsSuccess)
            {
                _chatMessageService.UpdateIsReadMessage(SenderId, ReceiverId);
            }
            return Ok(response);
        }

        [HttpGet("GetChatByGrade/{TeacherId}/{GradeId}")]
        public IActionResult GetChatByGrade(string TeacherId, int GradeId)
        {
            var response = _chatMessageService.GetChatByGrade(TeacherId, GradeId);
            return Ok(response);
        }

        [HttpGet("download-chat-pdf/{UserId}/{ChatUserId}")]
        public IActionResult DownloadChatPdf(string UserId, string ChatUserId)
        {
            var chatHistory = _chatMessageService.ExportChatHistory(UserId, ChatUserId);
            if(chatHistory.Data.Count > 0)
            {
                var firstRecord = chatHistory.Data[0];

                using (var memoryStream = new MemoryStream())
                {
                    using (var writer = new PdfWriter(memoryStream))
                    {
                        using (var pdf = new PdfDocument(writer))
                        {
                            var document = new Document(pdf);

                            PdfFont boldFont = PdfFontFactory.CreateFont(StandardFonts.HELVETICA_BOLD);

                            document.Add(new Paragraph($"Chat History of {firstRecord.UserName} & {firstRecord.ChatUserName}")
                                .SetFont(boldFont)
                                .SetFontSize(18)
                                .SetTextAlignment(TextAlignment.CENTER));

                            foreach (var chat in chatHistory.Data)
                            {
                                var sendContent = "";
                                if (chat.FileName != null)
                                {
                                    sendContent = sendContent + $"File: {chat.FileName}\n";
                                }

                                if (chat.MessageText != "")
                                {
                                    sendContent = sendContent + $"Message: {chat.MessageText}\n";
                                }

                                if (chat.ReplyToMessage != null && chat.ReplyToMessage != "")
                                {
                                    sendContent = sendContent + $"ReplyToMessage: {chat.ReplyToMessage}\n";
                                }

                                if (chat.ReplyToFile != null)
                                {
                                    sendContent = sendContent + $"ReplyToFile: {chat.ReplyToFile}\n";
                                }
                                document.Add(new Paragraph(
                                    $"From: {chat.SenderName} To: {chat.ReceiverName}\n" +
                                    $"{sendContent}" +
                                    $"Time: {chat.Time:dd-MM-yyyy HH:mm:ss}\n\n"
                                ));
                            }

                            document.Close();

                        }
                    }

                    // Return the in-memory PDF as a file
                    var fileName = $"chat_history_of_{firstRecord.UserName}&{firstRecord.ChatUserName}.pdf";
                    return File(memoryStream.ToArray(), "application/pdf", fileName);
                }

            }
            else
            {
                return NoContent();
            }
            
        }

        [HttpPost("UpdateIsReadMessage/{UserIdentityId}/{ChatUserIdentityId}")]
        public IActionResult UpdateIsReadMessage(string UserIdentityId, string ChatUserIdentityId)
        {
            _chatMessageService.UpdateIsReadMessage(UserIdentityId, ChatUserIdentityId);
            return Ok();
        }
    }
}
