using LegalApp.API.Models;
using System.ComponentModel.DataAnnotations;

namespace LegalApp.API.DTOs
{
    public class AppointmentCreateDto
    {
        [Required]
        public Guid ClientId { get; set; }
        
        [Required]
        public Guid LawFirmId { get; set; }
        
        public string? Title { get; set; }
        
        public string? Description { get; set; }
        
        public string? AppointmentType { get; set; }
        
        public Priority? Priority { get; set; }
        
        [Required]
        public DateTime AppointmentDate { get; set; }
    }

    public class AppointmentUpdateDto
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? AppointmentType { get; set; }
        public Priority? Priority { get; set; }
        public DateTime? AppointmentDate { get; set; }
    }

    public class AppointmentResponseDto
    {
        public Guid Id { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? AppointmentType { get; set; }
        public Priority? Priority { get; set; }
        public DateTime AppointmentDate { get; set; }
        public DateTime CreatedAt { get; set; }
        public string ClientName { get; set; } = string.Empty;
        public string LawFirmName { get; set; } = string.Empty;
        public string CreatedByName { get; set; } = string.Empty;
        public bool? ConfirmedByClient { get; set; }
        public DateTime? ConfirmedAt { get; set; }
    }
}
