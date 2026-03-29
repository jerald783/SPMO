using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace BACKEND.Hubs
{
    public class ChatHub : Hub
    {
        // You can add methods here if needed
        public async Task SendMessageToGroup(string ticketId, object message)
        {
            await Clients.Group(ticketId).SendAsync("ReceiveMessage", message);
        }

        public override async Task OnConnectedAsync()
        {
            var httpContext = Context.GetHttpContext();
            var ticketId = httpContext.Request.Query["ticketId"];

            if (!string.IsNullOrEmpty(ticketId))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, ticketId);
            }

            await base.OnConnectedAsync();
        }
    }
}
