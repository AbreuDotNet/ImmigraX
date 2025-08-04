using System.ComponentModel.DataAnnotations;

namespace LegalApp.API.DTOs
{
    public class DocumentCreateDto
    {
        [Required]
        public Guid ClientId { get; set; }
        
        [Required]
        public string DocumentType { get; set; } = string.Empty;
        
        [Required]
        public string FileUrl { get; set; } = string.Empty;
        
        public int Version { get; set; } = 1;
        
        public bool IsCurrent { get; set; } = true;
    }

    public class DocumentUpdateDto
    {
        public string? DocumentType { get; set; }
        public string? FileUrl { get; set; }
        public int? Version { get; set; }
        public bool? IsCurrent { get; set; }
    }

    public class DocumentResponseDto
    {
        public Guid Id { get; set; }
        public string DocumentType { get; set; } = string.Empty;
        public string FileUrl { get; set; } = string.Empty;
        public int Version { get; set; }
        public DateTime UploadedAt { get; set; }
        public bool IsCurrent { get; set; }
        public string ClientName { get; set; } = string.Empty;
        public string UploadedByName { get; set; } = string.Empty;
    }

    public class DocumentUploadDto
    {
        [Required]
        public Guid ClientId { get; set; }
        
        [Required]
        public string DocumentType { get; set; } = string.Empty;
        
        [Required]
        public IFormFile File { get; set; } = null!;
        
        public int Version { get; set; } = 1;
        
        public bool IsCurrent { get; set; } = true;
    }
}
