using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;


namespace TeacherApp.Modules.Admin.Modules
{
    public  class ChatHub : Hub
    {
        public override async Task OnConnectedAsync()
        {
            var userId = Context.GetHttpContext().Request.Query["userId"];
            if (!string.IsNullOrEmpty(userId))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, userId);
            }

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(System.Exception exception)
        {
            var userId = Context.GetHttpContext().Request.Query["userId"];
            if (!string.IsNullOrEmpty(userId))
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, userId);
            }

            await base.OnDisconnectedAsync(exception);
        }
        public async Task JoinChatSession(string chatSessionId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, chatSessionId);
        }

        public async Task LeaveChatSession(string chatSessionId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, chatSessionId);
        }
        public async Task SendTypingNotification(string receiverId, string senderName)
        {
            await Clients.Group(receiverId).SendAsync("ReceiveTypingNotification", senderName);
        }

    }
}
