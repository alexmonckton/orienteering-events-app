using Microsoft.EntityFrameworkCore;
using OrienteeringEvents.Api.Models;

namespace OrienteeringEvents.Api
{
    public class AppDbContext: DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
    }
}