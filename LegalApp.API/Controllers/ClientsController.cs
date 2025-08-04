using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using LegalApp.API.Data;
using LegalApp.API.Models;
using LegalApp.API.DTOs;
using System.Security.Claims;

namespace LegalApp.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ClientsController : ControllerBase
    {
        private readonly LegalAppDbContext _context;

        public ClientsController(LegalAppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ClientResponseDto>>> GetClients()
        {
            try
            {
                var clients = await _context.Clients
                    .Include(c => c.LawFirm)
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

        [HttpPost]
        public async Task<ActionResult<ClientResponseDto>> CreateClient([FromBody] ClientCreateDto clientDto)
        {
            try
            {
                // Verify law firm exists
                var lawFirmExists = await _context.LawFirms.AnyAsync(lf => lf.Id == clientDto.LawFirmId);
                if (!lawFirmExists)
                {
                    return BadRequest(new { message = "La firma legal especificada no existe" });
                }

                var client = new Client
                {
                    FullName = clientDto.FullName,
                    Email = clientDto.Email,
                    Phone = clientDto.Phone,
                    Address = clientDto.Address,
                    ProcessType = clientDto.ProcessType,
                    CaseNumber = clientDto.CaseNumber,
                    ProcessStatus = clientDto.ProcessStatus,
                    LawFirmId = clientDto.LawFirmId,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Clients.Add(client);
                await _context.SaveChangesAsync();

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
