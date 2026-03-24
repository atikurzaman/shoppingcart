using System.Collections.Generic;
using System.Threading.Tasks;
using ShoppingCart.Domain.Entities;

namespace ShoppingCart.Application.Interfaces.Services;

public interface ISupportService
{
    // Support Tickets
    Task<List<SupportTicket>> GetAllTicketsAsync(string? status = null);
    Task<SupportTicket?> GetTicketByIdAsync(int id);
    Task<SupportTicket> CreateTicketAsync(SupportTicket ticket);
    Task<SupportTicket> UpdateTicketAsync(SupportTicket ticket);
    Task<bool> DeleteTicketAsync(int id);
    Task<bool> UpdateTicketStatusAsync(int id, string status);

    // Ticket Messages
    Task<SupportTicketMessage> AddMessageAsync(SupportTicketMessage message);
    Task<List<SupportTicketMessage>> GetTicketMessagesAsync(int ticketId);
}
