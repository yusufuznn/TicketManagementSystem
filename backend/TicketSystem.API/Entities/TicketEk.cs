namespace TicketSystem.API.Entities
{
    public class TicketEk
    {
        public int Id { get; set; }
        public string DosyaAdi { get; set; } = string.Empty;
        public string DosyaYolu { get; set; } = string.Empty;
        public long Boyut { get; set; }
        public string Uzanti { get; set; } = string.Empty;
        public DateTime EklenmeTarihi { get; set; } = DateTime.UtcNow;
        public int TicketId { get; set; }
    }
} 