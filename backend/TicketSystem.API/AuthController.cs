using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using TicketSystem.API.Entities;
using BCrypt.Net;
using Microsoft.AspNetCore.Authorization;

namespace TicketSystem.API
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly TicketDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(TicketDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email && u.Aktif);
            if (user == null)
                return Unauthorized("Kullanıcı bulunamadı veya pasif.");

            // Şifre kontrolü (hash ile)
            if (!BCrypt.Net.BCrypt.Verify(request.Sifre, user.SifreHash))
                return Unauthorized("Şifre hatalı.");

            var token = GenerateJwtToken(user);
            return Ok(new { token });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
                return BadRequest("Bu e-posta ile kayıtlı bir kullanıcı zaten var.");

            var user = new User
            {
                AdSoyad = request.AdSoyad,
                Email = request.Email,
                SifreHash = BCrypt.Net.BCrypt.HashPassword(request.Sifre),
                Rol = request.Rol,
                Aktif = true,
                KayitTarihi = DateTime.UtcNow
            };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return Ok("Kullanıcı başarıyla kaydedildi.");
        }

        [HttpPut("profile")]
        [Authorize]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound();
            user.AdSoyad = request.AdSoyad;
            user.Email = request.Email;
            await _context.SaveChangesAsync();
            return Ok("Profil güncellendi.");
        }

        [HttpPut("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound();
            if (!BCrypt.Net.BCrypt.Verify(request.OldPassword, user.SifreHash))
                return BadRequest("Eski şifre yanlış.");
            user.SifreHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            await _context.SaveChangesAsync();
            return Ok("Şifre değiştirildi.");
        }

        [HttpGet("personel-list")]
        [Authorize(Roles = "Admin,Yonetici,Personel")]
        public async Task<IActionResult> GetPersonelList()
        {
            var personeller = await _context.Users
                .Where(u => (u.Rol == "Personel" || u.Rol == "Yonetici") && u.Aktif)
                .Select(u => new { u.Id, u.AdSoyad, u.Email, u.Rol })
                .ToListAsync();
            return Ok(personeller);
        }

        private string GenerateJwtToken(User user)
        {
            var jwtSettings = _configuration.GetSection("Jwt");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.AdSoyad),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Rol)
            };

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(int.Parse(jwtSettings["ExpireMinutes"])),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Sifre { get; set; } = string.Empty;
    }

    public class RegisterRequest
    {
        public string AdSoyad { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Sifre { get; set; } = string.Empty;
        public string Rol { get; set; } = "Musteri";
    }

    public class UpdateProfileRequest
    {
        public string AdSoyad { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
    }

    public class ChangePasswordRequest
    {
        public string OldPassword { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }
} 