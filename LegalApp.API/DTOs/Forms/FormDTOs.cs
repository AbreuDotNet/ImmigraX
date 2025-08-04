using System.ComponentModel.DataAnnotations;

namespace LegalApp.API.DTOs.Forms
{
    // ====================================
    // DTOs PARA SISTEMA DE FORMULARIOS
    // ====================================

    public class FormTemplateDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string FormType { get; set; } = string.Empty;
        public string ProcessType { get; set; } = string.Empty;
        public int Version { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<FormSectionDto> Sections { get; set; } = new();
        public List<FormRequiredDocumentDto> RequiredDocuments { get; set; } = new();
    }

    public class FormSectionDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int SectionOrder { get; set; }
        public bool IsRequired { get; set; }
        public Guid? DependsOnSectionId { get; set; }
        public object? ConditionalLogic { get; set; }
        public List<FormFieldDto> Fields { get; set; } = new();
    }

    public class FormFieldDto
    {
        public Guid Id { get; set; }
        public string FieldName { get; set; } = string.Empty;
        public string FieldLabel { get; set; } = string.Empty;
        public string FieldType { get; set; } = string.Empty;
        public int FieldOrder { get; set; }
        public bool IsRequired { get; set; }
        public object? ValidationRules { get; set; }
        public object? Options { get; set; }
        public string? Placeholder { get; set; }
        public string? HelpText { get; set; }
        public object? ConditionalLogic { get; set; }
    }

    public class FormRequiredDocumentDto
    {
        public Guid Id { get; set; }
        public string DocumentType { get; set; } = string.Empty;
        public string DocumentName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool IsRequired { get; set; }
        public string AcceptedFormats { get; set; } = string.Empty;
        public int MaxFileSize { get; set; }
        public int DocumentOrder { get; set; }
        public object? ConditionalLogic { get; set; }
    }

    public class ClientFormDto
    {
        public Guid Id { get; set; }
        public Guid ClientId { get; set; }
        public string ClientName { get; set; } = string.Empty;
        public string ClientEmail { get; set; } = string.Empty;
        public Guid FormTemplateId { get; set; }
        public string FormTitle { get; set; } = string.Empty;
        public string FormType { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string AccessToken { get; set; } = string.Empty;
        public DateTime? ExpiresAt { get; set; }
        public DateTime? SubmittedAt { get; set; }
        public DateTime? ReviewedAt { get; set; }
        public string? ReviewedByName { get; set; }
        public decimal CompletionPercentage { get; set; }
        public string? Instructions { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public FormTemplateDto? FormTemplate { get; set; }
        public List<FormResponseDto> Responses { get; set; } = new();
        public List<ClientFormDocumentDto> Documents { get; set; } = new();
    }

    public class FormResponseDto
    {
        public Guid Id { get; set; }
        public Guid FieldId { get; set; }
        public string FieldName { get; set; } = string.Empty;
        public string? ResponseValue { get; set; }
        public object? ResponseData { get; set; }
        public bool IsVerified { get; set; }
        public string? VerifiedByName { get; set; }
        public DateTime? VerifiedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class ClientFormDocumentDto
    {
        public Guid Id { get; set; }
        public Guid? RequiredDocumentId { get; set; }
        public string DocumentType { get; set; } = string.Empty;
        public string OriginalFilename { get; set; } = string.Empty;
        public int FileSize { get; set; }
        public string MimeType { get; set; } = string.Empty;
        public bool IsVerified { get; set; }
        public string? VerifiedByName { get; set; }
        public DateTime? VerifiedAt { get; set; }
        public string? UploadNotes { get; set; }
        public DateTime UploadedAt { get; set; }
    }

    // ====================================
    // DTOs PARA CREACIÓN/ACTUALIZACIÓN
    // ====================================

    public class CreateFormTemplateDto
    {
        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;
        
        public string? Description { get; set; }
        
        [Required]
        [MaxLength(50)]
        public string FormType { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(100)]
        public string ProcessType { get; set; } = string.Empty;
        
        public List<CreateFormSectionDto> Sections { get; set; } = new();
        public List<CreateFormRequiredDocumentDto> RequiredDocuments { get; set; } = new();
    }

    public class CreateFormSectionDto
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;
        
        public string? Description { get; set; }
        public int SectionOrder { get; set; }
        public bool IsRequired { get; set; } = true;
        public Guid? DependsOnSectionId { get; set; }
        public object? ConditionalLogic { get; set; }
        public List<CreateFormFieldDto> Fields { get; set; } = new();
    }

    public class CreateFormFieldDto
    {
        [Required]
        [MaxLength(100)]
        public string FieldName { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(200)]
        public string FieldLabel { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(50)]
        public string FieldType { get; set; } = string.Empty;
        
        public int FieldOrder { get; set; }
        public bool IsRequired { get; set; } = false;
        public object? ValidationRules { get; set; }
        public object? Options { get; set; }
        
        [MaxLength(200)]
        public string? Placeholder { get; set; }
        
        public string? HelpText { get; set; }
        public object? ConditionalLogic { get; set; }
    }

    public class CreateFormRequiredDocumentDto
    {
        [Required]
        [MaxLength(100)]
        public string DocumentType { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(200)]
        public string DocumentName { get; set; } = string.Empty;
        
        public string? Description { get; set; }
        public bool IsRequired { get; set; } = true;
        
        [MaxLength(200)]
        public string AcceptedFormats { get; set; } = "PDF,JPG,PNG";
        
        public int MaxFileSize { get; set; } = 10485760;
        public int DocumentOrder { get; set; }
        public object? ConditionalLogic { get; set; }
    }

    public class SendFormToClientDto
    {
        [Required]
        public Guid ClientId { get; set; }
        
        [Required]
        public Guid FormTemplateId { get; set; }
        
        [Required]
        [MaxLength(200)]
        public string FormTitle { get; set; } = string.Empty;
        
        public DateTime? ExpiresAt { get; set; }
        public string? Instructions { get; set; }
        public bool SendEmail { get; set; } = true;
        
        [MaxLength(255)]
        public string? CustomEmailSubject { get; set; }
        
        public string? CustomEmailMessage { get; set; }
    }

    public class SubmitFormResponseDto
    {
        [Required]
        public Guid FieldId { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string FieldName { get; set; } = string.Empty;
        
        public string? ResponseValue { get; set; }
        public object? ResponseData { get; set; }
    }

    public class SubmitClientFormDto
    {
        [Required]
        public List<SubmitFormResponseDto> Responses { get; set; } = new();
        
        public bool IsPartialSubmission { get; set; } = false;
    }

    public class UploadFormDocumentDto
    {
        [Required]
        public IFormFile File { get; set; } = null!;
        
        public Guid? RequiredDocumentId { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string DocumentType { get; set; } = string.Empty;
        
        public string? UploadNotes { get; set; }
    }

    public class ReviewFormDto
    {
        [Required]
        [MaxLength(50)]
        public string Status { get; set; } = string.Empty; // REVIEWED, APPROVED, REJECTED
        
        public string? ReviewNotes { get; set; }
        public List<VerifyFieldDto> FieldVerifications { get; set; } = new();
        public List<VerifyDocumentDto> DocumentVerifications { get; set; } = new();
    }

    public class VerifyFieldDto
    {
        [Required]
        public Guid ResponseId { get; set; }
        
        public bool IsVerified { get; set; }
        public string? VerificationNotes { get; set; }
    }

    public class VerifyDocumentDto
    {
        [Required]
        public Guid DocumentId { get; set; }
        
        public bool IsVerified { get; set; }
        public string? VerificationNotes { get; set; }
    }

    // ====================================
    // DTOs PARA VISTAS PÚBLICAS (SIN LOGIN)
    // ====================================

    public class PublicClientFormDto
    {
        public Guid Id { get; set; }
        public string FormTitle { get; set; } = string.Empty;
        public string FormType { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime? ExpiresAt { get; set; }
        public decimal CompletionPercentage { get; set; }
        public string? Instructions { get; set; }
        public bool IsExpired => ExpiresAt.HasValue && ExpiresAt.Value < DateTime.UtcNow;
        public FormTemplateDto? FormTemplate { get; set; }
        public List<FormResponseDto> ExistingResponses { get; set; } = new();
        public List<ClientFormDocumentDto> UploadedDocuments { get; set; } = new();
    }

    public class FormValidationResult
    {
        public bool IsValid { get; set; }
        public List<string> Errors { get; set; } = new();
        public List<string> Warnings { get; set; } = new();
        public decimal CompletionPercentage { get; set; }
        public List<string> MissingRequiredFields { get; set; } = new();
        public List<string> MissingRequiredDocuments { get; set; } = new();
    }

    public class FormStatisticsDto
    {
        public int TotalForms { get; set; }
        public int PendingForms { get; set; }
        public int InProgressForms { get; set; }
        public int CompletedForms { get; set; }
        public int ReviewedForms { get; set; }
        public int ApprovedForms { get; set; }
        public decimal AverageCompletionTime { get; set; } // En días
        public decimal AverageCompletionPercentage { get; set; }
        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
    }
}
