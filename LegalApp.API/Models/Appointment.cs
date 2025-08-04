using System.ComponentModel.DataAnnotations;

namespace LegalApp.API.Models
{
    public enum Priority
    {
        Baja,
        Media,
        Alta
    }

    public enum AppointmentStatus
    {
        Programada,
        Confirmada,
        Completada,
        Cancelada,
        Reprogramada
    }

    public class Appointment
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        
        public Guid ClientId { get; set; }
        
        public Guid LawFirmId { get; set; }
        
        [MaxLength(200)]
        public string? Title { get; set; }
        
        [MaxLength(1000)]
        public string? Description { get; set; }
        
        [MaxLength(100)]
        public string? AppointmentType { get; set; } // 'Entrevista consular', etc.
        
        public Priority? Priority { get; set; }
        
        public AppointmentStatus Status { get; set; } = AppointmentStatus.Programada;
        
        [Required]
        public DateTime AppointmentDate { get; set; }
        
        public Guid CreatedBy { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public virtual Client Client { get; set; } = null!;
        public virtual LawFirm LawFirm { get; set; } = null!;
        public virtual User CreatedByUser { get; set; } = null!;
        public virtual AppointmentConfirmation? Confirmation { get; set; }
    }
}
