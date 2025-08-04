using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LegalApp.API.Models.Forms
{
    // ====================================
    // MODELOS PARA SISTEMA DE FORMULARIOS DINÁMICOS
    // ====================================

    public class FormTemplate
    {
        public Guid Id { get; set; }
        
        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;
        
        public string? Description { get; set; }
        
        [Required]
        [MaxLength(50)]
        public string FormType { get; set; } = string.Empty; // DS-160, I-485, N-400, CUSTOM
        
        [Required]
        [MaxLength(100)]
        public string ProcessType { get; set; } = string.Empty; // Tourist Visa, Green Card, etc.
        
        public int Version { get; set; } = 1;
        public bool IsActive { get; set; } = true;
        
        [Required]
        public Guid LawFirmId { get; set; }
        
        [Required]
        public Guid CreatedBy { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public LawFirm LawFirm { get; set; } = null!;
        public User Creator { get; set; } = null!;
        public ICollection<FormSection> Sections { get; set; } = new List<FormSection>();
        public ICollection<FormRequiredDocument> RequiredDocuments { get; set; } = new List<FormRequiredDocument>();
        public ICollection<ClientForm> ClientForms { get; set; } = new List<ClientForm>();
    }

    public class FormSection
    {
        public Guid Id { get; set; }
        
        [Required]
        public Guid FormTemplateId { get; set; }
        
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;
        
        public string? Description { get; set; }
        
        public int SectionOrder { get; set; }
        public bool IsRequired { get; set; } = true;
        
        public Guid? DependsOnSectionId { get; set; }
        
        [Column(TypeName = "jsonb")]
        public string? ConditionalLogic { get; set; } // JSON para lógica condicional
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public FormTemplate FormTemplate { get; set; } = null!;
        public FormSection? DependsOnSection { get; set; }
        public ICollection<FormField> Fields { get; set; } = new List<FormField>();
    }

    public class FormField
    {
        public Guid Id { get; set; }
        
        [Required]
        public Guid SectionId { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string FieldName { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(200)]
        public string FieldLabel { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(50)]
        public string FieldType { get; set; } = string.Empty; // text, email, date, select, checkbox, file, etc.
        
        public int FieldOrder { get; set; }
        public bool IsRequired { get; set; } = false;
        
        [Column(TypeName = "jsonb")]
        public string? ValidationRules { get; set; } // JSON para reglas de validación
        
        [Column(TypeName = "jsonb")]
        public string? Options { get; set; } // JSON para opciones de select, checkbox, etc.
        
        [MaxLength(200)]
        public string? Placeholder { get; set; }
        
        public string? HelpText { get; set; }
        
        [Column(TypeName = "jsonb")]
        public string? ConditionalLogic { get; set; } // JSON para mostrar/ocultar basado en otros campos
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public FormSection Section { get; set; } = null!;
        public ICollection<FormResponse> Responses { get; set; } = new List<FormResponse>();
    }

    public class ClientForm
    {
        public Guid Id { get; set; }
        
        [Required]
        public Guid ClientId { get; set; }
        
        [Required]
        public Guid FormTemplateId { get; set; }
        
        [Required]
        [MaxLength(200)]
        public string FormTitle { get; set; } = string.Empty;
        
        [MaxLength(50)]
        public string Status { get; set; } = ClientFormStatus.Pending;
        
        [Required]
        [MaxLength(255)]
        public string AccessToken { get; set; } = string.Empty; // Token único para acceso sin login
        
        public DateTime? ExpiresAt { get; set; }
        public DateTime? SubmittedAt { get; set; }
        public DateTime? ReviewedAt { get; set; }
        
        public Guid? ReviewedBy { get; set; }
        
        [Column(TypeName = "decimal(5,2)")]
        public decimal CompletionPercentage { get; set; } = 0.00m;
        
        public string? Instructions { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public Client Client { get; set; } = null!;
        public FormTemplate FormTemplate { get; set; } = null!;
        public User? Reviewer { get; set; }
        public ICollection<FormResponse> Responses { get; set; } = new List<FormResponse>();
        public ICollection<ClientFormDocument> Documents { get; set; } = new List<ClientFormDocument>();
        public ICollection<FormNotification> Notifications { get; set; } = new List<FormNotification>();
        public ICollection<FormAuditLog> AuditLogs { get; set; } = new List<FormAuditLog>();
    }

    public class FormResponse
    {
        public Guid Id { get; set; }
        
        [Required]
        public Guid ClientFormId { get; set; }
        
        [Required]
        public Guid FieldId { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string FieldName { get; set; } = string.Empty;
        
        public string? ResponseValue { get; set; }
        
        [Column(TypeName = "jsonb")]
        public string? ResponseData { get; set; } // JSON para datos complejos
        
        public bool IsVerified { get; set; } = false;
        
        public Guid? VerifiedBy { get; set; }
        public DateTime? VerifiedAt { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public ClientForm ClientForm { get; set; } = null!;
        public FormField Field { get; set; } = null!;
        public User? Verifier { get; set; }
    }

    public class FormRequiredDocument
    {
        public Guid Id { get; set; }
        
        [Required]
        public Guid FormTemplateId { get; set; }
        
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
        
        public int MaxFileSize { get; set; } = 10485760; // 10MB
        public int DocumentOrder { get; set; }
        
        [Column(TypeName = "jsonb")]
        public string? ConditionalLogic { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public FormTemplate FormTemplate { get; set; } = null!;
        public ICollection<ClientFormDocument> ClientDocuments { get; set; } = new List<ClientFormDocument>();
    }

    public class ClientFormDocument
    {
        public Guid Id { get; set; }
        
        [Required]
        public Guid ClientFormId { get; set; }
        
        public Guid? RequiredDocumentId { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string DocumentType { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(255)]
        public string OriginalFilename { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(255)]
        public string StoredFilename { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(500)]
        public string FilePath { get; set; } = string.Empty;
        
        public int FileSize { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string MimeType { get; set; } = string.Empty;
        
        public bool IsVerified { get; set; } = false;
        
        public Guid? VerifiedBy { get; set; }
        public DateTime? VerifiedAt { get; set; }
        
        public string? UploadNotes { get; set; }
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public ClientForm ClientForm { get; set; } = null!;
        public FormRequiredDocument? RequiredDocument { get; set; }
        public User? Verifier { get; set; }
    }

    public class FormNotification
    {
        public Guid Id { get; set; }
        
        [Required]
        public Guid ClientFormId { get; set; }
        
        [Required]
        [MaxLength(50)]
        public string NotificationType { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(255)]
        public string RecipientEmail { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(255)]
        public string Subject { get; set; } = string.Empty;
        
        [Required]
        public string Message { get; set; } = string.Empty;
        
        public DateTime? SentAt { get; set; }
        public DateTime? OpenedAt { get; set; }
        public DateTime? ClickedAt { get; set; }
        
        [MaxLength(50)]
        public string Status { get; set; } = NotificationStatus.Pending;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public ClientForm ClientForm { get; set; } = null!;
    }

    public class FormAuditLog
    {
        public Guid Id { get; set; }
        
        [Required]
        public Guid ClientFormId { get; set; }
        
        public Guid? UserId { get; set; } // NULL si fue el cliente
        
        [Required]
        [MaxLength(100)]
        public string Action { get; set; } = string.Empty;
        
        [MaxLength(100)]
        public string? FieldName { get; set; }
        
        public string? OldValue { get; set; }
        public string? NewValue { get; set; }
        
        public string? IpAddress { get; set; }
        public string? UserAgent { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public ClientForm ClientForm { get; set; } = null!;
        public User? User { get; set; }
    }

    // ====================================
    // ENUMS Y CONSTANTES
    // ====================================

    public static class ClientFormStatus
    {
        public const string Pending = "PENDING";
        public const string InProgress = "IN_PROGRESS";
        public const string Completed = "COMPLETED";
        public const string Reviewed = "REVIEWED";
        public const string Approved = "APPROVED";
        public const string Rejected = "REJECTED";
    }

    public static class FormFieldType
    {
        public const string Text = "text";
        public const string Email = "email";
        public const string Phone = "phone";
        public const string Date = "date";
        public const string Select = "select";
        public const string Checkbox = "checkbox";
        public const string Radio = "radio";
        public const string File = "file";
        public const string TextArea = "textarea";
        public const string Number = "number";
        public const string Address = "address";
        public const string Country = "country";
        public const string Currency = "currency";
    }

    public static class NotificationStatus
    {
        public const string Pending = "PENDING";
        public const string Sent = "SENT";
        public const string Delivered = "DELIVERED";
        public const string Opened = "OPENED";
        public const string Failed = "FAILED";
    }

    public static class NotificationType
    {
        public const string Reminder = "REMINDER";
        public const string Completion = "COMPLETION";
        public const string ReviewRequest = "REVIEW_REQUEST";
        public const string Approved = "APPROVED";
        public const string Rejected = "REJECTED";
        public const string DocumentRequest = "DOCUMENT_REQUEST";
    }

    public static class FormAuditAction
    {
        public const string Created = "CREATED";
        public const string FieldUpdated = "FIELD_UPDATED";
        public const string DocumentUploaded = "DOCUMENT_UPLOADED";
        public const string DocumentDeleted = "DOCUMENT_DELETED";
        public const string Submitted = "SUBMITTED";
        public const string Reviewed = "REVIEWED";
        public const string Approved = "APPROVED";
        public const string Rejected = "REJECTED";
        public const string ReminderSent = "REMINDER_SENT";
    }
}
