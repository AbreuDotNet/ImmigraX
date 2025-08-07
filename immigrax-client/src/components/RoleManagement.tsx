import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  Snackbar,
  Divider
} from '@mui/material';
import {
  AdminPanelSettings as AdminIcon,
  Gavel as LawyerIcon,
  Support as SecretaryIcon,
  Check as CheckIcon,
  Info as InfoIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import { userService, UserRole } from '../services/userService';

const RoleManagement: React.FC = () => {
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const data = await userService.getRoles();
      setRoles(data);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error al cargar roles',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (roleName: string) => {
    switch (roleName) {
      case 'Master':
        return <AdminIcon sx={{ fontSize: 40, color: 'error.main' }} />;
      case 'Abogado':
        return <LawyerIcon sx={{ fontSize: 40, color: 'primary.main' }} />;
      case 'Secretario':
        return <SecretaryIcon sx={{ fontSize: 40, color: 'secondary.main' }} />;
      default:
        return <SecurityIcon sx={{ fontSize: 40, color: 'text.secondary' }} />;
    }
  };

  const getRoleColor = (roleName: string) => {
    switch (roleName) {
      case 'Master':
        return 'error';
      case 'Abogado':
        return 'primary';
      case 'Secretario':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getPermissionDescription = (permission: string): string => {
    const permissionDescriptions: { [key: string]: string } = {
      'Gestión de usuarios': 'Crear, editar y administrar cuentas de usuario del sistema',
      'Configuración del sistema': 'Acceso a configuraciones avanzadas y parámetros del sistema',
      'Acceso a todos los módulos': 'Visualización y uso completo de todas las funcionalidades',
      'Gestión de roles y permisos': 'Administración de roles de usuario y asignación de permisos',
      'Reportes avanzados': 'Generación y acceso a reportes detallados y estadísticas avanzadas',
      'Gestión de clientes': 'Crear, editar y administrar información de clientes',
      'Gestión de citas': 'Programar, modificar y gestionar citas con clientes',
      'Gestión de documentos': 'Subir, organizar y administrar documentos de clientes',
      'Notas de clientes': 'Crear y editar notas detalladas sobre clientes',
      'Reportes básicos': 'Acceso a reportes estándar y estadísticas básicas',
      'Formularios': 'Crear y gestionar formularios para clientes',
      'Ver clientes': 'Visualización de información básica de clientes',
      'Subir documentos': 'Cargar documentos al sistema sin capacidades de administración',
      'Notas básicas': 'Agregar notas simples sin funciones avanzadas de edición'
    };
    return permissionDescriptions[permission] || permission;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Gestión de Roles
        </Typography>
        <Chip
          icon={<InfoIcon />}
          label="Solo lectura"
          color="info"
          variant="outlined"
        />
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        Los roles del sistema están predefinidos y no se pueden modificar. Esta vista muestra los permisos asignados a cada rol.
      </Alert>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {roles.map((role) => (
          <Box key={role.name} sx={{ flex: '1 1 400px', minWidth: 400 }}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 4
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {getRoleIcon(role.name)}
                  <Box sx={{ ml: 2, flexGrow: 1 }}>
                    <Typography variant="h6" component="h2">
                      {role.displayName}
                    </Typography>
                    <Chip
                      label={role.name}
                      color={getRoleColor(role.name) as any}
                      size="small"
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                </Box>

                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ mb: 3, minHeight: '40px' }}
                >
                  {role.description}
                </Typography>

                <Divider sx={{ mb: 2 }} />

                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                  Permisos ({role.permissions.length})
                </Typography>

                <List dense sx={{ p: 0 }}>
                  {role.permissions.map((permission, index) => (
                    <ListItem 
                      key={index} 
                      sx={{ 
                        px: 0, 
                        py: 0.5,
                        '&:hover': { 
                          bgcolor: 'action.hover',
                          borderRadius: 1
                        }
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckIcon 
                          sx={{ 
                            fontSize: 16, 
                            color: getRoleColor(role.name) === 'error' ? 'error.main' : 
                                   getRoleColor(role.name) === 'primary' ? 'primary.main' : 
                                   'secondary.main'
                          }} 
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {permission}
                          </Typography>
                        }
                        secondary={
                          <Typography 
                            variant="caption" 
                            color="text.secondary"
                            sx={{ fontSize: '0.75rem', lineHeight: 1.2 }}
                          >
                            {getPermissionDescription(permission)}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      {roles.length === 0 && !loading && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <SecurityIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No hay roles disponibles
          </Typography>
          <Typography variant="body2" color="text.secondary">
            No se pudieron cargar los roles del sistema
          </Typography>
        </Paper>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RoleManagement;
