using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace BACKEND.Hubs
{
    public class NotificationHub : Hub
    {
        // ============================
        // VIDEO CALL SIGNALING
        // ============================

        // Join a room (ticketId)
        public async Task JoinRoom(string roomId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, roomId);
        }

        public async Task LeaveRoom(string roomId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomId);
        }

        // Send offer
        public async Task SendOffer(string roomId, object offer)
        {
            await Clients.OthersInGroup(roomId).SendAsync("ReceiveOffer", offer);
        }

        // Send answer
        public async Task SendAnswer(string roomId, object answer)
        {
            await Clients.OthersInGroup(roomId).SendAsync("ReceiveAnswer", answer);
        }

        // Send ICE candidate
        public async Task SendIceCandidate(string roomId, object candidate)
        {
            await Clients.OthersInGroup(roomId).SendAsync("ReceiveIceCandidate", candidate);
        }

        // Optional: end call
        public async Task EndCall(string roomId)
        {
            await Clients.OthersInGroup(roomId).SendAsync("CallEnded");
        }


//new 2/19/2026
        public static Dictionary<string, string> Connections = new();

public override Task OnConnectedAsync()
{
    var email = Context.GetHttpContext()?.Request.Query["email"].ToString();
    if (!string.IsNullOrEmpty(email))
        Connections[email] = Context.ConnectionId;
    return base.OnConnectedAsync();
}

public override Task OnDisconnectedAsync(Exception? exception)
{
    var email = Connections.FirstOrDefault(x => x.Value == Context.ConnectionId).Key;
    if (email != null)
        Connections.Remove(email);

    return base.OnDisconnectedAsync(exception);
}

    }

    
}