using System.ComponentModel.DataAnnotations;

namespace LegalApp.API.DTOs
{
    // DTO para crear una etiqueta
    public class CreateDocumentTagDto
    {
        [Required]
        [MaxLength(50)]
        public string Name { get; set; } = string.Empty;
        
        [MaxLength(30)]
        public string Color { get; set; } = "#e0e0e0";
        
        public bool IsSystemTag { get; set; } = false;
    }
    
    // DTO para actualizar una etiqueta
    public class UpdateDocumentTagDto
    {
        [Required]
        [MaxLength(50)]
        public string Name { get; set; } = string.Empty;
        
        [MaxLength(30)]
        public string Color { get; set; } = "#e0e0e0";
    }
    
    // DTO para respuesta con información completa de la etiqueta
    public class DocumentTagDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty;
        public bool IsSystemTag { get; set; }
        public int UsageCount { get; set; }
        public DateTime CreatedAt { get; set; }
    }
    
    // DTO simplificado para mostrar etiquetas asignadas a documentos
    public class DocumentTagSimpleDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty;
    }
    
    // DTO para asignar/desasignar etiquetas a documentos
    public class DocumentTagAssignmentDto
    {
        public Guid DocumentId { get; set; }
        public List<Guid> TagIds { get; set; } = [];
    }
    
    // DTO para respuesta de asignación con información completa
    public class DocumentTagAssignmentResponseDto
    {
        public Guid Id { get; set; }
        public Guid DocumentId { get; set; }
        public Guid TagId { get; set; }
        public DocumentTagSimpleDto Tag { get; set; } = null!;
        public Guid AssignedBy { get; set; }
        public string AssignedByUserName { get; set; } = string.Empty;
        public DateTime AssignedAt { get; set; }
    }
    
    // DTO para estadísticas de uso de etiquetas
    public class TagUsageStatsDto
    {
        public Guid TagId { get; set; }
        public string TagName { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty;
        public int DocumentCount { get; set; }
        public DateTime LastUsedAt { get; set; }
        public List<string> MostCommonDocumentTypes { get; set; } = [];
    }
}
