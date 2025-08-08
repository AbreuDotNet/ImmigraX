using System.ComponentModel.DataAnnotations;

namespace LegalApp.API.DTOs
{
    // DTO para crear una categoría de documentos
    public class CreateDocumentCategoryDto
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [MaxLength(500)]
        public string? Description { get; set; }
        
        [MaxLength(30)]
        public string Color { get; set; } = "#2196f3";
        
        [MaxLength(50)]
        public string? Icon { get; set; }
        
        public int SortOrder { get; set; } = 0;
        
        public Guid? ParentCategoryId { get; set; }
    }
    
    // DTO para actualizar una categoría
    public class UpdateDocumentCategoryDto
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [MaxLength(500)]
        public string? Description { get; set; }
        
        [MaxLength(30)]
        public string Color { get; set; } = "#2196f3";
        
        [MaxLength(50)]
        public string? Icon { get; set; }
        
        public int SortOrder { get; set; } = 0;
        
        public bool IsActive { get; set; } = true;
        
        public Guid? ParentCategoryId { get; set; }
    }
    
    // DTO para respuesta con información completa de la categoría
    public class DocumentCategoryDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Color { get; set; } = string.Empty;
        public string? Icon { get; set; }
        public int SortOrder { get; set; }
        public bool IsActive { get; set; }
        public Guid? ParentCategoryId { get; set; }
        public string? ParentCategoryName { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        
        // Categorías hijas (para jerarquía)
        public List<DocumentCategoryDto> SubCategories { get; set; } = [];
        
        // Contador de documentos en esta categoría
        public int DocumentCount { get; set; }
    }
    
    // DTO simplificado para dropdowns y listas
    public class DocumentCategorySimpleDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty;
        public string? Icon { get; set; }
        public Guid? ParentCategoryId { get; set; }
        public string? ParentPath { get; set; } // "Parent > Child" para mostrar jerarquía
    }
}
