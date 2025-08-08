using System.ComponentModel.DataAnnotations;

namespace LegalApp.API.Models
{
    public class DocumentCategory
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [MaxLength(500)]
        public string? Description { get; set; }
        
        [Required]
        [MaxLength(50)]
        public string Color { get; set; } = "#1976d2"; // Color hex para UI
        
        [MaxLength(50)]
        public string? Icon { get; set; } // Nombre del ícono Material-UI
        
        public int SortOrder { get; set; } = 0;
        
        public bool IsActive { get; set; } = true;
        
        // Jerarquía
        public Guid? ParentCategoryId { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public virtual DocumentCategory? ParentCategory { get; set; }
        public virtual ICollection<DocumentCategory> SubCategories { get; set; } = new List<DocumentCategory>();
        public virtual ICollection<ClientDocument> Documents { get; set; } = new List<ClientDocument>();
    }
}
