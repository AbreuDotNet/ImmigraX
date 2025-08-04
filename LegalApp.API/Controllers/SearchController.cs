using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using LegalApp.API.Services;
using LegalApp.API.DTOs;
using System.Security.Claims;

namespace LegalApp.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class SearchController : ControllerBase
    {
        private readonly ISearchService _searchService;
        private readonly ILogger<SearchController> _logger;

        public SearchController(ISearchService searchService, ILogger<SearchController> logger)
        {
            _searchService = searchService;
            _logger = logger;
        }

        /// <summary>
        /// Búsqueda global en todos los tipos de contenido
        /// </summary>
        [HttpGet("global")]
        public async Task<ActionResult<GlobalSearchResultDto>> GlobalSearch(
            [FromQuery] string query,
            [FromQuery] Guid? lawFirmId = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(query) || query.Length < 2)
                {
                    return BadRequest(new { message = "La consulta debe tener al menos 2 caracteres" });
                }

                // Validate LawFirm access
                if (lawFirmId.HasValue && !await ValidateLawFirmAccess(lawFirmId.Value))
                {
                    return Forbid("No tiene acceso a esta firma legal");
                }

                var result = await _searchService.GlobalSearchAsync(query, lawFirmId, page, pageSize);
                
                _logger.LogInformation($"Global search for '{query}' returned {result.TotalResults} results");
                
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error performing global search for query: {Query}", query);
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        /// <summary>
        /// Búsqueda específica de clientes
        /// </summary>
        [HttpGet("clients")]
        public async Task<ActionResult<List<ClientSearchResultDto>>> SearchClients(
            [FromQuery] string query,
            [FromQuery] Guid? lawFirmId = null,
            [FromQuery] int limit = 10)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(query) || query.Length < 2)
                {
                    return BadRequest(new { message = "La consulta debe tener al menos 2 caracteres" });
                }

                if (lawFirmId.HasValue && !await ValidateLawFirmAccess(lawFirmId.Value))
                {
                    return Forbid("No tiene acceso a esta firma legal");
                }

                var clients = await _searchService.SearchClientsAsync(query, lawFirmId, limit);
                return Ok(clients);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching clients for query: {Query}", query);
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        /// <summary>
        /// Búsqueda específica de documentos
        /// </summary>
        [HttpGet("documents")]
        public async Task<ActionResult<List<DocumentSearchResultDto>>> SearchDocuments(
            [FromQuery] string query,
            [FromQuery] Guid? lawFirmId = null,
            [FromQuery] int limit = 10)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(query) || query.Length < 2)
                {
                    return BadRequest(new { message = "La consulta debe tener al menos 2 caracteres" });
                }

                if (lawFirmId.HasValue && !await ValidateLawFirmAccess(lawFirmId.Value))
                {
                    return Forbid("No tiene acceso a esta firma legal");
                }

                var documents = await _searchService.SearchDocumentsAsync(query, lawFirmId, limit);
                return Ok(documents);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching documents for query: {Query}", query);
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        /// <summary>
        /// Búsqueda específica de citas
        /// </summary>
        [HttpGet("appointments")]
        public async Task<ActionResult<List<AppointmentSearchResultDto>>> SearchAppointments(
            [FromQuery] string query,
            [FromQuery] Guid? lawFirmId = null,
            [FromQuery] int limit = 10)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(query) || query.Length < 2)
                {
                    return BadRequest(new { message = "La consulta debe tener al menos 2 caracteres" });
                }

                if (lawFirmId.HasValue && !await ValidateLawFirmAccess(lawFirmId.Value))
                {
                    return Forbid("No tiene acceso a esta firma legal");
                }

                var appointments = await _searchService.SearchAppointmentsAsync(query, lawFirmId, limit);
                return Ok(appointments);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching appointments for query: {Query}", query);
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        /// <summary>
        /// Búsqueda específica de notas
        /// </summary>
        [HttpGet("notes")]
        public async Task<ActionResult<List<NoteSearchResultDto>>> SearchNotes(
            [FromQuery] string query,
            [FromQuery] Guid? lawFirmId = null,
            [FromQuery] int limit = 10)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(query) || query.Length < 2)
                {
                    return BadRequest(new { message = "La consulta debe tener al menos 2 caracteres" });
                }

                if (lawFirmId.HasValue && !await ValidateLawFirmAccess(lawFirmId.Value))
                {
                    return Forbid("No tiene acceso a esta firma legal");
                }

                var notes = await _searchService.SearchNotesAsync(query, lawFirmId, limit);
                return Ok(notes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching notes for query: {Query}", query);
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        /// <summary>
        /// Búsqueda avanzada con múltiples filtros
        /// </summary>
        [HttpPost("advanced")]
        public async Task<ActionResult<GlobalSearchResultDto>> AdvancedSearch([FromBody] SearchRequestDto searchRequest)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(searchRequest.Query) || searchRequest.Query.Length < 2)
                {
                    return BadRequest(new { message = "La consulta debe tener al menos 2 caracteres" });
                }

                if (searchRequest.LawFirmId.HasValue && !await ValidateLawFirmAccess(searchRequest.LawFirmId.Value))
                {
                    return Forbid("No tiene acceso a esta firma legal");
                }

                GlobalSearchResultDto result;

                switch (searchRequest.SearchType.ToLower())
                {
                    case "clients":
                        var clients = await _searchService.SearchClientsAsync(searchRequest.Query, searchRequest.LawFirmId, searchRequest.PageSize);
                        result = new GlobalSearchResultDto
                        {
                            Query = searchRequest.Query,
                            Page = searchRequest.Page,
                            PageSize = searchRequest.PageSize,
                            Clients = clients,
                            TotalResults = clients.Count
                        };
                        break;

                    case "documents":
                        var documents = await _searchService.SearchDocumentsAsync(searchRequest.Query, searchRequest.LawFirmId, searchRequest.PageSize);
                        result = new GlobalSearchResultDto
                        {
                            Query = searchRequest.Query,
                            Page = searchRequest.Page,
                            PageSize = searchRequest.PageSize,
                            Documents = documents,
                            TotalResults = documents.Count
                        };
                        break;

                    case "appointments":
                        var appointments = await _searchService.SearchAppointmentsAsync(searchRequest.Query, searchRequest.LawFirmId, searchRequest.PageSize);
                        result = new GlobalSearchResultDto
                        {
                            Query = searchRequest.Query,
                            Page = searchRequest.Page,
                            PageSize = searchRequest.PageSize,
                            Appointments = appointments,
                            TotalResults = appointments.Count
                        };
                        break;

                    case "notes":
                        var notes = await _searchService.SearchNotesAsync(searchRequest.Query, searchRequest.LawFirmId, searchRequest.PageSize);
                        result = new GlobalSearchResultDto
                        {
                            Query = searchRequest.Query,
                            Page = searchRequest.Page,
                            PageSize = searchRequest.PageSize,
                            Notes = notes,
                            TotalResults = notes.Count
                        };
                        break;

                    default: // "all"
                        result = await _searchService.GlobalSearchAsync(searchRequest.Query, searchRequest.LawFirmId, searchRequest.Page, searchRequest.PageSize);
                        break;
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error performing advanced search");
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        private Task<bool> ValidateLawFirmAccess(Guid lawFirmId)
        {
            // Get current user ID from JWT token
            var currentUserIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!Guid.TryParse(currentUserIdString, out var currentUserId))
            {
                return Task.FromResult(false);
            }

            // Master users can access any law firm
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            if (userRole == "Master")
            {
                return Task.FromResult(true);
            }

            // Check if user has access to this law firm
            var userLawFirms = HttpContext.Items["UserLawFirms"] as List<Guid>;
            return Task.FromResult(userLawFirms?.Contains(lawFirmId) ?? false);
        }
    }
}
