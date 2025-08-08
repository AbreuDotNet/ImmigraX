using System.ComponentModel.DataAnnotations;
using LegalApp.API.Models;

namespace LegalApp.API.DTOs
{
    // DTO para crear permisos de usuario para un documento
    public class CreateDocumentUserPermissionDto
    {
        [Required]
        public Guid DocumentId { get; set; }
        
        [Required]
        public Guid UserId { get; set; }
        
        public bool CanView { get; set; } = true;
        public bool CanEdit { get; set; } = false;
        public bool CanDelete { get; set; } = false;
        public bool CanShare { get; set; } = false;
        
        public DateTime? ExpiresAt { get; set; }
    }
    
    // DTO para actualizar permisos existentes
    public class UpdateDocumentUserPermissionDto
    {
        public bool CanView { get; set; } = true;
        public bool CanEdit { get; set; } = false;
        public bool CanDelete { get; set; } = false;
        public bool CanShare { get; set; } = false;
        
        public DateTime? ExpiresAt { get; set; }
        public bool IsActive { get; set; } = true;
    }
    
    // DTO para respuesta con información completa del permiso
    public class DocumentUserPermissionDto
    {
        public Guid Id { get; set; }
        public Guid DocumentId { get; set; }
        public string DocumentName { get; set; } = string.Empty;
        public Guid UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string UserEmail { get; set; } = string.Empty;
        
        public bool CanView { get; set; }
        public bool CanEdit { get; set; }
        public bool CanDelete { get; set; }
        public bool CanShare { get; set; }
        
        public Guid GrantedBy { get; set; }
        public string GrantedByUserName { get; set; } = string.Empty;
        public DateTime GrantedAt { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public bool IsActive { get; set; }
        public bool IsExpired { get; set; }
    }
    
    // DTO para asignar permisos múltiples
    public class BulkDocumentPermissionDto
    {
        [Required]
        public Guid DocumentId { get; set; }
        
        [Required]
        public List<UserPermissionDto> UserPermissions { get; set; } = [];
    }
    
    public class UserPermissionDto
    {
        [Required]
        public Guid UserId { get; set; }
        
        public bool CanView { get; set; } = true;
        public bool CanEdit { get; set; } = false;
        public bool CanDelete { get; set; } = false;
        public bool CanShare { get; set; } = false;
        
        public DateTime? ExpiresAt { get; set; }
    }
    
    // DTO para verificar permisos de un usuario en un documento
    public class DocumentPermissionCheckDto
    {
        public Guid DocumentId { get; set; }
        public Guid UserId { get; set; }
        public DocumentAccessLevel DocumentAccessLevel { get; set; }
        
        // Permisos calculados (considerando nivel de acceso del documento y permisos específicos)
        public bool CanView { get; set; }
        public bool CanEdit { get; set; }
        public bool CanDelete { get; set; }
        public bool CanShare { get; set; }
        
        // Información adicional
        public bool HasSpecificPermissions { get; set; } // Si tiene permisos específicos asignados
        public bool IsOwner { get; set; } // Si es el propietario del documento
        public string AccessReason { get; set; } = string.Empty; // "Document level", "Specific permissions", "Owner", etc.
    }
    
    // DTO para estadísticas de permisos de documento
    public class DocumentPermissionStatsDto
    {
        public Guid DocumentId { get; set; }
        public string DocumentName { get; set; } = string.Empty;
        public DocumentAccessLevel AccessLevel { get; set; }
        
        public int TotalUsersWithAccess { get; set; }
        public int UsersWithViewAccess { get; set; }
        public int UsersWithEditAccess { get; set; }
        public int UsersWithDeleteAccess { get; set; }
        public int UsersWithShareAccess { get; set; }
        
        public int ExpiredPermissions { get; set; }
        public int ActivePermissions { get; set; }
        
        public List<DocumentUserPermissionDto> RecentPermissions { get; set; } = [];
    }
}
