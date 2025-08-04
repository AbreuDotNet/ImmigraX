using Microsoft.EntityFrameworkCore;
using LegalApp.API.Models;

namespace LegalApp.API.Data
{
    public class LegalAppDbContext : DbContext
    {
        public LegalAppDbContext(DbContextOptions<LegalAppDbContext> options) : base(options)
        {
        }

        // DbSets
        public DbSet<User> Users { get; set; }
        public DbSet<LawFirm> LawFirms { get; set; }
        public DbSet<UserLawFirm> UserLawFirms { get; set; }
        public DbSet<Client> Clients { get; set; }
        public DbSet<ClientDocument> ClientDocuments { get; set; }
        public DbSet<Appointment> Appointments { get; set; }
        public DbSet<AppointmentConfirmation> AppointmentConfirmations { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<PaymentPlan> PaymentPlans { get; set; }
        public DbSet<PaymentInstallment> PaymentInstallments { get; set; }
        public DbSet<ClientNote> ClientNotes { get; set; }
        public DbSet<Message> Messages { get; set; }
        public DbSet<AuditLog> AuditLogs { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure table names to match PostgreSQL convention
            modelBuilder.Entity<User>().ToTable("users");
            modelBuilder.Entity<LawFirm>().ToTable("law_firms");
            modelBuilder.Entity<UserLawFirm>().ToTable("user_law_firm");
            modelBuilder.Entity<Client>().ToTable("clients");
            modelBuilder.Entity<ClientDocument>().ToTable("client_documents");
            modelBuilder.Entity<Appointment>().ToTable("appointments");
            modelBuilder.Entity<AppointmentConfirmation>().ToTable("appointment_confirmations");
            modelBuilder.Entity<Payment>().ToTable("payments");
            modelBuilder.Entity<PaymentPlan>().ToTable("payment_plans");
            modelBuilder.Entity<PaymentInstallment>().ToTable("payment_installments");
            modelBuilder.Entity<ClientNote>().ToTable("client_notes");
            modelBuilder.Entity<Message>().ToTable("messages");
            modelBuilder.Entity<AuditLog>().ToTable("audit_logs");

            // Configure composite primary key for UserLawFirm
            modelBuilder.Entity<UserLawFirm>()
                .HasKey(ul => new { ul.UserId, ul.LawFirmId });

            // Configure primary key for AppointmentConfirmation
            modelBuilder.Entity<AppointmentConfirmation>()
                .HasKey(ac => ac.AppointmentId);

            // Configure relationships
            
            // User relationships
            modelBuilder.Entity<User>()
                .HasMany(u => u.UserLawFirms)
                .WithOne(ul => ul.User)
                .HasForeignKey(ul => ul.UserId);

            modelBuilder.Entity<User>()
                .HasMany(u => u.UploadedDocuments)
                .WithOne(cd => cd.UploadedByUser)
                .HasForeignKey(cd => cd.UploadedBy);

            modelBuilder.Entity<User>()
                .HasMany(u => u.CreatedAppointments)
                .WithOne(a => a.CreatedByUser)
                .HasForeignKey(a => a.CreatedBy);

            modelBuilder.Entity<User>()
                .HasMany(u => u.CreatedNotes)
                .WithOne(cn => cn.CreatedByUser)
                .HasForeignKey(cn => cn.CreatedBy);

            modelBuilder.Entity<User>()
                .HasMany(u => u.SentMessages)
                .WithOne(m => m.Sender)
                .HasForeignKey(m => m.SenderId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<User>()
                .HasMany(u => u.ReceivedMessages)
                .WithOne(m => m.Recipient)
                .HasForeignKey(m => m.RecipientId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<User>()
                .HasMany(u => u.AuditLogs)
                .WithOne(al => al.User)
                .HasForeignKey(al => al.UserId);

            // LawFirm relationships
            modelBuilder.Entity<LawFirm>()
                .HasMany(lf => lf.UserLawFirms)
                .WithOne(ul => ul.LawFirm)
                .HasForeignKey(ul => ul.LawFirmId);

            modelBuilder.Entity<LawFirm>()
                .HasMany(lf => lf.Clients)
                .WithOne(c => c.LawFirm)
                .HasForeignKey(c => c.LawFirmId);

            modelBuilder.Entity<LawFirm>()
                .HasMany(lf => lf.Appointments)
                .WithOne(a => a.LawFirm)
                .HasForeignKey(a => a.LawFirmId);

            // Client relationships
            modelBuilder.Entity<Client>()
                .HasMany(c => c.Documents)
                .WithOne(cd => cd.Client)
                .HasForeignKey(cd => cd.ClientId);

            modelBuilder.Entity<Client>()
                .HasMany(c => c.Appointments)
                .WithOne(a => a.Client)
                .HasForeignKey(a => a.ClientId);

            modelBuilder.Entity<Client>()
                .HasMany(c => c.PaymentPlans)
                .WithOne(pp => pp.Client)
                .HasForeignKey(pp => pp.ClientId);

            modelBuilder.Entity<Client>()
                .HasMany(c => c.Notes)
                .WithOne(cn => cn.Client)
                .HasForeignKey(cn => cn.ClientId);

            // PaymentPlan relationships
            modelBuilder.Entity<PaymentPlan>()
                .HasMany(pp => pp.Installments)
                .WithOne(pi => pi.PaymentPlan)
                .HasForeignKey(pi => pi.PaymentPlanId);

            // Appointment relationships
            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.Confirmation)
                .WithOne(ac => ac.Appointment)
                .HasForeignKey<AppointmentConfirmation>(ac => ac.AppointmentId);

            // Configure enum conversions
            modelBuilder.Entity<User>()
                .Property(u => u.Role)
                .HasConversion<string>();

            modelBuilder.Entity<Appointment>()
                .Property(a => a.Priority)
                .HasConversion<string>();

            // Configure column mappings to match PostgreSQL naming
            ConfigureColumnNames(modelBuilder);
        }

        private void ConfigureColumnNames(ModelBuilder modelBuilder)
        {
            // User entity
            modelBuilder.Entity<User>()
                .Property(u => u.FullName).HasColumnName("full_name");
            modelBuilder.Entity<User>()
                .Property(u => u.PasswordHash).HasColumnName("password_hash");
            modelBuilder.Entity<User>()
                .Property(u => u.IsActive).HasColumnName("is_active");
            modelBuilder.Entity<User>()
                .Property(u => u.CreatedAt).HasColumnName("created_at");

            // LawFirm entity
            modelBuilder.Entity<LawFirm>()
                .Property(lf => lf.CreatedAt).HasColumnName("created_at");

            // UserLawFirm entity
            modelBuilder.Entity<UserLawFirm>()
                .Property(ul => ul.UserId).HasColumnName("user_id");
            modelBuilder.Entity<UserLawFirm>()
                .Property(ul => ul.LawFirmId).HasColumnName("law_firm_id");

            // Client entity
            modelBuilder.Entity<Client>()
                .Property(c => c.LawFirmId).HasColumnName("law_firm_id");
            modelBuilder.Entity<Client>()
                .Property(c => c.FullName).HasColumnName("full_name");
            modelBuilder.Entity<Client>()
                .Property(c => c.ProcessType).HasColumnName("process_type");
            modelBuilder.Entity<Client>()
                .Property(c => c.CaseNumber).HasColumnName("case_number");
            modelBuilder.Entity<Client>()
                .Property(c => c.ProcessStatus).HasColumnName("process_status");
            modelBuilder.Entity<Client>()
                .Property(c => c.CreatedAt).HasColumnName("created_at");

            // ClientDocument entity
            modelBuilder.Entity<ClientDocument>()
                .Property(cd => cd.ClientId).HasColumnName("client_id");
            modelBuilder.Entity<ClientDocument>()
                .Property(cd => cd.DocumentType).HasColumnName("document_type");
            modelBuilder.Entity<ClientDocument>()
                .Property(cd => cd.FileUrl).HasColumnName("file_url");
            modelBuilder.Entity<ClientDocument>()
                .Property(cd => cd.UploadedBy).HasColumnName("uploaded_by");
            modelBuilder.Entity<ClientDocument>()
                .Property(cd => cd.UploadedAt).HasColumnName("uploaded_at");
            modelBuilder.Entity<ClientDocument>()
                .Property(cd => cd.IsCurrent).HasColumnName("is_current");

            // Appointment entity
            modelBuilder.Entity<Appointment>()
                .Property(a => a.ClientId).HasColumnName("client_id");
            modelBuilder.Entity<Appointment>()
                .Property(a => a.LawFirmId).HasColumnName("law_firm_id");
            modelBuilder.Entity<Appointment>()
                .Property(a => a.AppointmentType).HasColumnName("appointment_type");
            modelBuilder.Entity<Appointment>()
                .Property(a => a.AppointmentDate).HasColumnName("appointment_date");
            modelBuilder.Entity<Appointment>()
                .Property(a => a.CreatedBy).HasColumnName("created_by");
            modelBuilder.Entity<Appointment>()
                .Property(a => a.CreatedAt).HasColumnName("created_at");

            // AppointmentConfirmation entity
            modelBuilder.Entity<AppointmentConfirmation>()
                .Property(ac => ac.AppointmentId).HasColumnName("appointment_id");
            modelBuilder.Entity<AppointmentConfirmation>()
                .Property(ac => ac.ConfirmedByClient).HasColumnName("confirmed_by_client");
            modelBuilder.Entity<AppointmentConfirmation>()
                .Property(ac => ac.ConfirmedAt).HasColumnName("confirmed_at");

            // Payment entity
            modelBuilder.Entity<Payment>()
                .Property(p => p.ClientId).HasColumnName("client_id");
            modelBuilder.Entity<Payment>()
                .Property(p => p.LawFirmId).HasColumnName("law_firm_id");
            modelBuilder.Entity<Payment>()
                .Property(p => p.DueDate).HasColumnName("due_date");
            modelBuilder.Entity<Payment>()
                .Property(p => p.PaidDate).HasColumnName("paid_date");

            // PaymentPlan entity
            modelBuilder.Entity<PaymentPlan>()
                .Property(pp => pp.ClientId).HasColumnName("client_id");
            modelBuilder.Entity<PaymentPlan>()
                .Property(pp => pp.TotalAmount).HasColumnName("total_amount");
            modelBuilder.Entity<PaymentPlan>()
                .Property(pp => pp.CreatedAt).HasColumnName("created_at");

            // PaymentInstallment entity
            modelBuilder.Entity<PaymentInstallment>()
                .Property(pi => pi.PaymentPlanId).HasColumnName("payment_plan_id");
            modelBuilder.Entity<PaymentInstallment>()
                .Property(pi => pi.DueDate).HasColumnName("due_date");
            modelBuilder.Entity<PaymentInstallment>()
                .Property(pi => pi.PaidAt).HasColumnName("paid_at");

            // ClientNote entity
            modelBuilder.Entity<ClientNote>()
                .Property(cn => cn.ClientId).HasColumnName("client_id");
            modelBuilder.Entity<ClientNote>()
                .Property(cn => cn.CreatedBy).HasColumnName("created_by");
            modelBuilder.Entity<ClientNote>()
                .Property(cn => cn.IsImportant).HasColumnName("is_important");
            modelBuilder.Entity<ClientNote>()
                .Property(cn => cn.CreatedAt).HasColumnName("created_at");
            modelBuilder.Entity<ClientNote>()
                .Property(cn => cn.UpdatedAt).HasColumnName("updated_at");

            // Message entity
            modelBuilder.Entity<Message>()
                .Property(m => m.SenderId).HasColumnName("sender_id");
            modelBuilder.Entity<Message>()
                .Property(m => m.RecipientId).HasColumnName("recipient_id");
            modelBuilder.Entity<Message>()
                .Property(m => m.MessageText).HasColumnName("message");
            modelBuilder.Entity<Message>()
                .Property(m => m.SentAt).HasColumnName("sent_at");
            modelBuilder.Entity<Message>()
                .Property(m => m.IsRead).HasColumnName("is_read");

            // AuditLog entity
            modelBuilder.Entity<AuditLog>()
                .Property(al => al.UserId).HasColumnName("user_id");
            modelBuilder.Entity<AuditLog>()
                .Property(al => al.EntityType).HasColumnName("entity_type");
            modelBuilder.Entity<AuditLog>()
                .Property(al => al.EntityId).HasColumnName("entity_id");
        }
    }
}
