using Microsoft.EntityFrameworkCore;
using LegalApp.API.Data;
using LegalApp.API.Models;
using System.Security.Cryptography;
using System.Text;

namespace LegalApp.API.Seeders
{
    public static class DatabaseSeeder
    {
        public static async Task SeedAsync(LegalAppDbContext context)
        {
            // Ensure database is created
            await context.Database.EnsureCreatedAsync();

            // Seed Law Firms
            if (!await context.LawFirms.AnyAsync())
            {
                var lawFirms = new List<LawFirm>
                {
                    new LawFirm
                    {
                        Id = Guid.NewGuid(),
                        Name = "ImmigraX Legal Services",
                        Address = "Santo Domingo, República Dominicana",
                        Phone = "+1-809-123-4567",
                        CreatedAt = DateTime.UtcNow
                    },
                    new LawFirm
                    {
                        Id = Guid.NewGuid(),
                        Name = "Consultores Migratorios RD",
                        Address = "Santiago, República Dominicana",
                        Phone = "+1-809-987-6543",
                        CreatedAt = DateTime.UtcNow
                    }
                };

                context.LawFirms.AddRange(lawFirms);
                await context.SaveChangesAsync();
            }

            // Seed Users
            if (!await context.Users.AnyAsync())
            {
                var users = new List<User>
                {
                    new User
                    {
                        Id = Guid.NewGuid(),
                        FullName = "Daniel Abreu",
                        Email = "dabreu@synerxrd.com",
                        PasswordHash = HashPassword("nuevaPassword123"),
                        Role = UserRole.Master,
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    },
                    new User
                    {
                        Id = Guid.NewGuid(),
                        FullName = "Dr. María González",
                        Email = "maria.gonzalez@immigrax.com",
                        PasswordHash = HashPassword("Abogado123!"),
                        Role = UserRole.Abogado,
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    },
                    new User
                    {
                        Id = Guid.NewGuid(),
                        FullName = "Ana Secretaria",
                        Email = "ana@immigrax.com",
                        PasswordHash = HashPassword("Secretario123!"),
                        Role = UserRole.Secretario,
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    }
                };

                context.Users.AddRange(users);
                await context.SaveChangesAsync();

                // Associate users with law firms
                var masterUser = users.First(u => u.Role == UserRole.Master);
                var abogadoUser = users.First(u => u.Role == UserRole.Abogado);
                var secretarioUser = users.First(u => u.Role == UserRole.Secretario);
                var immigraXLawFirm = await context.LawFirms.FirstAsync(lf => lf.Name == "ImmigraX Legal Services");

                var userLawFirms = new List<UserLawFirm>
                {
                    new UserLawFirm { UserId = masterUser.Id, LawFirmId = immigraXLawFirm.Id },
                    new UserLawFirm { UserId = abogadoUser.Id, LawFirmId = immigraXLawFirm.Id },
                    new UserLawFirm { UserId = secretarioUser.Id, LawFirmId = immigraXLawFirm.Id }
                };

                context.UserLawFirms.AddRange(userLawFirms);
                await context.SaveChangesAsync();
            }

            // Seed Sample Clients
            if (!await context.Clients.AnyAsync())
            {
                var immigraXLawFirm = await context.LawFirms.FirstAsync(lf => lf.Name == "ImmigraX Legal Services");
                var clients = new List<Client>
                {
                    new Client
                    {
                        Id = Guid.NewGuid(),
                        LawFirmId = immigraXLawFirm.Id,
                        FullName = "Juan Pérez Rodriguez",
                        Email = "juan.perez@email.com",
                        Phone = "+1-809-555-0001",
                        Address = "Av. Winston Churchill, Santo Domingo",
                        ProcessType = "Visa de Trabajo",
                        CaseNumber = "VT-2025-001",
                        ProcessStatus = "En Proceso",
                        CreatedAt = DateTime.UtcNow
                    },
                    new Client
                    {
                        Id = Guid.NewGuid(),
                        LawFirmId = immigraXLawFirm.Id,
                        FullName = "María Fernanda López",
                        Email = "maria.lopez@email.com",
                        Phone = "+1-809-555-0002",
                        Address = "Zona Colonial, Santo Domingo",
                        ProcessType = "Residencia Permanente",
                        CaseNumber = "RP-2025-001",
                        ProcessStatus = "Documentos Pendientes",
                        CreatedAt = DateTime.UtcNow
                    },
                    new Client
                    {
                        Id = Guid.NewGuid(),
                        LawFirmId = immigraXLawFirm.Id,
                        FullName = "Carlos Antonio Jiménez",
                        Email = "carlos.jimenez@email.com",
                        Phone = "+1-809-555-0003",
                        Address = "Piantini, Santo Domingo",
                        ProcessType = "Reunificación Familiar",
                        CaseNumber = "RF-2025-001",
                        ProcessStatus = "Aprobado",
                        CreatedAt = DateTime.UtcNow
                    }
                };

                context.Clients.AddRange(clients);
                await context.SaveChangesAsync();
            }
        }

        private static string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password + "LegalApp_Salt"));
            return Convert.ToBase64String(hashedBytes);
        }
    }
}
