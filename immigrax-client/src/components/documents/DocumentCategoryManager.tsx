import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  CircularProgress,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import { HexColorPicker } from 'react-colorful';
import { 
  DocumentCategory, 
  CreateDocumentCategoryDto
} from '../../types';
import documentPermissionService from '../../services/documentPermissionService';

interface DocumentCategoryManagerProps {
  open: boolean;
  onClose: () => void;
  onCategoriesChanged?: () => void;
}

const MATERIAL_ICONS = [
  'folder', 'folder_open', 'description', 'article', 'file_present',
  'assignment', 'gavel', 'balance', 'account_balance', 'business',
  'person', 'group', 'family_restroom', 'home', 'flight',
  'card_travel', 'work', 'school', 'medical_services', 'security'
];

const DocumentCategoryManager: React.FC<DocumentCategoryManagerProps> = ({
  open,
  onClose,
  onCategoriesChanged
}) => {
  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<DocumentCategory | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [formData, setFormData] = useState<CreateDocumentCategoryDto>({
    name: '',
    description: '',
    color: '#2196f3',
    icon: 'folder',
    sortOrder: 0,
    parentCategoryId: undefined,
  });

  useEffect(() => {
    if (open) {
      loadCategories();
    }
  }, [open]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const cats = await documentPermissionService.getCategories();
      setCategories(cats);
    } catch (err) {
      setError('Error al cargar categorías');
      console.error('Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCategory = async () => {
    try {
      setSaving(true);
      
      if (editingCategory) {
        await documentPermissionService.updateCategory(editingCategory.id, formData);
      } else {
        await documentPermissionService.createCategory(formData);
      }
      
      await loadCategories();
      handleCancelForm();
      onCategoriesChanged?.();
    } catch (err) {
      setError('Error al guardar categoría');
      console.error('Error saving category:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!window.confirm('¿Está seguro de eliminar esta categoría? Los documentos asignados quedarán sin categoría.')) {
      return;
    }

    try {
      setSaving(true);
      await documentPermissionService.deleteCategory(categoryId);
      await loadCategories();
      onCategoriesChanged?.();
    } catch (err) {
      setError('Error al eliminar categoría');
      console.error('Error deleting category:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleEditCategory = (category: DocumentCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      color: category.color,
      icon: category.icon || 'folder',
      sortOrder: category.sortOrder,
      parentCategoryId: category.parentCategoryId,
    });
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      color: '#2196f3',
      icon: 'folder',
      sortOrder: 0,
      parentCategoryId: undefined,
    });
    setShowForm(false);
    setShowColorPicker(false);
  };

  const buildCategoryHierarchy = (cats: DocumentCategory[], parentId?: string): DocumentCategory[] => {
    return cats
      .filter(cat => cat.parentCategoryId === parentId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  };

  const renderCategoryItem = (category: DocumentCategory, level: number = 0) => {
    const hasChildren = categories.some(cat => cat.parentCategoryId === category.id);
    const indent = level * 24;

    return (
      <React.Fragment key={category.id}>
        <ListItem sx={{ pl: `${16 + indent}px` }} divider>
          <ListItemIcon>
            {hasChildren ? <FolderOpenIcon /> : <FolderIcon />}
          </ListItemIcon>
          
          <ListItemText
            primary={
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="subtitle2">{category.name}</Typography>
                <Chip
                  size="small"
                  sx={{
                    backgroundColor: category.color,
                    color: 'white',
                    fontSize: '0.65rem',
                    height: 20,
                  }}
                  label={category.documentCount}
                />
                {!category.isActive && (
                  <Chip size="small" label="Inactiva" color="warning" />
                )}
              </Box>
            }
            secondary={
              <Box>
                {category.description && (
                  <Typography variant="caption" color="textSecondary">
                    {category.description}
                  </Typography>
                )}
                <Typography variant="caption" color="textSecondary" display="block">
                  {category.documentCount} documento{category.documentCount !== 1 ? 's' : ''}
                </Typography>
              </Box>
            }
          />
          
          <ListItemSecondaryAction>
            <Box display="flex" gap={1}>
              <Tooltip title="Editar categoría">
                <IconButton
                  edge="end"
                  size="small"
                  onClick={() => handleEditCategory(category)}
                  disabled={saving}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Eliminar categoría">
                <IconButton
                  edge="end"
                  size="small"
                  color="error"
                  onClick={() => handleDeleteCategory(category.id)}
                  disabled={saving || category.documentCount > 0}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </ListItemSecondaryAction>
        </ListItem>
        
        {/* Renderizar subcategorías */}
        {buildCategoryHierarchy(categories, category.id).map(subcat => 
          renderCategoryItem(subcat, level + 1)
        )}
      </React.Fragment>
    );
  };

  const rootCategories = buildCategoryHierarchy(categories);
  const availableParents = categories.filter(cat => 
    !editingCategory || cat.id !== editingCategory.id
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <CategoryIcon />
            <Typography variant="h6">
              Gestionar Categorías de Documentos
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => setShowForm(true)}
            disabled={saving}
          >
            Nueva Categoría
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Formulario para crear/editar categoría */}
        {showForm && (
          <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
            </Typography>
            
            <Box display="flex" flexDirection="column" gap={2}>
              <TextField
                label="Nombre de la Categoría"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                size="small"
                required
              />
              
              <TextField
                label="Descripción"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                size="small"
                multiline
                rows={2}
              />
              
              <FormControl size="small">
                <InputLabel>Categoría Padre</InputLabel>
                <Select
                  value={formData.parentCategoryId || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    parentCategoryId: e.target.value || undefined 
                  }))}
                  label="Categoría Padre"
                >
                  <MenuItem value="">
                    <em>Sin categoría padre (Raíz)</em>
                  </MenuItem>
                  {availableParents.map(cat => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Box display="flex" gap={2}>
                <Box flex={1}>
                  <Typography variant="body2" gutterBottom>
                    Color de la Categoría
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box
                      sx={{
                        width: 30,
                        height: 30,
                        backgroundColor: formData.color,
                        border: '1px solid #ccc',
                        borderRadius: 1,
                        cursor: 'pointer',
                      }}
                      onClick={() => setShowColorPicker(!showColorPicker)}
                    />
                    <TextField
                      size="small"
                      value={formData.color}
                      onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                      sx={{ width: 100 }}
                    />
                  </Box>
                  {showColorPicker && (
                    <Box sx={{ mt: 1 }}>
                      <HexColorPicker
                        color={formData.color}
                        onChange={(color: string) => setFormData(prev => ({ ...prev, color }))}
                      />
                    </Box>
                  )}
                </Box>
                
                <Box flex={1}>
                  <FormControl size="small" fullWidth>
                    <InputLabel>Ícono</InputLabel>
                    <Select
                      value={formData.icon}
                      onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                      label="Ícono"
                    >
                      {MATERIAL_ICONS.map(iconName => (
                        <MenuItem key={iconName} value={iconName}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <span className="material-icons" style={{ fontSize: 18 }}>
                              {iconName}
                            </span>
                            {iconName}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Box>
              
              <TextField
                label="Orden de Clasificación"
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  sortOrder: parseInt(e.target.value) || 0 
                }))}
                size="small"
              />
              
              <Box display="flex" gap={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  onClick={handleCancelForm}
                  disabled={saving}
                >
                  Cancelar
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSaveCategory}
                  disabled={saving || !formData.name.trim()}
                  startIcon={saving ? <CircularProgress size={20} /> : null}
                >
                  {editingCategory ? 'Actualizar' : 'Crear'}
                </Button>
              </Box>
            </Box>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Lista de categorías */}
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Categorías Existentes ({categories.length})
          </Typography>
          
          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : categories.length === 0 ? (
            <Alert severity="info">
              No hay categorías creadas aún.
            </Alert>
          ) : (
            <List>
              {rootCategories.map(category => renderCategoryItem(category))}
            </List>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DocumentCategoryManager;
