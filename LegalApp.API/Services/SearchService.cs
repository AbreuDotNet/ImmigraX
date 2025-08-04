using Microsoft.EntityFrameworkCore;
using LegalApp.API.Data;
using LegalApp.API.Models;
using LegalApp.API.DTOs;

namespace LegalApp.API.Services
{
    public interface ISearchService
    {
        Task<GlobalSearchResultDto> GlobalSearchAsync(string query, Guid? lawFirmId = null, int page = 1, int pageSize = 20);
        Task<List<ClientSearchResultDto>> SearchClientsAsync(string query, Guid? lawFirmId = null, int limit = 10);
        Task<List<DocumentSearchResultDto>> SearchDocumentsAsync(string query, Guid? lawFirmId = null, int limit = 10);
        Task<List<AppointmentSearchResultDto>> SearchAppointmentsAsync(string query, Guid? lawFirmId = null, int limit = 10);
        Task<List<NoteSearchResultDto>> SearchNotesAsync(string query, Guid? lawFirmId = null, int limit = 10);
    }

    public class SearchService : ISearchService
    {
        private readonly LegalAppDbContext _context;
        private readonly ILogger<SearchService> _logger;

        public SearchService(LegalAppDbContext context, ILogger<SearchService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<GlobalSearchResultDto> GlobalSearchAsync(string query, Guid? lawFirmId = null, int page = 1, int pageSize = 20)
        {
            try
            {
                var result = new GlobalSearchResultDto
                {
                    Query = query,
                    Page = page,
                    PageSize = pageSize
                };

                // Search in parallel for better performance
                var clientsTask = SearchClientsAsync(query, lawFirmId, pageSize);
                var documentsTask = SearchDocumentsAsync(query, lawFirmId, pageSize);
                var appointmentsTask = SearchAppointmentsAsync(query, lawFirmId, pageSize);
                var notesTask = SearchNotesAsync(query, lawFirmId, pageSize);

                await Task.WhenAll(clientsTask, documentsTask, appointmentsTask, notesTask);

                result.Clients = await clientsTask;
                result.Documents = await documentsTask;
                result.Appointments = await appointmentsTask;
                result.Notes = await notesTask;

                result.TotalResults = result.Clients.Count + result.Documents.Count + 
                                    result.Appointments.Count + result.Notes.Count;

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error performing global search for query: {Query}", query);
                throw;
            }
        }

        public async Task<List<ClientSearchResultDto>> SearchClientsAsync(string query, Guid? lawFirmId = null, int limit = 10)
        {
            var clientsQuery = _context.Clients.AsQueryable();

            if (lawFirmId.HasValue)
            {
                clientsQuery = clientsQuery.Where(c => c.LawFirmId == lawFirmId.Value);
            }

            var clients = await clientsQuery
                .Where(c => 
                    EF.Functions.ILike(c.FullName, $"%{query}%") ||
                    EF.Functions.ILike(c.Email ?? "", $"%{query}%") ||
                    EF.Functions.ILike(c.Phone ?? "", $"%{query}%") ||
                    EF.Functions.ILike(c.CaseNumber ?? "", $"%{query}%") ||
                    EF.Functions.ILike(c.ProcessType, $"%{query}%"))
                .Select(c => new ClientSearchResultDto
                {
                    Id = c.Id,
                    FullName = c.FullName,
                    Email = c.Email ?? "",
                    PhoneNumber = c.Phone,
                    CaseNumber = c.CaseNumber,
                    ProcessType = c.ProcessType,
                    ProcessStatus = c.ProcessStatus,
                    CreatedAt = c.CreatedAt,
                    MatchType = "Client"
                })
                .OrderBy(c => c.FullName)
                .Take(limit)
                .ToListAsync();

            return clients;
        }

        public async Task<List<DocumentSearchResultDto>> SearchDocumentsAsync(string query, Guid? lawFirmId = null, int limit = 10)
        {
            var documentsQuery = _context.ClientDocuments
                .Include(d => d.Client)
                .AsQueryable();

            if (lawFirmId.HasValue)
            {
                documentsQuery = documentsQuery.Where(d => d.Client.LawFirmId == lawFirmId.Value);
            }

            var documents = await documentsQuery
                .Where(d => 
                    EF.Functions.ILike(d.DocumentType, $"%{query}%") ||
                    EF.Functions.ILike(d.FileUrl, $"%{query}%") ||
                    EF.Functions.ILike(d.Client.FullName, $"%{query}%"))
                .Select(d => new DocumentSearchResultDto
                {
                    Id = d.Id,
                    DocumentType = d.DocumentType,
                    FileName = d.FileUrl.Contains("/") ? d.FileUrl.Substring(d.FileUrl.LastIndexOf("/") + 1) : d.FileUrl,
                    Description = $"Version {d.Version} - {(d.IsCurrent ? "Current" : "Archived")}",
                    ClientName = d.Client.FullName,
                    ClientId = d.ClientId,
                    UploadedAt = d.UploadedAt,
                    MatchType = "Document"
                })
                .OrderByDescending(d => d.UploadedAt)
                .Take(limit)
                .ToListAsync();

            return documents;
        }

        public async Task<List<AppointmentSearchResultDto>> SearchAppointmentsAsync(string query, Guid? lawFirmId = null, int limit = 10)
        {
            var appointmentsQuery = _context.Appointments
                .Include(a => a.Client)
                .AsQueryable();

            if (lawFirmId.HasValue)
            {
                appointmentsQuery = appointmentsQuery.Where(a => a.LawFirmId == lawFirmId.Value);
            }

            var appointments = await appointmentsQuery
                .Where(a => 
                    EF.Functions.ILike(a.Title ?? "", $"%{query}%") ||
                    EF.Functions.ILike(a.Description ?? "", $"%{query}%") ||
                    EF.Functions.ILike(a.AppointmentType ?? "", $"%{query}%") ||
                    EF.Functions.ILike(a.Client.FullName, $"%{query}%"))
                .Select(a => new AppointmentSearchResultDto
                {
                    Id = a.Id,
                    Title = a.Title,
                    Description = a.Description,
                    AppointmentType = a.AppointmentType,
                    AppointmentDate = a.AppointmentDate,
                    Status = a.Status.ToString(),
                    ClientName = a.Client.FullName,
                    ClientId = a.ClientId,
                    MatchType = "Appointment"
                })
                .OrderBy(a => a.AppointmentDate)
                .Take(limit)
                .ToListAsync();

            return appointments;
        }

        public async Task<List<NoteSearchResultDto>> SearchNotesAsync(string query, Guid? lawFirmId = null, int limit = 10)
        {
            var notesQuery = _context.ClientNotes
                .Include(n => n.Client)
                .AsQueryable();

            if (lawFirmId.HasValue)
            {
                notesQuery = notesQuery.Where(n => n.Client.LawFirmId == lawFirmId.Value);
            }

            var notes = await notesQuery
                .Where(n => 
                    EF.Functions.ILike(n.Title ?? "", $"%{query}%") ||
                    EF.Functions.ILike(n.Content ?? "", $"%{query}%") ||
                    EF.Functions.ILike(n.Category ?? "", $"%{query}%") ||
                    EF.Functions.ILike(n.Client.FullName, $"%{query}%"))
                .Select(n => new NoteSearchResultDto
                {
                    Id = n.Id,
                    Title = n.Title,
                    Content = (n.Content ?? "").Length > 200 ? (n.Content ?? "").Substring(0, 200) + "..." : (n.Content ?? ""),
                    Category = n.Category,
                    ClientName = n.Client.FullName,
                    ClientId = n.ClientId,
                    CreatedAt = n.CreatedAt,
                    IsImportant = n.IsImportant,
                    MatchType = "Note"
                })
                .OrderByDescending(n => n.CreatedAt)
                .Take(limit)
                .ToListAsync();

            return notes;
        }
    }
}
