using Microsoft.EntityFrameworkCore;
using TicketSystem.API.Entities;

namespace TicketSystem.API
{
    public class TicketDbContext : DbContext
    {
        public TicketDbContext(DbContextOptions<TicketDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Ticket> Tickets { get; set; }
        public DbSet<TicketEk> TicketEkler { get; set; }
        public DbSet<TicketYorum> TicketYorumlar { get; set; }
        public DbSet<TicketTimeline> TicketTimelines { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

        }
    }
} 