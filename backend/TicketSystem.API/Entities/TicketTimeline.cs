namespace TicketSystem.API.Entities
{
    public class TicketTimeline
    {
        public int Id { get; set; }
        public int TicketId { get; set; }
        public int? KullaniciId { get; set; }
        public string Islem { get; set; } = string.Empty; // Oluşturdu, Atandı, Devredildi, Durum değişti
        public DateTime Tarih { get; set; } = DateTime.UtcNow;
        public string? Aciklama { get; set; }
    }
} 