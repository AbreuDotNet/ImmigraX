using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LegalApp.API.Migrations
{
    /// <inheritdoc />
    public partial class AddFormsSystem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "form_templates",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    FormType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ProcessType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Version = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    LawFirmId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_form_templates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_form_templates_law_firms_LawFirmId",
                        column: x => x.LawFirmId,
                        principalTable: "law_firms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_form_templates_users_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "client_forms",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ClientId = table.Column<Guid>(type: "uuid", nullable: false),
                    FormTemplateId = table.Column<Guid>(type: "uuid", nullable: false),
                    FormTitle = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    AccessToken = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    SubmittedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ReviewedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ReviewedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    CompletionPercentage = table.Column<decimal>(type: "numeric(5,2)", nullable: false),
                    Instructions = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_client_forms", x => x.Id);
                    table.ForeignKey(
                        name: "FK_client_forms_clients_ClientId",
                        column: x => x.ClientId,
                        principalTable: "clients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_client_forms_form_templates_FormTemplateId",
                        column: x => x.FormTemplateId,
                        principalTable: "form_templates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_client_forms_users_ReviewedBy",
                        column: x => x.ReviewedBy,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "form_required_documents",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FormTemplateId = table.Column<Guid>(type: "uuid", nullable: false),
                    DocumentType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    DocumentName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    IsRequired = table.Column<bool>(type: "boolean", nullable: false),
                    AcceptedFormats = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    MaxFileSize = table.Column<int>(type: "integer", nullable: false),
                    DocumentOrder = table.Column<int>(type: "integer", nullable: false),
                    ConditionalLogic = table.Column<string>(type: "jsonb", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_form_required_documents", x => x.Id);
                    table.ForeignKey(
                        name: "FK_form_required_documents_form_templates_FormTemplateId",
                        column: x => x.FormTemplateId,
                        principalTable: "form_templates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "form_sections",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FormTemplateId = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    SectionOrder = table.Column<int>(type: "integer", nullable: false),
                    IsRequired = table.Column<bool>(type: "boolean", nullable: false),
                    DependsOnSectionId = table.Column<Guid>(type: "uuid", nullable: true),
                    ConditionalLogic = table.Column<string>(type: "jsonb", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_form_sections", x => x.Id);
                    table.ForeignKey(
                        name: "FK_form_sections_form_sections_DependsOnSectionId",
                        column: x => x.DependsOnSectionId,
                        principalTable: "form_sections",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_form_sections_form_templates_FormTemplateId",
                        column: x => x.FormTemplateId,
                        principalTable: "form_templates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "form_audit_log",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ClientFormId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: true),
                    Action = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    FieldName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    OldValue = table.Column<string>(type: "text", nullable: true),
                    NewValue = table.Column<string>(type: "text", nullable: true),
                    IpAddress = table.Column<string>(type: "text", nullable: true),
                    UserAgent = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_form_audit_log", x => x.Id);
                    table.ForeignKey(
                        name: "FK_form_audit_log_client_forms_ClientFormId",
                        column: x => x.ClientFormId,
                        principalTable: "client_forms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_form_audit_log_users_UserId",
                        column: x => x.UserId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "form_notifications",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ClientFormId = table.Column<Guid>(type: "uuid", nullable: false),
                    NotificationType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    RecipientEmail = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Subject = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Message = table.Column<string>(type: "text", nullable: false),
                    SentAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    OpenedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ClickedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_form_notifications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_form_notifications_client_forms_ClientFormId",
                        column: x => x.ClientFormId,
                        principalTable: "client_forms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "client_form_documents",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ClientFormId = table.Column<Guid>(type: "uuid", nullable: false),
                    RequiredDocumentId = table.Column<Guid>(type: "uuid", nullable: true),
                    DocumentType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    OriginalFilename = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    StoredFilename = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    FilePath = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    FileSize = table.Column<int>(type: "integer", nullable: false),
                    MimeType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    IsVerified = table.Column<bool>(type: "boolean", nullable: false),
                    VerifiedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    VerifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UploadNotes = table.Column<string>(type: "text", nullable: true),
                    UploadedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_client_form_documents", x => x.Id);
                    table.ForeignKey(
                        name: "FK_client_form_documents_client_forms_ClientFormId",
                        column: x => x.ClientFormId,
                        principalTable: "client_forms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_client_form_documents_form_required_documents_RequiredDocum~",
                        column: x => x.RequiredDocumentId,
                        principalTable: "form_required_documents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_client_form_documents_users_VerifiedBy",
                        column: x => x.VerifiedBy,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "form_fields",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SectionId = table.Column<Guid>(type: "uuid", nullable: false),
                    FieldName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    FieldLabel = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    FieldType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    FieldOrder = table.Column<int>(type: "integer", nullable: false),
                    IsRequired = table.Column<bool>(type: "boolean", nullable: false),
                    ValidationRules = table.Column<string>(type: "jsonb", nullable: true),
                    Options = table.Column<string>(type: "jsonb", nullable: true),
                    Placeholder = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    HelpText = table.Column<string>(type: "text", nullable: true),
                    ConditionalLogic = table.Column<string>(type: "jsonb", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_form_fields", x => x.Id);
                    table.ForeignKey(
                        name: "FK_form_fields_form_sections_SectionId",
                        column: x => x.SectionId,
                        principalTable: "form_sections",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "form_responses",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ClientFormId = table.Column<Guid>(type: "uuid", nullable: false),
                    FieldId = table.Column<Guid>(type: "uuid", nullable: false),
                    FieldName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ResponseValue = table.Column<string>(type: "text", nullable: true),
                    ResponseData = table.Column<string>(type: "jsonb", nullable: true),
                    IsVerified = table.Column<bool>(type: "boolean", nullable: false),
                    VerifiedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    VerifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_form_responses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_form_responses_client_forms_ClientFormId",
                        column: x => x.ClientFormId,
                        principalTable: "client_forms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_form_responses_form_fields_FieldId",
                        column: x => x.FieldId,
                        principalTable: "form_fields",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_form_responses_users_VerifiedBy",
                        column: x => x.VerifiedBy,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_client_form_documents_ClientFormId",
                table: "client_form_documents",
                column: "ClientFormId");

            migrationBuilder.CreateIndex(
                name: "IX_client_form_documents_RequiredDocumentId",
                table: "client_form_documents",
                column: "RequiredDocumentId");

            migrationBuilder.CreateIndex(
                name: "IX_client_form_documents_VerifiedBy",
                table: "client_form_documents",
                column: "VerifiedBy");

            migrationBuilder.CreateIndex(
                name: "IX_client_forms_AccessToken",
                table: "client_forms",
                column: "AccessToken",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_client_forms_ClientId",
                table: "client_forms",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_client_forms_FormTemplateId",
                table: "client_forms",
                column: "FormTemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_client_forms_ReviewedBy",
                table: "client_forms",
                column: "ReviewedBy");

            migrationBuilder.CreateIndex(
                name: "IX_form_audit_log_ClientFormId",
                table: "form_audit_log",
                column: "ClientFormId");

            migrationBuilder.CreateIndex(
                name: "IX_form_audit_log_UserId",
                table: "form_audit_log",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_form_fields_SectionId",
                table: "form_fields",
                column: "SectionId");

            migrationBuilder.CreateIndex(
                name: "IX_form_notifications_ClientFormId",
                table: "form_notifications",
                column: "ClientFormId");

            migrationBuilder.CreateIndex(
                name: "IX_form_required_documents_FormTemplateId",
                table: "form_required_documents",
                column: "FormTemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_form_responses_ClientFormId_FieldId",
                table: "form_responses",
                columns: new[] { "ClientFormId", "FieldId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_form_responses_FieldId",
                table: "form_responses",
                column: "FieldId");

            migrationBuilder.CreateIndex(
                name: "IX_form_responses_VerifiedBy",
                table: "form_responses",
                column: "VerifiedBy");

            migrationBuilder.CreateIndex(
                name: "IX_form_sections_DependsOnSectionId",
                table: "form_sections",
                column: "DependsOnSectionId");

            migrationBuilder.CreateIndex(
                name: "IX_form_sections_FormTemplateId",
                table: "form_sections",
                column: "FormTemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_form_templates_CreatedBy",
                table: "form_templates",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_form_templates_LawFirmId",
                table: "form_templates",
                column: "LawFirmId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "client_form_documents");

            migrationBuilder.DropTable(
                name: "form_audit_log");

            migrationBuilder.DropTable(
                name: "form_notifications");

            migrationBuilder.DropTable(
                name: "form_responses");

            migrationBuilder.DropTable(
                name: "form_required_documents");

            migrationBuilder.DropTable(
                name: "client_forms");

            migrationBuilder.DropTable(
                name: "form_fields");

            migrationBuilder.DropTable(
                name: "form_sections");

            migrationBuilder.DropTable(
                name: "form_templates");
        }
    }
}
