using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LegalApp.API.Models
{
    public enum PaymentStatus
    {
        Pending,
        Paid,
        Overdue,
        Cancelled
    }

    public class Payment
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        
        public Guid ClientId { get; set; }
        public Guid LawFirmId { get; set; }
        
        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal Amount { get; set; }
        
        [Required]
        public DateTime DueDate { get; set; }
        
        public DateTime? PaidDate { get; set; }
        
        [Required]
        public PaymentStatus Status { get; set; } = PaymentStatus.Pending;
        
        public string? Description { get; set; }
        
        // Navigation properties
        public virtual Client Client { get; set; } = null!;
        public virtual LawFirm LawFirm { get; set; } = null!;
    }
}
