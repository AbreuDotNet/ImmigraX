import React, { useState } from 'react';
import {
  Box,
  Chip,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Checkbox,
} from '@mui/material';
import {
  Edit as EditIcon,
  Label as LabelIcon,
} from '@mui/icons-material';
import { DocumentTagSimple, DocumentTag } from '../../types';
import documentPermissionService from '../../services/documentPermissionService';

interface DocumentTagsDisplayProps {
  documentId: string;
  tags: DocumentTagSimple[];
  canEdit?: boolean;
  maxVisible?: number;
  size?: 'small' | 'medium';
  onTagsChanged?: () => void;
}

const DocumentTagsDisplay: React.FC<DocumentTagsDisplayProps> = ({
  documentId,
  tags,
  canEdit = false,
  maxVisible = 3,
  size = 'small',
  onTagsChanged
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [availableTags, setAvailableTags] = useState<DocumentTag[]>([]);
  const [loading, setLoading] = useState(false);

  const visibleTags = tags.slice(0, maxVisible);
  const remainingCount = tags.length - maxVisible;

  const handleEditClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!canEdit) return;
    
    setAnchorEl(event.currentTarget);
    
    try {
      setLoading(true);
      const allTags = await documentPermissionService.getTags();
      setAvailableTags(allTags);
    } catch (error) {
      console.error('Error loading tags:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleTagToggle = async (tagId: string, isAssigned: boolean) => {
    try {
      if (isAssigned) {
        await documentPermissionService.removeTagFromDocument(documentId, tagId);
      } else {
        await documentPermissionService.assignTagsToDocument(documentId, [tagId]);
      }
      onTagsChanged?.();
    } catch (error) {
      console.error('Error toggling tag:', error);
    }
  };

  const isTagAssigned = (tagId: string) => {
    return tags.some(tag => tag.id === tagId);
  };

  return (
    <Box display="flex" alignItems="center" gap={0.5} flexWrap="wrap">
      {/* Etiquetas visibles */}
      {visibleTags.map((tag) => (
        <Chip
          key={tag.id}
          icon={<LabelIcon />}
          label={tag.name}
          size={size}
          sx={{
            backgroundColor: tag.color,
            color: 'white',
            fontWeight: 'bold',
            '& .MuiChip-icon': {
              color: 'white',
            },
          }}
        />
      ))}

      {/* Indicador de etiquetas adicionales */}
      {remainingCount > 0 && (
        <Tooltip title={`${remainingCount} etiqueta${remainingCount !== 1 ? 's' : ''} más`}>
          <Chip
            label={`+${remainingCount}`}
            size={size}
            variant="outlined"
            sx={{ borderStyle: 'dashed' }}
          />
        </Tooltip>
      )}

      {/* Botón de edición */}
      {canEdit && (
        <Tooltip title="Editar etiquetas">
          <IconButton
            size="small"
            onClick={handleEditClick}
            sx={{ 
              width: size === 'small' ? 24 : 32, 
              height: size === 'small' ? 24 : 32 
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}

      {/* Menú de selección de etiquetas */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: { maxHeight: 300, width: 280 }
        }}
      >
        <MenuItem disabled>
          <Typography variant="subtitle2">
            Gestionar Etiquetas del Documento
          </Typography>
        </MenuItem>
        
        <Divider />

        {loading ? (
          <MenuItem disabled>
            <Typography variant="body2" color="textSecondary">
              Cargando etiquetas...
            </Typography>
          </MenuItem>
        ) : (
          <>
            {availableTags.map((tag) => {
              const assigned = isTagAssigned(tag.id);
              return (
                <MenuItem
                  key={tag.id}
                  onClick={() => handleTagToggle(tag.id, assigned)}
                  dense
                >
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={assigned}
                      size="small"
                    />
                  </ListItemIcon>
                  <ListItemIcon>
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        backgroundColor: tag.color,
                        borderRadius: '50%',
                        border: '1px solid #ccc',
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText 
                    primary={tag.name}
                    secondary={
                      <Typography variant="caption" color="textSecondary">
                        {tag.usageCount} uso{tag.usageCount !== 1 ? 's' : ''}
                        {tag.isSystemTag && ' • Sistema'}
                      </Typography>
                    }
                  />
                </MenuItem>
              );
            })}
            
            {availableTags.length === 0 && (
              <MenuItem disabled>
                <Typography variant="body2" color="textSecondary">
                  No hay etiquetas disponibles
                </Typography>
              </MenuItem>
            )}
          </>
        )}
      </Menu>
    </Box>
  );
};

export default DocumentTagsDisplay;
