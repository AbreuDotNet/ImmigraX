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
  Badge,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Label as LabelIcon,
  TrendingUp as TrendingUpIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { HexColorPicker } from 'react-colorful';
import { 
  DocumentTag, 
  CreateDocumentTagDto
} from '../../types';
import documentPermissionService from '../../services/documentPermissionService';

interface DocumentTagManagerProps {
  open: boolean;
  onClose: () => void;
  onTagsChanged?: () => void;
}

const PREDEFINED_COLORS = [
  '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5',
  '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50',
  '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800',
  '#ff5722', '#795548', '#9e9e9e', '#607d8b'
];

const DocumentTagManager: React.FC<DocumentTagManagerProps> = ({
  open,
  onClose,
  onTagsChanged
}) => {
  const [tags, setTags] = useState<DocumentTag[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingTag, setEditingTag] = useState<DocumentTag | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [formData, setFormData] = useState<CreateDocumentTagDto>({
    name: '',
    color: '#2196f3',
    isSystemTag: false,
  });

  useEffect(() => {
    if (open) {
      loadTags();
    }
  }, [open]);

  const loadTags = async () => {
    try {
      setLoading(true);
      const tagList = await documentPermissionService.getTags();
      setTags(tagList.sort((a, b) => {
        // Sistema tags primero, luego por uso descendente
        if (a.isSystemTag !== b.isSystemTag) {
          return a.isSystemTag ? -1 : 1;
        }
        return b.usageCount - a.usageCount;
      }));
    } catch (err) {
      setError('Error al cargar etiquetas');
      console.error('Error loading tags:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTag = async () => {
    try {
      setSaving(true);
      
      if (editingTag) {
        await documentPermissionService.updateTag(editingTag.id, formData);
      } else {
        await documentPermissionService.createTag(formData);
      }
      
      await loadTags();
      handleCancelForm();
      onTagsChanged?.();
    } catch (err) {
      setError('Error al guardar etiqueta');
      console.error('Error saving tag:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTag = async (tagId: string, tagName: string, usageCount: number) => {
    if (usageCount > 0) {
      alert(`No se puede eliminar la etiqueta "${tagName}" porque está siendo usada en ${usageCount} documento${usageCount !== 1 ? 's' : ''}.`);
      return;
    }

    if (!window.confirm(`¿Está seguro de eliminar la etiqueta "${tagName}"?`)) {
      return;
    }

    try {
      setSaving(true);
      await documentPermissionService.deleteTag(tagId);
      await loadTags();
      onTagsChanged?.();
    } catch (err) {
      setError('Error al eliminar etiqueta');
      console.error('Error deleting tag:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleEditTag = (tag: DocumentTag) => {
    setEditingTag(tag);
    setFormData({
      name: tag.name,
      color: tag.color,
      isSystemTag: tag.isSystemTag,
    });
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setEditingTag(null);
    setFormData({
      name: '',
      color: '#2196f3',
      isSystemTag: false,
    });
    setShowForm(false);
    setShowColorPicker(false);
  };

  const handleColorSelect = (color: string) => {
    setFormData(prev => ({ ...prev, color }));
    setShowColorPicker(false);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <LabelIcon />
            <Typography variant="h6">
              Gestionar Etiquetas de Documentos
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => setShowForm(true)}
            disabled={saving}
          >
            Nueva Etiqueta
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Formulario para crear/editar etiqueta */}
        {showForm && (
          <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              {editingTag ? 'Editar Etiqueta' : 'Nueva Etiqueta'}
            </Typography>
            
            <Box display="flex" flexDirection="column" gap={2}>
              <TextField
                label="Nombre de la Etiqueta"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                size="small"
                required
                helperText="Máximo 50 caracteres"
                inputProps={{ maxLength: 50 }}
              />
              
              <Box>
                <Typography variant="body2" gutterBottom>
                  Color de la Etiqueta
                </Typography>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
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
                  <Chip
                    label="Vista previa"
                    size="small"
                    sx={{
                      backgroundColor: formData.color,
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  />
                </Box>
                
                {/* Colores predefinidos */}
                <Typography variant="caption" color="textSecondary" gutterBottom>
                  Colores sugeridos:
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={0.5} mb={1}>
                  {PREDEFINED_COLORS.map(color => (
                    <Box
                      key={color}
                      sx={{
                        width: 20,
                        height: 20,
                        backgroundColor: color,
                        borderRadius: '50%',
                        cursor: 'pointer',
                        border: formData.color === color ? '2px solid #000' : '1px solid #ccc',
                      }}
                      onClick={() => handleColorSelect(color)}
                    />
                  ))}
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
                  onClick={handleSaveTag}
                  disabled={saving || !formData.name.trim()}
                  startIcon={saving ? <CircularProgress size={20} /> : null}
                >
                  {editingTag ? 'Actualizar' : 'Crear'}
                </Button>
              </Box>
            </Box>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Lista de etiquetas */}
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Etiquetas Existentes ({tags.length})
          </Typography>
          
          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : tags.length === 0 ? (
            <Alert severity="info">
              No hay etiquetas creadas aún.
            </Alert>
          ) : (
            <List>
              {tags.map((tag) => (
                <ListItem key={tag.id} divider>
                  <ListItemIcon>
                    {tag.isSystemTag ? <SettingsIcon /> : <LabelIcon />}
                  </ListItemIcon>
                  
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Chip
                          label={tag.name}
                          size="small"
                          sx={{
                            backgroundColor: tag.color,
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                        />
                        {tag.isSystemTag && (
                          <Chip
                            icon={<SettingsIcon />}
                            label="Sistema"
                            size="small"
                            color="info"
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="caption" color="textSecondary">
                          Creada: {new Date(tag.createdAt).toLocaleDateString()}
                        </Typography>
                        <Badge badgeContent={tag.usageCount} color="primary">
                          <TrendingUpIcon fontSize="small" color="action" />
                        </Badge>
                        <Typography variant="caption" color="textSecondary">
                          {tag.usageCount} uso{tag.usageCount !== 1 ? 's' : ''}
                        </Typography>
                      </Box>
                    }
                  />
                  
                  <ListItemSecondaryAction>
                    <Box display="flex" gap={1}>
                      {!tag.isSystemTag && (
                        <>
                          <Tooltip title="Editar etiqueta">
                            <IconButton
                              edge="end"
                              size="small"
                              onClick={() => handleEditTag(tag)}
                              disabled={saving}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title={tag.usageCount > 0 ? `No se puede eliminar (${tag.usageCount} usos)` : 'Eliminar etiqueta'}>
                            <span>
                              <IconButton
                                edge="end"
                                size="small"
                                color="error"
                                onClick={() => handleDeleteTag(tag.id, tag.name, tag.usageCount)}
                                disabled={saving || tag.usageCount > 0}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </>
                      )}
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
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

export default DocumentTagManager;
