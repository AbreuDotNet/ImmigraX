namespace LegalApp.API.Models
{
    public class UserLawFirm
    {
        public Guid UserId { get; set; }
        public Guid LawFirmId { get; set; }
        
        // Navigation properties
        public virtual User User { get; set; } = null!;
        public virtual LawFirm LawFirm { get; set; } = null!;
    }
}
