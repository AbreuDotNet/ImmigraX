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
    public class ClientNotesController : ControllerBase
    {
        private readonly LegalAppDbContext _context;
        private readonly ActivityLogService _activityLogService;

        public ClientNotesController(LegalAppDbContext context, ActivityLogService activityLogService)
        {
            _context = context;
            _activityLogService = activityLogService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ClientNoteResponseDto>>> GetClientNotes([FromQuery] Guid? clientId = null, [FromQuery] string? category = null)
        {
            try
            {
                var query = _context.ClientNotes
                    .Include(n => n.Client)
                    .Include(n => n.CreatedByUser)
                    .AsQueryable();

                if (clientId.HasValue)
                {
                    query = query.Where(n => n.ClientId == clientId.Value);
                }

                if (!string.IsNullOrEmpty(category))
                {
                    query = query.Where(n => n.Category.ToLower().Contains(category.ToLower()));
                }

                var notes = await query
                    .Select(n => new ClientNoteResponseDto
                    {
                        Id = n.Id,
                        Title = n.Title,
                        Content = n.Content,
                        Category = n.Category,
                        IsImportant = n.IsImportant,
                        CreatedAt = n.CreatedAt,
                        UpdatedAt = n.UpdatedAt,
                        ClientName = n.Client.FullName,
                        CreatedByName = n.CreatedByUser.FullName
                    })
                    .OrderByDescending(n => n.CreatedAt)
                    .ToListAsync();

                return Ok(notes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener notas", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ClientNoteResponseDto>> GetClientNote(Guid id)
        {
            try
            {
                var note = await _context.ClientNotes
                    .Include(n => n.Client)
                    .Include(n => n.CreatedByUser)
                    .Where(n => n.Id == id)
                    .Select(n => new ClientNoteResponseDto
                    {
                        Id = n.Id,
                        Title = n.Title,
                        Content = n.Content,
                        Category = n.Category,
                        IsImportant = n.IsImportant,
                        CreatedAt = n.CreatedAt,
                        UpdatedAt = n.UpdatedAt,
                        ClientName = n.Client.FullName,
                        CreatedByName = n.CreatedByUser.FullName
                    })
                    .FirstOrDefaultAsync();

                if (note == null)
                {
                    return NotFound(new { message = "Nota no encontrada" });
                }

                return Ok(note);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener nota", error = ex.Message });
            }
        }

        [HttpGet("client/{clientId}")]
        public async Task<ActionResult<IEnumerable<ClientNoteResponseDto>>> GetNotesByClient(Guid clientId)
        {
            try
            {
                var clientExists = await _context.Clients.AnyAsync(c => c.Id == clientId);
                if (!clientExists)
                {
                    return NotFound(new { message = "Cliente no encontrado" });
                }

                var notes = await _context.ClientNotes
                    .Include(n => n.Client)
                    .Include(n => n.CreatedByUser)
                    .Where(n => n.ClientId == clientId)
                    .Select(n => new ClientNoteResponseDto
                    {
                        Id = n.Id,
                        Title = n.Title,
                        Content = n.Content,
                        Category = n.Category,
                        IsImportant = n.IsImportant,
                        CreatedAt = n.CreatedAt,
                        UpdatedAt = n.UpdatedAt,
                        ClientName = n.Client.FullName,
                        CreatedByName = n.CreatedByUser.FullName
                    })
                    .OrderByDescending(n => n.CreatedAt)
                    .ToListAsync();

                return Ok(notes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener notas del cliente", error = ex.Message });
            }
        }

        [HttpGet("important")]
        public async Task<ActionResult<IEnumerable<ClientNoteResponseDto>>> GetImportantNotes([FromQuery] Guid? clientId = null)
        {
            try
            {
                var query = _context.ClientNotes
                    .Include(n => n.Client)
                    .Include(n => n.CreatedByUser)
                    .Where(n => n.IsImportant);

                if (clientId.HasValue)
                {
                    query = query.Where(n => n.ClientId == clientId.Value);
                }

                var importantNotes = await query
                    .Select(n => new ClientNoteResponseDto
                    {
                        Id = n.Id,
                        Title = n.Title,
                        Content = n.Content,
                        Category = n.Category,
                        IsImportant = n.IsImportant,
                        CreatedAt = n.CreatedAt,
                        UpdatedAt = n.UpdatedAt,
                        ClientName = n.Client.FullName,
                        CreatedByName = n.CreatedByUser.FullName
                    })
                    .OrderByDescending(n => n.CreatedAt)
                    .ToListAsync();

                return Ok(importantNotes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener notas importantes", error = ex.Message });
            }
        }

        [HttpGet("categories")]
        public async Task<ActionResult<IEnumerable<string>>> GetCategories()
        {
            try
            {
                var categories = await _context.ClientNotes
                    .Where(n => !string.IsNullOrEmpty(n.Category))
                    .Select(n => n.Category)
                    .Distinct()
                    .OrderBy(c => c)
                    .ToListAsync();

                return Ok(categories);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener categorías", error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult<ClientNoteResponseDto>> CreateClientNote([FromBody] ClientNoteCreateDto noteDto)
        {
            try
            {
                // Get current user ID from JWT token
                var currentUserIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!Guid.TryParse(currentUserIdString, out var currentUserId))
                {
                    return Unauthorized(new { message = "Token de usuario inválido" });
                }

                // Verify client exists
                var clientExists = await _context.Clients.AnyAsync(c => c.Id == noteDto.ClientId);
                if (!clientExists)
                {
                    return BadRequest(new { message = "El cliente especificado no existe" });
                }

                var note = new ClientNote
                {
                    ClientId = noteDto.ClientId,
                    Title = noteDto.Title,
                    Content = noteDto.Content,
                    Category = noteDto.Category ?? "General",
                    IsImportant = noteDto.IsImportant,
                    CreatedBy = currentUserId,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.ClientNotes.Add(note);
                await _context.SaveChangesAsync();

                // Get client info and user law firm for logging
                var client = await _context.Clients.FindAsync(noteDto.ClientId);
                var userLawFirm = await _context.UserLawFirms
                    .Where(ul => ul.UserId == currentUserId)
                    .FirstOrDefaultAsync();

                // Log the activity
                if (client != null && userLawFirm != null)
                {
                    await _activityLogService.LogNoteAddedAsync(
                        currentUserId,
                        userLawFirm.LawFirmId,
                        noteDto.ClientId,
                        client.FullName,
                        noteDto.Title ?? "Nota sin título"
                    );
                }

                // Return created note with related data
                var createdNote = await _context.ClientNotes
                    .Include(n => n.Client)
                    .Include(n => n.CreatedByUser)
                    .Where(n => n.Id == note.Id)
                    .Select(n => new ClientNoteResponseDto
                    {
                        Id = n.Id,
                        Title = n.Title,
                        Content = n.Content,
                        Category = n.Category,
                        IsImportant = n.IsImportant,
                        CreatedAt = n.CreatedAt,
                        UpdatedAt = n.UpdatedAt,
                        ClientName = n.Client.FullName,
                        CreatedByName = n.CreatedByUser.FullName
                    })
                    .FirstOrDefaultAsync();

                return CreatedAtAction(nameof(GetClientNote), new { id = note.Id }, createdNote);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al crear nota", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateClientNote(Guid id, [FromBody] ClientNoteUpdateDto noteDto)
        {
            try
            {
                var note = await _context.ClientNotes.FindAsync(id);
                if (note == null)
                {
                    return NotFound(new { message = "Nota no encontrada" });
                }

                // Update only provided fields
                if (!string.IsNullOrEmpty(noteDto.Title))
                    note.Title = noteDto.Title;

                if (!string.IsNullOrEmpty(noteDto.Content))
                    note.Content = noteDto.Content;

                if (!string.IsNullOrEmpty(noteDto.Category))
                    note.Category = noteDto.Category;

                if (noteDto.IsImportant.HasValue)
                    note.IsImportant = noteDto.IsImportant.Value;

                note.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(new { message = "Nota actualizada exitosamente" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al actualizar nota", error = ex.Message });
            }
        }

        [HttpPut("{id}/toggle-importance")]
        public async Task<ActionResult> ToggleImportance(Guid id)
        {
            try
            {
                var note = await _context.ClientNotes.FindAsync(id);
                if (note == null)
                {
                    return NotFound(new { message = "Nota no encontrada" });
                }

                note.IsImportant = !note.IsImportant;
                note.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(new 
                { 
                    message = note.IsImportant ? "Nota marcada como importante" : "Nota desmarcada como importante",
                    isImportant = note.IsImportant
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al cambiar importancia de la nota", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteClientNote(Guid id)
        {
            try
            {
                var note = await _context.ClientNotes.FindAsync(id);
                if (note == null)
                {
                    return NotFound(new { message = "Nota no encontrada" });
                }

                _context.ClientNotes.Remove(note);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Nota eliminada exitosamente" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al eliminar nota", error = ex.Message });
            }
        }

        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<ClientNoteResponseDto>>> SearchNotes([FromQuery] string searchTerm, [FromQuery] Guid? clientId = null)
        {
            try
            {
                if (string.IsNullOrEmpty(searchTerm))
                {
                    return BadRequest(new { message = "Término de búsqueda requerido" });
                }

                var query = _context.ClientNotes
                    .Include(n => n.Client)
                    .Include(n => n.CreatedByUser)
                    .Where(n => n.Title.ToLower().Contains(searchTerm.ToLower()) ||
                               n.Content.ToLower().Contains(searchTerm.ToLower()) ||
                               n.Category.ToLower().Contains(searchTerm.ToLower()));

                if (clientId.HasValue)
                {
                    query = query.Where(n => n.ClientId == clientId.Value);
                }

                var notes = await query
                    .Select(n => new ClientNoteResponseDto
                    {
                        Id = n.Id,
                        Title = n.Title,
                        Content = n.Content,
                        Category = n.Category,
                        IsImportant = n.IsImportant,
                        CreatedAt = n.CreatedAt,
                        UpdatedAt = n.UpdatedAt,
                        ClientName = n.Client.FullName,
                        CreatedByName = n.CreatedByUser.FullName
                    })
                    .OrderByDescending(n => n.CreatedAt)
                    .ToListAsync();

                return Ok(notes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al buscar notas", error = ex.Message });
            }
        }

        [HttpGet("recent")]
        public async Task<ActionResult<IEnumerable<ClientNoteResponseDto>>> GetRecentNotes([FromQuery] int days = 7, [FromQuery] Guid? clientId = null)
        {
            try
            {
                var cutoffDate = DateTime.UtcNow.AddDays(-days);
                var query = _context.ClientNotes
                    .Include(n => n.Client)
                    .Include(n => n.CreatedByUser)
                    .Where(n => n.CreatedAt >= cutoffDate);

                if (clientId.HasValue)
                {
                    query = query.Where(n => n.ClientId == clientId.Value);
                }

                var recentNotes = await query
                    .Select(n => new ClientNoteResponseDto
                    {
                        Id = n.Id,
                        Title = n.Title,
                        Content = n.Content,
                        Category = n.Category,
                        IsImportant = n.IsImportant,
                        CreatedAt = n.CreatedAt,
                        UpdatedAt = n.UpdatedAt,
                        ClientName = n.Client.FullName,
                        CreatedByName = n.CreatedByUser.FullName
                    })
                    .OrderByDescending(n => n.CreatedAt)
                    .ToListAsync();

                return Ok(recentNotes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener notas recientes", error = ex.Message });
            }
        }

        [HttpGet("statistics")]
        public async Task<ActionResult> GetNotesStatistics([FromQuery] Guid? clientId = null)
        {
            try
            {
                var query = _context.ClientNotes.AsQueryable();

                if (clientId.HasValue)
                {
                    query = query.Where(n => n.ClientId == clientId.Value);
                }

                var statistics = await query
                    .GroupBy(n => 1)
                    .Select(g => new
                    {
                        TotalNotes = g.Count(),
                        ImportantNotes = g.Count(n => n.IsImportant),
                        NotesThisWeek = g.Count(n => n.CreatedAt >= DateTime.UtcNow.AddDays(-7)),
                        NotesThisMonth = g.Count(n => n.CreatedAt >= DateTime.UtcNow.AddDays(-30)),
                        CategoriesCount = g.Select(n => n.Category).Distinct().Count()
                    })
                    .FirstOrDefaultAsync();

                if (statistics == null)
                {
                    statistics = new
                    {
                        TotalNotes = 0,
                        ImportantNotes = 0,
                        NotesThisWeek = 0,
                        NotesThisMonth = 0,
                        CategoriesCount = 0
                    };
                }

                // Get notes by category
                var notesByCategory = await query
                    .GroupBy(n => n.Category)
                    .Select(g => new
                    {
                        Category = g.Key,
                        Count = g.Count()
                    })
                    .OrderByDescending(x => x.Count)
                    .ToListAsync();

                return Ok(new
                {
                    statistics,
                    notesByCategory
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener estadísticas de notas", error = ex.Message });
            }
        }
    }
}
