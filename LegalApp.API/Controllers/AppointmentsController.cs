using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using LegalApp.API.Data;
using LegalApp.API.Models;
using LegalApp.API.DTOs;
using LegalApp.API.Services;
using System.Security.Claims;

namespace LegalApp.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AppointmentsController : ControllerBase
    {
        private readonly LegalAppDbContext _context;
        private readonly ActivityLogService _activityLogService;

        public AppointmentsController(LegalAppDbContext context, ActivityLogService activityLogService)
        {
            _context = context;
            _activityLogService = activityLogService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<AppointmentResponseDto>>> GetAppointments()
        {
            try
            {
                var appointments = await _context.Appointments
                    .Include(a => a.Client)
                    .Include(a => a.LawFirm)
                    .Include(a => a.CreatedByUser)
                    .Include(a => a.Confirmation)
                    .Select(a => new AppointmentResponseDto
                    {
                        Id = a.Id,
                        Title = a.Title,
                        Description = a.Description,
                        AppointmentType = a.AppointmentType,
                        Priority = a.Priority,
                        AppointmentDate = a.AppointmentDate,
                        CreatedAt = a.CreatedAt,
                        ClientName = a.Client.FullName,
                        LawFirmName = a.LawFirm.Name,
                        CreatedByName = a.CreatedByUser.FullName,
                        ConfirmedByClient = a.Confirmation != null ? a.Confirmation.ConfirmedByClient : null,
                        ConfirmedAt = a.Confirmation != null ? a.Confirmation.ConfirmedAt : null
                    })
                    .OrderBy(a => a.AppointmentDate)
                    .ToListAsync();

                return Ok(appointments);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener citas", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<AppointmentResponseDto>> GetAppointment(Guid id)
        {
            try
            {
                var appointment = await _context.Appointments
                    .Include(a => a.Client)
                    .Include(a => a.LawFirm)
                    .Include(a => a.CreatedByUser)
                    .Include(a => a.Confirmation)
                    .Where(a => a.Id == id)
                    .Select(a => new AppointmentResponseDto
                    {
                        Id = a.Id,
                        Title = a.Title,
                        Description = a.Description,
                        AppointmentType = a.AppointmentType,
                        Priority = a.Priority,
                        AppointmentDate = a.AppointmentDate,
                        CreatedAt = a.CreatedAt,
                        ClientName = a.Client.FullName,
                        LawFirmName = a.LawFirm.Name,
                        CreatedByName = a.CreatedByUser.FullName,
                        ConfirmedByClient = a.Confirmation != null ? a.Confirmation.ConfirmedByClient : null,
                        ConfirmedAt = a.Confirmation != null ? a.Confirmation.ConfirmedAt : null
                    })
                    .FirstOrDefaultAsync();

                if (appointment == null)
                {
                    return NotFound(new { message = "Cita no encontrada" });
                }

                return Ok(appointment);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener cita", error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult<AppointmentResponseDto>> CreateAppointment([FromBody] AppointmentCreateDto appointmentDto)
        {
            try
            {
                // Get current user ID from JWT token
                var currentUserIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!Guid.TryParse(currentUserIdString, out var currentUserId))
                {
                    return Unauthorized(new { message = "Token de usuario inválido" });
                }

                // Get user's law firm instead of using appointmentDto.LawFirmId
                var userLawFirm = await _context.UserLawFirms
                    .Where(ul => ul.UserId == currentUserId)
                    .FirstOrDefaultAsync();

                if (userLawFirm == null)
                {
                    return BadRequest(new { message = "Usuario no está asociado a ninguna firma legal" });
                }

                // Verify client exists
                var clientExists = await _context.Clients.AnyAsync(c => c.Id == appointmentDto.ClientId);
                if (!clientExists)
                {
                    return BadRequest(new { message = "El cliente especificado no existe" });
                }

                var appointment = new Appointment
                {
                    ClientId = appointmentDto.ClientId,
                    LawFirmId = userLawFirm.LawFirmId, // Use authenticated user's LawFirm
                    Title = appointmentDto.Title,
                    Description = appointmentDto.Description,
                    AppointmentType = appointmentDto.AppointmentType,
                    Priority = appointmentDto.Priority,
                    AppointmentDate = appointmentDto.AppointmentDate,
                    CreatedBy = currentUserId,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Appointments.Add(appointment);
                await _context.SaveChangesAsync();

                // Get client name for logging
                var client = await _context.Clients.FindAsync(appointmentDto.ClientId);
                
                // Log the activity
                await _activityLogService.LogAppointmentScheduledAsync(
                    currentUserId, 
                    userLawFirm.LawFirmId, // Use authenticated user's LawFirm
                    appointmentDto.ClientId, 
                    client?.FullName ?? "Cliente desconocido",
                    appointmentDto.AppointmentDate);

                // Return created appointment with related data
                var createdAppointment = await _context.Appointments
                    .Include(a => a.Client)
                    .Include(a => a.LawFirm)
                    .Include(a => a.CreatedByUser)
                    .Where(a => a.Id == appointment.Id)
                    .Select(a => new AppointmentResponseDto
                    {
                        Id = a.Id,
                        Title = a.Title,
                        Description = a.Description,
                        AppointmentType = a.AppointmentType,
                        Priority = a.Priority,
                        AppointmentDate = a.AppointmentDate,
                        CreatedAt = a.CreatedAt,
                        ClientName = a.Client.FullName,
                        LawFirmName = a.LawFirm.Name,
                        CreatedByName = a.CreatedByUser.FullName,
                        ConfirmedByClient = null,
                        ConfirmedAt = null
                    })
                    .FirstOrDefaultAsync();

                return CreatedAtAction(nameof(GetAppointment), new { id = appointment.Id }, createdAppointment);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al crear cita", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateAppointment(Guid id, [FromBody] AppointmentUpdateDto appointmentDto)
        {
            try
            {
                // Get current user ID from JWT token
                var currentUserIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!Guid.TryParse(currentUserIdString, out var currentUserId))
                {
                    return Unauthorized(new { message = "Token de usuario inválido" });
                }

                // Get user's law firm
                var userLawFirm = await _context.UserLawFirms
                    .Where(ul => ul.UserId == currentUserId)
                    .FirstOrDefaultAsync();

                if (userLawFirm == null)
                {
                    return BadRequest(new { message = "Usuario no está asociado a ninguna firma legal" });
                }

                var appointment = await _context.Appointments
                    .Include(a => a.Client)
                    .FirstOrDefaultAsync(a => a.Id == id);
                    
                if (appointment == null)
                {
                    return NotFound(new { message = "Cita no encontrada" });
                }

                // Store original values for comparison
                var originalTitle = appointment.Title;
                var originalDate = appointment.AppointmentDate;

                // Update only provided fields
                if (!string.IsNullOrEmpty(appointmentDto.Title))
                    appointment.Title = appointmentDto.Title;

                if (!string.IsNullOrEmpty(appointmentDto.Description))
                    appointment.Description = appointmentDto.Description;

                if (!string.IsNullOrEmpty(appointmentDto.AppointmentType))
                    appointment.AppointmentType = appointmentDto.AppointmentType;

                if (appointmentDto.Priority.HasValue)
                    appointment.Priority = appointmentDto.Priority;

                if (appointmentDto.AppointmentDate.HasValue)
                    appointment.AppointmentDate = appointmentDto.AppointmentDate.Value;

                await _context.SaveChangesAsync();

                // Log the activity
                var changes = new List<string>();
                if (!string.IsNullOrEmpty(appointmentDto.Title) && appointmentDto.Title != originalTitle)
                    changes.Add($"Título: '{originalTitle}' → '{appointmentDto.Title}'");
                if (appointmentDto.AppointmentDate.HasValue && appointmentDto.AppointmentDate != originalDate)
                    changes.Add($"Fecha: '{originalDate:dd/MM/yyyy HH:mm}' → '{appointmentDto.AppointmentDate:dd/MM/yyyy HH:mm}'");

                if (changes.Any())
                {
                    await _activityLogService.LogAppointmentUpdatedAsync(
                        currentUserId,
                        userLawFirm.LawFirmId,
                        appointment.ClientId,
                        appointment.Client?.FullName ?? "Cliente desconocido",
                        appointment.Title,
                        string.Join(", ", changes));
                }

                return Ok(new { message = "Cita actualizada exitosamente" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al actualizar cita", error = ex.Message });
            }
        }

        [HttpPost("{id}/confirm")]
        public async Task<ActionResult> ConfirmAppointment(Guid id, [FromBody] bool confirmed)
        {
            try
            {
                // Get current user ID from JWT token
                var currentUserIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!Guid.TryParse(currentUserIdString, out var currentUserId))
                {
                    return Unauthorized(new { message = "Token de usuario inválido" });
                }

                // Get user's law firm
                var userLawFirm = await _context.UserLawFirms
                    .Where(ul => ul.UserId == currentUserId)
                    .FirstOrDefaultAsync();

                if (userLawFirm == null)
                {
                    return BadRequest(new { message = "Usuario no está asociado a ninguna firma legal" });
                }

                var appointment = await _context.Appointments
                    .Include(a => a.Confirmation)
                    .Include(a => a.Client)
                    .FirstOrDefaultAsync(a => a.Id == id);

                if (appointment == null)
                {
                    return NotFound(new { message = "Cita no encontrada" });
                }

                if (appointment.Confirmation == null)
                {
                    appointment.Confirmation = new AppointmentConfirmation
                    {
                        AppointmentId = id,
                        ConfirmedByClient = confirmed,
                        ConfirmedAt = DateTime.UtcNow
                    };
                    _context.AppointmentConfirmations.Add(appointment.Confirmation);
                }
                else
                {
                    appointment.Confirmation.ConfirmedByClient = confirmed;
                    appointment.Confirmation.ConfirmedAt = DateTime.UtcNow;
                }

                await _context.SaveChangesAsync();

                // Log the activity
                var activityMessage = confirmed ? 
                    $"Cita '{appointment.Title}' confirmada por el cliente" : 
                    $"Cita '{appointment.Title}' cancelada por el cliente";

                await _activityLogService.LogClientInteractionAsync(
                    currentUserId,
                    userLawFirm.LawFirmId,
                    appointment.ClientId,
                    appointment.Client?.FullName ?? "Cliente desconocido",
                    activityMessage);

                return Ok(new { message = confirmed ? "Cita confirmada exitosamente" : "Cita cancelada por el cliente" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al confirmar cita", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteAppointment(Guid id)
        {
            try
            {
                // Get current user ID from JWT token
                var currentUserIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!Guid.TryParse(currentUserIdString, out var currentUserId))
                {
                    return Unauthorized(new { message = "Token de usuario inválido" });
                }

                // Get user's law firm
                var userLawFirm = await _context.UserLawFirms
                    .Where(ul => ul.UserId == currentUserId)
                    .FirstOrDefaultAsync();

                if (userLawFirm == null)
                {
                    return BadRequest(new { message = "Usuario no está asociado a ninguna firma legal" });
                }

                var appointment = await _context.Appointments
                    .Include(a => a.Client)
                    .FirstOrDefaultAsync(a => a.Id == id);
                    
                if (appointment == null)
                {
                    return NotFound(new { message = "Cita no encontrada" });
                }

                // Store data for logging before deletion
                var appointmentTitle = appointment.Title;
                var clientName = appointment.Client?.FullName ?? "Cliente desconocido";
                var clientId = appointment.ClientId;
                var appointmentDate = appointment.AppointmentDate;

                _context.Appointments.Remove(appointment);
                await _context.SaveChangesAsync();

                // Log the activity
                await _activityLogService.LogAppointmentCancelledAsync(
                    currentUserId,
                    userLawFirm.LawFirmId,
                    clientId,
                    clientName,
                    appointmentTitle,
                    appointmentDate);

                return Ok(new { message = "Cita eliminada exitosamente" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al eliminar cita", error = ex.Message });
            }
        }
    }
}
