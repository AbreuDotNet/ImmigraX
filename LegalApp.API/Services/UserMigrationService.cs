using LegalApp.API.Data;
using LegalApp.API.Models;
using Microsoft.EntityFrameworkCore;

namespace LegalApp.API.Services
{
    public class UserMigrationService
    {
        private readonly LegalAppDbContext _context;

        public UserMigrationService(LegalAppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Migra usuarios existentes que no tienen asociación con LawFirm
        /// Los asocia al primer LawFirm disponible o crea uno por defecto
        /// </summary>
        public async Task MigrateUsersWithoutLawFirmAsync()
        {
            // Buscar usuarios que no tienen asociación con LawFirm
            var usersWithoutLawFirm = await _context.Users
                .Where(u => !u.UserLawFirms.Any())
                .ToListAsync();

            if (!usersWithoutLawFirm.Any())
            {
                Console.WriteLine("No hay usuarios sin asociación a LawFirm");
                return;
            }

            // Buscar un LawFirm existente o crear uno por defecto
            var lawFirm = await _context.LawFirms.FirstOrDefaultAsync();
            if (lawFirm == null)
            {
                // Crear un LawFirm por defecto
                lawFirm = new LawFirm
                {
                    Name = "Bufete Legal Principal",
                    Address = "Dirección por definir",
                    Phone = "Teléfono por definir"
                };

                _context.LawFirms.Add(lawFirm);
                await _context.SaveChangesAsync();
                Console.WriteLine($"Creado LawFirm por defecto: {lawFirm.Name}");
            }

            // Asociar todos los usuarios sin LawFirm al LawFirm encontrado/creado
            foreach (var user in usersWithoutLawFirm)
            {
                var userLawFirm = new UserLawFirm
                {
                    UserId = user.Id,
                    LawFirmId = lawFirm.Id
                };

                _context.Set<UserLawFirm>().Add(userLawFirm);
                Console.WriteLine($"Asociando usuario {user.FullName} al LawFirm {lawFirm.Name}");
            }

            await _context.SaveChangesAsync();
            Console.WriteLine($"Migración completada: {usersWithoutLawFirm.Count} usuarios asociados");
        }

        /// <summary>
        /// Actualiza las contraseñas de usuarios existentes de SHA256 a BCrypt
        /// </summary>
        public async Task MigratePasswordHashingAsync()
        {
            var users = await _context.Users
                .Where(u => u.PasswordHash.Length < 60) // BCrypt hashes are typically 60 chars
                .ToListAsync();

            foreach (var user in users)
            {
                // Nota: No podemos convertir hashes SHA256 existentes a BCrypt
                // porque no conocemos las contraseñas originales.
                // Los usuarios existentes necesitarán resetear sus contraseñas
                Console.WriteLine($"Usuario {user.Email} necesita resetear su contraseña (hash SHA256 detectado)");
            }

            if (users.Any())
            {
                Console.WriteLine($"Se encontraron {users.Count} usuarios con hashes SHA256 que necesitan resetear contraseña");
            }
        }
    }
}
