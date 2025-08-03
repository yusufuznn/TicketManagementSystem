# Ticket System - Docker Compose Kurulumu

Bu proje Docker Compose kullanarak ayağa kaldırılabilir.

## Gereksinimler

- Docker
- Docker Compose

## Kurulum

1. Projeyi klonlayın:
```bash
git clone <repository-url>
cd ticket-system
```

2. Docker Compose ile servisleri başlatın:
```bash
docker-compose up -d
```

## Servisler

### PostgreSQL Database
- **Port**: 5432
- **Database**: ticketdb
- **Username**: postgres
- **Password**: postgres

### Backend API (.NET)
- **Port**: 5000
- **Health Check**: http://localhost:5000/health
- **API Base URL**: http://localhost:5000/api

### Frontend (React + Nginx)
- **Port**: 3000
- **URL**: http://localhost:3000

## Kullanım

1. **Veritabanı Migration'ları** (İlk çalıştırmada):
```bash
docker-compose exec backend dotnet ef database update
```

2. **Servisleri durdurmak**:
```bash
docker-compose down
```

3. **Logları görüntülemek**:
```bash
docker-compose logs -f
```

4. **Belirli bir servisin loglarını görüntülemek**:
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

## Geliştirme

### Backend Geliştirme
```bash
# Backend container'ına bağlanmak
docker-compose exec backend bash

# Migration oluşturmak
docker-compose exec backend dotnet ef migrations add MigrationName

# Migration uygulamak
docker-compose exec backend dotnet ef database update
```

### Frontend Geliştirme
```bash
# Frontend container'ına bağlanmak
docker-compose exec frontend sh

# Node modules yeniden yüklemek
docker-compose exec frontend npm install
```

## Sorun Giderme

### Veritabanı Bağlantı Sorunu
```bash
# PostgreSQL container'ının durumunu kontrol edin
docker-compose ps postgres

# PostgreSQL loglarını kontrol edin
docker-compose logs postgres
```

### Backend Başlatma Sorunu
```bash
# Backend loglarını kontrol edin
docker-compose logs backend

# Backend container'ını yeniden başlatın
docker-compose restart backend
```

### Frontend Başlatma Sorunu
```bash
# Frontend loglarını kontrol edin
docker-compose logs frontend

# Frontend container'ını yeniden başlatın
docker-compose restart frontend
```

## Production

Production ortamı için:

1. Environment değişkenlerini güncelleyin
2. SSL sertifikalarını ekleyin
3. Güvenlik ayarlarını yapılandırın
4. Backup stratejisi oluşturun

## Temizlik

Tüm container'ları ve volume'ları silmek için:
```bash
docker-compose down -v
``` 