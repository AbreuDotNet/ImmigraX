using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LegalApp.API.Models
{
    public class PaymentPlan
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        
        public Guid ClientId { get; set; }
        
        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal TotalAmount { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public virtual Client Client { get; set; } = null!;
        public virtual ICollection<PaymentInstallment> Installments { get; set; } = new List<PaymentInstallment>();
    }
}
