using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using LegalApp.API.Services;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using LegalApp.API.Data;

namespace LegalApp.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ReportsController : ControllerBase
    {
        private readonly IReportService _reportService;
        private readonly LegalAppDbContext _context;

        public ReportsController(IReportService reportService, LegalAppDbContext context)
        {
            _reportService = reportService;
            _context = context;
        }

        [HttpGet("client/{clientId}")]
        public async Task<ActionResult> GetClientReport(Guid clientId)
        {
            try
            {
                var pdfBytes = await _reportService.GenerateClientReportAsync(clientId);
                return File(pdfBytes, "application/pdf", $"reporte_cliente_{clientId:N}.pdf");
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al generar reporte", error = ex.Message });
            }
        }

        [HttpGet("invoice/{paymentId}")]
        public async Task<ActionResult> GetPaymentInvoice(Guid paymentId)
        {
            try
            {
                var pdfBytes = await _reportService.GeneratePaymentInvoiceAsync(paymentId);
                return File(pdfBytes, "application/pdf", $"factura_{paymentId:N}.pdf");
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al generar factura", error = ex.Message });
            }
        }

        [HttpGet("monthly/{year}/{month}")]
        public async Task<ActionResult> GetMonthlyReport(int year, int month)
        {
            try
            {
                // Get current user's law firm
                var currentUserIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!Guid.TryParse(currentUserIdString, out var currentUserId))
                {
                    return Unauthorized(new { message = "Token de usuario inválido" });
                }

                var user = await _context.Users.Include(u => u.UserLawFirms).FirstOrDefaultAsync(u => u.Id == currentUserId);
                if (user?.UserLawFirms == null || !user.UserLawFirms.Any())
                {
                    return BadRequest(new { message = "Usuario no tiene firma legal asociada" });
                }

                var lawFirmId = user.UserLawFirms.First().LawFirmId;
                var pdfBytes = await _reportService.GenerateMonthlyReportAsync(lawFirmId, year, month);
                return File(pdfBytes, "application/pdf", $"reporte_mensual_{year}_{month:D2}.pdf");
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al generar reporte mensual", error = ex.Message });
            }
        }

        [HttpGet("appointments")]
        public async Task<ActionResult> GetAppointmentsList([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            try
            {
                // Get current user's law firm
                var currentUserIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!Guid.TryParse(currentUserIdString, out var currentUserId))
                {
                    return Unauthorized(new { message = "Token de usuario inválido" });
                }

                var user = await _context.Users.Include(u => u.UserLawFirms).FirstOrDefaultAsync(u => u.Id == currentUserId);
                if (user?.UserLawFirms == null || !user.UserLawFirms.Any())
                {
                    return BadRequest(new { message = "Usuario no tiene firma legal asociada" });
                }

                var lawFirmId = user.UserLawFirms.First().LawFirmId;
                var pdfBytes = await _reportService.GenerateAppointmentListAsync(lawFirmId, startDate, endDate);
                return File(pdfBytes, "application/pdf", $"citas_{startDate:yyyy-MM-dd}_a_{endDate:yyyy-MM-dd}.pdf");
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al generar lista de citas", error = ex.Message });
            }
        }
    }
}
