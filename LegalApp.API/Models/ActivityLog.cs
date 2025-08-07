using System.ComponentModel.DataAnnotations;

namespace LegalApp.API.Models
{
    public enum ActivityType
    {
        ClientCreated = 0,
        ClientUpdated = 1,
        AppointmentScheduled = 2,
        AppointmentConfirmed = 3,
        AppointmentCancelled = 4,
        AppointmentUpdated = 5,
        EmailSent = 6,
        DocumentUploaded = 7,
        DocumentReviewed = 8,
        PaymentReceived = 9,
        PaymentReminderSent = 10,
        NoteAdded = 11,
        FormSent = 12,
        FormCompleted = 13,
        CaseStatusUpdated = 14,
        PhoneCallMade = 15,
        ClientInteraction = 16,
        UserCreate = 17,
        UserUpdate = 18,
        UserDelete = 19,
        UserList = 20,
        UserView = 21
    }

    public class ActivityLog
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid UserId { get; set; }
        public virtual User User { get; set; } = null!;

        public Guid? ClientId { get; set; }
        public virtual Client? Client { get; set; }

        [Required]
        public Guid LawFirmId { get; set; }
        public virtual LawFirm LawFirm { get; set; } = null!;

        [Required]
        public ActivityType ActivityType { get; set; }

        [Required]
        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;

        /// <summary>
        /// JSON metadata for storing additional information like email subject, amount, etc.
        /// </summary>
        public string? Metadata { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
