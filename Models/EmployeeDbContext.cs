using Microsoft.EntityFrameworkCore;

//2-Context olusturduk 
namespace EmployeeRegisterAPI.Models
{
    public class EmployeeDbContext: DbContext //burada ef Dbcontext den kalitim aldirdik
    {
        
        public EmployeeDbContext(DbContextOptions<EmployeeDbContext> options):base(options)
        {


        }

        public DbSet<EmployeeModel> Employees { get; set; }
    }
}
