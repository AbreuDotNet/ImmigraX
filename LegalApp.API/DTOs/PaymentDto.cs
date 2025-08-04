using System.ComponentModel.DataAnnotations;
using LegalApp.API.Models;

namespace LegalApp.API.DTOs
{
    public class PaymentCreateDto
    {
        [Required]
        public Guid ClientId { get; set; }
        
        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "El monto debe ser mayor a 0")]
        public decimal Amount { get; set; }
        
        [Required]
        public DateTime DueDate { get; set; }
        
        [Required]
        public string Status { get; set; } = "Pending";
        
        public string? Description { get; set; }
    }

    public class PaymentUpdateDto
    {
        public decimal? Amount { get; set; }
        public DateTime? DueDate { get; set; }
        public DateTime? PaidDate { get; set; }
        public string? Status { get; set; }
        public string? Description { get; set; }
    }

    public class PaymentResponseDto
    {
        public Guid Id { get; set; }
        public decimal Amount { get; set; }
        public DateTime DueDate { get; set; }
        public DateTime? PaidDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string ClientName { get; set; } = string.Empty;
        public bool IsOverdue { get; set; }
        public int DaysOverdue { get; set; }
    }

    public class PaymentPlanCreateDto
    {
        [Required]
        public Guid ClientId { get; set; }
        
        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "El monto total debe ser mayor a 0")]
        public decimal TotalAmount { get; set; }
        
        [Required]
        [Range(1, 60, ErrorMessage = "El número de cuotas debe estar entre 1 y 60")]
        public int NumberOfInstallments { get; set; }
        
        [Required]
        public DateTime FirstPaymentDate { get; set; }
        
        [Required]
        public string PaymentInterval { get; set; } = "monthly"; // weekly, biweekly, monthly, quarterly
        
        public string? Description { get; set; }
    }

    public class PaymentMarkAsPaidDto
    {
        public DateTime? PaidAt { get; set; }
    }
}
