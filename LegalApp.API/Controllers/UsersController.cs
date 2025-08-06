using LegalApp.API.Data;
using LegalApp.API.DTOs;
using LegalApp.API.Models;
using LegalApp.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using BCrypt.Net;

namespace LegalApp.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly LegalAppDbContext _context;
        private readonly ActivityLogService _activityLogService;

        public UsersController(LegalAppDbContext context, ActivityLogService activityLogService)
        {
            _context = context;
            _activityLogService = activityLogService;
        }

        private async Task<Guid> GetCurrentUserLawFirmIdAsync(Guid userId)
        {
            var user = await _context.Users
                .Include(u => u.UserLawFirms)
                .FirstOrDefaultAsync(u => u.Id == userId);
            
            return user?.UserLawFirms.FirstOrDefault()?.LawFirmId ?? Guid.Empty;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetUsers()
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
            
            // Solo usuarios Master pueden ver todos los usuarios
            if (userRole != "Master")
            {
                return Forbid();
            }

            var lawFirmId = await GetCurrentUserLawFirmIdAsync(userId);

            var users = await _context.Users
                .Include(u => u.UserLawFirms)
                .ThenInclude(ulf => ulf.LawFirm)
                .OrderBy(u => u.FullName)
                .Select(u => new UserDto
                {
                    Id = u.Id,
                    FullName = u.FullName,
                    Email = u.Email,
                    Role = u.Role.ToString(),
                    IsActive = u.IsActive,
                    CreatedAt = u.CreatedAt,
                    LawFirms = u.UserLawFirms.Select(ulf => ulf.LawFirm.Name).ToList()
                })
                .ToListAsync();

            await _activityLogService.LogActivityAsync(
                userId, 
                lawFirmId, 
                ActivityType.UserList, 
                "Lista de usuarios consultada"
            );

            return Ok(users);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<UserDto>> GetUser(Guid id)
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
            
            if (userRole != "Master")
            {
                return Forbid();
            }

            var lawFirmId = await GetCurrentUserLawFirmIdAsync(userId);

            var user = await _context.Users
                .Include(u => u.UserLawFirms)
                .ThenInclude(ulf => ulf.LawFirm)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
            {
                return NotFound();
            }

            var userDto = new UserDto
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role.ToString(),
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt,
                LawFirms = user.UserLawFirms.Select(ulf => ulf.LawFirm.Name).ToList()
            };

            await _activityLogService.LogActivityAsync(
                userId, 
                lawFirmId, 
                ActivityType.UserView, 
                $"Usuario {user.FullName} consultado"
            );

            return Ok(userDto);
        }

        [HttpPost]
        public async Task<ActionResult<UserDto>> CreateUser(CreateUserDto createUserDto)
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
            
            if (userRole != "Master")
            {
                return Forbid();
            }

            var lawFirmId = await GetCurrentUserLawFirmIdAsync(userId);

            // Verificar si el email ya existe
            var existingUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Email.ToLower() == createUserDto.Email.ToLower());
            
            if (existingUser != null)
            {
                return BadRequest("Ya existe un usuario con este email");
            }

            // Validar rol
            if (!Enum.TryParse<UserRole>(createUserDto.Role, out var role))
            {
                return BadRequest("Rol inválido");
            }

            var user = new User
            {
                FullName = createUserDto.FullName,
                Email = createUserDto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(createUserDto.Password),
                Role = role,
                IsActive = createUserDto.IsActive
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var userDto = new UserDto
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role.ToString(),
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt,
                LawFirms = new List<string>()
            };

            await _activityLogService.LogActivityAsync(
                userId, 
                lawFirmId, 
                ActivityType.UserCreate, 
                $"Usuario {user.FullName} creado"
            );

            return CreatedAtAction(nameof(GetUser), new { id = user.Id }, userDto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(Guid id, UpdateUserDto updateUserDto)
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
            
            if (userRole != "Master")
            {
                return Forbid();
            }

            var lawFirmId = await GetCurrentUserLawFirmIdAsync(userId);

            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            // Verificar si el email ya existe (excluyendo el usuario actual)
            var existingUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Email.ToLower() == updateUserDto.Email.ToLower() && u.Id != id);
            
            if (existingUser != null)
            {
                return BadRequest("Ya existe otro usuario con este email");
            }

            // Validar rol
            if (!Enum.TryParse<UserRole>(updateUserDto.Role, out var role))
            {
                return BadRequest("Rol inválido");
            }

            user.FullName = updateUserDto.FullName;
            user.Email = updateUserDto.Email;
            user.Role = role;
            user.IsActive = updateUserDto.IsActive;

            // Actualizar contraseña si se proporciona
            if (!string.IsNullOrEmpty(updateUserDto.NewPassword))
            {
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(updateUserDto.NewPassword);
            }

            await _context.SaveChangesAsync();

            await _activityLogService.LogActivityAsync(
                userId, 
                lawFirmId, 
                ActivityType.UserUpdate, 
                $"Usuario {user.FullName} actualizado"
            );

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(Guid id)
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
            
            if (userRole != "Master")
            {
                return Forbid();
            }

            var lawFirmId = await GetCurrentUserLawFirmIdAsync(userId);

            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            // No permitir eliminar el usuario actual
            if (user.Id == userId)
            {
                return BadRequest("No puedes eliminar tu propio usuario");
            }

            // Desactivar en lugar de eliminar para mantener integridad referencial
            user.IsActive = false;
            await _context.SaveChangesAsync();

            await _activityLogService.LogActivityAsync(
                userId, 
                lawFirmId, 
                ActivityType.UserDelete, 
                $"Usuario {user.FullName} desactivado"
            );

            return NoContent();
        }

        [HttpPost("{id}/activate")]
        public async Task<IActionResult> ActivateUser(Guid id)
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
            
            if (userRole != "Master")
            {
                return Forbid();
            }

            var lawFirmId = await GetCurrentUserLawFirmIdAsync(userId);

            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            user.IsActive = true;
            await _context.SaveChangesAsync();

            await _activityLogService.LogActivityAsync(
                userId, 
                lawFirmId, 
                ActivityType.UserUpdate, 
                $"Usuario {user.FullName} activado"
            );

            return NoContent();
        }

        [HttpGet("roles")]
        public ActionResult<IEnumerable<UserRoleDto>> GetRoles()
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            
            if (userRole != "Master")
            {
                return Forbid();
            }

            var roles = new List<UserRoleDto>
            {
                new UserRoleDto
                {
                    Name = "Master",
                    DisplayName = "Administrador Master",
                    Description = "Acceso completo al sistema, gestión de usuarios y configuración",
                    Permissions = new List<string>
                    {
                        "Gestión de usuarios",
                        "Configuración del sistema",
                        "Acceso a todos los módulos",
                        "Gestión de roles y permisos",
                        "Reportes avanzados"
                    }
                },
                new UserRoleDto
                {
                    Name = "Abogado",
                    DisplayName = "Abogado",
                    Description = "Acceso a gestión de clientes, casos y documentos",
                    Permissions = new List<string>
                    {
                        "Gestión de clientes",
                        "Gestión de citas",
                        "Gestión de documentos",
                        "Notas de clientes",
                        "Reportes básicos",
                        "Formularios"
                    }
                },
                new UserRoleDto
                {
                    Name = "Secretario",
                    DisplayName = "Secretario/a",
                    Description = "Acceso limitado para tareas administrativas y de apoyo",
                    Permissions = new List<string>
                    {
                        "Ver clientes",
                        "Gestión de citas",
                        "Subir documentos",
                        "Notas básicas"
                    }
                }
            };

            return Ok(roles);
        }
    }
}
