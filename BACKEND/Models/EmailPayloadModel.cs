using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BACKEND.Models
{
public class EmailPayloadModel
{
    public string To { get; set; } = "";           // customer email
    public string Subject { get; set; } = "";
    public string Body { get; set; } = "";         // message for customer

    public List<string>? Agents { get; set; }      // agent list
    public string? AgentSubject { get; set; }      // optional subject for agents
    public string? AgentBody { get; set; }         // optional message for agents
}
}