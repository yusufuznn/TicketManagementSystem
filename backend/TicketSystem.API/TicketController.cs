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
    public class TicketController : ControllerBase
    {
        private readonly TicketDbContext _context;
        public TicketController(TicketDbContext context)
        {
            _context = context;
        }

        private async Task AddTimeline(int ticketId, int? kullaniciId, string islem, string? aciklama = null)
        {
            var timeline = new TicketTimeline
            {
                TicketId = ticketId,
                KullaniciId = kullaniciId,
                Islem = islem,
                Aciklama = aciklama,
                Tarih = DateTime.UtcNow
            };
            _context.TicketTimelines.Add(timeline);
            await _context.SaveChangesAsync();
        }

        // Tüm ticket'ları listele (Yönetici ve Personel)
        [HttpGet]
        [Authorize(Roles = "Admin,Yonetici,Personel")]
        public async Task<IActionResult> GetAll()
        {
            var tickets = await _context.Tickets.Include(t => t.Yorumlar).Include(t => t.Ekler).Include(t => t.Timeline).ToListAsync();
            return Ok(tickets);
        }

        // Sadece kendi ticket'larını listele (Müşteri)
        [HttpGet("my")]
        [Authorize(Roles = "Musteri")]
        public async Task<IActionResult> GetMyTickets()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
            var tickets = await _context.Tickets.Where(t => t.MusteriId == userId).Include(t => t.Yorumlar).Include(t => t.Ekler).Include(t => t.Timeline).ToListAsync();
            return Ok(tickets);
        }

        // Kendisine atanan ticket'ları listele (Personel, Yonetici, Admin)
        [HttpGet("assigned-to-me")]
        [Authorize(Roles = "Admin,Yonetici,Personel")]
        public async Task<IActionResult> GetAssignedToMe()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
            var tickets = await _context.Tickets
                .Where(t => t.AtananPersonelId == userId)
                .Include(t => t.Yorumlar)
                .Include(t => t.Ekler)
                .Include(t => t.Timeline)
                .ToListAsync();
            return Ok(tickets);
        }

        // Ticket oluştur (Müşteri)
        [HttpPost]
        [Authorize(Roles = "Musteri")]
        public async Task<IActionResult> Create([FromBody] TicketCreateRequest request)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
            var ticket = new Ticket
            {
                Baslik = request.Baslik,
                Aciklama = request.Aciklama,
                Onem = request.Onem,
                Durum = "Yeni",
                MusteriId = userId,
                OlusturmaTarihi = DateTime.UtcNow,
                SonGuncellemeTarihi = DateTime.UtcNow
            };
            _context.Tickets.Add(ticket);
            await _context.SaveChangesAsync();
            await AddTimeline(ticket.Id, userId, "Oluşturuldu", $"Ticket oluşturuldu: {ticket.Baslik}");
            return Ok(ticket);
        }

        // Ticket güncelle (Yönetici, Personel, Müşteri kendi ticket'ı)
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] TicketUpdateRequest request)
        {
            var ticket = await _context.Tickets.FindAsync(id);
            if (ticket == null) return NotFound();

            // Rol ve sahiplik kontrolü
            var userRole = User.FindFirstValue(ClaimTypes.Role);
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
            if (userRole == "Musteri" && ticket.MusteriId != userId)
                return Forbid();

            var eskiDurum = ticket.Durum;
            var eskiAtanan = ticket.AtananPersonelId;
            ticket.Baslik = request.Baslik;
            ticket.Aciklama = request.Aciklama;
            ticket.Onem = request.Onem;
            ticket.Durum = request.Durum;
            ticket.SonGuncellemeTarihi = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            if (eskiDurum != request.Durum)
                await AddTimeline(ticket.Id, userId, "Durum Değişti", $"{eskiDurum} → {request.Durum}");
            else
                await AddTimeline(ticket.Id, userId, "Güncellendi", "Ticket bilgileri güncellendi.");
            return Ok(ticket);
        }

        // Ticket atama veya devretme (Admin, Yonetici, Personel)
        [HttpPut("{id}/assign")]
        [Authorize(Roles = "Admin,Yonetici,Personel")]
        public async Task<IActionResult> Assign(int id, [FromBody] AssignRequest request)
        {
            var ticket = await _context.Tickets.FindAsync(id);
            if (ticket == null) return NotFound();
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
            var eskiAtanan = ticket.AtananPersonelId;
            ticket.AtananPersonelId = request.AtananPersonelId;
            ticket.SonGuncellemeTarihi = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            string aciklama = eskiAtanan == null ? $"{request.AtananPersonelId} kişisine atandı." : $"{eskiAtanan} → {request.AtananPersonelId} devredildi.";
            await AddTimeline(ticket.Id, userId, "Atama/Devir", aciklama);
            return Ok(ticket);
        }

        // Ticket sil (Yönetici)
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var ticket = await _context.Tickets.FindAsync(id);
            if (ticket == null) return NotFound();
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
            await AddTimeline(ticket.Id, userId, "Silindi", "Ticket silindi.");
            _context.Tickets.Remove(ticket);
            await _context.SaveChangesAsync();
            return Ok("Ticket silindi.");
        }

        // Yönetici paneli için istatistikler
        [HttpGet("statistics")]
        [Authorize(Roles = "Admin,Yonetici")]
        public async Task<IActionResult> GetStatistics()
        {
            var tickets = await _context.Tickets.ToListAsync();
            var now = DateTime.UtcNow;
            var total = tickets.Count;
            var open = tickets.Count(t => t.Durum != "Kapatıldı" && t.Durum != "Tamamlandı");
            var closed = tickets.Count(t => t.Durum == "Kapatıldı");
            var byPersonel = tickets
                .Where(t => t.AtananPersonelId != null)
                .GroupBy(t => t.AtananPersonelId)
                .Select(g => new { PersonelId = g.Key, Count = g.Count() })
                .ToList();
            // Ortalama çözüm süresi (tamamlanan ticket'lar)
            var completed = tickets.Where(t => t.Durum == "Tamamlandı" && t.SonGuncellemeTarihi.HasValue).ToList();
            double avgSolutionHours = 0;
            if (completed.Count > 0)
            {
                var totalHours = completed.Sum(t => (t.SonGuncellemeTarihi!.Value - t.OlusturmaTarihi).TotalHours);
                avgSolutionHours = totalHours / completed.Count;
            }
            
            // Geciken talepler - Ortalama çözüm süresinin 1.5 katı veya minimum 60 saat
            var overdueThreshold = Math.Max(avgSolutionHours * 1.5, 60);
            var overdue = tickets.Where(t => {
                // Açık ticketlar için: Oluşturulma tarihinden itibaren geçen süre kontrolü
                if (t.Durum != "Kapatıldı" && t.Durum != "Tamamlandı")
                {
                    return (now - t.OlusturmaTarihi).TotalHours > overdueThreshold;
                }
                // Tamamlanmış ticketlar için: Çözüm süresi kontrolü
                else if (t.Durum == "Tamamlandı" && t.SonGuncellemeTarihi.HasValue)
                {
                    return (t.SonGuncellemeTarihi.Value - t.OlusturmaTarihi).TotalHours > overdueThreshold;
                }
                return false;
            }).Count();
            return Ok(new {
                total,
                open,
                closed,
                completed = completed.Count,
                byPersonel,
                avgSolutionHours,
                overdue
            });
        }

        // Filtreli istatistikler (tarih aralığı, durum, personel)
        [HttpGet("filtered-statistics")]
        [Authorize(Roles = "Admin,Yonetici")]
        public async Task<IActionResult> GetFilteredStatistics([FromQuery] DateTime? start, [FromQuery] DateTime? end, [FromQuery] string? durum, [FromQuery] int? personelId)
        {
            var query = _context.Tickets.AsQueryable();
            if (start.HasValue)
                query = query.Where(t => t.OlusturmaTarihi >= start.Value);
            if (end.HasValue)
                query = query.Where(t => t.OlusturmaTarihi <= end.Value);
            if (!string.IsNullOrEmpty(durum))
                query = query.Where(t => t.Durum == durum);
            if (personelId.HasValue)
                query = query.Where(t => t.AtananPersonelId == personelId);
            var tickets = await query.ToListAsync();
            var total = tickets.Count;
            var open = tickets.Count(t => t.Durum != "Kapatıldı" && t.Durum != "Tamamlandı");
            var closed = tickets.Count(t => t.Durum == "Kapatıldı");
            var byPersonel = tickets
                .Where(t => t.AtananPersonelId != null)
                .GroupBy(t => t.AtananPersonelId)
                .Select(g => new { PersonelId = g.Key, Count = g.Count() })
                .ToList();
            var completed = tickets.Where(t => t.Durum == "Tamamlandı" && t.SonGuncellemeTarihi.HasValue).ToList();
            double avgSolutionHours = 0;
            if (completed.Count > 0)
            {
                var totalHours = completed.Sum(t => (t.SonGuncellemeTarihi!.Value - t.OlusturmaTarihi).TotalHours);
                avgSolutionHours = totalHours / completed.Count;
            }
            var now = DateTime.UtcNow;
            
            // Geciken talepler - Ortalama çözüm süresinin 1.5 katı veya minimum 60 saat
            var overdueThreshold = Math.Max(avgSolutionHours * 1.5, 60);
            var overdue = tickets.Where(t => {
                // Açık ticketlar için: Oluşturulma tarihinden itibaren geçen süre kontrolü
                if (t.Durum != "Kapatıldı" && t.Durum != "Tamamlandı")
                {
                    return (now - t.OlusturmaTarihi).TotalHours > overdueThreshold;
                }
                // Tamamlanmış ticketlar için: Çözüm süresi kontrolü
                else if (t.Durum == "Tamamlandı" && t.SonGuncellemeTarihi.HasValue)
                {
                    return (t.SonGuncellemeTarihi.Value - t.OlusturmaTarihi).TotalHours > overdueThreshold;
                }
                return false;
            }).Count();
            return Ok(new {
                total,
                open,
                closed,
                completed = completed.Count,
                byPersonel,
                avgSolutionHours,
                overdue
            });
        }

        // CSV export
        [HttpGet("export-csv")]
        [Authorize(Roles = "Admin,Yonetici")]
        public async Task<IActionResult> ExportCsv([FromQuery] DateTime? start, [FromQuery] DateTime? end, [FromQuery] string? durum, [FromQuery] int? personelId)
        {
            var query = _context.Tickets.AsQueryable();
            if (start.HasValue)
                query = query.Where(t => t.OlusturmaTarihi >= start.Value);
            if (end.HasValue)
                query = query.Where(t => t.OlusturmaTarihi <= end.Value);
            if (!string.IsNullOrEmpty(durum))
                query = query.Where(t => t.Durum == durum);
            if (personelId.HasValue)
                query = query.Where(t => t.AtananPersonelId == personelId);
            var tickets = await query.ToListAsync();
            var csv = "Id,Baslik,Aciklama,Onem,Durum,MusteriId,AtananPersonelId,OlusturmaTarihi,SonGuncellemeTarihi\n" +
                string.Join("\n", tickets.Select(t => $"{t.Id},\"{t.Baslik.Replace("\"", "''") }\",\"{t.Aciklama.Replace("\"", "''") }\",{t.Onem},{t.Durum},{t.MusteriId},{t.AtananPersonelId},{t.OlusturmaTarihi:u},{t.SonGuncellemeTarihi:u}"));
            var bytes = System.Text.Encoding.UTF8.GetBytes(csv);
            return File(bytes, "text/csv", $"tickets_{DateTime.UtcNow:yyyyMMddHHmmss}.csv");
        }

        // Debug endpoint - ticket detayları
        [HttpGet("debug-tickets")]
        [Authorize(Roles = "Admin,Yonetici")]
        public async Task<IActionResult> GetDebugTickets()
        {
            var tickets = await _context.Tickets.ToListAsync();
            var debugData = tickets.Select(t => new {
                t.Id,
                t.Baslik,
                t.Durum,
                t.OlusturmaTarihi,
                t.SonGuncellemeTarihi,
                HasSonGuncelleme = t.SonGuncellemeTarihi.HasValue,
                IsCompleted = t.Durum == "Tamamlandı" || t.Durum == "Kapatıldı",
                SolutionHours = t.SonGuncellemeTarihi.HasValue ? (t.SonGuncellemeTarihi.Value - t.OlusturmaTarihi).TotalHours : 0
            }).ToList();
            
            // Add statistics breakdown
            var total = tickets.Count;
            var open = tickets.Count(t => t.Durum != "Kapatıldı" && t.Durum != "Tamamlandı");
            var closed = tickets.Count(t => t.Durum == "Kapatıldı");
            var completed = tickets.Count(t => t.Durum == "Tamamlandı");
            var completedWithDate = tickets.Count(t => t.Durum == "Tamamlandı" && t.SonGuncellemeTarihi.HasValue);
            
            // Ortalama çözüm süresi hesaplama
            var completedTickets = tickets.Where(t => t.Durum == "Tamamlandı" && t.SonGuncellemeTarihi.HasValue).ToList();
            double avgSolutionHours = 0;
            if (completedTickets.Count > 0)
            {
                var totalHours = completedTickets.Sum(t => (t.SonGuncellemeTarihi!.Value - t.OlusturmaTarihi).TotalHours);
                avgSolutionHours = totalHours / completedTickets.Count;
            }
            
            // Geciken ticket eşik değeri
            var overdueThreshold = Math.Max(avgSolutionHours * 1.5, 60);
            var overdue = tickets.Where(t => {
                // Açık ticketlar için: Oluşturulma tarihinden itibaren geçen süre kontrolü
                if (t.Durum != "Kapatıldı" && t.Durum != "Tamamlandı")
                {
                    return (DateTime.UtcNow - t.OlusturmaTarihi).TotalHours > overdueThreshold;
                }
                // Tamamlanmış ticketlar için: Çözüm süresi kontrolü
                else if (t.Durum == "Tamamlandı" && t.SonGuncellemeTarihi.HasValue)
                {
                    return (t.SonGuncellemeTarihi.Value - t.OlusturmaTarihi).TotalHours > overdueThreshold;
                }
                return false;
            }).Count();
            
            var statusBreakdown = tickets.GroupBy(t => t.Durum).Select(g => new { Status = g.Key, Count = g.Count() }).ToList();
            
            return Ok(new {
                tickets = debugData,
                statistics = new {
                    total,
                    open,
                    closed,
                    completed,
                    completedWithDate,
                    avgSolutionHours,
                    overdueThreshold,
                    overdue,
                    statusBreakdown
                }
            });
        }

        // Personel performans istatistikleri
        [HttpGet("personel-stats")]
        [Authorize(Roles = "Admin,Yonetici")]
        public async Task<IActionResult> GetPersonelStats()
        {
            var users = await _context.Users.Where(u => u.Rol == "Personel" || u.Rol == "Yonetici").ToListAsync();
            var tickets = await _context.Tickets.ToListAsync();
            var now = DateTime.UtcNow;
            var stats = users.Select(u => {
                var personelTickets = tickets.Where(t => t.AtananPersonelId == u.Id).ToList();
                var total = personelTickets.Count;
                var open = personelTickets.Count(t => t.Durum != "Kapatıldı" && t.Durum != "Tamamlandı");
                var closed = personelTickets.Count(t => t.Durum == "Kapatıldı");
                var completedTickets = personelTickets.Where(t => t.Durum == "Tamamlandı" && t.SonGuncellemeTarihi.HasValue).ToList();
                var completed = completedTickets.Count;
                double avgSolutionHours = 0;
                if (completedTickets.Count > 0)
                {
                    var totalHours = completedTickets.Sum(t => (t.SonGuncellemeTarihi!.Value - t.OlusturmaTarihi).TotalHours);
                    avgSolutionHours = totalHours / completedTickets.Count;
                }
                
                // Geciken talepler - Genel ortalama çözüm süresinin 1.5 katı veya minimum 60 saat
                // Önce genel ortalama çözüm süresini hesapla
                var allCompletedTickets = tickets.Where(t => t.Durum == "Tamamlandı" && t.SonGuncellemeTarihi.HasValue).ToList();
                double generalAvgSolutionHours = 0;
                if (allCompletedTickets.Count > 0)
                {
                    var totalHours = allCompletedTickets.Sum(t => (t.SonGuncellemeTarihi!.Value - t.OlusturmaTarihi).TotalHours);
                    generalAvgSolutionHours = totalHours / allCompletedTickets.Count;
                }
                var overdueThreshold = Math.Max(generalAvgSolutionHours * 1.5, 60);
                var overdue = personelTickets.Where(t => {
                    // Açık ticketlar için: Oluşturulma tarihinden itibaren geçen süre kontrolü
                    if (t.Durum != "Kapatıldı" && t.Durum != "Tamamlandı")
                    {
                        return (now - t.OlusturmaTarihi).TotalHours > overdueThreshold;
                    }
                    // Tamamlanmış ticketlar için: Çözüm süresi kontrolü
                    else if (t.Durum == "Tamamlandı" && t.SonGuncellemeTarihi.HasValue)
                    {
                        return (t.SonGuncellemeTarihi.Value - t.OlusturmaTarihi).TotalHours > overdueThreshold;
                    }
                    return false;
                }).Count();
                return new {
                    personelId = u.Id,
                    adSoyad = u.AdSoyad,
                    email = u.Email,
                    rol = u.Rol,
                    total,
                    open,
                    closed,
                    completed = completed,
                    avgSolutionHours,
                    overdue
                };
            }).ToList();
            return Ok(stats);
        }
    }

    public class TicketCreateRequest
    {
        public string Baslik { get; set; } = string.Empty;
        public string Aciklama { get; set; } = string.Empty;
        public string Onem { get; set; } = "Normal";
    }

    public class TicketUpdateRequest
    {
        public string Baslik { get; set; } = string.Empty;
        public string Aciklama { get; set; } = string.Empty;
        public string Onem { get; set; } = "Normal";
        public string Durum { get; set; } = "Yeni";
    }

    public class AssignRequest
    {
        public int AtananPersonelId { get; set; }
    }
} 