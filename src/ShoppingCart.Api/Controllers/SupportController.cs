using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShoppingCart.Domain.Entities;
using ShoppingCart.Persistence.Data;
using ShoppingCart.Shared.Common;

namespace ShoppingCart.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,Manager")]
public class SupportController : ControllerBase
{
    private readonly AppDbContext _context;

    public SupportController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("tickets")]
    public async Task<ActionResult<ApiResponse<List<SupportTicket>>>> GetTickets([FromQuery] string? status = null)
    {
        var query = _context.SupportTickets.Include(t => t.User).AsQueryable();
        
        if (!string.IsNullOrEmpty(status))
        {
            query = query.Where(t => t.Status == status);
        }

        var tickets = await query.OrderByDescending(t => t.CreatedAt).ToListAsync();
        return Ok(ApiResponse<List<SupportTicket>>.Success(tickets));
    }

    [HttpGet("tickets/{id}")]
    public async Task<ActionResult<ApiResponse<SupportTicket>>> GetTicketById(int id)
    {
        var ticket = await _context.SupportTickets
            .Include(t => t.User)
            .Include(t => t.Messages.OrderBy(m => m.CreatedAt))
            .FirstOrDefaultAsync(t => t.Id == id);

        if (ticket == null) return NotFound(ApiResponse.Fail("Ticket not found"));
        return Ok(ApiResponse<SupportTicket>.Success(ticket));
    }

    [HttpPost("tickets/{id}/reply")]
    public async Task<ActionResult<ApiResponse<SupportTicketMessage>>> ReplyToTicket(int id, [FromBody] string message)
    {
        var ticket = await _context.SupportTickets.FindAsync(id);
        if (ticket == null) return NotFound(ApiResponse.Fail("Ticket not found"));

        var reply = new SupportTicketMessage
        {
            SupportTicketId = id,
            Message = message,
            IsFromAdmin = true
        };

        _context.SupportTicketMessages.Add(reply);
        ticket.Status = "Pending"; // Waiting for customer
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<SupportTicketMessage>.Created(reply, "Reply sent successfully"));
    }

    [HttpPut("tickets/{id}/status")]
    public async Task<ActionResult<ApiResponse>> UpdateStatus(int id, [FromBody] string status)
    {
        var ticket = await _context.SupportTickets.FindAsync(id);
        if (ticket == null) return NotFound(ApiResponse.Fail("Ticket not found"));

        ticket.Status = status;
        await _context.SaveChangesAsync();

        return Ok(ApiResponse.Success($"Ticket status updated to {status}"));
    }
}
