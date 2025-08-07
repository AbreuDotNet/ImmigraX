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
    public class DocumentsController : ControllerBase
    {
        private readonly LegalAppDbContext _context;
        private readonly IWebHostEnvironment _environment;
        private readonly ActivityLogService _activityLogService;

        public DocumentsController(LegalAppDbContext context, IWebHostEnvironment environment, ActivityLogService activityLogService)
        {
            _context = context;
            _environment = environment;
            _activityLogService = activityLogService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<DocumentResponseDto>>> GetDocuments([FromQuery] Guid? clientId = null)
        {
            try
            {
                var query = _context.ClientDocuments
                    .Include(d => d.Client)
                    .Include(d => d.UploadedByUser)
                    .AsQueryable();

                if (clientId.HasValue)
                {
                    query = query.Where(d => d.ClientId == clientId.Value);
                }

                var documents = await query
                    .Select(d => new DocumentResponseDto
                    {
                        Id = d.Id,
                        DocumentType = d.DocumentType,
                        FileUrl = d.FileUrl,
                        Version = d.Version,
                        UploadedAt = d.UploadedAt,
                        IsCurrent = d.IsCurrent,
                        ClientName = d.Client.FullName,
                        UploadedByName = d.UploadedByUser.FullName
                    })
                    .OrderByDescending(d => d.UploadedAt)
                    .ToListAsync();

                return Ok(documents);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener documentos", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<DocumentResponseDto>> GetDocument(Guid id)
        {
            try
            {
                var document = await _context.ClientDocuments
                    .Include(d => d.Client)
                    .Include(d => d.UploadedByUser)
                    .Where(d => d.Id == id)
                    .Select(d => new DocumentResponseDto
                    {
                        Id = d.Id,
                        DocumentType = d.DocumentType,
                        FileUrl = d.FileUrl,
                        Version = d.Version,
                        UploadedAt = d.UploadedAt,
                        IsCurrent = d.IsCurrent,
                        ClientName = d.Client.FullName,
                        UploadedByName = d.UploadedByUser.FullName
                    })
                    .FirstOrDefaultAsync();

                if (document == null)
                {
                    return NotFound(new { message = "Documento no encontrado" });
                }

                return Ok(document);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener documento", error = ex.Message });
            }
        }

        [HttpGet("client/{clientId}")]
        public async Task<ActionResult<IEnumerable<DocumentResponseDto>>> GetDocumentsByClient(Guid clientId)
        {
            try
            {
                var clientExists = await _context.Clients.AnyAsync(c => c.Id == clientId);
                if (!clientExists)
                {
                    return NotFound(new { message = "Cliente no encontrado" });
                }

                var documents = await _context.ClientDocuments
                    .Include(d => d.Client)
                    .Include(d => d.UploadedByUser)
                    .Where(d => d.ClientId == clientId)
                    .Select(d => new DocumentResponseDto
                    {
                        Id = d.Id,
                        DocumentType = d.DocumentType,
                        FileUrl = d.FileUrl,
                        Version = d.Version,
                        UploadedAt = d.UploadedAt,
                        IsCurrent = d.IsCurrent,
                        ClientName = d.Client.FullName,
                        UploadedByName = d.UploadedByUser.FullName
                    })
                    .OrderBy(d => d.DocumentType)
                    .ThenByDescending(d => d.Version)
                    .ToListAsync();

                return Ok(documents);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener documentos del cliente", error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult<DocumentResponseDto>> CreateDocument([FromBody] DocumentCreateDto documentDto)
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
                var clientExists = await _context.Clients.AnyAsync(c => c.Id == documentDto.ClientId);
                if (!clientExists)
                {
                    return BadRequest(new { message = "El cliente especificado no existe" });
                }

                // If this is marked as current, mark others as not current
                if (documentDto.IsCurrent)
                {
                    var existingDocs = await _context.ClientDocuments
                        .Where(d => d.ClientId == documentDto.ClientId && 
                               d.DocumentType == documentDto.DocumentType && 
                               d.IsCurrent)
                        .ToListAsync();

                    foreach (var doc in existingDocs)
                    {
                        doc.IsCurrent = false;
                    }
                }

                var document = new ClientDocument
                {
                    ClientId = documentDto.ClientId,
                    DocumentType = documentDto.DocumentType,
                    FileUrl = documentDto.FileUrl,
                    Version = documentDto.Version,
                    UploadedBy = currentUserId,
                    UploadedAt = DateTime.UtcNow,
                    IsCurrent = documentDto.IsCurrent
                };

                _context.ClientDocuments.Add(document);
                await _context.SaveChangesAsync();

                // Get client info for logging
                var client = await _context.Clients.FindAsync(documentDto.ClientId);
                var userLawFirm = await _context.UserLawFirms
                    .Where(ul => ul.UserId == currentUserId)
                    .FirstOrDefaultAsync();

                // Log the activity
                if (client != null && userLawFirm != null)
                {
                    await _activityLogService.LogDocumentUploadedAsync(
                        currentUserId,
                        userLawFirm.LawFirmId,
                        documentDto.ClientId,
                        client.FullName,
                        documentDto.DocumentType
                    );
                }

                // Return created document with related data
                var createdDocument = await _context.ClientDocuments
                    .Include(d => d.Client)
                    .Include(d => d.UploadedByUser)
                    .Where(d => d.Id == document.Id)
                    .Select(d => new DocumentResponseDto
                    {
                        Id = d.Id,
                        DocumentType = d.DocumentType,
                        FileUrl = d.FileUrl,
                        Version = d.Version,
                        UploadedAt = d.UploadedAt,
                        IsCurrent = d.IsCurrent,
                        ClientName = d.Client.FullName,
                        UploadedByName = d.UploadedByUser.FullName
                    })
                    .FirstOrDefaultAsync();

                return CreatedAtAction(nameof(GetDocument), new { id = document.Id }, createdDocument);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al crear documento", error = ex.Message });
            }
        }

        [HttpPost("upload")]
        public async Task<ActionResult<DocumentResponseDto>> UploadDocument([FromForm] DocumentUploadDto uploadDto)
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
                var clientExists = await _context.Clients.AnyAsync(c => c.Id == uploadDto.ClientId);
                if (!clientExists)
                {
                    return BadRequest(new { message = "El cliente especificado no existe" });
                }

                // Validate file
                if (uploadDto.File == null || uploadDto.File.Length == 0)
                {
                    return BadRequest(new { message = "No se ha proporcionado un archivo válido" });
                }

                // Create uploads directory if it doesn't exist
                var uploadsPath = Path.Combine(_environment.WebRootPath ?? _environment.ContentRootPath, "uploads", "documents");
                Directory.CreateDirectory(uploadsPath);

                // Generate unique filename
                var fileExtension = Path.GetExtension(uploadDto.File.FileName);
                var fileName = $"{Guid.NewGuid()}{fileExtension}";
                var filePath = Path.Combine(uploadsPath, fileName);

                // Save file
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await uploadDto.File.CopyToAsync(stream);
                }

                // Generate file URL
                var fileUrl = $"/uploads/documents/{fileName}";

                // If this is marked as current, mark others as not current
                if (uploadDto.IsCurrent)
                {
                    var existingDocs = await _context.ClientDocuments
                        .Where(d => d.ClientId == uploadDto.ClientId && 
                               d.DocumentType == uploadDto.DocumentType && 
                               d.IsCurrent)
                        .ToListAsync();

                    foreach (var doc in existingDocs)
                    {
                        doc.IsCurrent = false;
                    }
                }

                var document = new ClientDocument
                {
                    ClientId = uploadDto.ClientId,
                    DocumentType = uploadDto.DocumentType,
                    FileUrl = fileUrl,
                    Version = uploadDto.Version,
                    UploadedBy = currentUserId,
                    UploadedAt = DateTime.UtcNow,
                    IsCurrent = uploadDto.IsCurrent
                };

                _context.ClientDocuments.Add(document);
                await _context.SaveChangesAsync();

                // Return created document with related data
                var createdDocument = await _context.ClientDocuments
                    .Include(d => d.Client)
                    .Include(d => d.UploadedByUser)
                    .Where(d => d.Id == document.Id)
                    .Select(d => new DocumentResponseDto
                    {
                        Id = d.Id,
                        DocumentType = d.DocumentType,
                        FileUrl = d.FileUrl,
                        Version = d.Version,
                        UploadedAt = d.UploadedAt,
                        IsCurrent = d.IsCurrent,
                        ClientName = d.Client.FullName,
                        UploadedByName = d.UploadedByUser.FullName
                    })
                    .FirstOrDefaultAsync();

                return CreatedAtAction(nameof(GetDocument), new { id = document.Id }, createdDocument);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al subir documento", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateDocument(Guid id, [FromBody] DocumentUpdateDto documentDto)
        {
            try
            {
                var document = await _context.ClientDocuments.FindAsync(id);
                if (document == null)
                {
                    return NotFound(new { message = "Documento no encontrado" });
                }

                // Update only provided fields
                if (!string.IsNullOrEmpty(documentDto.DocumentType))
                    document.DocumentType = documentDto.DocumentType;

                if (!string.IsNullOrEmpty(documentDto.FileUrl))
                    document.FileUrl = documentDto.FileUrl;

                if (documentDto.Version.HasValue)
                    document.Version = documentDto.Version.Value;

                if (documentDto.IsCurrent.HasValue)
                {
                    // If setting this as current, mark others as not current
                    if (documentDto.IsCurrent.Value)
                    {
                        var existingDocs = await _context.ClientDocuments
                            .Where(d => d.ClientId == document.ClientId && 
                                   d.DocumentType == document.DocumentType && 
                                   d.IsCurrent && 
                                   d.Id != id)
                            .ToListAsync();

                        foreach (var doc in existingDocs)
                        {
                            doc.IsCurrent = false;
                        }
                    }
                    document.IsCurrent = documentDto.IsCurrent.Value;
                }

                await _context.SaveChangesAsync();

                return Ok(new { message = "Documento actualizado exitosamente" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al actualizar documento", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteDocument(Guid id)
        {
            try
            {
                var document = await _context.ClientDocuments.FindAsync(id);
                if (document == null)
                {
                    return NotFound(new { message = "Documento no encontrado" });
                }

                // Delete physical file if exists
                if (!string.IsNullOrEmpty(document.FileUrl) && document.FileUrl.StartsWith("/uploads/"))
                {
                    var physicalPath = Path.Combine(_environment.WebRootPath ?? _environment.ContentRootPath, 
                        document.FileUrl.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));
                    
                    if (System.IO.File.Exists(physicalPath))
                    {
                        System.IO.File.Delete(physicalPath);
                    }
                }

                _context.ClientDocuments.Remove(document);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Documento eliminado exitosamente" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al eliminar documento", error = ex.Message });
            }
        }

        [HttpGet("download/{id}")]
        public async Task<ActionResult> DownloadDocument(Guid id)
        {
            try
            {
                var document = await _context.ClientDocuments.FindAsync(id);
                if (document == null)
                {
                    return NotFound(new { message = "Documento no encontrado" });
                }

                if (string.IsNullOrEmpty(document.FileUrl))
                {
                    return NotFound(new { message = "Archivo no encontrado" });
                }

                var physicalPath = Path.Combine(_environment.WebRootPath ?? _environment.ContentRootPath, 
                    document.FileUrl.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));

                if (!System.IO.File.Exists(physicalPath))
                {
                    return NotFound(new { message = "Archivo físico no encontrado" });
                }

                var fileBytes = await System.IO.File.ReadAllBytesAsync(physicalPath);
                var fileName = Path.GetFileName(physicalPath);
                var contentType = GetContentType(fileName);

                return File(fileBytes, contentType, fileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al descargar documento", error = ex.Message });
            }
        }

        private string GetContentType(string fileName)
        {
            var extension = Path.GetExtension(fileName).ToLowerInvariant();
            return extension switch
            {
                ".pdf" => "application/pdf",
                ".doc" => "application/msword",
                ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                ".jpg" or ".jpeg" => "image/jpeg",
                ".png" => "image/png",
                ".gif" => "image/gif",
                ".txt" => "text/plain",
                _ => "application/octet-stream"
            };
        }
    }
}
