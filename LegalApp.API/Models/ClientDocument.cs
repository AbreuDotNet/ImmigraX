using System.ComponentModel.DataAnnotations;

namespace LegalApp.API.Models
{
    public class ClientDocument
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        
        public Guid ClientId { get; set; }
        
        // Categorización mejorada
        public Guid? CategoryId { get; set; }
        
        public DocumentAccessLevel AccessLevel { get; set; } = DocumentAccessLevel.Restricted;
        
        [Required]
        [MaxLength(200)]
        public string DocumentType { get; set; } = string.Empty; // 'Pasaporte', 'Acta de Nacimiento', etc.
        
        [Required]
        [MaxLength(300)]
        public string FileName { get; set; } = string.Empty; // Nombre original del archivo
        
        [Required]
        [MaxLength(500)]
        public string FileUrl { get; set; } = string.Empty;
        
        // Metadatos del archivo
        [MaxLength(100)]
        public string? MimeType { get; set; }
        
        public long? FileSizeBytes { get; set; }
        
        [MaxLength(64)]
        public string? FileHash { get; set; } // SHA-256 para integridad
        
        // Información de versión mejorada
        public int Version { get; set; } = 1;
        
        [MaxLength(1000)]
        public string? VersionNotes { get; set; } // Comentarios de la versión
        
        // Información de usuario
        public Guid UploadedBy { get; set; }
        
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ModifiedAt { get; set; }
        
        public bool IsCurrent { get; set; } = true;
        
        // Metadatos adicionales
        [MaxLength(1000)]
        public string? Description { get; set; }
        
        [MaxLength(2000)]
        public string? Notes { get; set; }
        
        public bool IsArchived { get; set; } = false;
        public DateTime? ArchivedAt { get; set; }
        public Guid? ArchivedBy { get; set; }
        
        // Campos para búsqueda
        public string? SearchableContent { get; set; } // Contenido extraído para búsqueda
        
        // Navigation properties
        public virtual Client Client { get; set; } = null!;
        public virtual User UploadedByUser { get; set; } = null!;
        public virtual User? ArchivedByUser { get; set; }
        public virtual DocumentCategory? Category { get; set; }
        public virtual ICollection<DocumentTagAssignment> TagAssignments { get; set; } = new List<DocumentTagAssignment>();
        public virtual ICollection<DocumentUserPermission> UserPermissions { get; set; } = new List<DocumentUserPermission>();
        public virtual DocumentAccessControl? AccessControl { get; set; }
    }
}
