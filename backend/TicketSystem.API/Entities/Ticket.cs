using System.ComponentModel.DataAnnotations;

namespace TicketSystem.API.Entities
{
    public class Ticket
    {
        public int Id { get; set; }
        [Required, MaxLength(200)]
        public string Baslik { get; set; } = string.Empty;
        [Required, MaxLength(2000)]
        public string Aciklama { get; set; } = string.Empty;
        [Required]
        public string Onem { get; set; } = "Normal"; // Düşük, Normal, Yüksek
        [Required]
        public string Durum { get; set; } = "Yeni"; // Yeni, Yanıt Bekleniyor, İşlemde, Tamamlandı, Müşteri Onayı Bekleniyor, Kapatıldı, Yeniden Açıldı
        public int MusteriId { get; set; }
        public int? AtananPersonelId { get; set; }
        public DateTime OlusturmaTarihi { get; set; } = DateTime.UtcNow;
        public DateTime? SonGuncellemeTarihi { get; set; }
        public List<TicketEk>? Ekler { get; set; }
        public List<TicketYorum>? Yorumlar { get; set; }
        public List<TicketTimeline>? Timeline { get; set; }
        public int? MemnuniyetPuani { get; set; } // 1-5 arası
    }
} 