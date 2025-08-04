using iTextSharp.text;
using iTextSharp.text.pdf;
using LegalApp.API.Data;
using LegalApp.API.Models;
using Microsoft.EntityFrameworkCore;
using System.Text;

namespace LegalApp.API.Services
{
    public interface IReportService
    {
        Task<byte[]> GenerateClientReportAsync(Guid clientId);
        Task<byte[]> GeneratePaymentInvoiceAsync(Guid paymentId);
        Task<byte[]> GenerateMonthlyReportAsync(Guid lawFirmId, int year, int month);
        Task<byte[]> GenerateAppointmentListAsync(Guid lawFirmId, DateTime startDate, DateTime endDate);
    }

    public class ReportService : IReportService
    {
        private readonly LegalAppDbContext _context;
        private readonly ILogger<ReportService> _logger;

        public ReportService(LegalAppDbContext context, ILogger<ReportService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<byte[]> GenerateClientReportAsync(Guid clientId)
        {
            try
            {
                var client = await _context.Clients
                    .Include(c => c.LawFirm)
                    .FirstOrDefaultAsync(c => c.Id == clientId);

                if (client == null)
                    throw new ArgumentException("Cliente no encontrado");

                var appointments = await _context.Appointments
                    .Where(a => a.ClientId == clientId)
                    .OrderByDescending(a => a.AppointmentDate)
                    .ToListAsync();

                var payments = await _context.Payments
                    .Where(p => p.ClientId == clientId)
                    .OrderByDescending(p => p.DueDate)
                    .ToListAsync();

                var documents = await _context.ClientDocuments
                    .Where(d => d.ClientId == clientId)
                    .OrderByDescending(d => d.UploadedAt)
                    .ToListAsync();

                var notes = await _context.ClientNotes
                    .Include(n => n.CreatedByUser)
                    .Where(n => n.ClientId == clientId)
                    .OrderByDescending(n => n.CreatedAt)
                    .ToListAsync();

                return GenerateClientPDF(client, appointments, payments, documents, notes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error generating client report for {clientId}");
                throw;
            }
        }

        public async Task<byte[]> GeneratePaymentInvoiceAsync(Guid paymentId)
        {
            try
            {
                var payment = await _context.Payments
                    .Include(p => p.Client)
                    .Include(p => p.LawFirm)
                    .FirstOrDefaultAsync(p => p.Id == paymentId);

                if (payment == null)
                    throw new ArgumentException("Pago no encontrado");

                return GenerateInvoicePDF(payment);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error generating invoice for payment {paymentId}");
                throw;
            }
        }

        public async Task<byte[]> GenerateMonthlyReportAsync(Guid lawFirmId, int year, int month)
        {
            try
            {
                var startDate = new DateTime(year, month, 1);
                var endDate = startDate.AddMonths(1).AddDays(-1);

                var lawFirm = await _context.LawFirms.FirstOrDefaultAsync(lf => lf.Id == lawFirmId);
                var clients = await _context.Clients.Where(c => c.LawFirmId == lawFirmId).ToListAsync();
                var appointments = await _context.Appointments
                    .Include(a => a.Client)
                    .Where(a => a.LawFirmId == lawFirmId && a.AppointmentDate >= startDate && a.AppointmentDate <= endDate)
                    .ToListAsync();
                var payments = await _context.Payments
                    .Include(p => p.Client)
                    .Where(p => p.LawFirmId == lawFirmId && p.DueDate >= startDate && p.DueDate <= endDate)
                    .ToListAsync();

                return GenerateMonthlyPDF(lawFirm!, year, month, clients, appointments, payments);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error generating monthly report for {lawFirmId}");
                throw;
            }
        }

        public async Task<byte[]> GenerateAppointmentListAsync(Guid lawFirmId, DateTime startDate, DateTime endDate)
        {
            try
            {
                var appointments = await _context.Appointments
                    .Include(a => a.Client)
                    .Where(a => a.LawFirmId == lawFirmId && a.AppointmentDate >= startDate && a.AppointmentDate <= endDate)
                    .OrderBy(a => a.AppointmentDate)
                    .ToListAsync();

                return GenerateAppointmentListPDF(appointments, startDate, endDate);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error generating appointment list for {lawFirmId}");
                throw;
            }
        }

        private byte[] GenerateClientPDF(Client client, List<Appointment> appointments, List<Payment> payments, List<ClientDocument> documents, List<ClientNote> notes)
        {
            using var stream = new MemoryStream();
            var document = new Document(PageSize.A4, 50, 50, 25, 25);
            var writer = PdfWriter.GetInstance(document, stream);
            
            document.Open();

            // Header
            var titleFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 18, new BaseColor(0, 0, 255));
            var headerFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 14);
            var normalFont = FontFactory.GetFont(FontFactory.HELVETICA, 11);
            var smallFont = FontFactory.GetFont(FontFactory.HELVETICA, 9);

            document.Add(new Paragraph("REPORTE DE CLIENTE", titleFont) { Alignment = Element.ALIGN_CENTER });
            document.Add(new Paragraph($"{client.LawFirm.Name}", headerFont) { Alignment = Element.ALIGN_CENTER });
            document.Add(new Paragraph(" "));

            // Client Info
            document.Add(new Paragraph("INFORMACIÓN DEL CLIENTE", headerFont));
            document.Add(new Paragraph($"Nombre: {client.FullName}", normalFont));
            document.Add(new Paragraph($"Email: {client.Email}", normalFont));
            document.Add(new Paragraph($"Teléfono: {client.Phone}", normalFont));
            document.Add(new Paragraph($"Dirección: {client.Address}", normalFont));
            document.Add(new Paragraph($"Tipo de Proceso: {client.ProcessType}", normalFont));
            document.Add(new Paragraph($"Número de Caso: {client.CaseNumber}", normalFont));
            document.Add(new Paragraph($"Estado: {client.ProcessStatus}", normalFont));
            document.Add(new Paragraph($"Fecha de Registro: {client.CreatedAt:dd/MM/yyyy}", normalFont));
            document.Add(new Paragraph(" "));

            // Appointments
            if (appointments.Any())
            {
                document.Add(new Paragraph("HISTORIAL DE CITAS", headerFont));
                var appointmentTable = new PdfPTable(4) { WidthPercentage = 100 };
                appointmentTable.SetWidths(new float[] { 25f, 25f, 25f, 25f });
                
                appointmentTable.AddCell(new PdfPCell(new Phrase("Fecha", headerFont)) { BackgroundColor = new BaseColor(211, 211, 211) });
                appointmentTable.AddCell(new PdfPCell(new Phrase("Tipo", headerFont)) { BackgroundColor = new BaseColor(211, 211, 211) });
                appointmentTable.AddCell(new PdfPCell(new Phrase("Estado", headerFont)) { BackgroundColor = new BaseColor(211, 211, 211) });
                appointmentTable.AddCell(new PdfPCell(new Phrase("Descripción", headerFont)) { BackgroundColor = new BaseColor(211, 211, 211) });

                foreach (var appointment in appointments.Take(10))
                {
                    appointmentTable.AddCell(new Phrase(appointment.AppointmentDate.ToString("dd/MM/yyyy HH:mm"), smallFont));
                    appointmentTable.AddCell(new Phrase(appointment.AppointmentType, smallFont));
                    appointmentTable.AddCell(new Phrase("Programada", smallFont)); // appointment.Status ?? "Pendiente"
                    appointmentTable.AddCell(new Phrase(appointment.Description ?? "", smallFont));
                }

                document.Add(appointmentTable);
                document.Add(new Paragraph(" "));
            }

            // Payments Summary
            if (payments.Any())
            {
                document.Add(new Paragraph("RESUMEN DE PAGOS", headerFont));
                var totalAmount = payments.Sum(p => p.Amount);
                var paidAmount = payments.Where(p => p.Status == PaymentStatus.Paid).Sum(p => p.Amount);
                var pendingAmount = totalAmount - paidAmount;

                document.Add(new Paragraph($"Total Facturado: ${totalAmount:F2}", normalFont));
                document.Add(new Paragraph($"Total Pagado: ${paidAmount:F2}", normalFont));
                document.Add(new Paragraph($"Pendiente: ${pendingAmount:F2}", normalFont));
                document.Add(new Paragraph(" "));
            }

            // Recent Notes
            if (notes.Any())
            {
                document.Add(new Paragraph("NOTAS RECIENTES", headerFont));
                foreach (var note in notes.Take(5))
                {
                    document.Add(new Paragraph($"• {note.Title} ({note.CreatedAt:dd/MM/yyyy})", normalFont));
                    if (!string.IsNullOrEmpty(note.Content))
                    {
                        var content = note.Content.Length > 100 ? note.Content.Substring(0, 100) + "..." : note.Content;
                        document.Add(new Paragraph($"  {content}", smallFont));
                    }
                }
            }

            document.Close();
            return stream.ToArray();
        }

        private byte[] GenerateInvoicePDF(Payment payment)
        {
            using var stream = new MemoryStream();
            var document = new Document(PageSize.A4, 50, 50, 25, 25);
            var writer = PdfWriter.GetInstance(document, stream);
            
            document.Open();

            var titleFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 18, new BaseColor(0, 0, 255));
            var headerFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 14);
            var normalFont = FontFactory.GetFont(FontFactory.HELVETICA, 11);

            document.Add(new Paragraph("FACTURA", titleFont) { Alignment = Element.ALIGN_CENTER });
            document.Add(new Paragraph($"{payment.LawFirm.Name}", headerFont) { Alignment = Element.ALIGN_CENTER });
            document.Add(new Paragraph(" "));

            document.Add(new Paragraph($"Factura #: {payment.Id.ToString().Substring(0, 8).ToUpper()}", normalFont));
            document.Add(new Paragraph($"Fecha: {DateTime.Now:dd/MM/yyyy}", normalFont));
            document.Add(new Paragraph($"Cliente: {payment.Client.FullName}", normalFont));
            document.Add(new Paragraph($"Descripción: {payment.Description}", normalFont));
            document.Add(new Paragraph(" "));

            var table = new PdfPTable(3) { WidthPercentage = 100 };
            table.SetWidths(new float[] { 50f, 25f, 25f });
            
            table.AddCell(new PdfPCell(new Phrase("Descripción", headerFont)) { BackgroundColor = new BaseColor(211, 211, 211) });
            table.AddCell(new PdfPCell(new Phrase("Cantidad", headerFont)) { BackgroundColor = new BaseColor(211, 211, 211) });
            table.AddCell(new PdfPCell(new Phrase("Monto", headerFont)) { BackgroundColor = new BaseColor(211, 211, 211) });

            table.AddCell(new Phrase(payment.Description ?? "Servicios Legales", normalFont));
            table.AddCell(new Phrase("1", normalFont));
            table.AddCell(new Phrase($"${payment.Amount:F2}", normalFont));

            table.AddCell(new PdfPCell(new Phrase("TOTAL", headerFont)) { Colspan = 2, HorizontalAlignment = Element.ALIGN_RIGHT });
            table.AddCell(new PdfPCell(new Phrase($"${payment.Amount:F2}", headerFont)) { BackgroundColor = new BaseColor(255, 255, 0) });

            document.Add(table);

            document.Add(new Paragraph(" "));
            document.Add(new Paragraph($"Fecha de vencimiento: {payment.DueDate:dd/MM/yyyy}", normalFont));
            document.Add(new Paragraph($"Estado: {payment.Status}", normalFont));

            document.Close();
            return stream.ToArray();
        }

        private byte[] GenerateMonthlyPDF(LawFirm lawFirm, int year, int month, List<Client> clients, List<Appointment> appointments, List<Payment> payments)
        {
            using var stream = new MemoryStream();
            var document = new Document(PageSize.A4, 50, 50, 25, 25);
            var writer = PdfWriter.GetInstance(document, stream);
            
            document.Open();

            var titleFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 18, new BaseColor(0, 0, 255));
            var headerFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 14);
            var normalFont = FontFactory.GetFont(FontFactory.HELVETICA, 11);

            var monthName = new DateTime(year, month, 1).ToString("MMMM yyyy").ToUpper();
            document.Add(new Paragraph($"REPORTE MENSUAL - {monthName}", titleFont) { Alignment = Element.ALIGN_CENTER });
            document.Add(new Paragraph($"{lawFirm.Name}", headerFont) { Alignment = Element.ALIGN_CENTER });
            document.Add(new Paragraph(" "));

            // Summary
            document.Add(new Paragraph("RESUMEN EJECUTIVO", headerFont));
            document.Add(new Paragraph($"Total de Clientes: {clients.Count}", normalFont));
            document.Add(new Paragraph($"Citas del Mes: {appointments.Count}", normalFont));
            document.Add(new Paragraph($"Ingresos del Mes: ${payments.Where(p => p.Status == PaymentStatus.Paid).Sum(p => p.Amount):F2}", normalFont));
            document.Add(new Paragraph($"Pendiente de Cobro: ${payments.Where(p => p.Status == PaymentStatus.Pending).Sum(p => p.Amount):F2}", normalFont));
            document.Add(new Paragraph(" "));

            // Appointments
            if (appointments.Any())
            {
                document.Add(new Paragraph("CITAS DEL MES", headerFont));
                var appointmentsByDay = appointments.GroupBy(a => a.AppointmentDate.Date).OrderBy(g => g.Key);
                foreach (var dayGroup in appointmentsByDay.Take(10))
                {
                    document.Add(new Paragraph($"{dayGroup.Key:dd/MM/yyyy} - {dayGroup.Count()} citas", normalFont));
                }
                document.Add(new Paragraph(" "));
            }

            document.Close();
            return stream.ToArray();
        }

        private byte[] GenerateAppointmentListPDF(List<Appointment> appointments, DateTime startDate, DateTime endDate)
        {
            using var stream = new MemoryStream();
            var document = new Document(PageSize.A4, 50, 50, 25, 25);
            var writer = PdfWriter.GetInstance(document, stream);
            
            document.Open();

            var titleFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 18, new BaseColor(0, 0, 255));
            var headerFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 12);
            var normalFont = FontFactory.GetFont(FontFactory.HELVETICA, 10);

            document.Add(new Paragraph("LISTA DE CITAS", titleFont) { Alignment = Element.ALIGN_CENTER });
            document.Add(new Paragraph($"Del {startDate:dd/MM/yyyy} al {endDate:dd/MM/yyyy}", headerFont) { Alignment = Element.ALIGN_CENTER });
            document.Add(new Paragraph(" "));

            if (appointments.Any())
            {
                var table = new PdfPTable(4) { WidthPercentage = 100 };
                table.SetWidths(new float[] { 25f, 35f, 25f, 15f });
                
                table.AddCell(new PdfPCell(new Phrase("Fecha/Hora", headerFont)) { BackgroundColor = new BaseColor(211, 211, 211) });
                table.AddCell(new PdfPCell(new Phrase("Cliente", headerFont)) { BackgroundColor = new BaseColor(211, 211, 211) });
                table.AddCell(new PdfPCell(new Phrase("Tipo", headerFont)) { BackgroundColor = new BaseColor(211, 211, 211) });
                table.AddCell(new PdfPCell(new Phrase("Estado", headerFont)) { BackgroundColor = new BaseColor(211, 211, 211) });

                foreach (var appointment in appointments)
                {
                    table.AddCell(new Phrase(appointment.AppointmentDate.ToString("dd/MM/yyyy HH:mm"), normalFont));
                    table.AddCell(new Phrase(appointment.Client.FullName, normalFont));
                    table.AddCell(new Phrase(appointment.AppointmentType, normalFont));
                    table.AddCell(new Phrase("Programada", normalFont)); // appointment.Status ?? "Pendiente"
                }

                document.Add(table);
            }
            else
            {
                document.Add(new Paragraph("No hay citas programadas en este período.", normalFont));
            }

            document.Close();
            return stream.ToArray();
        }
    }
}
