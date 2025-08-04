using System.ComponentModel.DataAnnotations;

namespace LegalApp.API.Models
{
    public class Message
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        
        public Guid SenderId { get; set; }
        
        public Guid RecipientId { get; set; }
        
        [MaxLength(200)]
        public string? Subject { get; set; }
        
        [MaxLength(2000)]
        public string? MessageText { get; set; }
        
        public DateTime SentAt { get; set; } = DateTime.UtcNow;
        
        public bool IsRead { get; set; } = false;
        
        // Navigation properties
        public virtual User Sender { get; set; } = null!;
        public virtual User Recipient { get; set; } = null!;
    }
}
