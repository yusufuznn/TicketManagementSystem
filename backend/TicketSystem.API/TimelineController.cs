using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TicketSystem.API.Entities;

namespace TicketSystem.API
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TimelineController : ControllerBase
    {
        private readonly TicketDbContext _context;
        public TimelineController(TicketDbContext context)
        {
            _context = context;
        }

        // Belirli bir ticket'ın timeline'ını getir
        [HttpGet("{ticketId}")]
        public async Task<IActionResult> GetTimeline(int ticketId)
        {
            var userRole = User.FindFirstValue(ClaimTypes.Role);
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
            var ticket = await _context.Tickets.FindAsync(ticketId);
            if (ticket == null) return NotFound();
            if (userRole == "Musteri" && ticket.MusteriId != userId) return Forbid();
            var timeline = await _context.TicketTimelines.Where(t => t.TicketId == ticketId).OrderBy(t => t.Tarih).ToListAsync();
            return Ok(timeline);
        }
    }
} 