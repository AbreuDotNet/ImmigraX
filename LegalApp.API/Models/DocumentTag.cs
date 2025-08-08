using System.ComponentModel.DataAnnotations;

namespace LegalApp.API.Models
{
    public class DocumentTag
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        
        [Required]
        [MaxLength(50)]
        public string Name { get; set; } = string.Empty;
        
        [MaxLength(200)]
        public string? Description { get; set; }
        
        [Required]
        [MaxLength(30)]
        public string Color { get; set; } = "#e0e0e0"; // Color del tag
        
        public bool IsSystemTag { get; set; } = false; // Tags del sistema vs personalizados
        
        public int UsageCount { get; set; } = 0; // Contador de uso
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public virtual ICollection<DocumentTagAssignment> DocumentTagAssignments { get; set; } = new List<DocumentTagAssignment>();
    }
    
    // Tabla intermedia para many-to-many relationship
    public class DocumentTagAssignment
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        
        public Guid DocumentId { get; set; }
        public Guid TagId { get; set; }
        
        public Guid AssignedBy { get; set; }
        public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public virtual ClientDocument Document { get; set; } = null!;
        public virtual DocumentTag Tag { get; set; } = null!;
        public virtual User AssignedByUser { get; set; } = null!;
    }
}
