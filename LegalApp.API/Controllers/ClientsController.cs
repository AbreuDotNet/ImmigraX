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
    public class ClientsController : ControllerBase
    {
        private readonly LegalAppDbContext _context;
        private readonly ActivityLogService _activityLogService;

        public ClientsController(LegalAppDbContext context, ActivityLogService activityLogService)
        {
            _context = context;
            _activityLogService = activityLogService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ClientResponseDto>>> GetClients([FromQuery] Guid? lawFirmId = null)
        {
            try
            {
                var clientsQuery = _context.Clients
                    .Include(c => c.LawFirm)
                    .AsQueryable();

                // Filter by law firm if specified
                if (lawFirmId.HasValue)
                {
                    clientsQuery = clientsQuery.Where(c => c.LawFirmId == lawFirmId.Value);
                }

                var clients = await clientsQuery
                    .Select(c => new ClientResponseDto
                    {
                        Id = c.Id,
                        FullName = c.FullName,
                        Email = c.Email,
                        Phone = c.Phone,
                        Address = c.Address,
                        ProcessType = c.ProcessType,
                        CaseNumber = c.CaseNumber,
                        ProcessStatus = c.ProcessStatus,
                        CreatedAt = c.CreatedAt,
                        LawFirmName = c.LawFirm.Name
                    })
                    .OrderByDescending(c => c.CreatedAt)
                    .ToListAsync();

                return Ok(clients);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener clientes", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ClientResponseDto>> GetClient(Guid id)
        {
            try
            {
                var client = await _context.Clients
                    .Include(c => c.LawFirm)
                    .Where(c => c.Id == id)
                    .Select(c => new ClientResponseDto
                    {
                        Id = c.Id,
                        FullName = c.FullName,
                        Email = c.Email,
                        Phone = c.Phone,
                        Address = c.Address,
                        ProcessType = c.ProcessType,
                        CaseNumber = c.CaseNumber,
                        ProcessStatus = c.ProcessStatus,
                        CreatedAt = c.CreatedAt,
                        LawFirmName = c.LawFirm.Name
                    })
                    .FirstOrDefaultAsync();

                if (client == null)
                {
                    return NotFound(new { message = "Cliente no encontrado" });
                }

                return Ok(client);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener cliente", error = ex.Message });
            }
        }

        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<ClientResponseDto>>> SearchClients([FromQuery] string query, [FromQuery] Guid? lawFirmId = null)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(query))
                {
                    return BadRequest(new { message = "El término de búsqueda es requerido" });
                }

                var clientsQuery = _context.Clients
                    .Include(c => c.LawFirm)
                    .AsQueryable();

                // Filter by law firm if specified
                if (lawFirmId.HasValue)
                {
                    clientsQuery = clientsQuery.Where(c => c.LawFirmId == lawFirmId.Value);
                }

                // Search in multiple fields
                clientsQuery = clientsQuery.Where(c =>
                    c.FullName.Contains(query) ||
                    (c.Email != null && c.Email.Contains(query)) ||
                    (c.Phone != null && c.Phone.Contains(query)) ||
                    (c.CaseNumber != null && c.CaseNumber.Contains(query)) ||
                    c.ProcessType.Contains(query) ||
                    c.ProcessStatus.Contains(query)
                );

                var clients = await clientsQuery
                    .Select(c => new ClientResponseDto
                    {
                        Id = c.Id,
                        FullName = c.FullName,
                        Email = c.Email,
                        Phone = c.Phone,
                        Address = c.Address,
                        ProcessType = c.ProcessType,
                        CaseNumber = c.CaseNumber,
                        ProcessStatus = c.ProcessStatus,
                        CreatedAt = c.CreatedAt,
                        LawFirmName = c.LawFirm.Name
                    })
                    .OrderByDescending(c => c.CreatedAt)
                    .Take(50) // Limit results
                    .ToListAsync();

                return Ok(clients);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error en la búsqueda", error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult<ClientResponseDto>> CreateClient([FromBody] ClientCreateDto clientDto)
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
                    .Include(ulf => ulf.LawFirm)
                    .Where(ulf => ulf.UserId == currentUserId)
                    .FirstOrDefaultAsync();

                if (userLawFirm == null)
                {
                    return BadRequest(new { message = "Usuario no tiene firma legal asignada" });
                }

                var lawFirmId = userLawFirm.LawFirm.Id;

                var client = new Client
                {
                    FullName = clientDto.FullName,
                    Email = clientDto.Email,
                    Phone = clientDto.Phone,
                    Address = clientDto.Address,
                    ProcessType = clientDto.ProcessType,
                    CaseNumber = clientDto.CaseNumber,
                    ProcessStatus = clientDto.ProcessStatus ?? "Nuevo",
                    LawFirmId = lawFirmId, // Use the user's law firm
                    CreatedAt = DateTime.UtcNow
                };

                _context.Clients.Add(client);
                await _context.SaveChangesAsync();

                // Log the activity
                await _activityLogService.LogClientCreatedAsync(
                    currentUserId, lawFirmId, client.Id, client.FullName);

                // Return created client with law firm name
                var createdClient = await _context.Clients
                    .Include(c => c.LawFirm)
                    .Where(c => c.Id == client.Id)
                    .Select(c => new ClientResponseDto
                    {
                        Id = c.Id,
                        FullName = c.FullName,
                        Email = c.Email,
                        Phone = c.Phone,
                        Address = c.Address,
                        ProcessType = c.ProcessType,
                        CaseNumber = c.CaseNumber,
                        ProcessStatus = c.ProcessStatus,
                        CreatedAt = c.CreatedAt,
                        LawFirmName = c.LawFirm.Name
                    })
                    .FirstOrDefaultAsync();

                return CreatedAtAction(nameof(GetClient), new { id = client.Id }, createdClient);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al crear cliente", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateClient(Guid id, [FromBody] ClientUpdateDto clientDto)
        {
            try
            {
                // Get current user ID
                var currentUserIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!Guid.TryParse(currentUserIdString, out var currentUserId))
                {
                    return Unauthorized(new { message = "Token de usuario inválido" });
                }

                // Get user's law firm
                var userLawFirm = await _context.UserLawFirms
                    .Include(ulf => ulf.LawFirm)
                    .Where(ulf => ulf.UserId == currentUserId)
                    .FirstOrDefaultAsync();

                if (userLawFirm == null)
                {
                    return BadRequest(new { message = "Usuario no tiene firma legal asignada" });
                }

                var client = await _context.Clients.FindAsync(id);
                if (client == null)
                {
                    return NotFound(new { message = "Cliente no encontrado" });
                }

                // Update only provided fields
                if (!string.IsNullOrEmpty(clientDto.FullName))
                    client.FullName = clientDto.FullName;
                
                if (clientDto.Email != null)
                    client.Email = clientDto.Email;
                
                if (clientDto.Phone != null)
                    client.Phone = clientDto.Phone;
                
                if (clientDto.Address != null)
                    client.Address = clientDto.Address;
                
                if (!string.IsNullOrEmpty(clientDto.ProcessType))
                    client.ProcessType = clientDto.ProcessType;
                
                if (clientDto.CaseNumber != null)
                    client.CaseNumber = clientDto.CaseNumber;
                
                if (!string.IsNullOrEmpty(clientDto.ProcessStatus))
                    client.ProcessStatus = clientDto.ProcessStatus;

                await _context.SaveChangesAsync();

                // Log the activity
                await _activityLogService.LogActivityAsync(
                    currentUserId, 
                    userLawFirm.LawFirm.Id, 
                    ActivityType.ClientUpdated,
                    $"Actualizó información del cliente: {client.FullName}",
                    client.Id);

                return Ok(new { message = "Cliente actualizado exitosamente" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al actualizar cliente", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteClient(Guid id)
        {
            try
            {
                var client = await _context.Clients.FindAsync(id);
                if (client == null)
                {
                    return NotFound(new { message = "Cliente no encontrado" });
                }

                _context.Clients.Remove(client);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Cliente eliminado exitosamente" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al eliminar cliente", error = ex.Message });
            }
        }
    }
}
