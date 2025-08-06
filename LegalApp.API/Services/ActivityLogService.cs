using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using LegalApp.API.Data;
using LegalApp.API.Models;

namespace LegalApp.API.Services
{
    public class ActivityLogService
    {
        private readonly LegalAppDbContext _context;

        public ActivityLogService(LegalAppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Registra una nueva actividad en el log
        /// </summary>
        public async Task LogActivityAsync(
            Guid userId,
            Guid lawFirmId,
            ActivityType activityType,
            string description,
            Guid? clientId = null,
            object? metadata = null)
        {
            var activityLog = new ActivityLog
            {
                UserId = userId,
                LawFirmId = lawFirmId,
                ClientId = clientId,
                ActivityType = activityType,
                Description = description,
                Metadata = metadata != null ? JsonSerializer.Serialize(metadata) : null,
                CreatedAt = DateTime.UtcNow
            };

            _context.ActivityLogs.Add(activityLog);
            await _context.SaveChangesAsync();
        }

        /// <summary>
        /// Obtiene las actividades recientes para el dashboard
        /// </summary>
        public async Task<IEnumerable<ActivityLog>> GetRecentActivitiesAsync(
            Guid lawFirmId,
            int limit = 10,
            Guid? clientId = null)
        {
            var query = _context.ActivityLogs
                .Include(a => a.User)
                .Include(a => a.Client)
                .Where(a => a.LawFirmId == lawFirmId);

            if (clientId.HasValue)
            {
                query = query.Where(a => a.ClientId == clientId.Value);
            }

            return await query
                .OrderByDescending(a => a.CreatedAt)
                .Take(limit)
                .ToListAsync();
        }

        /// <summary>
        /// Obtiene estadísticas de actividades para el dashboard
        /// </summary>
        public async Task<object> GetActivityStatsAsync(Guid lawFirmId)
        {
            var today = DateTime.UtcNow.Date;
            var thisWeek = today.AddDays(-7);

            var todayCount = await _context.ActivityLogs
                .Where(a => a.LawFirmId == lawFirmId && a.CreatedAt.Date == today)
                .CountAsync();

            var weekCount = await _context.ActivityLogs
                .Where(a => a.LawFirmId == lawFirmId && a.CreatedAt >= thisWeek)
                .CountAsync();

            var topClient = await _context.ActivityLogs
                .Where(a => a.LawFirmId == lawFirmId && a.ClientId != null)
                .GroupBy(a => new { a.ClientId, a.Client!.FullName })
                .OrderByDescending(g => g.Count())
                .Select(g => g.Key.FullName)
                .FirstOrDefaultAsync();

            var activityBreakdown = await _context.ActivityLogs
                .Where(a => a.LawFirmId == lawFirmId && a.CreatedAt >= thisWeek)
                .GroupBy(a => a.ActivityType)
                .Select(g => new { Type = g.Key, Count = g.Count() })
                .OrderByDescending(x => x.Count)
                .ToListAsync();

            return new
            {
                TotalToday = todayCount,
                TotalThisWeek = weekCount,
                MostActiveClient = topClient ?? "Sin actividad",
                ActivityBreakdown = activityBreakdown
            };
        }

        // Métodos de conveniencia para actividades comunes

        public async Task LogClientCreatedAsync(Guid userId, Guid lawFirmId, Guid clientId, string clientName)
        {
            await LogActivityAsync(userId, lawFirmId, ActivityType.ClientCreated,
                $"Creó nuevo cliente: {clientName}", clientId);
        }

        public async Task LogAppointmentScheduledAsync(Guid userId, Guid lawFirmId, Guid clientId, string clientName, DateTime appointmentDate)
        {
            await LogActivityAsync(userId, lawFirmId, ActivityType.AppointmentScheduled,
                $"Programó cita con {clientName}", clientId,
                new { AppointmentDate = appointmentDate });
        }

        public async Task LogAppointmentConfirmedAsync(Guid userId, Guid lawFirmId, Guid clientId, string clientName)
        {
            await LogActivityAsync(userId, lawFirmId, ActivityType.AppointmentConfirmed,
                $"Confirmó cita con {clientName}", clientId);
        }

        public async Task LogEmailSentAsync(Guid userId, Guid lawFirmId, Guid clientId, string clientName, string subject)
        {
            await LogActivityAsync(userId, lawFirmId, ActivityType.EmailSent,
                $"Envió email a {clientName}", clientId,
                new { Subject = subject });
        }

        public async Task LogPaymentReceivedAsync(Guid userId, Guid lawFirmId, Guid clientId, string clientName, decimal amount)
        {
            await LogActivityAsync(userId, lawFirmId, ActivityType.PaymentReceived,
                $"Registró pago de {clientName}: ${amount:N2}", clientId,
                new { Amount = amount });
        }

        public async Task LogDocumentReviewedAsync(Guid userId, Guid lawFirmId, Guid clientId, string clientName, string documentType)
        {
            await LogActivityAsync(userId, lawFirmId, ActivityType.DocumentReviewed,
                $"Revisó documento de {clientName}: {documentType}", clientId,
                new { DocumentType = documentType });
        }

        public async Task LogPhoneCallMadeAsync(Guid userId, Guid lawFirmId, Guid clientId, string clientName, string duration, string notes = "")
        {
            await LogActivityAsync(userId, lawFirmId, ActivityType.PhoneCallMade,
                $"Llamada telefónica a {clientName}", clientId,
                new { Duration = duration, Notes = notes });
        }

        public async Task LogCaseStatusUpdatedAsync(Guid userId, Guid lawFirmId, Guid clientId, string clientName, string newStatus)
        {
            await LogActivityAsync(userId, lawFirmId, ActivityType.CaseStatusUpdated,
                $"Actualizó estado de caso de {clientName} a: {newStatus}", clientId,
                new { NewStatus = newStatus });
        }

        public async Task LogAppointmentUpdatedAsync(Guid userId, Guid lawFirmId, Guid clientId, string clientName, string appointmentTitle, string changes)
        {
            await LogActivityAsync(userId, lawFirmId, ActivityType.AppointmentUpdated,
                $"Actualizó cita '{appointmentTitle}' para {clientName}. Cambios: {changes}", clientId,
                new { AppointmentTitle = appointmentTitle, Changes = changes });
        }

        public async Task LogAppointmentCancelledAsync(Guid userId, Guid lawFirmId, Guid clientId, string clientName, string appointmentTitle, DateTime appointmentDate)
        {
            await LogActivityAsync(userId, lawFirmId, ActivityType.AppointmentCancelled,
                $"Canceló cita '{appointmentTitle}' con {clientName} programada para {appointmentDate:dd/MM/yyyy HH:mm}", clientId,
                new { AppointmentTitle = appointmentTitle, OriginalDate = appointmentDate });
        }

        public async Task LogClientInteractionAsync(Guid userId, Guid lawFirmId, Guid clientId, string clientName, string interactionDetails)
        {
            await LogActivityAsync(userId, lawFirmId, ActivityType.ClientInteraction,
                $"Interacción con {clientName}: {interactionDetails}", clientId,
                new { InteractionDetails = interactionDetails });
        }

        public async Task LogFormSentAsync(Guid userId, Guid lawFirmId, Guid clientId, string clientName, string formTitle)
        {
            await LogActivityAsync(userId, lawFirmId, ActivityType.FormSent,
                $"Envió formulario '{formTitle}' a {clientName}", clientId,
                new { FormTitle = formTitle });
        }

        public async Task LogFormCompletedAsync(Guid userId, Guid lawFirmId, Guid clientId, string clientName, string formTitle)
        {
            await LogActivityAsync(userId, lawFirmId, ActivityType.FormCompleted,
                $"Formulario '{formTitle}' completado por {clientName}", clientId,
                new { FormTitle = formTitle });
        }

        public async Task LogDocumentUploadedAsync(Guid userId, Guid lawFirmId, Guid clientId, string clientName, string documentType)
        {
            await LogActivityAsync(userId, lawFirmId, ActivityType.DocumentUploaded,
                $"Subió documento para {clientName}: {documentType}", clientId,
                new { DocumentType = documentType });
        }

        public async Task LogNoteAddedAsync(Guid userId, Guid lawFirmId, Guid clientId, string clientName, string noteTitle)
        {
            await LogActivityAsync(userId, lawFirmId, ActivityType.NoteAdded,
                $"Agregó nota para {clientName}: {noteTitle}", clientId,
                new { NoteTitle = noteTitle });
        }
    }
}
