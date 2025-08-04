using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;

namespace LegalApp.API.Models
{
    public class AuditLog
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        
        public Guid UserId { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string Action { get; set; } = string.Empty; // 'CREATED_CLIENT', 'UPDATED_APPOINTMENT', etc.
        
        [Required]
        [MaxLength(50)]
        public string EntityType { get; set; } = string.Empty; // 'client', 'document', 'appointment', etc.
        
        public Guid EntityId { get; set; }
        
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        
        [Column(TypeName = "jsonb")]
        public string? Details { get; set; } // Store as JSON string
        
        // Navigation properties
        public virtual User User { get; set; } = null!;
        
        // Helper methods for JSON handling
        public T? GetDetails<T>() where T : class
        {
            if (string.IsNullOrEmpty(Details))
                return null;
                
            return JsonSerializer.Deserialize<T>(Details);
        }
        
        public void SetDetails<T>(T details) where T : class
        {
            Details = JsonSerializer.Serialize(details);
        }
    }
}
