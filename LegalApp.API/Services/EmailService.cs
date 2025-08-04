namespace LegalApp.API.Services
{
    public interface IEmailService
    {
        Task SendEmailAsync(string to, string subject, string body, bool isHtml = false);
        Task SendAppointmentReminderAsync(string clientEmail, string clientName, DateTime appointmentDate, string appointmentType);
        Task SendPaymentReminderAsync(string clientEmail, string clientName, decimal amount, DateTime dueDate);
        Task SendWelcomeEmailAsync(string clientEmail, string clientName, string caseNumber);
        Task SendDocumentReceivedEmailAsync(string clientEmail, string clientName, string documentType);
    }

    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public async Task SendEmailAsync(string to, string subject, string body, bool isHtml = false)
        {
            try
            {
                // En desarrollo, solo log del email
                if (_configuration.GetValue<bool>("EmailSettings:DevelopmentMode", true))
                {
                    _logger.LogInformation($"[EMAIL SIMULATION] To: {to}, Subject: {subject}, Body: {body}");
                    await Task.CompletedTask;
                    return;
                }

                // Aquí implementarías el envío real con SendGrid, SMTP, etc.
                // Por ahora simulamos el envío
                _logger.LogInformation($"Email sent to {to} with subject: {subject}");
                await Task.Delay(100); // Simular envío
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error sending email to {to}");
                throw;
            }
        }

        public async Task SendAppointmentReminderAsync(string clientEmail, string clientName, DateTime appointmentDate, string appointmentType)
        {
            var subject = "Recordatorio de Cita - ImmigraX Legal Services";
            var body = $@"
                Estimado/a {clientName},

                Le recordamos que tiene una cita programada:

                📅 Fecha: {appointmentDate:dddd, dd 'de' MMMM 'de' yyyy}
                🕐 Hora: {appointmentDate:hh:mm tt}
                📋 Tipo: {appointmentType}

                Por favor, confirme su asistencia respondiendo a este email.

                Si necesita reprogramar, contáctenos con al menos 24 horas de anticipación.

                Atentamente,
                ImmigraX Legal Services
                ";

            await SendEmailAsync(clientEmail, subject, body);
        }

        public async Task SendPaymentReminderAsync(string clientEmail, string clientName, decimal amount, DateTime dueDate)
        {
            var subject = "Recordatorio de Pago - ImmigraX Legal Services";
            var body = $@"
                        Estimado/a {clientName},

                        Le recordamos que tiene un pago pendiente:

                        💰 Monto: ${amount:F2}
                        📅 Fecha de vencimiento: {dueDate:dd 'de' MMMM 'de' yyyy}

                        Para realizar su pago, puede:
                        - Visitarnos en nuestras oficinas
                        - Realizar transferencia bancaria
                        - Contactarnos para coordinar el pago

                        Si ya realizó el pago, puede ignorar este mensaje.

                        Atentamente,
                        ImmigraX Legal Services
                        ";

            await SendEmailAsync(clientEmail, subject, body);
        }

        public async Task SendWelcomeEmailAsync(string clientEmail, string clientName, string caseNumber)
        {
            var subject = "Bienvenido/a a ImmigraX Legal Services";
            var body = $@"
                        Estimado/a {clientName},

                        ¡Bienvenido/a a ImmigraX Legal Services!

                        Su caso ha sido registrado exitosamente:
                        📋 Número de caso: {caseNumber}

                        Nuestro equipo estará trabajando en su proceso migratorio y le mantendremos informado/a de todos los avances.

                        Puede contactarnos en cualquier momento si tiene preguntas o inquietudes.

                        Atentamente,
                        ImmigraX Legal Services
                        ";

            await SendEmailAsync(clientEmail, subject, body);
        }

        public async Task SendDocumentReceivedEmailAsync(string clientEmail, string clientName, string documentType)
        {
            var subject = "Documento Recibido - ImmigraX Legal Services";
            var body = $@"
                        Estimado/a {clientName},

                        Hemos recibido exitosamente su documento:
                        📄 Tipo de documento: {documentType}
                        📅 Fecha de recepción: {DateTime.Now:dd 'de' MMMM 'de' yyyy}

                        Nuestro equipo revisará el documento y le contactaremos si necesitamos información adicional.

                        Atentamente,
                        ImmigraX Legal Services
                        ";

            await SendEmailAsync(clientEmail, subject, body);
        }
    }
}
