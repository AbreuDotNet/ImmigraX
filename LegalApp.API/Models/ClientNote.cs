using System.ComponentModel.DataAnnotations;

namespace LegalApp.API.Models
{
    public class ClientNote
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        
        public Guid ClientId { get; set; }
        
        public Guid CreatedBy { get; set; }
        
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;
        
        [MaxLength(2000)]
        public string? Content { get; set; }
        
        [MaxLength(50)]
        public string Category { get; set; } = "General";
        
        public bool IsImportant { get; set; } = false;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public virtual Client Client { get; set; } = null!;
        public virtual User CreatedByUser { get; set; } = null!;
    }
}
