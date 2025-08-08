using System.ComponentModel.DataAnnotations;
using LegalApp.API.Models;

namespace LegalApp.API.DTOs
{
    public class DocumentCreateDto
    {
        [Required]
        public Guid ClientId { get; set; }
        
        [Required]
        [MaxLength(200)]
        public string DocumentType { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(300)]
        public string FileName { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(500)]
        public string FileUrl { get; set; } = string.Empty;
        
        public Guid? CategoryId { get; set; }
        
        public DocumentAccessLevel AccessLevel { get; set; } = DocumentAccessLevel.Restricted;
        
        public int Version { get; set; } = 1;
        
        [MaxLength(1000)]
        public string? VersionNotes { get; set; }
        
        [MaxLength(1000)]
        public string? Description { get; set; }
        
        public bool IsCurrent { get; set; } = true;
        
        // Etiquetas a asignar
        public List<Guid> TagIds { get; set; } = [];
    }

    public class DocumentUpdateDto
    {
        [MaxLength(200)]
        public string? DocumentType { get; set; }
        
        [MaxLength(300)]
        public string? FileName { get; set; }
        
        [MaxLength(500)]
        public string? FileUrl { get; set; }
        
        public Guid? CategoryId { get; set; }
        
        public DocumentAccessLevel? AccessLevel { get; set; }
        
        public int? Version { get; set; }
        
        [MaxLength(1000)]
        public string? VersionNotes { get; set; }
        
        [MaxLength(1000)]
        public string? Description { get; set; }
        
        [MaxLength(2000)]
        public string? Notes { get; set; }
        
        public bool? IsCurrent { get; set; }
        
        public bool? IsArchived { get; set; }
        
        // Etiquetas a asignar
        public List<Guid>? TagIds { get; set; }
    }

    public class DocumentResponseDto
    {
        public Guid Id { get; set; }
        public string DocumentType { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public string FileUrl { get; set; } = string.Empty;
        
        // Información de categoría
        public Guid? CategoryId { get; set; }
        public string? CategoryName { get; set; }
        public string? CategoryColor { get; set; }
        
        public DocumentAccessLevel AccessLevel { get; set; }
        
        // Metadatos del archivo
        public string? MimeType { get; set; }
        public long? FileSizeBytes { get; set; }
        public string? FileHash { get; set; }
        
        public int Version { get; set; }
        public string? VersionNotes { get; set; }
        public string? Description { get; set; }
        public string? Notes { get; set; }
        
        public DateTime UploadedAt { get; set; }
        public DateTime? ModifiedAt { get; set; }
        public bool IsCurrent { get; set; }
        public bool IsArchived { get; set; }
        public DateTime? ArchivedAt { get; set; }
        
        // Información del cliente y usuarios
        public string ClientName { get; set; } = string.Empty;
        public string UploadedByName { get; set; } = string.Empty;
        public string? ArchivedByName { get; set; }
        
        // Etiquetas asignadas
        public List<DocumentTagSimpleDto> Tags { get; set; } = [];
        
        // Permisos del usuario actual (calculados)
        public bool CanView { get; set; }
        public bool CanEdit { get; set; }
        public bool CanDelete { get; set; }
        public bool CanShare { get; set; }
    }

    public class DocumentUploadDto
    {
        [Required]
        public Guid ClientId { get; set; }
        
        [Required]
        [MaxLength(200)]
        public string DocumentType { get; set; } = string.Empty;
        
        [Required]
        public IFormFile File { get; set; } = null!;
        
        public Guid? CategoryId { get; set; }
        
        public DocumentAccessLevel AccessLevel { get; set; } = DocumentAccessLevel.Restricted;
        
        public int Version { get; set; } = 1;
        
        [MaxLength(1000)]
        public string? VersionNotes { get; set; }
        
        [MaxLength(1000)]
        public string? Description { get; set; }
        
        public bool IsCurrent { get; set; } = true;
        
        // Etiquetas a asignar
        public List<Guid> TagIds { get; set; } = [];
    }
    
    // DTO para búsqueda avanzada de documentos
    public class DocumentSearchDto
    {
        public string? SearchTerm { get; set; }
        public Guid? ClientId { get; set; }
        public Guid? CategoryId { get; set; }
        public List<Guid>? TagIds { get; set; }
        public DocumentAccessLevel? AccessLevel { get; set; }
        public string? DocumentType { get; set; }
        public bool? IsArchived { get; set; }
        public DateTime? UploadedAfter { get; set; }
        public DateTime? UploadedBefore { get; set; }
        public long? MinFileSize { get; set; }
        public long? MaxFileSize { get; set; }
        
        // Paginación
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
        
        // Ordenamiento
        public string SortBy { get; set; } = "UploadedAt"; // "Name", "Size", "Type", etc.
        public bool SortDescending { get; set; } = true;
    }
    
    // DTO para estadísticas de documentos
    public class DocumentStatsDto
    {
        public int TotalDocuments { get; set; }
        public int ArchivedDocuments { get; set; }
        public long TotalSizeBytes { get; set; }
        public string TotalSizeFormatted { get; set; } = string.Empty;
        
        public Dictionary<string, int> DocumentsByType { get; set; } = [];
        public Dictionary<string, int> DocumentsByCategory { get; set; } = [];
        public Dictionary<DocumentAccessLevel, int> DocumentsByAccessLevel { get; set; } = [];
        
        public List<DocumentTagSimpleDto> MostUsedTags { get; set; } = [];
        public DateTime? LastUploadedAt { get; set; }
        public int DocumentsThisMonth { get; set; }
    }
}
