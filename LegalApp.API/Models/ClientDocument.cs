using System.ComponentModel.DataAnnotations;

namespace LegalApp.API.Models
{
    public class ClientDocument
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        
        public Guid ClientId { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string DocumentType { get; set; } = string.Empty; // 'Pasaporte', 'Acta de Nacimiento', etc.
        
        [Required]
        [MaxLength(500)]
        public string FileUrl { get; set; } = string.Empty;
        
        public int Version { get; set; } = 1;
        
        public Guid UploadedBy { get; set; }
        
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
        
        public bool IsCurrent { get; set; } = true;
        
        // Navigation properties
        public virtual Client Client { get; set; } = null!;
        public virtual User UploadedByUser { get; set; } = null!;
    }
}
