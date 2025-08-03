# Ticket System
<img width="1024" height="1024" alt="ticketly" src="https://github.com/user-attachments/assets/fcd68c62-0ddd-47f3-a67f-7fe4bd4d088b" />

A modern and user-friendly ticket management system.
This project is designed for tracking customer support requests, assigning staff, and analyzing performance.

## 🚀 Features

### User Roles

* **Customer**: Create and track tickets
* **Staff**: Manage assigned tickets
* **Manager**: Manage all tickets and assign staff
* **Admin**: Full system administration

### Core Features

* ✅ Ticket creation and management
* ✅ Staff assignment and transfer
* ✅ Comment system
* ✅ File attachments
* ✅ Timeline tracking
* ✅ Filtering and search
* ✅ Statistics and reporting
* ✅ CSV export
* ✅ JWT-based security

## 🛠️ Technologies

### Backend

* **ASP.NET Core 9.0**
* **Entity Framework Core**
* **PostgreSQL**
* **JWT Authentication**
* **BCrypt** (for password hashing)

### Frontend

* **React 18**
* **TypeScript**
* **Modern CSS**
* **Responsive Design**

## 📸 Screenshots


<img width="1912" height="922" alt="login" src="https://github.com/user-attachments/assets/e489cfb5-4c72-478d-82f7-714c88c7ce79" />

**login page**

<img width="1916" height="925" alt="register" src="https://github.com/user-attachments/assets/0c5bb5fc-e557-4d6d-8b92-a9a5821276db" />

**register page**

<img width="1915" height="922" alt="musHp" src="https://github.com/user-attachments/assets/0d2e8766-e129-44bb-9418-c46e3919ac4c" />


**customer homepage**

<img width="1208" height="916" alt="ticketDetail" src="https://github.com/user-attachments/assets/990c432f-4a06-4d37-a94a-202a20861262" />


**ticket creation, listing and details**

<img width="1908" height="863" alt="persHp" src="https://github.com/user-attachments/assets/c7fbf170-a45b-4a2a-b241-400580251e18" />


**staff homepage**

<img width="1206" height="330" alt="persPanel" src="https://github.com/user-attachments/assets/4fe6c75f-b469-4712-a335-a445bf232c13" />


**staff page**

<img width="1905" height="910" alt="adminHp" src="https://github.com/user-attachments/assets/f5413cb9-844e-436a-8395-62db8a50b5c7" />


 **admin homepage**

<img width="1157" height="847" alt="adminPanel" src="https://github.com/user-attachments/assets/c052b336-79dc-4e5c-9280-2939028becfe" />


**admin page**

📦 Installation

### Requirements

* .NET 9.0 SDK
* Node.js 18+
* PostgreSQL

### Backend Setup

1. **Create the database:**

```bash
# Create a PostgreSQL database
createdb ticket_system
```

2. **Install backend dependencies:**

```bash
cd backend/TicketSystem.API
dotnet restore
```

3. **Configure the connection string:**
   Update the PostgreSQL connection string in `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=ticket_system;Username=your_username;Password=your_password"
  }
}
```

4. **Apply database migrations:**

```bash
dotnet ef database update
```

5. **Start the backend:**

```bash
dotnet run
```

### Frontend Setup

1. **Install frontend dependencies:**

```bash
cd frontend
npm install
```

2. **Start the frontend:**

```bash
npm start
```

## 🔧 Configuration

### JWT Settings

Configure JWT options in `backend/TicketSystem.API/appsettings.json`:

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

### CORS Settings

Update the frontend URL in `Program.cs`:

```csharp
policy.WithOrigins("http://localhost:3000")
```

## 📁 Project Structure

```
ticket-system/
├── backend/
│   └── TicketSystem.API/
│       ├── Controllers/     # API endpoints
│       ├── Entities/        # Database models
│       ├── Migrations/      # EF Core migrations
│       └── Program.cs       # Application configuration
└── frontend/
    └── src/
        ├── components/      # React components
        ├── pages/           # Page components
        ├── services/        # API services
        ├── utils/           # Utility functions
        └── contexts/        # React contexts
```

## 🔐 Security

* JWT-based authentication
* Password hashing with BCrypt
* Role-based authorization
* CORS protection
* Input validation

## 📊 API Endpoints

### Auth

* `POST /api/Auth/login` — User login
* `POST /api/Auth/register` — User registration
* `POST /api/Auth/change-password` — Change password

### Tickets

* `GET /api/Ticket` — List all tickets
* `GET /api/Ticket/my` — List user’s tickets
* `POST /api/Ticket` — Create new ticket
* `PUT /api/Ticket/{id}` — Update ticket
* `DELETE /api/Ticket/{id}` — Delete ticket

### Statistics

* `GET /api/Ticket/statistics` — General statistics
* `GET /api/Ticket/personel-stats` — Staff performance
* `GET /api/Ticket/export-csv` — Export as CSV

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to your branch (`git push origin feature/amazing-feature`)
5. Create a pull request

## 📢 Contact

**Email**: [yusfuzn@hotmail.com](mailto:yusfuzn@hotmail.com)
