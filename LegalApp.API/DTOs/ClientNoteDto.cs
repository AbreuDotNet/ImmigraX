using System.ComponentModel.DataAnnotations;

namespace LegalApp.API.DTOs
{
    public class ClientNoteCreateDto
    {
        [Required]
        public Guid ClientId { get; set; }
        
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(2000)]
        public string Content { get; set; } = string.Empty;
        
        [MaxLength(50)]
        public string? Category { get; set; }
        
        public bool IsImportant { get; set; } = false;
    }

    public class ClientNoteUpdateDto
    {
        [MaxLength(200)]
        public string? Title { get; set; }
        
        [MaxLength(2000)]
        public string? Content { get; set; }
        
        [MaxLength(50)]
        public string? Category { get; set; }
        
        public bool? IsImportant { get; set; }
    }

    public class ClientNoteResponseDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public bool IsImportant { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public string ClientName { get; set; } = string.Empty;
        public string CreatedByName { get; set; } = string.Empty;
    }
}
