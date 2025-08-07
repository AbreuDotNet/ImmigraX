using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using LegalApp.API.Data;
using LegalApp.API.Models.Forms;
using LegalApp.API.DTOs.Forms;
using LegalApp.API.Services;
using System.Security.Claims;
using System.Text.Json;

namespace LegalApp.API.Controllers.Forms
{
    [ApiController]
    [Route("api/[controller]")]
    public class FormsController : ControllerBase
    {
        private readonly LegalAppDbContext _context;
        private readonly ILogger<FormsController> _logger;
        private readonly IWebHostEnvironment _environment;
        private readonly ActivityLogService _activityLogService;

        public FormsController(LegalAppDbContext context, ILogger<FormsController> logger, IWebHostEnvironment environment, ActivityLogService activityLogService)
        {
            _context = context;
            _logger = logger;
            _environment = environment;
            _activityLogService = activityLogService;
        }

        // ====================================
        // GESTIÓN DE PLANTILLAS DE FORMULARIOS (Admin/Lawyers)
        // ====================================

        [HttpGet("templates")]
        [Authorize]
        public async Task<ActionResult<List<FormTemplateDto>>> GetFormTemplates()
        {
            try
            {
                var lawFirmId = await GetUserLawFirmId();
                if (lawFirmId == null)
                {
                    return BadRequest(new { message = "Usuario no tiene firma legal asociada" });
                }

                var templates = await _context.FormTemplates
                    .Where(ft => ft.LawFirmId == lawFirmId.Value && ft.IsActive)
                    .Include(ft => ft.Sections.OrderBy(s => s.SectionOrder))
                        .ThenInclude(s => s.Fields.OrderBy(f => f.FieldOrder))
                    .Include(ft => ft.RequiredDocuments.OrderBy(rd => rd.DocumentOrder))
                    .OrderBy(ft => ft.FormType)
                    .ThenBy(ft => ft.Name)
                    .ToListAsync();

                var templateDtos = templates.Select(MapToFormTemplateDto).ToList();
                return Ok(templateDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener plantillas de formularios");
                return StatusCode(500, new { message = "Error al obtener plantillas de formularios", error = ex.Message });
            }
        }

        [HttpGet("client-forms")]
        [Authorize]
        public async Task<ActionResult<List<ClientFormDto>>> GetClientForms()
        {
            try
            {
                var lawFirmId = await GetUserLawFirmId();
                if (lawFirmId == null)
                {
                    return BadRequest(new { message = "Usuario no tiene firma legal asociada" });
                }

                var clientForms = await _context.ClientForms
                    .Include(cf => cf.Client)
                    .Include(cf => cf.FormTemplate)
                    .Where(cf => cf.FormTemplate.LawFirmId == lawFirmId.Value)
                    .OrderByDescending(cf => cf.CreatedAt)
                    .ToListAsync();

                var clientFormDtos = clientForms.Select(cf => new ClientFormDto
                {
                    Id = cf.Id,
                    ClientId = cf.ClientId,
                    ClientName = cf.Client.FullName,
                    ClientEmail = cf.Client.Email ?? string.Empty,
                    FormTitle = cf.FormTitle,
                    FormType = cf.FormTemplate.FormType,
                    Status = cf.Status,
                    AccessToken = cf.AccessToken,
                    ExpiresAt = cf.ExpiresAt,
                    SubmittedAt = cf.SubmittedAt,
                    ReviewedAt = cf.ReviewedAt,
                    CompletionPercentage = cf.CompletionPercentage,
                    Instructions = cf.Instructions,
                    CreatedAt = cf.CreatedAt,
                    UpdatedAt = cf.UpdatedAt
                }).ToList();

                return Ok(clientFormDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener formularios de cliente");
                return StatusCode(500, new { message = "Error al obtener formularios de cliente", error = ex.Message });
            }
        }

        [HttpPost("templates")]
        [Authorize]
        public async Task<ActionResult<FormTemplateDto>> CreateFormTemplate(CreateFormTemplateDto dto)
        {
            try
            {
                var lawFirmId = await GetUserLawFirmId();
                var userId = GetCurrentUserId();
                
                if (lawFirmId == null || userId == null)
                {
                    return BadRequest(new { message = "Usuario no tiene permisos válidos" });
                }

                var template = new FormTemplate
                {
                    Name = dto.Name,
                    Description = dto.Description,
                    FormType = dto.FormType,
                    ProcessType = dto.ProcessType,
                    LawFirmId = lawFirmId.Value,
                    CreatedBy = userId.Value
                };

                _context.FormTemplates.Add(template);
                await _context.SaveChangesAsync();

                // Crear secciones
                foreach (var sectionDto in dto.Sections)
                {
                    var section = new FormSection
                    {
                        FormTemplateId = template.Id,
                        Title = sectionDto.Title,
                        Description = sectionDto.Description,
                        SectionOrder = sectionDto.SectionOrder,
                        IsRequired = sectionDto.IsRequired,
                        DependsOnSectionId = sectionDto.DependsOnSectionId,
                        ConditionalLogic = sectionDto.ConditionalLogic != null ? JsonSerializer.Serialize(sectionDto.ConditionalLogic) : null
                    };

                    _context.FormSections.Add(section);
                    await _context.SaveChangesAsync();

                    // Crear campos
                    foreach (var fieldDto in sectionDto.Fields)
                    {
                        var field = new FormField
                        {
                            SectionId = section.Id,
                            FieldName = fieldDto.FieldName,
                            FieldLabel = fieldDto.FieldLabel,
                            FieldType = fieldDto.FieldType,
                            FieldOrder = fieldDto.FieldOrder,
                            IsRequired = fieldDto.IsRequired,
                            ValidationRules = fieldDto.ValidationRules != null ? JsonSerializer.Serialize(fieldDto.ValidationRules) : null,
                            Options = fieldDto.Options != null ? JsonSerializer.Serialize(fieldDto.Options) : null,
                            Placeholder = fieldDto.Placeholder,
                            HelpText = fieldDto.HelpText,
                            ConditionalLogic = fieldDto.ConditionalLogic != null ? JsonSerializer.Serialize(fieldDto.ConditionalLogic) : null
                        };

                        _context.FormFields.Add(field);
                    }
                }

                // Crear documentos requeridos
                foreach (var docDto in dto.RequiredDocuments)
                {
                    var document = new FormRequiredDocument
                    {
                        FormTemplateId = template.Id,
                        DocumentType = docDto.DocumentType,
                        DocumentName = docDto.DocumentName,
                        Description = docDto.Description,
                        IsRequired = docDto.IsRequired,
                        AcceptedFormats = docDto.AcceptedFormats,
                        MaxFileSize = docDto.MaxFileSize,
                        DocumentOrder = docDto.DocumentOrder,
                        ConditionalLogic = docDto.ConditionalLogic != null ? JsonSerializer.Serialize(docDto.ConditionalLogic) : null
                    };

                    _context.FormRequiredDocuments.Add(document);
                }

                await _context.SaveChangesAsync();

                // Cargar el template completo para devolverlo
                var createdTemplate = await _context.FormTemplates
                    .Include(ft => ft.Sections.OrderBy(s => s.SectionOrder))
                        .ThenInclude(s => s.Fields.OrderBy(f => f.FieldOrder))
                    .Include(ft => ft.RequiredDocuments.OrderBy(rd => rd.DocumentOrder))
                    .FirstOrDefaultAsync(ft => ft.Id == template.Id);

                return Ok(MapToFormTemplateDto(createdTemplate!));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear plantilla de formulario");
                return StatusCode(500, new { message = "Error al crear plantilla de formulario", error = ex.Message });
            }
        }

        // ====================================
        // ENVÍO DE FORMULARIOS A CLIENTES
        // ====================================

        [HttpPost("send-to-client")]
        [Authorize]
        public async Task<ActionResult<ClientFormDto>> SendFormToClient(SendFormToClientDto dto)
        {
            try
            {
                var lawFirmId = await GetUserLawFirmId();
                if (lawFirmId == null)
                {
                    return BadRequest(new { message = "Usuario no tiene firma legal asociada" });
                }

                // Verificar que el cliente pertenece a la firma legal
                var client = await _context.Clients
                    .FirstOrDefaultAsync(c => c.Id == dto.ClientId && c.LawFirmId == lawFirmId.Value);

                if (client == null)
                {
                    return NotFound(new { message = "Cliente no encontrado" });
                }

                // Verificar que la plantilla existe
                var template = await _context.FormTemplates
                    .FirstOrDefaultAsync(ft => ft.Id == dto.FormTemplateId && ft.LawFirmId == lawFirmId.Value);

                if (template == null)
                {
                    return NotFound(new { message = "Plantilla de formulario no encontrada" });
                }

                // Generar token único para acceso sin login
                var accessToken = Guid.NewGuid().ToString("N");

                var clientForm = new ClientForm
                {
                    ClientId = dto.ClientId,
                    FormTemplateId = dto.FormTemplateId,
                    FormTitle = dto.FormTitle,
                    AccessToken = accessToken,
                    ExpiresAt = dto.ExpiresAt,
                    Instructions = dto.Instructions,
                    Status = ClientFormStatus.Pending
                };

                _context.ClientForms.Add(clientForm);
                await _context.SaveChangesAsync();

                // Registrar en el log de auditoría
                await LogFormAction(clientForm.Id, null, FormAuditAction.Created, null, null, null);

                // Log activity
                var currentUserIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (Guid.TryParse(currentUserIdString, out var currentUserId))
                {
                    await _activityLogService.LogFormSentAsync(
                        currentUserId,
                        lawFirmId.Value,
                        dto.ClientId,
                        client.FullName,
                        dto.FormTitle
                    );
                }

                // Enviar email al cliente si se solicita
                if (dto.SendEmail)
                {
                    await SendFormNotification(clientForm.Id, NotificationType.Completion, 
                        dto.CustomEmailSubject, dto.CustomEmailMessage);
                }

                // Cargar el formulario completo para devolverlo
                var createdForm = await _context.ClientForms
                    .Include(cf => cf.Client)
                    .Include(cf => cf.FormTemplate)
                    .FirstOrDefaultAsync(cf => cf.Id == clientForm.Id);

                return Ok(MapToClientFormDto(createdForm!));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al enviar formulario al cliente");
                return StatusCode(500, new { message = "Error al enviar formulario al cliente", error = ex.Message });
            }
        }

        [HttpPost("{formId}/send-reminder")]
        [Authorize]
        public async Task<ActionResult> SendFormReminder(Guid formId)
        {
            try
            {
                var lawFirmId = await GetUserLawFirmId();
                if (lawFirmId == null)
                {
                    return BadRequest(new { message = "Usuario no tiene firma legal asociada" });
                }

                var clientForm = await _context.ClientForms
                    .Include(cf => cf.Client)
                    .Include(cf => cf.FormTemplate)
                    .FirstOrDefaultAsync(cf => cf.Id == formId && cf.FormTemplate.LawFirmId == lawFirmId.Value);

                if (clientForm == null)
                {
                    return NotFound(new { message = "Formulario no encontrado" });
                }

                if (clientForm.Status == ClientFormStatus.Completed)
                {
                    return BadRequest(new { message = "El formulario ya está completado" });
                }

                if (clientForm.ExpiresAt.HasValue && clientForm.ExpiresAt.Value < DateTime.UtcNow)
                {
                    return BadRequest(new { message = "El formulario ha expirado" });
                }

                // Enviar notificación de recordatorio
                await SendFormNotification(clientForm.Id, NotificationType.Reminder, 
                    $"Recordatorio: Complete su formulario {clientForm.FormTitle}",
                    $"Le recordamos que tiene un formulario pendiente por completar. Haga clic en el enlace para continuar: " +
                    $"{GetClientFormUrl(clientForm.AccessToken)}");

                await LogFormAction(clientForm.Id, null, FormAuditAction.ReminderSent, null, null, null);

                return Ok(new { message = "Recordatorio enviado exitosamente" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al enviar recordatorio");
                return StatusCode(500, new { message = "Error al enviar recordatorio", error = ex.Message });
            }
        }

        // ====================================
        // ACCESO PÚBLICO PARA CLIENTES (SIN LOGIN)
        // ====================================

        [HttpGet("public/{accessToken}")]
        [AllowAnonymous]
        public async Task<ActionResult<PublicClientFormDto>> GetPublicForm(string accessToken)
        {
            try
            {
                var clientForm = await _context.ClientForms
                    .Include(cf => cf.Client)
                    .Include(cf => cf.FormTemplate)
                        .ThenInclude(ft => ft.Sections.OrderBy(s => s.SectionOrder))
                            .ThenInclude(s => s.Fields.OrderBy(f => f.FieldOrder))
                    .Include(cf => cf.FormTemplate)
                        .ThenInclude(ft => ft.RequiredDocuments.OrderBy(rd => rd.DocumentOrder))
                    .Include(cf => cf.Responses)
                        .ThenInclude(r => r.Field)
                    .Include(cf => cf.Documents)
                    .FirstOrDefaultAsync(cf => cf.AccessToken == accessToken);

                if (clientForm == null)
                {
                    return NotFound(new { message = "Formulario no encontrado" });
                }

                if (clientForm.ExpiresAt.HasValue && clientForm.ExpiresAt.Value < DateTime.UtcNow)
                {
                    return BadRequest(new { message = "El formulario ha expirado" });
                }

                var publicDto = new PublicClientFormDto
                {
                    Id = clientForm.Id,
                    FormTitle = clientForm.FormTitle,
                    FormType = clientForm.FormTemplate.FormType,
                    Status = clientForm.Status,
                    ExpiresAt = clientForm.ExpiresAt,
                    CompletionPercentage = clientForm.CompletionPercentage,
                    Instructions = clientForm.Instructions,
                    FormTemplate = MapToFormTemplateDto(clientForm.FormTemplate),
                    ExistingResponses = clientForm.Responses.Select(MapToFormResponseDto).ToList(),
                    UploadedDocuments = clientForm.Documents.Select(MapToClientFormDocumentDto).ToList()
                };

                return Ok(publicDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener formulario público");
                return StatusCode(500, new { message = "Error al obtener formulario", error = ex.Message });
            }
        }

        [HttpPost("public/{accessToken}/submit")]
        [AllowAnonymous]
        public async Task<ActionResult<FormValidationResult>> SubmitPublicForm(string accessToken, SubmitClientFormDto dto)
        {
            try
            {
                var clientForm = await _context.ClientForms
                    .Include(cf => cf.FormTemplate)
                        .ThenInclude(ft => ft.Sections)
                            .ThenInclude(s => s.Fields)
                    .Include(cf => cf.Responses)
                    .FirstOrDefaultAsync(cf => cf.AccessToken == accessToken);

                if (clientForm == null)
                {
                    return NotFound(new { message = "Formulario no encontrado" });
                }

                if (clientForm.ExpiresAt.HasValue && clientForm.ExpiresAt.Value < DateTime.UtcNow)
                {
                    return BadRequest(new { message = "El formulario ha expirado" });
                }

                if (clientForm.Status == ClientFormStatus.Completed)
                {
                    return BadRequest(new { message = "El formulario ya ha sido completado" });
                }

                // Actualizar o crear respuestas
                foreach (var responseDto in dto.Responses)
                {
                    var existingResponse = clientForm.Responses
                        .FirstOrDefault(r => r.FieldId == responseDto.FieldId);

                    if (existingResponse != null)
                    {
                        var oldValue = existingResponse.ResponseValue;
                        existingResponse.ResponseValue = responseDto.ResponseValue;
                        existingResponse.ResponseData = responseDto.ResponseData != null ? 
                            JsonSerializer.Serialize(responseDto.ResponseData) : null;
                        existingResponse.UpdatedAt = DateTime.UtcNow;

                        // Log del cambio
                        await LogFormAction(clientForm.Id, null, FormAuditAction.FieldUpdated, 
                            responseDto.FieldName, oldValue, responseDto.ResponseValue);
                    }
                    else
                    {
                        var newResponse = new FormResponse
                        {
                            ClientFormId = clientForm.Id,
                            FieldId = responseDto.FieldId,
                            FieldName = responseDto.FieldName,
                            ResponseValue = responseDto.ResponseValue,
                            ResponseData = responseDto.ResponseData != null ? 
                                JsonSerializer.Serialize(responseDto.ResponseData) : null
                        };

                        _context.FormResponses.Add(newResponse);

                        // Log del nuevo campo
                        await LogFormAction(clientForm.Id, null, FormAuditAction.FieldUpdated, 
                            responseDto.FieldName, null, responseDto.ResponseValue);
                    }
                }

                // Calcular porcentaje de completitud
                var completionPercentage = CalculateCompletionPercentage(clientForm);
                clientForm.CompletionPercentage = completionPercentage;
                clientForm.UpdatedAt = DateTime.UtcNow;

                // Si no es envío parcial y está completo, marcar como completado
                if (!dto.IsPartialSubmission && completionPercentage >= 100)
                {
                    clientForm.Status = ClientFormStatus.Completed;
                    clientForm.SubmittedAt = DateTime.UtcNow;

                    // Log de finalización
                    await LogFormAction(clientForm.Id, null, FormAuditAction.Submitted, null, null, null);

                    // Enviar notificación a la firma legal
                    await SendFormNotification(clientForm.Id, NotificationType.Completion, null, null);
                }
                else
                {
                    clientForm.Status = ClientFormStatus.InProgress;
                }

                await _context.SaveChangesAsync();

                // Validar formulario
                var validationResult = await ValidateForm(clientForm.Id);
                return Ok(validationResult);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al enviar respuestas del formulario");
                return StatusCode(500, new { message = "Error al enviar respuestas", error = ex.Message });
            }
        }

        // ====================================
        // MÉTODOS AUXILIARES
        // ====================================

        private async Task<Guid?> GetUserLawFirmId()
        {
            var currentUserIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!Guid.TryParse(currentUserIdString, out var currentUserId))
            {
                return null;
            }

            var userLawFirm = await _context.UserLawFirms
                .FirstOrDefaultAsync(ulf => ulf.UserId == currentUserId);

            return userLawFirm?.LawFirmId;
        }

        private Guid? GetCurrentUserId()
        {
            var currentUserIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.TryParse(currentUserIdString, out var currentUserId) ? currentUserId : null;
        }

        private FormTemplateDto MapToFormTemplateDto(FormTemplate template)
        {
            return new FormTemplateDto
            {
                Id = template.Id,
                Name = template.Name,
                Description = template.Description,
                FormType = template.FormType,
                ProcessType = template.ProcessType,
                Version = template.Version,
                IsActive = template.IsActive,
                CreatedAt = template.CreatedAt,
                Sections = template.Sections.Select(MapToFormSectionDto).ToList(),
                RequiredDocuments = template.RequiredDocuments.Select(MapToFormRequiredDocumentDto).ToList()
            };
        }

        private FormSectionDto MapToFormSectionDto(FormSection section)
        {
            return new FormSectionDto
            {
                Id = section.Id,
                Title = section.Title,
                Description = section.Description,
                SectionOrder = section.SectionOrder,
                IsRequired = section.IsRequired,
                DependsOnSectionId = section.DependsOnSectionId,
                ConditionalLogic = section.ConditionalLogic != null ? 
                    JsonSerializer.Deserialize<object>(section.ConditionalLogic) : null,
                Fields = section.Fields.Select(MapToFormFieldDto).ToList()
            };
        }

        private FormFieldDto MapToFormFieldDto(FormField field)
        {
            return new FormFieldDto
            {
                Id = field.Id,
                FieldName = field.FieldName,
                FieldLabel = field.FieldLabel,
                FieldType = field.FieldType,
                FieldOrder = field.FieldOrder,
                IsRequired = field.IsRequired,
                ValidationRules = field.ValidationRules != null ? 
                    JsonSerializer.Deserialize<object>(field.ValidationRules) : null,
                Options = field.Options != null ? 
                    JsonSerializer.Deserialize<object>(field.Options) : null,
                Placeholder = field.Placeholder,
                HelpText = field.HelpText,
                ConditionalLogic = field.ConditionalLogic != null ? 
                    JsonSerializer.Deserialize<object>(field.ConditionalLogic) : null
            };
        }

        private FormRequiredDocumentDto MapToFormRequiredDocumentDto(FormRequiredDocument doc)
        {
            return new FormRequiredDocumentDto
            {
                Id = doc.Id,
                DocumentType = doc.DocumentType,
                DocumentName = doc.DocumentName,
                Description = doc.Description,
                IsRequired = doc.IsRequired,
                AcceptedFormats = doc.AcceptedFormats,
                MaxFileSize = doc.MaxFileSize,
                DocumentOrder = doc.DocumentOrder,
                ConditionalLogic = doc.ConditionalLogic != null ? 
                    JsonSerializer.Deserialize<object>(doc.ConditionalLogic) : null
            };
        }

        private ClientFormDto MapToClientFormDto(ClientForm clientForm)
        {
            return new ClientFormDto
            {
                Id = clientForm.Id,
                ClientId = clientForm.ClientId,
                ClientName = clientForm.Client.FullName,
                ClientEmail = clientForm.Client.Email,
                FormTemplateId = clientForm.FormTemplateId,
                FormTitle = clientForm.FormTitle,
                FormType = clientForm.FormTemplate.FormType,
                Status = clientForm.Status,
                AccessToken = clientForm.AccessToken,
                ExpiresAt = clientForm.ExpiresAt,
                SubmittedAt = clientForm.SubmittedAt,
                ReviewedAt = clientForm.ReviewedAt,
                CompletionPercentage = clientForm.CompletionPercentage,
                Instructions = clientForm.Instructions,
                CreatedAt = clientForm.CreatedAt,
                UpdatedAt = clientForm.UpdatedAt
            };
        }

        private FormResponseDto MapToFormResponseDto(FormResponse response)
        {
            return new FormResponseDto
            {
                Id = response.Id,
                FieldId = response.FieldId,
                FieldName = response.FieldName,
                ResponseValue = response.ResponseValue,
                ResponseData = response.ResponseData != null ? 
                    JsonSerializer.Deserialize<object>(response.ResponseData) : null,
                IsVerified = response.IsVerified,
                VerifiedAt = response.VerifiedAt,
                UpdatedAt = response.UpdatedAt
            };
        }

        private ClientFormDocumentDto MapToClientFormDocumentDto(ClientFormDocument doc)
        {
            return new ClientFormDocumentDto
            {
                Id = doc.Id,
                RequiredDocumentId = doc.RequiredDocumentId,
                DocumentType = doc.DocumentType,
                OriginalFilename = doc.OriginalFilename,
                FileSize = doc.FileSize,
                MimeType = doc.MimeType,
                IsVerified = doc.IsVerified,
                VerifiedAt = doc.VerifiedAt,
                UploadNotes = doc.UploadNotes,
                UploadedAt = doc.UploadedAt
            };
        }

        private decimal CalculateCompletionPercentage(ClientForm clientForm)
        {
            var totalFields = clientForm.FormTemplate.Sections
                .SelectMany(s => s.Fields)
                .Count(f => f.IsRequired);

            if (totalFields == 0) return 100;

            var completedFields = clientForm.Responses
                .Count(r => !string.IsNullOrEmpty(r.ResponseValue));

            return Math.Round((decimal)completedFields / totalFields * 100, 2);
        }

        private async Task<FormValidationResult> ValidateForm(Guid clientFormId)
        {
            var clientForm = await _context.ClientForms
                .Include(cf => cf.FormTemplate)
                    .ThenInclude(ft => ft.Sections)
                        .ThenInclude(s => s.Fields)
                .Include(cf => cf.FormTemplate)
                    .ThenInclude(ft => ft.RequiredDocuments)
                .Include(cf => cf.Responses)
                .Include(cf => cf.Documents)
                .FirstOrDefaultAsync(cf => cf.Id == clientFormId);

            var result = new FormValidationResult();

            if (clientForm == null)
            {
                result.Errors.Add("Formulario no encontrado");
                return result;
            }

            // Validar campos requeridos
            var requiredFields = clientForm.FormTemplate.Sections
                .SelectMany(s => s.Fields)
                .Where(f => f.IsRequired)
                .ToList();

            foreach (var field in requiredFields)
            {
                var response = clientForm.Responses.FirstOrDefault(r => r.FieldId == field.Id);
                if (response == null || string.IsNullOrEmpty(response.ResponseValue))
                {
                    result.MissingRequiredFields.Add(field.FieldLabel);
                }
            }

            // Validar documentos requeridos
            var requiredDocuments = clientForm.FormTemplate.RequiredDocuments
                .Where(rd => rd.IsRequired)
                .ToList();

            foreach (var doc in requiredDocuments)
            {
                var uploaded = clientForm.Documents.Any(d => d.RequiredDocumentId == doc.Id);
                if (!uploaded)
                {
                    result.MissingRequiredDocuments.Add(doc.DocumentName);
                }
            }

            result.IsValid = !result.MissingRequiredFields.Any() && !result.MissingRequiredDocuments.Any();
            result.CompletionPercentage = clientForm.CompletionPercentage;

            return result;
        }

        private async Task LogFormAction(Guid clientFormId, Guid? userId, string action, 
            string? fieldName, string? oldValue, string? newValue)
        {
            var auditLog = new FormAuditLog
            {
                ClientFormId = clientFormId,
                UserId = userId,
                Action = action,
                FieldName = fieldName,
                OldValue = oldValue,
                NewValue = newValue,
                IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString(),
                UserAgent = Request.Headers["User-Agent"].ToString()
            };

            _context.FormAuditLogs.Add(auditLog);
            await _context.SaveChangesAsync();
        }

        private async Task SendFormNotification(Guid clientFormId, string notificationType, 
            string? customSubject, string? customMessage)
        {
            // TODO: Implementar envío de emails
            // Por ahora solo guardamos la notificación en la base de datos
            
            var clientForm = await _context.ClientForms
                .Include(cf => cf.Client)
                .FirstOrDefaultAsync(cf => cf.Id == clientFormId);

            if (clientForm == null) return;

            var notification = new FormNotification
            {
                ClientFormId = clientFormId,
                NotificationType = notificationType,
                RecipientEmail = clientForm.Client.Email,
                Subject = customSubject ?? GetDefaultSubject(notificationType, clientForm.FormTitle),
                Message = customMessage ?? GetDefaultMessage(notificationType, clientForm.FormTitle, clientForm.AccessToken)
            };

            _context.FormNotifications.Add(notification);
            await _context.SaveChangesAsync();
        }

        private string GetDefaultSubject(string notificationType, string formTitle)
        {
            return notificationType switch
            {
                NotificationType.Completion => $"Nuevo formulario disponible: {formTitle}",
                NotificationType.Reminder => $"Recordatorio: Completar {formTitle}",
                NotificationType.ReviewRequest => $"Formulario enviado para revisión: {formTitle}",
                NotificationType.Approved => $"Formulario aprobado: {formTitle}",
                _ => $"Notificación sobre {formTitle}"
            };
        }

        private string GetDefaultMessage(string notificationType, string formTitle, string accessToken)
        {
            var baseUrl = $"{Request.Scheme}://{Request.Host}";
            var formUrl = $"{baseUrl}/forms/public/{accessToken}";

            return notificationType switch
            {
                NotificationType.Completion => $"Tiene un nuevo formulario disponible para completar: {formTitle}. Acceda al siguiente enlace: {formUrl}",
                NotificationType.Reminder => $"Recordatorio: Por favor complete el formulario {formTitle}. Enlace: {formUrl}",
                NotificationType.ReviewRequest => $"Su formulario {formTitle} ha sido enviado y está siendo revisado por nuestro equipo.",
                NotificationType.Approved => $"Su formulario {formTitle} ha sido aprobado. Nos pondremos en contacto con usted pronto.",
                _ => $"Tiene una notificación sobre el formulario {formTitle}."
            };
        }

        private string GetClientFormUrl(string accessToken)
        {
            // En producción, usar la URL base del cliente configurada
            var baseUrl = _environment.IsDevelopment() 
                ? "http://localhost:3000" 
                : "https://immigrax.app"; // URL de producción
            
            return $"{baseUrl}/forms/fill/{accessToken}";
        }
    }
}
