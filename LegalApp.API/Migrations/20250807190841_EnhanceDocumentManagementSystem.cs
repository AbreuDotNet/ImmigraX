using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LegalApp.API.Migrations
{
    /// <inheritdoc />
    public partial class EnhanceDocumentManagementSystem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "document_type",
                table: "client_documents",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);

            migrationBuilder.AddColumn<string>(
                name: "AccessLevel",
                table: "client_documents",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "ArchivedAt",
                table: "client_documents",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ArchivedBy",
                table: "client_documents",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ArchivedByUserId",
                table: "client_documents",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CategoryId",
                table: "client_documents",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "client_documents",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FileHash",
                table: "client_documents",
                type: "character varying(64)",
                maxLength: 64,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FileName",
                table: "client_documents",
                type: "character varying(300)",
                maxLength: 300,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<long>(
                name: "FileSizeBytes",
                table: "client_documents",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsArchived",
                table: "client_documents",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "MimeType",
                table: "client_documents",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ModifiedAt",
                table: "client_documents",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Notes",
                table: "client_documents",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SearchableContent",
                table: "client_documents",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "VersionNotes",
                table: "client_documents",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "document_categories",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Color = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Icon = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    ParentCategoryId = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_document_categories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_document_categories_document_categories_ParentCategoryId",
                        column: x => x.ParentCategoryId,
                        principalTable: "document_categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "document_tags",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Color = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    IsSystemTag = table.Column<bool>(type: "boolean", nullable: false),
                    UsageCount = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_document_tags", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DocumentAccessControl",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DocumentId = table.Column<Guid>(type: "uuid", nullable: false),
                    AccessLevel = table.Column<int>(type: "integer", nullable: false),
                    AccessReason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DocumentAccessControl", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DocumentAccessControl_client_documents_DocumentId",
                        column: x => x.DocumentId,
                        principalTable: "client_documents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DocumentAccessControl_users_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "document_tag_assignments",
                columns: table => new
                {
                    DocumentId = table.Column<Guid>(type: "uuid", nullable: false),
                    TagId = table.Column<Guid>(type: "uuid", nullable: false),
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    AssignedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    AssignedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AssignedByUserId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_document_tag_assignments", x => new { x.DocumentId, x.TagId });
                    table.ForeignKey(
                        name: "FK_document_tag_assignments_client_documents_DocumentId",
                        column: x => x.DocumentId,
                        principalTable: "client_documents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_document_tag_assignments_document_tags_TagId",
                        column: x => x.TagId,
                        principalTable: "document_tags",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_document_tag_assignments_users_AssignedByUserId",
                        column: x => x.AssignedByUserId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "document_user_permissions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DocumentId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    CanView = table.Column<bool>(type: "boolean", nullable: false),
                    CanEdit = table.Column<bool>(type: "boolean", nullable: false),
                    CanDelete = table.Column<bool>(type: "boolean", nullable: false),
                    CanShare = table.Column<bool>(type: "boolean", nullable: false),
                    GrantedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    GrantedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    DocumentAccessControlId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_document_user_permissions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_document_user_permissions_DocumentAccessControl_DocumentAcc~",
                        column: x => x.DocumentAccessControlId,
                        principalTable: "DocumentAccessControl",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_document_user_permissions_client_documents_DocumentId",
                        column: x => x.DocumentId,
                        principalTable: "client_documents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_document_user_permissions_users_GrantedBy",
                        column: x => x.GrantedBy,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_document_user_permissions_users_UserId",
                        column: x => x.UserId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_client_documents_ArchivedByUserId",
                table: "client_documents",
                column: "ArchivedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_client_documents_CategoryId",
                table: "client_documents",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_document_categories_ParentCategoryId",
                table: "document_categories",
                column: "ParentCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_document_tag_assignments_AssignedByUserId",
                table: "document_tag_assignments",
                column: "AssignedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_document_tag_assignments_TagId",
                table: "document_tag_assignments",
                column: "TagId");

            migrationBuilder.CreateIndex(
                name: "IX_document_user_permissions_DocumentAccessControlId",
                table: "document_user_permissions",
                column: "DocumentAccessControlId");

            migrationBuilder.CreateIndex(
                name: "IX_document_user_permissions_DocumentId",
                table: "document_user_permissions",
                column: "DocumentId");

            migrationBuilder.CreateIndex(
                name: "IX_document_user_permissions_GrantedBy",
                table: "document_user_permissions",
                column: "GrantedBy");

            migrationBuilder.CreateIndex(
                name: "IX_document_user_permissions_UserId",
                table: "document_user_permissions",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentAccessControl_CreatedByUserId",
                table: "DocumentAccessControl",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentAccessControl_DocumentId",
                table: "DocumentAccessControl",
                column: "DocumentId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_client_documents_document_categories_CategoryId",
                table: "client_documents",
                column: "CategoryId",
                principalTable: "document_categories",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_client_documents_users_ArchivedByUserId",
                table: "client_documents",
                column: "ArchivedByUserId",
                principalTable: "users",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_client_documents_document_categories_CategoryId",
                table: "client_documents");

            migrationBuilder.DropForeignKey(
                name: "FK_client_documents_users_ArchivedByUserId",
                table: "client_documents");

            migrationBuilder.DropTable(
                name: "document_categories");

            migrationBuilder.DropTable(
                name: "document_tag_assignments");

            migrationBuilder.DropTable(
                name: "document_user_permissions");

            migrationBuilder.DropTable(
                name: "document_tags");

            migrationBuilder.DropTable(
                name: "DocumentAccessControl");

            migrationBuilder.DropIndex(
                name: "IX_client_documents_ArchivedByUserId",
                table: "client_documents");

            migrationBuilder.DropIndex(
                name: "IX_client_documents_CategoryId",
                table: "client_documents");

            migrationBuilder.DropColumn(
                name: "AccessLevel",
                table: "client_documents");

            migrationBuilder.DropColumn(
                name: "ArchivedAt",
                table: "client_documents");

            migrationBuilder.DropColumn(
                name: "ArchivedBy",
                table: "client_documents");

            migrationBuilder.DropColumn(
                name: "ArchivedByUserId",
                table: "client_documents");

            migrationBuilder.DropColumn(
                name: "CategoryId",
                table: "client_documents");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "client_documents");

            migrationBuilder.DropColumn(
                name: "FileHash",
                table: "client_documents");

            migrationBuilder.DropColumn(
                name: "FileName",
                table: "client_documents");

            migrationBuilder.DropColumn(
                name: "FileSizeBytes",
                table: "client_documents");

            migrationBuilder.DropColumn(
                name: "IsArchived",
                table: "client_documents");

            migrationBuilder.DropColumn(
                name: "MimeType",
                table: "client_documents");

            migrationBuilder.DropColumn(
                name: "ModifiedAt",
                table: "client_documents");

            migrationBuilder.DropColumn(
                name: "Notes",
                table: "client_documents");

            migrationBuilder.DropColumn(
                name: "SearchableContent",
                table: "client_documents");

            migrationBuilder.DropColumn(
                name: "VersionNotes",
                table: "client_documents");

            migrationBuilder.AlterColumn<string>(
                name: "document_type",
                table: "client_documents",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(200)",
                oldMaxLength: 200);
        }
    }
}
