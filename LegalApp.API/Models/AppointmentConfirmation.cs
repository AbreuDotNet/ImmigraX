namespace LegalApp.API.Models
{
    public class AppointmentConfirmation
    {
        public Guid AppointmentId { get; set; }
        
        public bool? ConfirmedByClient { get; set; }
        
        public DateTime? ConfirmedAt { get; set; }
        
        // Navigation properties
        public virtual Appointment Appointment { get; set; } = null!;
    }
}
