using System.ComponentModel.DataAnnotations;

namespace TicketSystem.API.Entities
{
    public class User
    {
        public int Id { get; set; }
        [Required, MaxLength(100)]
        public string AdSoyad { get; set; } = string.Empty;
        [Required, MaxLength(100)]
        public string Email { get; set; } = string.Empty;
        [Required]
        public string SifreHash { get; set; } = string.Empty;
        [Required]
        public string Rol { get; set; } = string.Empty; // Admin, Musteri, Personel, Yonetici
        public bool Aktif { get; set; } = true;
        public DateTime KayitTarihi { get; set; } = DateTime.UtcNow;
    }
} 