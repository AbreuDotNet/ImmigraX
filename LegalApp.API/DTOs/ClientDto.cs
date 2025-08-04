using System.ComponentModel.DataAnnotations;

namespace LegalApp.API.DTOs
{
    public class ClientCreateDto
    {
        [Required]
        public string FullName { get; set; } = string.Empty;
        
        [EmailAddress]
        public string? Email { get; set; }
        
        public string? Phone { get; set; }
        
        public string? Address { get; set; }
        
        [Required]
        public string ProcessType { get; set; } = string.Empty;
        
        public string? CaseNumber { get; set; }
        
        public string ProcessStatus { get; set; } = "Pendiente";
        
        [Required]
        public Guid LawFirmId { get; set; }
    }

    public class ClientUpdateDto
    {
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? Address { get; set; }
        public string? ProcessType { get; set; }
        public string? CaseNumber { get; set; }
        public string? ProcessStatus { get; set; }
    }

    public class ClientResponseDto
    {
        public Guid Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? Address { get; set; }
        public string ProcessType { get; set; } = string.Empty;
        public string? CaseNumber { get; set; }
        public string ProcessStatus { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public string LawFirmName { get; set; } = string.Empty;
    }
}
