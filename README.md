# Ticket System

Modern ve kullanıcı dostu bir ticket yönetim sistemi. Bu proje, müşteri destek taleplerinin takibi, personel ataması ve performans analizi için geliştirilmiştir.

## 🚀 Özellikler

### Kullanıcı Rolleri
- **Müşteri**: Ticket oluşturma, takip etme
- **Personel**: Kendisine atanan ticket'ları yönetme
- **Yönetici**: Tüm ticket'ları yönetme, personel atama
- **Admin**: Tam sistem yönetimi

### Ana Özellikler
- ✅ Ticket oluşturma ve yönetimi
- ✅ Personel atama ve devir işlemleri
- ✅ Yorum sistemi
- ✅ Dosya ekleme
- ✅ Timeline takibi
- ✅ Filtreleme ve arama
- ✅ İstatistikler ve raporlama
- ✅ CSV export
- ✅ JWT tabanlı güvenlik

## 🛠️ Teknolojiler

### Backend
- **ASP.NET Core 9.0**
- **Entity Framework Core**
- **PostgreSQL**
- **JWT Authentication**
- **BCrypt** (şifre hashleme)

### Frontend
- **React 18**
- **TypeScript**
- **Modern CSS**
- **Responsive Design**

## 📦 Kurulum

### Gereksinimler
- .NET 9.0 SDK
- Node.js 18+
- PostgreSQL

### Backend Kurulumu

1. **Veritabanı kurulumu:**
```bash
# PostgreSQL'de veritabanı oluşturun
createdb ticket_system
```

2. **Backend bağımlılıklarını yükleyin:**
```bash
cd backend/TicketSystem.API
dotnet restore
```

3. **Connection string'i ayarlayın:**
`appsettings.json` dosyasında PostgreSQL connection string'ini güncelleyin:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=ticket_system;Username=your_username;Password=your_password"
  }
}
```

4. **Migration'ları çalıştırın:**
```bash
dotnet ef database update
```

5. **Backend'i başlatın:**
```bash
dotnet run
```

### Frontend Kurulumu

1. **Bağımlılıkları yükleyin:**
```bash
cd frontend
npm install
```

2. **Frontend'i başlatın:**
```bash
npm start
```

## 🔧 Konfigürasyon

### JWT Ayarları
`backend/TicketSystem.API/appsettings.json` dosyasında JWT ayarlarını yapılandırın:

```json
{
  "Jwt": {
    "Key": "your-super-secret-key-here-minimum-16-characters",
    "Issuer": "TicketSystem",
    "Audience": "TicketSystemUsers",
    "ExpireMinutes": 60
  }
}
```

### CORS Ayarları
Frontend URL'ini `Program.cs` dosyasında güncelleyin:

```csharp
policy.WithOrigins("http://localhost:3000")
```

## 📁 Proje Yapısı

```
ticket-system/
├── backend/
│   └── TicketSystem.API/
│       ├── Controllers/     # API endpoints
│       ├── Entities/        # Veritabanı modelleri
│       ├── Migrations/      # EF Core migrations
│       └── Program.cs       # Uygulama konfigürasyonu
└── frontend/
    └── src/
        ├── components/      # React bileşenleri
        ├── pages/          # Sayfa bileşenleri
        ├── services/       # API servisleri
        ├── utils/          # Utility fonksiyonları
        └── contexts/       # React context'leri
```

## 🔐 Güvenlik

- JWT tabanlı kimlik doğrulama
- BCrypt ile şifre hashleme
- Role-based authorization
- CORS koruması
- Input validation

## 📊 API Endpoints

### Auth
- `POST /api/Auth/login` - Kullanıcı girişi
- `POST /api/Auth/register` - Kullanıcı kaydı
- `POST /api/Auth/change-password` - Şifre değiştirme

### Tickets
- `GET /api/Ticket` - Tüm ticket'ları listele
- `GET /api/Ticket/my` - Kullanıcının ticket'ları
- `POST /api/Ticket` - Yeni ticket oluştur
- `PUT /api/Ticket/{id}` - Ticket güncelle
- `DELETE /api/Ticket/{id}` - Ticket sil

### Statistics
- `GET /api/Ticket/statistics` - Genel istatistikler
- `GET /api/Ticket/personel-stats` - Personel performansı
- `GET /api/Ticket/export-csv` - CSV export

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🆘 Destek

Herhangi bir sorun yaşarsanız, lütfen issue oluşturun veya iletişime geçin.

---

**Not:** Bu proje geliştirme amaçlı oluşturulmuştur. Production kullanımı için ek güvenlik önlemleri alınması önerilir. 