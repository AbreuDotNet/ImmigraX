using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LegalApp.API.Models
{
    public class PaymentInstallment
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        
        public Guid PaymentPlanId { get; set; }
        
        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal Amount { get; set; }
        
        [Required]
        public DateOnly DueDate { get; set; }
        
        public bool Paid { get; set; } = false;
        
        public DateTime? PaidAt { get; set; }
        
        // Navigation properties
        public virtual PaymentPlan PaymentPlan { get; set; } = null!;
    }
}
