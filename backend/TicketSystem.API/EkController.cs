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
    public class EkController : ControllerBase
    {
        private readonly TicketDbContext _context;
        private readonly IWebHostEnvironment _env;
        public EkController(TicketDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        // Belirli bir ticket'ın eklerini getir
        [HttpGet("{ticketId}")]
        public async Task<IActionResult> GetEkler(int ticketId)
        {
            var userRole = User.FindFirstValue(ClaimTypes.Role);
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
            var ticket = await _context.Tickets.FindAsync(ticketId);
            if (ticket == null) return NotFound();
            if (userRole == "Musteri" && ticket.MusteriId != userId) return Forbid();
            var ekler = await _context.TicketEkler.Where(e => e.TicketId == ticketId).ToListAsync();
            return Ok(ekler);
        }

        // Ticket'a dosya ekle (max 5MB)
        [HttpPost("upload")]
        public async Task<IActionResult> Upload([FromForm] EkYukleRequest request)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
            var ticket = await _context.Tickets.FindAsync(request.TicketId);
            if (ticket == null) return NotFound();
            var userRole = User.FindFirstValue(ClaimTypes.Role);
            if (userRole == "Musteri" && ticket.MusteriId != userId) return Forbid();

            var file = request.Dosya;
            if (file == null || file.Length == 0) return BadRequest("Dosya seçilmedi.");
            if (file.Length > 5 * 1024 * 1024) return BadRequest("Dosya boyutu 5MB'dan büyük olamaz.");
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".pdf", ".docx", ".xlsx" };
            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(ext)) return BadRequest("Geçersiz dosya uzantısı.");

            var uploads = Path.Combine(_env.ContentRootPath, "Uploads");
            if (!Directory.Exists(uploads)) Directory.CreateDirectory(uploads);
            var fileName = Guid.NewGuid() + ext;
            var filePath = Path.Combine(uploads, fileName);
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var ek = new TicketEk
            {
                TicketId = request.TicketId,
                DosyaAdi = file.FileName,
                DosyaYolu = fileName,
                Boyut = file.Length,
                Uzanti = ext,
                EklenmeTarihi = DateTime.UtcNow
            };
            _context.TicketEkler.Add(ek);
            await _context.SaveChangesAsync();
            return Ok(ek);
        }

        // Dosya indirme
        [HttpGet("download/{id}")]
        public async Task<IActionResult> Download(int id)
        {
            var ek = await _context.TicketEkler.FindAsync(id);
            if (ek == null) return NotFound();
            var ticket = await _context.Tickets.FindAsync(ek.TicketId);
            var userRole = User.FindFirstValue(ClaimTypes.Role);
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
            if (userRole == "Musteri" && ticket.MusteriId != userId) return Forbid();
            var uploads = Path.Combine(_env.ContentRootPath, "Uploads");
            var filePath = Path.Combine(uploads, ek.DosyaYolu);
            if (!System.IO.File.Exists(filePath)) return NotFound("Dosya bulunamadı.");
            var contentType = "application/octet-stream";
            return PhysicalFile(filePath, contentType, ek.DosyaAdi);
        }
    }

    public class EkYukleRequest
    {
        public int TicketId { get; set; }
        public IFormFile Dosya { get; set; } = null!;
    }
} 