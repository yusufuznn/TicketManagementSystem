namespace TicketSystem.API.Entities
{
    public class TicketYorum
    {
        public int Id { get; set; }
        public int KullaniciId { get; set; }
        public string Yorum { get; set; } = string.Empty;
        public DateTime Tarih { get; set; } = DateTime.UtcNow;
        public int TicketId { get; set; }
    }
} 