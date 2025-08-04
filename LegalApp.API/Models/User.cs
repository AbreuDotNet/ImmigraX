using System.ComponentModel.DataAnnotations;

namespace LegalApp.API.Models
{
    public enum UserRole
    {
        Master,
        Abogado,
        Secretario
    }

    public class User
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        
        [Required]
        [MaxLength(200)]
        public string FullName { get; set; } = string.Empty;
        
        [Required]
        [EmailAddress]
        [MaxLength(255)]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        public string PasswordHash { get; set; } = string.Empty;
        
        [Required]
        public UserRole Role { get; set; }
        
        public bool IsActive { get; set; } = true;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public virtual ICollection<UserLawFirm> UserLawFirms { get; set; } = new List<UserLawFirm>();
        public virtual ICollection<ClientDocument> UploadedDocuments { get; set; } = new List<ClientDocument>();
        public virtual ICollection<Appointment> CreatedAppointments { get; set; } = new List<Appointment>();
        public virtual ICollection<ClientNote> CreatedNotes { get; set; } = new List<ClientNote>();
        public virtual ICollection<Message> SentMessages { get; set; } = new List<Message>();
        public virtual ICollection<Message> ReceivedMessages { get; set; } = new List<Message>();
        public virtual ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();
    }
}
