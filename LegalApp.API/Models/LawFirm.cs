using System.ComponentModel.DataAnnotations;

namespace LegalApp.API.Models
{
    public class LawFirm
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        
        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;
        
        [MaxLength(500)]
        public string? Address { get; set; }
        
        [MaxLength(20)]
        public string? Phone { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public virtual ICollection<UserLawFirm> UserLawFirms { get; set; } = new List<UserLawFirm>();
        public virtual ICollection<Client> Clients { get; set; } = new List<Client>();
        public virtual ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
    }
}
