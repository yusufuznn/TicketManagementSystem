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
    public class YorumController : ControllerBase
    {
        private readonly TicketDbContext _context;
        public YorumController(TicketDbContext context)
        {
            _context = context;
        }

        // Belirli bir ticket'ın yorumlarını getir
        [HttpGet("{ticketId}")]
        public async Task<IActionResult> GetYorumlar(int ticketId)
        {
            var userRole = User.FindFirstValue(ClaimTypes.Role);
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
            var ticket = await _context.Tickets.FindAsync(ticketId);
            if (ticket == null) return NotFound();
            if (userRole == "Musteri" && ticket.MusteriId != userId) return Forbid();
            var yorumlar = await _context.TicketYorumlar.Where(y => y.TicketId == ticketId).ToListAsync();
            return Ok(yorumlar);
        }

        // Ticket'a yorum ekle
        [HttpPost]
        public async Task<IActionResult> AddYorum([FromBody] YorumEkleRequest request)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
            var ticket = await _context.Tickets.FindAsync(request.TicketId);
            if (ticket == null) return NotFound();
            var userRole = User.FindFirstValue(ClaimTypes.Role);
            if (userRole == "Musteri" && ticket.MusteriId != userId) return Forbid();
            var yorum = new TicketYorum
            {
                TicketId = request.TicketId,
                KullaniciId = userId,
                Yorum = request.Yorum,
                Tarih = DateTime.UtcNow
            };
            _context.TicketYorumlar.Add(yorum);
            await _context.SaveChangesAsync();
            return Ok(yorum);
        }
    }

    public class YorumEkleRequest
    {
        public int TicketId { get; set; }
        public string Yorum { get; set; } = string.Empty;
    }
} 