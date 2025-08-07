using LegalApp.API.Services;
using Microsoft.AspNetCore.Mvc;
using LegalApp.API.Data;
using Microsoft.EntityFrameworkCore;

namespace LegalApp.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MigrationController : ControllerBase
    {
        private readonly UserMigrationService _migrationService;
        private readonly LegalAppDbContext _context;

        public MigrationController(UserMigrationService migrationService, LegalAppDbContext context)
        {
            _migrationService = migrationService;
            _context = context;
        }

        [HttpPost("migrate-users")]
        public async Task<IActionResult> MigrateUsers()
        {
            try
            {
                await _migrationService.MigrateUsersWithoutLawFirmAsync();
                await _migrationService.MigratePasswordHashingAsync();
                
                return Ok(new { message = "Migración de usuarios completada exitosamente" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error en la migración", error = ex.Message });
            }
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            try
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());
                if (user == null)
                {
                    return NotFound(new { message = "Usuario no encontrado" });
                }

                // Actualizar la contraseña usando BCrypt
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
                await _context.SaveChangesAsync();

                return Ok(new { message = $"Contraseña actualizada exitosamente para {user.Email}" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al resetear contraseña", error = ex.Message });
            }
        }
    }

    public class ResetPasswordRequest
    {
        public string Email { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }
}
