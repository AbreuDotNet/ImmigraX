using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using LegalApp.API.Data;
using LegalApp.API.Models;
using LegalApp.API.DTOs;
using LegalApp.API.Services;
using System.Security.Claims;

namespace LegalApp.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PaymentsController : ControllerBase
    {
        private readonly LegalAppDbContext _context;
        private readonly ActivityLogService _activityLogService;

        public PaymentsController(LegalAppDbContext context, ActivityLogService activityLogService)
        {
            _context = context;
            _activityLogService = activityLogService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<PaymentResponseDto>>> GetPayments([FromQuery] Guid? clientId = null, [FromQuery] PaymentStatus? status = null)
        {
            try
            {
                var query = _context.Payments
                    .Include(p => p.Client)
                    .Include(p => p.LawFirm)
                    .AsQueryable();

                if (clientId.HasValue)
                {
                    query = query.Where(p => p.ClientId == clientId.Value);
                }

                if (status.HasValue)
                {
                    query = query.Where(p => p.Status == status.Value);
                }

                var payments = await query
                    .Select(p => new PaymentResponseDto
                    {
                        Id = p.Id,
                        Amount = p.Amount,
                        DueDate = p.DueDate,
                        PaidDate = p.PaidDate,
                        Status = p.Status.ToString(),
                        Description = p.Description,
                        ClientName = p.Client.FullName,
                        IsOverdue = p.DueDate < DateTime.UtcNow && p.Status != PaymentStatus.Paid,
                        DaysOverdue = p.DueDate < DateTime.UtcNow && p.Status != PaymentStatus.Paid 
                            ? (int)(DateTime.UtcNow - p.DueDate).TotalDays 
                            : 0
                    })
                    .OrderByDescending(p => p.DueDate)
                    .ToListAsync();

                return Ok(payments);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener pagos", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PaymentResponseDto>> GetPayment(Guid id)
        {
            try
            {
                var payment = await _context.Payments
                    .Include(p => p.Client)
                    .Include(p => p.LawFirm)
                    .Where(p => p.Id == id)
                    .Select(p => new PaymentResponseDto
                    {
                        Id = p.Id,
                        Amount = p.Amount,
                        DueDate = p.DueDate,
                        PaidDate = p.PaidDate,
                        Status = p.Status.ToString(),
                        Description = p.Description,
                        ClientName = p.Client.FullName,
                        IsOverdue = p.DueDate < DateTime.UtcNow && p.Status != PaymentStatus.Paid,
                        DaysOverdue = p.DueDate < DateTime.UtcNow && p.Status != PaymentStatus.Paid 
                            ? (int)(DateTime.UtcNow - p.DueDate).TotalDays 
                            : 0
                    })
                    .FirstOrDefaultAsync();

                if (payment == null)
                {
                    return NotFound(new { message = "Pago no encontrado" });
                }

                return Ok(payment);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener pago", error = ex.Message });
            }
        }

        [HttpGet("client/{clientId}")]
        public async Task<ActionResult<IEnumerable<PaymentResponseDto>>> GetPaymentsByClient(Guid clientId)
        {
            try
            {
                var clientExists = await _context.Clients.AnyAsync(c => c.Id == clientId);
                if (!clientExists)
                {
                    return NotFound(new { message = "Cliente no encontrado" });
                }

                var payments = await _context.Payments
                    .Include(p => p.Client)
                    .Include(p => p.LawFirm)
                    .Where(p => p.ClientId == clientId)
                    .Select(p => new PaymentResponseDto
                    {
                        Id = p.Id,
                        Amount = p.Amount,
                        DueDate = p.DueDate,
                        PaidDate = p.PaidDate,
                        Status = p.Status.ToString(),
                        Description = p.Description,
                        ClientName = p.Client.FullName,
                        IsOverdue = p.DueDate < DateTime.UtcNow && p.Status != PaymentStatus.Paid,
                        DaysOverdue = p.DueDate < DateTime.UtcNow && p.Status != PaymentStatus.Paid 
                            ? (int)(DateTime.UtcNow - p.DueDate).TotalDays 
                            : 0
                    })
                    .OrderByDescending(p => p.DueDate)
                    .ToListAsync();

                return Ok(payments);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener pagos del cliente", error = ex.Message });
            }
        }

        [HttpGet("overdue")]
        public async Task<ActionResult<IEnumerable<PaymentResponseDto>>> GetOverduePayments()
        {
            try
            {
                var overduePayments = await _context.Payments
                    .Include(p => p.Client)
                    .Include(p => p.LawFirm)
                    .Where(p => p.DueDate < DateTime.UtcNow && p.Status != PaymentStatus.Paid)
                    .Select(p => new PaymentResponseDto
                    {
                        Id = p.Id,
                        Amount = p.Amount,
                        DueDate = p.DueDate,
                        PaidDate = p.PaidDate,
                        Status = p.Status.ToString(),
                        Description = p.Description,
                        ClientName = p.Client.FullName,
                        IsOverdue = true,
                        DaysOverdue = (int)(DateTime.UtcNow - p.DueDate).TotalDays
                    })
                    .OrderByDescending(p => p.DaysOverdue)
                    .ToListAsync();

                return Ok(overduePayments);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener pagos vencidos", error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult<PaymentResponseDto>> CreatePayment([FromBody] PaymentCreateDto paymentDto)
        {
            try
            {
                // Get current user ID from JWT token
                var currentUserIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!Guid.TryParse(currentUserIdString, out var currentUserId))
                {
                    return Unauthorized(new { message = "Token de usuario inválido" });
                }

                // Get user's law firm
                var user = await _context.Users.Include(u => u.UserLawFirms).FirstOrDefaultAsync(u => u.Id == currentUserId);
                if (user?.UserLawFirms == null || !user.UserLawFirms.Any())
                {
                    return BadRequest(new { message = "Usuario no tiene firma legal asociada" });
                }

                var lawFirmId = user.UserLawFirms.First().LawFirmId;

                // Verify client exists and belongs to the same law firm
                var client = await _context.Clients.FirstOrDefaultAsync(c => c.Id == paymentDto.ClientId);
                if (client == null)
                {
                    return BadRequest(new { message = "El cliente especificado no existe" });
                }

                if (client.LawFirmId != lawFirmId)
                {
                    return Forbid("No tiene permisos para crear pagos para este cliente");
                }

                // Parse status
                if (!Enum.TryParse<PaymentStatus>(paymentDto.Status, true, out var status))
                {
                    return BadRequest(new { message = "Estado de pago inválido" });
                }

                var payment = new Payment
                {
                    ClientId = paymentDto.ClientId,
                    LawFirmId = lawFirmId,
                    Amount = paymentDto.Amount,
                    DueDate = paymentDto.DueDate,
                    PaidDate = status == PaymentStatus.Paid ? DateTime.UtcNow : null,
                    Status = status,
                    Description = paymentDto.Description
                };

                _context.Payments.Add(payment);
                await _context.SaveChangesAsync();

                // Log the activity
                await _activityLogService.LogPaymentReceivedAsync(
                    currentUserId,
                    lawFirmId,
                    paymentDto.ClientId,
                    client.FullName,
                    paymentDto.Amount
                );

                // Return created payment with related data
                var createdPayment = await _context.Payments
                    .Include(p => p.Client)
                    .Include(p => p.LawFirm)
                    .Where(p => p.Id == payment.Id)
                    .Select(p => new PaymentResponseDto
                    {
                        Id = p.Id,
                        Amount = p.Amount,
                        DueDate = p.DueDate,
                        PaidDate = p.PaidDate,
                        Status = p.Status.ToString(),
                        Description = p.Description,
                        ClientName = p.Client.FullName,
                        IsOverdue = p.DueDate < DateTime.UtcNow && p.Status != PaymentStatus.Paid,
                        DaysOverdue = p.DueDate < DateTime.UtcNow && p.Status != PaymentStatus.Paid 
                            ? (int)(DateTime.UtcNow - p.DueDate).TotalDays 
                            : 0
                    })
                    .FirstOrDefaultAsync();

                return CreatedAtAction(nameof(GetPayment), new { id = payment.Id }, createdPayment);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al crear pago", error = ex.Message });
            }
        }

        [HttpPost("plan")]
        public async Task<ActionResult<IEnumerable<PaymentResponseDto>>> CreatePaymentPlan([FromBody] PaymentPlanCreateDto planDto)
        {
            try
            {
                // Get current user ID from JWT token
                var currentUserIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!Guid.TryParse(currentUserIdString, out var currentUserId))
                {
                    return Unauthorized(new { message = "Token de usuario inválido" });
                }

                // Get user's law firm
                var user = await _context.Users.Include(u => u.UserLawFirms).FirstOrDefaultAsync(u => u.Id == currentUserId);
                if (user?.UserLawFirms == null || !user.UserLawFirms.Any())
                {
                    return BadRequest(new { message = "Usuario no tiene firma legal asociada" });
                }

                var lawFirmId = user.UserLawFirms.First().LawFirmId;

                // Verify client exists and belongs to the same law firm
                var client = await _context.Clients.FirstOrDefaultAsync(c => c.Id == planDto.ClientId);
                if (client == null)
                {
                    return BadRequest(new { message = "El cliente especificado no existe" });
                }

                if (client.LawFirmId != lawFirmId)
                {
                    return Forbid("No tiene permisos para crear plan de pagos para este cliente");
                }

                if (planDto.NumberOfInstallments <= 0)
                {
                    return BadRequest(new { message = "El número de cuotas debe ser mayor a 0" });
                }

                var installmentAmount = Math.Round(planDto.TotalAmount / planDto.NumberOfInstallments, 2);
                var currentDate = planDto.FirstPaymentDate;
                var payments = new List<Payment>();

                // Create installments
                for (int i = 0; i < planDto.NumberOfInstallments; i++)
                {
                    var amount = i == planDto.NumberOfInstallments - 1 
                        ? planDto.TotalAmount - (installmentAmount * (planDto.NumberOfInstallments - 1)) // Adjust last payment for rounding
                        : installmentAmount;

                    var payment = new Payment
                    {
                        ClientId = planDto.ClientId,
                        LawFirmId = lawFirmId,
                        Amount = amount,
                        DueDate = currentDate,
                        Status = PaymentStatus.Pending,
                        Description = $"{planDto.Description} - Cuota {i + 1} de {planDto.NumberOfInstallments}"
                    };

                    payments.Add(payment);
                    _context.Payments.Add(payment);

                    // Add interval for next payment
                    currentDate = planDto.PaymentInterval.ToLowerInvariant() switch
                    {
                        "weekly" => currentDate.AddDays(7),
                        "biweekly" => currentDate.AddDays(14),
                        "monthly" => currentDate.AddMonths(1),
                        "quarterly" => currentDate.AddMonths(3),
                        _ => currentDate.AddMonths(1) // Default to monthly
                    };
                }

                await _context.SaveChangesAsync();

                // Return created payments
                var createdPayments = payments.Select(p => new PaymentResponseDto
                {
                    Id = p.Id,
                    Amount = p.Amount,
                    DueDate = p.DueDate,
                    PaidDate = p.PaidDate,
                    Status = p.Status.ToString(),
                    Description = p.Description,
                    ClientName = client.FullName,
                    IsOverdue = false,
                    DaysOverdue = 0
                }).ToList();

                return Ok(new { 
                    message = "Plan de pagos creado exitosamente", 
                    payments = createdPayments,
                    totalAmount = planDto.TotalAmount,
                    numberOfInstallments = planDto.NumberOfInstallments
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al crear plan de pagos", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> UpdatePayment(Guid id, [FromBody] PaymentUpdateDto paymentDto)
        {
            try
            {
                var payment = await _context.Payments.FindAsync(id);
                if (payment == null)
                {
                    return NotFound(new { message = "Pago no encontrado" });
                }

                // Update fields if provided
                if (paymentDto.Amount.HasValue)
                    payment.Amount = paymentDto.Amount.Value;

                if (paymentDto.DueDate.HasValue)
                    payment.DueDate = paymentDto.DueDate.Value;

                if (!string.IsNullOrEmpty(paymentDto.Status))
                {
                    if (Enum.TryParse<PaymentStatus>(paymentDto.Status, true, out var status))
                    {
                        payment.Status = status;
                        
                        // Set paid date if marking as paid
                        if (status == PaymentStatus.Paid && payment.PaidDate == null)
                        {
                            payment.PaidDate = DateTime.UtcNow;
                        }
                        else if (status != PaymentStatus.Paid)
                        {
                            payment.PaidDate = null;
                        }
                    }
                    else
                    {
                        return BadRequest(new { message = "Estado de pago inválido" });
                    }
                }

                if (paymentDto.PaidDate.HasValue)
                {
                    payment.PaidDate = paymentDto.PaidDate.Value;
                    if (payment.Status != PaymentStatus.Paid)
                    {
                        payment.Status = PaymentStatus.Paid;
                    }
                }

                if (!string.IsNullOrEmpty(paymentDto.Description))
                    payment.Description = paymentDto.Description;

                await _context.SaveChangesAsync();

                return Ok(new { message = "Pago actualizado exitosamente" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al actualizar pago", error = ex.Message });
            }
        }

        [HttpPut("{id}/mark-paid")]
        public async Task<ActionResult> MarkPaymentAsPaid(Guid id)
        {
            try
            {
                var payment = await _context.Payments.FindAsync(id);
                if (payment == null)
                {
                    return NotFound(new { message = "Pago no encontrado" });
                }

                payment.Status = PaymentStatus.Paid;
                payment.PaidDate = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(new { message = "Pago marcado como pagado exitosamente" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al marcar pago como pagado", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeletePayment(Guid id)
        {
            try
            {
                var payment = await _context.Payments.FindAsync(id);
                if (payment == null)
                {
                    return NotFound(new { message = "Pago no encontrado" });
                }

                _context.Payments.Remove(payment);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Pago eliminado exitosamente" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al eliminar pago", error = ex.Message });
            }
        }

        [HttpGet("summary")]
        public async Task<ActionResult> GetPaymentSummary([FromQuery] Guid? clientId = null)
        {
            try
            {
                var query = _context.Payments.AsQueryable();

                if (clientId.HasValue)
                {
                    query = query.Where(p => p.ClientId == clientId.Value);
                }

                var summary = await query
                    .GroupBy(p => 1)
                    .Select(g => new
                    {
                        TotalAmount = g.Sum(p => p.Amount),
                        PaidAmount = g.Where(p => p.Status == PaymentStatus.Paid).Sum(p => p.Amount),
                        PendingAmount = g.Where(p => p.Status == PaymentStatus.Pending).Sum(p => p.Amount),
                        OverdueAmount = g.Where(p => p.DueDate < DateTime.UtcNow && p.Status != PaymentStatus.Paid).Sum(p => p.Amount),
                        TotalPayments = g.Count(),
                        PaidPayments = g.Count(p => p.Status == PaymentStatus.Paid),
                        PendingPayments = g.Count(p => p.Status == PaymentStatus.Pending),
                        OverduePayments = g.Count(p => p.DueDate < DateTime.UtcNow && p.Status != PaymentStatus.Paid)
                    })
                    .FirstOrDefaultAsync();

                if (summary == null)
                {
                    summary = new
                    {
                        TotalAmount = 0m,
                        PaidAmount = 0m,
                        PendingAmount = 0m,
                        OverdueAmount = 0m,
                        TotalPayments = 0,
                        PaidPayments = 0,
                        PendingPayments = 0,
                        OverduePayments = 0
                    };
                }

                return Ok(summary);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener resumen de pagos", error = ex.Message });
            }
        }
    }
}
