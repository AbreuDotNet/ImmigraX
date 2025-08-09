import React, { useState } from 'react';
import {
  Box,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Security as SecurityIcon,
  Category as CategoryIcon,
  Label as LabelIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { DocumentResponse } from '../../types';
import DocumentPermissionManager from './DocumentPermissionManager';
import DocumentCategoryManager from './DocumentCategoryManager';
import DocumentTagManager from './DocumentTagManager';

interface DocumentManagementMenuProps {
  selectedDocument?: DocumentResponse;
  onDocumentUpdated?: () => void;
}

const DocumentManagementMenu: React.FC<DocumentManagementMenuProps> = ({
  selectedDocument,
  onDocumentUpdated
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [permissionManagerOpen, setPermissionManagerOpen] = useState(false);
  const [categoryManagerOpen, setCategoryManagerOpen] = useState(false);
  const [tagManagerOpen, setTagManagerOpen] = useState(false);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOpenPermissions = () => {
    if (selectedDocument) {
      setPermissionManagerOpen(true);
    }
    handleClose();
  };

  const handleOpenCategories = () => {
    setCategoryManagerOpen(true);
    handleClose();
  };

  const handleOpenTags = () => {
    setTagManagerOpen(true);
    handleClose();
  };

  return (
    <>
      <Button
        variant="outlined"
        endIcon={<ExpandMoreIcon />}
        onClick={handleClick}
        size="small"
      >
        <SettingsIcon sx={{ mr: 1 }} />
        Gestión
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem 
          onClick={handleOpenPermissions}
          disabled={!selectedDocument}
        >
          <ListItemIcon>
            <SecurityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            Permisos del Documento
            {!selectedDocument && (
              <Box component="span" sx={{ fontSize: '0.75rem', color: 'text.secondary', display: 'block' }}>
                Seleccione un documento
              </Box>
            )}
          </ListItemText>
        </MenuItem>

        <Divider />

        <MenuItem onClick={handleOpenCategories}>
          <ListItemIcon>
            <CategoryIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            Gestionar Categorías
          </ListItemText>
        </MenuItem>

        <MenuItem onClick={handleOpenTags}>
          <ListItemIcon>
            <LabelIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            Gestionar Etiquetas
          </ListItemText>
        </MenuItem>
      </Menu>

      {/* Modales de gestión */}
      <DocumentPermissionManager
        open={permissionManagerOpen}
        onClose={() => setPermissionManagerOpen(false)}
        document={selectedDocument || null}
        onPermissionsChanged={onDocumentUpdated}
      />

      <DocumentCategoryManager
        open={categoryManagerOpen}
        onClose={() => setCategoryManagerOpen(false)}
        onCategoriesChanged={onDocumentUpdated}
      />

      <DocumentTagManager
        open={tagManagerOpen}
        onClose={() => setTagManagerOpen(false)}
        onTagsChanged={onDocumentUpdated}
      />
    </>
  );
};

export default DocumentManagementMenu;
