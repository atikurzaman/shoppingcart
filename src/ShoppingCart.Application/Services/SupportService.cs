using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ShoppingCart.Application.Interfaces.Services;
using ShoppingCart.Domain.Entities;
using ShoppingCart.Persistence.Data;

namespace ShoppingCart.Application.Services;

public class SupportService : ISupportService
{
    private readonly AppDbContext _context;

    public SupportService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<SupportTicket>> GetAllTicketsAsync(string? status = null)
    {
        var query = _context.SupportTickets.Include(t => t.User).AsQueryable();
        if (!string.IsNullOrEmpty(status)) query = query.Where(t => t.Status == status);
        return await query.OrderByDescending(t => t.CreatedAt).ToListAsync();
    }

    public async Task<SupportTicket?> GetTicketByIdAsync(int id)
    {
        return await _context.SupportTickets
            .Include(t => t.User)
            .Include(t => t.Messages)
            .FirstOrDefaultAsync(t => t.Id == id);
    }

    public async Task<SupportTicket> CreateTicketAsync(SupportTicket ticket)
    {
        _context.SupportTickets.Add(ticket);
        await _context.SaveChangesAsync();
        return ticket;
    }

    public async Task<SupportTicket> UpdateTicketAsync(SupportTicket ticket)
    {
        _context.SupportTickets.Update(ticket);
        await _context.SaveChangesAsync();
        return ticket;
    }

    public async Task<bool> DeleteTicketAsync(int id)
    {
        var ticket = await _context.SupportTickets.FindAsync(id);
        if (ticket == null) return false;
        _context.SupportTickets.Remove(ticket);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UpdateTicketStatusAsync(int id, string status)
    {
        var ticket = await _context.SupportTickets.FindAsync(id);
        if (ticket == null) return false;
        ticket.Status = status;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<SupportTicketMessage> AddMessageAsync(SupportTicketMessage message)
    {
        _context.SupportTicketMessages.Add(message);
        await _context.SaveChangesAsync();
        return message;
    }

    public async Task<List<SupportTicketMessage>> GetTicketMessagesAsync(int ticketId)
    {
        return await _context.SupportTicketMessages
            .Where(m => m.SupportTicketId == ticketId)
            .OrderBy(m => m.CreatedAt)
            .ToListAsync();
    }
}
