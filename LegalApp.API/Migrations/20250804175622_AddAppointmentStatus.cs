using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LegalApp.API.Migrations
{
    /// <inheritdoc />
    public partial class AddAppointmentStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "appointments",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Status",
                table: "appointments");
        }
    }
}
