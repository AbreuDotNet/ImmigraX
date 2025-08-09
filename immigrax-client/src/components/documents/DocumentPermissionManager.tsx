import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Alert,
  Divider,
  Tooltip,
  CircularProgress,
  TextField,
  Autocomplete,
} from '@mui/material';
import {
  Security as SecurityIcon,
  Person as PersonIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Share as ShareIcon,
  Visibility as ViewIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { 
  DocumentUserPermission, 
  DocumentAccessLevel, 
  CreateDocumentUserPermissionDto, 
  User,
  DocumentResponse 
} from '../../types';
import documentPermissionService from '../../services/documentPermissionService';
import { userService } from '../../services/userService';

interface DocumentPermissionManagerProps {
  open: boolean;
  onClose: () => void;
  document: DocumentResponse | null;
  onPermissionsChanged?: () => void;
}

const DocumentPermissionManager: React.FC<DocumentPermissionManagerProps> = ({
  open,
  onClose,
  document,
  onPermissionsChanged
}) => {
  const [permissions, setPermissions] = useState<DocumentUserPermission[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newPermission, setNewPermission] = useState<CreateDocumentUserPermissionDto>({
    documentId: '',
    userId: '',
    canView: true,
    canEdit: false,
    canDelete: false,
    canShare: false,
  });

  const loadPermissions = useCallback(async () => {
    if (!document) return;
    
    try {
      setLoading(true);
      const perms = await documentPermissionService.getDocumentPermissions(document.id);
      setPermissions(perms);
    } catch (err) {
      setError('Error al cargar permisos del documento');
      console.error('Error loading permissions:', err);
    } finally {
      setLoading(false);
    }
  }, [document]);

  const loadUsers = useCallback(async () => {
    try {
      const allUsers = await userService.getUsers();
      // Convertir los usuarios del servicio al tipo correcto
      const convertedUsers: User[] = allUsers.map(user => ({
        ...user,
        role: user.role as any // Conversión temporal del tipo
      }));
      setUsers(convertedUsers);
    } catch (err) {
      console.error('Error loading users:', err);
    }
  }, []);

  useEffect(() => {
    if (open && document) {
      loadPermissions();
      loadUsers();
      setNewPermission(prev => ({ ...prev, documentId: document.id }));
    }
  }, [open, document, loadPermissions, loadUsers]);

  const handleGrantPermission = async () => {
    if (!selectedUser || !document) return;

    try {
      setSaving(true);
      const permissionData: CreateDocumentUserPermissionDto = {
        ...newPermission,
        userId: selectedUser.id,
        documentId: document.id
      };

      await documentPermissionService.grantPermission(permissionData);
      await loadPermissions();
      
      // Reset form
      setSelectedUser(null);
      setNewPermission({
        documentId: document.id,
        userId: '',
        canView: true,
        canEdit: false,
        canDelete: false,
        canShare: false,
      });
      
      onPermissionsChanged?.();
    } catch (err) {
      setError('Error al otorgar permisos');
      console.error('Error granting permission:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleRevokePermission = async (permissionId: string) => {
    try {
      setSaving(true);
      await documentPermissionService.revokePermission(permissionId);
      await loadPermissions();
      onPermissionsChanged?.();
    } catch (err) {
      setError('Error al revocar permisos');
      console.error('Error revoking permission:', err);
    } finally {
      setSaving(false);
    }
  };

  const getAccessLevelColor = (level: DocumentAccessLevel) => {
    return documentPermissionService.getAccessLevelColor(level);
  };

  const getAccessLevelDescription = (level: DocumentAccessLevel) => {
    return documentPermissionService.getAccessLevelDescription(level);
  };

  const availableUsers = users.filter(user => 
    !permissions.some(perm => perm.userId === user.id)
  );

  if (!document) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <SecurityIcon />
          <Typography variant="h6">
            Permisos del Documento
          </Typography>
        </Box>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          {document.fileName}
        </Typography>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Información del nivel de acceso del documento */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Nivel de Acceso del Documento
          </Typography>
          <Chip
            icon={<SecurityIcon />}
            label={document.accessLevel}
            size="small"
            sx={{ 
              backgroundColor: getAccessLevelColor(document.accessLevel),
              color: 'white',
              fontWeight: 'bold'
            }}
          />
          <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
            {getAccessLevelDescription(document.accessLevel)}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Formulario para agregar nuevos permisos */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Otorgar Permisos Específicos
          </Typography>
          
          <Box display="flex" flexDirection="column" gap={2}>
            <Autocomplete
              options={availableUsers}
              getOptionLabel={(user) => `${user.fullName} (${user.email})`}
              value={selectedUser}
              onChange={(_, newValue) => setSelectedUser(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Seleccionar Usuario"
                  variant="outlined"
                  size="small"
                />
              )}
              disabled={saving}
            />

            {selectedUser && (
              <Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Permisos para <strong>{selectedUser.fullName}</strong>:
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  <Chip
                    icon={<ViewIcon />}
                    label="Ver"
                    variant={newPermission.canView ? "filled" : "outlined"}
                    color={newPermission.canView ? "primary" : "default"}
                    onClick={() => setNewPermission(prev => ({ ...prev, canView: !prev.canView }))}
                    size="small"
                  />
                  <Chip
                    icon={<EditIcon />}
                    label="Editar"
                    variant={newPermission.canEdit ? "filled" : "outlined"}
                    color={newPermission.canEdit ? "primary" : "default"}
                    onClick={() => setNewPermission(prev => ({ ...prev, canEdit: !prev.canEdit }))}
                    size="small"
                  />
                  <Chip
                    icon={<DeleteIcon />}
                    label="Eliminar"
                    variant={newPermission.canDelete ? "filled" : "outlined"}
                    color={newPermission.canDelete ? "primary" : "default"}
                    onClick={() => setNewPermission(prev => ({ ...prev, canDelete: !prev.canDelete }))}
                    size="small"
                  />
                  <Chip
                    icon={<ShareIcon />}
                    label="Compartir"
                    variant={newPermission.canShare ? "filled" : "outlined"}
                    color={newPermission.canShare ? "primary" : "default"}
                    onClick={() => setNewPermission(prev => ({ ...prev, canShare: !prev.canShare }))}
                    size="small"
                  />
                </Box>
                
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleGrantPermission}
                  disabled={saving}
                  sx={{ mt: 2 }}
                >
                  {saving ? <CircularProgress size={20} /> : 'Otorgar Permisos'}
                </Button>
              </Box>
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Lista de permisos existentes */}
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Permisos Específicos Otorgados ({permissions.length})
          </Typography>
          
          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : permissions.length === 0 ? (
            <Alert severity="info">
              No hay permisos específicos otorgados para este documento.
            </Alert>
          ) : (
            <List>
              {permissions.map((permission) => (
                <ListItem key={permission.id} divider>
                  <ListItemIcon>
                    <PersonIcon />
                  </ListItemIcon>
                  
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="subtitle2">
                          {permission.userName}
                        </Typography>
                        {permission.isExpired && (
                          <Chip
                            icon={<WarningIcon />}
                            label="Expirado"
                            size="small"
                            color="error"
                          />
                        )}
                        {permission.expiresAt && !permission.isExpired && (
                          <Tooltip title={`Expira: ${new Date(permission.expiresAt).toLocaleDateString()}`}>
                            <ScheduleIcon fontSize="small" color="warning" />
                          </Tooltip>
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          {permission.userEmail} • Otorgado por {permission.grantedByUserName}
                        </Typography>
                        <Box display="flex" gap={1} mt={1}>
                          {permission.canView && (
                            <Chip icon={<ViewIcon />} label="Ver" size="small" color="success" />
                          )}
                          {permission.canEdit && (
                            <Chip icon={<EditIcon />} label="Editar" size="small" color="primary" />
                          )}
                          {permission.canDelete && (
                            <Chip icon={<DeleteIcon />} label="Eliminar" size="small" color="error" />
                          )}
                          {permission.canShare && (
                            <Chip icon={<ShareIcon />} label="Compartir" size="small" color="info" />
                          )}
                        </Box>
                      </Box>
                    }
                  />
                  
                  <ListItemSecondaryAction>
                    <Tooltip title="Revocar permisos">
                      <IconButton
                        edge="end"
                        color="error"
                        onClick={() => handleRevokePermission(permission.id)}
                        disabled={saving}
                        size="small"
                      >
                        <RemoveIcon />
                      </IconButton>
                    </Tooltip>
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

export default DocumentPermissionManager;
