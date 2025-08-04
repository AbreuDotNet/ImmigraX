namespace LegalApp.API.DTOs
{
    public class GlobalSearchResultDto
    {
        public string Query { get; set; } = string.Empty;
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalResults { get; set; }
        public List<ClientSearchResultDto> Clients { get; set; } = new();
        public List<DocumentSearchResultDto> Documents { get; set; } = new();
        public List<AppointmentSearchResultDto> Appointments { get; set; } = new();
        public List<NoteSearchResultDto> Notes { get; set; } = new();
    }

    public class ClientSearchResultDto
    {
        public Guid Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
        public string? CaseNumber { get; set; }
        public string? ProcessType { get; set; }
        public string? ProcessStatus { get; set; }
        public DateTime CreatedAt { get; set; }
        public string MatchType { get; set; } = string.Empty;
    }

    public class DocumentSearchResultDto
    {
        public Guid Id { get; set; }
        public string DocumentType { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string ClientName { get; set; } = string.Empty;
        public Guid ClientId { get; set; }
        public DateTime UploadedAt { get; set; }
        public string MatchType { get; set; } = string.Empty;
    }

    public class AppointmentSearchResultDto
    {
        public Guid Id { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? AppointmentType { get; set; }
        public DateTime AppointmentDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public string ClientName { get; set; } = string.Empty;
        public Guid ClientId { get; set; }
        public string MatchType { get; set; } = string.Empty;
    }

    public class NoteSearchResultDto
    {
        public Guid Id { get; set; }
        public string? Title { get; set; }
        public string Content { get; set; } = string.Empty;
        public string? Category { get; set; }
        public string ClientName { get; set; } = string.Empty;
        public Guid ClientId { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsImportant { get; set; }
        public string MatchType { get; set; } = string.Empty;
    }

    public class SearchRequestDto
    {
        public string Query { get; set; } = string.Empty;
        public Guid? LawFirmId { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
        public string SearchType { get; set; } = "all"; // all, clients, documents, appointments, notes
    }
}
