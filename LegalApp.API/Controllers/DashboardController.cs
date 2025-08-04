using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using LegalApp.API.Data;
using LegalApp.API.Models;
using System.Security.Claims;

namespace LegalApp.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly LegalAppDbContext _context;

        public DashboardController(LegalAppDbContext context)
        {
            _context = context;
        }

        [HttpGet("summary")]
        public async Task<ActionResult> GetDashboardSummary()
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

                // Get counts
                var totalClients = await _context.Clients.CountAsync(c => c.LawFirmId == lawFirmId);
                var activeClients = await _context.Clients.CountAsync(c => c.LawFirmId == lawFirmId && c.ProcessStatus != "Completado");
                
                var totalAppointments = await _context.Appointments.CountAsync(a => a.LawFirmId == lawFirmId);
                var todayAppointments = await _context.Appointments
                    .CountAsync(a => a.LawFirmId == lawFirmId && a.AppointmentDate.Date == DateTime.Today);
                var upcomingAppointments = await _context.Appointments
                    .CountAsync(a => a.LawFirmId == lawFirmId && a.AppointmentDate > DateTime.Now && a.AppointmentDate <= DateTime.Now.AddDays(7));

                var totalPayments = await _context.Payments.CountAsync(p => p.LawFirmId == lawFirmId);
                var pendingPayments = await _context.Payments.CountAsync(p => p.LawFirmId == lawFirmId && p.Status == PaymentStatus.Pending);
                var overduePayments = await _context.Payments.CountAsync(p => p.LawFirmId == lawFirmId && p.DueDate < DateTime.Now && p.Status != PaymentStatus.Paid);

                var totalRevenue = await _context.Payments
                    .Where(p => p.LawFirmId == lawFirmId && p.Status == PaymentStatus.Paid)
                    .SumAsync(p => p.Amount);
                var pendingRevenue = await _context.Payments
                    .Where(p => p.LawFirmId == lawFirmId && p.Status == PaymentStatus.Pending)
                    .SumAsync(p => p.Amount);

                var totalDocuments = await _context.ClientDocuments
                    .Include(d => d.Client)
                    .CountAsync(d => d.Client.LawFirmId == lawFirmId);

                var totalNotes = await _context.ClientNotes
                    .Include(n => n.Client)
                    .CountAsync(n => n.Client.LawFirmId == lawFirmId);
                var importantNotes = await _context.ClientNotes
                    .Include(n => n.Client)
                    .CountAsync(n => n.Client.LawFirmId == lawFirmId && n.IsImportant);

                // Recent activity
                var recentClients = await _context.Clients
                    .Where(c => c.LawFirmId == lawFirmId)
                    .OrderByDescending(c => c.CreatedAt)
                    .Take(5)
                    .Select(c => new { c.FullName, c.ProcessType, c.CreatedAt })
                    .ToListAsync();

                var recentAppointments = await _context.Appointments
                    .Include(a => a.Client)
                    .Where(a => a.LawFirmId == lawFirmId && a.AppointmentDate >= DateTime.Now)
                    .OrderBy(a => a.AppointmentDate)
                    .Take(5)
                    .Select(a => new { 
                        ClientName = a.Client.FullName, 
                        a.AppointmentType, 
                        a.AppointmentDate,
                        a.Status
                    })
                    .ToListAsync();

                // Cases by status
                var casesByStatus = await _context.Clients
                    .Where(c => c.LawFirmId == lawFirmId)
                    .GroupBy(c => c.ProcessStatus)
                    .Select(g => new { Status = g.Key, Count = g.Count() })
                    .ToListAsync();

                // Cases by process type
                var casesByType = await _context.Clients
                    .Where(c => c.LawFirmId == lawFirmId)
                    .GroupBy(c => c.ProcessType)
                    .Select(g => new { Type = g.Key, Count = g.Count() })
                    .ToListAsync();

                // Monthly revenue trend (last 6 months)
                var monthlyRevenue = await _context.Payments
                    .Where(p => p.LawFirmId == lawFirmId && 
                               p.Status == PaymentStatus.Paid && 
                               p.PaidDate >= DateTime.Now.AddMonths(-6))
                    .GroupBy(p => new { p.PaidDate!.Value.Year, p.PaidDate!.Value.Month })
                    .Select(g => new { 
                        Year = g.Key.Year, 
                        Month = g.Key.Month, 
                        Revenue = g.Sum(p => p.Amount) 
                    })
                    .OrderBy(x => x.Year).ThenBy(x => x.Month)
                    .ToListAsync();

                return Ok(new
                {
                    summary = new
                    {
                        clients = new { total = totalClients, active = activeClients },
                        appointments = new { 
                            total = totalAppointments, 
                            today = todayAppointments, 
                            upcoming = upcomingAppointments 
                        },
                        payments = new { 
                            total = totalPayments, 
                            pending = pendingPayments, 
                            overdue = overduePayments 
                        },
                        revenue = new { 
                            total = totalRevenue, 
                            pending = pendingRevenue 
                        },
                        documents = totalDocuments,
                        notes = new { 
                            total = totalNotes, 
                            important = importantNotes 
                        }
                    },
                    recentActivity = new
                    {
                        clients = recentClients,
                        appointments = recentAppointments
                    },
                    analytics = new
                    {
                        casesByStatus,
                        casesByType,
                        monthlyRevenue
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener resumen del dashboard", error = ex.Message });
            }
        }

        [HttpGet("performance")]
        public async Task<ActionResult> GetPerformanceMetrics([FromQuery] int days = 30)
        {
            try
            {
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
                var startDate = DateTime.Now.AddDays(-days);

                // New clients in period
                var newClients = await _context.Clients
                    .CountAsync(c => c.LawFirmId == lawFirmId && c.CreatedAt >= startDate);

                // Completed appointments
                var completedAppointments = await _context.Appointments
                    .CountAsync(a => a.LawFirmId == lawFirmId && 
                               a.AppointmentDate >= startDate && 
                               a.Status == AppointmentStatus.Completada);

                // Revenue in period
                var periodRevenue = await _context.Payments
                    .Where(p => p.LawFirmId == lawFirmId && 
                               p.Status == PaymentStatus.Paid && 
                               p.PaidDate >= startDate)
                    .SumAsync(p => p.Amount);

                // Documents uploaded
                var documentsUploaded = await _context.ClientDocuments
                    .Include(d => d.Client)
                    .CountAsync(d => d.Client.LawFirmId == lawFirmId && d.UploadedAt >= startDate);

                // Average response time (based on notes/activities) - simplified calculation
                var notesWithDates = await _context.ClientNotes
                    .Include(n => n.Client)
                    .Where(n => n.Client.LawFirmId == lawFirmId && n.CreatedAt >= startDate)
                    .Select(n => new { ClientCreated = n.Client.CreatedAt, NoteCreated = n.CreatedAt })
                    .ToListAsync();

                var averageResponseHours = notesWithDates.Any() 
                    ? notesWithDates.Average(x => (x.NoteCreated - x.ClientCreated).TotalHours)
                    : 0;

                // Case resolution rate
                var totalCases = await _context.Clients.CountAsync(c => c.LawFirmId == lawFirmId);
                var resolvedCases = await _context.Clients.CountAsync(c => c.LawFirmId == lawFirmId && 
                    (c.ProcessStatus == "Completado" || c.ProcessStatus == "Aprobado"));
                var resolutionRate = totalCases > 0 ? (double)resolvedCases / totalCases * 100 : 0;

                return Ok(new
                {
                    period = $"Últimos {days} días",
                    metrics = new
                    {
                        newClients,
                        completedAppointments,
                        periodRevenue,
                        documentsUploaded,
                        averageResponseHours = Math.Round(averageResponseHours, 1),
                        resolutionRate = Math.Round(resolutionRate, 1)
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener métricas de rendimiento", error = ex.Message });
            }
        }

        [HttpGet("alerts")]
        public async Task<ActionResult> GetAlerts()
        {
            try
            {
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
                var alerts = new List<object>();

                // Overdue payments
                var overduePayments = await _context.Payments
                    .Include(p => p.Client)
                    .Where(p => p.LawFirmId == lawFirmId && 
                               p.DueDate < DateTime.Now && 
                               p.Status != PaymentStatus.Paid)
                    .Select(p => new { 
                        type = "payment_overdue",
                        message = $"Pago vencido de {p.Client.FullName} - ${p.Amount}",
                        severity = "high",
                        clientId = p.ClientId,
                        paymentId = p.Id,
                        daysOverdue = (DateTime.Now - p.DueDate).Days
                    })
                    .ToListAsync();

                alerts.AddRange(overduePayments);

                // Upcoming appointments (next 24 hours)
                var upcomingAppointments = await _context.Appointments
                    .Include(a => a.Client)
                    .Where(a => a.LawFirmId == lawFirmId && 
                               a.AppointmentDate > DateTime.Now && 
                               a.AppointmentDate <= DateTime.Now.AddHours(24))
                    .Select(a => new { 
                        type = "appointment_reminder",
                        message = $"Cita con {a.Client.FullName} - {a.AppointmentType}",
                        severity = "medium",
                        clientId = a.ClientId,
                        appointmentId = a.Id,
                        hoursUntil = (a.AppointmentDate - DateTime.Now).TotalHours
                    })
                    .ToListAsync();

                alerts.AddRange(upcomingAppointments);

                // Important notes without recent activity
                var importantNotesWithoutActivity = await _context.ClientNotes
                    .Include(n => n.Client)
                    .Where(n => n.Client.LawFirmId == lawFirmId && 
                               n.IsImportant && 
                               n.UpdatedAt < DateTime.Now.AddDays(-7))
                    .Select(n => new { 
                        type = "important_note_stale",
                        message = $"Nota importante sin actividad: {n.Title} - {n.Client.FullName}",
                        severity = "low",
                        clientId = n.ClientId,
                        noteId = n.Id,
                        daysSinceUpdate = (DateTime.Now - n.UpdatedAt).Days
                    })
                    .ToListAsync();

                alerts.AddRange(importantNotesWithoutActivity);

                return Ok(new { alerts = alerts.Take(20) }); // Limit to 20 most important alerts
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener alertas", error = ex.Message });
            }
        }
    }
}
