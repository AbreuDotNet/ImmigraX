using System.ComponentModel.DataAnnotations;

namespace LegalApp.API.Models
{
    public class Client
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        
        public Guid LawFirmId { get; set; }
        
        [Required]
        [MaxLength(200)]
        public string FullName { get; set; } = string.Empty;
        
        [EmailAddress]
        [MaxLength(255)]
        public string? Email { get; set; }
        
        [MaxLength(20)]
        public string? Phone { get; set; }
        
        [MaxLength(500)]
        public string? Address { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string ProcessType { get; set; } = string.Empty; // Visa, TPS, Asilo, etc.
        
        [MaxLength(100)]
        public string? CaseNumber { get; set; }
        
        [MaxLength(50)]
        public string ProcessStatus { get; set; } = "Pendiente";
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public virtual LawFirm LawFirm { get; set; } = null!;
        public virtual ICollection<ClientDocument> Documents { get; set; } = new List<ClientDocument>();
        public virtual ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
        public virtual ICollection<PaymentPlan> PaymentPlans { get; set; } = new List<PaymentPlan>();
        public virtual ICollection<ClientNote> Notes { get; set; } = new List<ClientNote>();
    }
}
