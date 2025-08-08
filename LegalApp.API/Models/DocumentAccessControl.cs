using System.ComponentModel.DataAnnotations;

namespace LegalApp.API.Models
{
    public enum DocumentAccessLevel
    {
        Public = 0,          // Acceso público (dentro de la firma)
        Restricted = 1,      // Solo usuarios específicos
        Confidential = 2,    // Solo abogados y admins
        HighlyConfidential = 3  // Solo admins/masters
    }
    
    public class DocumentAccessControl
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        
        public Guid DocumentId { get; set; }
        
        public DocumentAccessLevel AccessLevel { get; set; } = DocumentAccessLevel.Public;
        
        [MaxLength(500)]
        public string? AccessReason { get; set; } // Razón de la restricción
        
        public Guid CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ExpiresAt { get; set; } // Acceso temporal
        
        public bool IsActive { get; set; } = true;
        
        // Navigation properties
        public virtual ClientDocument Document { get; set; } = null!;
        public virtual User CreatedByUser { get; set; } = null!;
        public virtual ICollection<DocumentUserPermission> UserPermissions { get; set; } = new List<DocumentUserPermission>();
    }
    
    // Permisos específicos por usuario
    public class DocumentUserPermission
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        
        public Guid DocumentId { get; set; }
        public Guid UserId { get; set; }
        
        public bool CanView { get; set; } = true;
        public bool CanEdit { get; set; } = false;
        public bool CanDelete { get; set; } = false;
        public bool CanShare { get; set; } = false;
        
        public Guid GrantedBy { get; set; }
        public DateTime GrantedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ExpiresAt { get; set; }
        
        public bool IsActive { get; set; } = true;
        
        // Navigation properties
        public virtual ClientDocument Document { get; set; } = null!;
        public virtual User User { get; set; } = null!;
        public virtual User GrantedByUser { get; set; } = null!;
    }
}
