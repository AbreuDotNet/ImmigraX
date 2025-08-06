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
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Close,
  Edit,
  Email,
  Phone,
  LocationOn,
  Description,
  CalendarToday,
  Person,
  Assignment
} from '@mui/icons-material';
import { Client } from '../../types';
import apiService from '../../services/apiService';

interface ClientDetailsProps {
  open: boolean;
  onClose: () => void;
  onEdit: (client: Client) => void;
  clientId: string | null;
}

const ClientDetails: React.FC<ClientDetailsProps> = ({
  open,
  onClose,
  onEdit,
  clientId
}) => {
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClientDetails = useCallback(async () => {
    if (!clientId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const clientData = await apiService.getClient(clientId);
      setClient(clientData);
    } catch (err: any) {
      console.error('Error fetching client details:', err);
      setError(err.response?.data?.message || 'Error al cargar los detalles del cliente');
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    if (open && clientId) {
      fetchClientDetails();
    }
  }, [open, clientId, fetchClientDetails]);

  const handleClose = () => {
    setClient(null);
    setError(null);
    onClose();
  };

  const handleEdit = () => {
    if (client) {
      onEdit(client);
      handleClose();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completado':
        return 'success';
      case 'En Proceso':
      case 'En Revisión':
        return 'warning';
      case 'Pendiente':
      case 'Documentos Pendientes':
        return 'error';
      case 'Cancelado':
        return 'default';
      default:
        return 'primary';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <CircularProgress />
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogContent>
          <Alert severity="error">{error}</Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    );
  }

  if (!client) {
    return null;
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h5" component="div" gutterBottom>
              {client.fullName}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <Chip
                label={client.processStatus}
                color={getStatusColor(client.processStatus || '')}
                size="small"
              />
              {client.caseNumber && (
                <Chip
                  label={client.caseNumber}
                  variant="outlined"
                  size="small"
                />
              )}
            </Box>
          </Box>
          <Box>
            <IconButton onClick={handleEdit} title="Editar cliente">
              <Edit />
            </IconButton>
            <IconButton onClick={handleClose} title="Cerrar">
              <Close />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Información Personal */}
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Box sx={{ flex: 1 }}>
              <Card elevation={1}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Person color="primary" />
                    Información Personal
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <Person fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Nombre Completo"
                        secondary={client.fullName}
                      />
                    </ListItem>
                    
                    {client.email && (
                      <ListItem>
                        <ListItemIcon>
                          <Email fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Email"
                          secondary={client.email}
                        />
                      </ListItem>
                    )}
                    
                    {client.phone && (
                      <ListItem>
                        <ListItemIcon>
                          <Phone fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Teléfono"
                          secondary={client.phone}
                        />
                      </ListItem>
                    )}
                    
                    {client.address && (
                      <ListItem>
                        <ListItemIcon>
                          <LocationOn fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Dirección"
                          secondary={client.address}
                        />
                      </ListItem>
                    )}
                  </List>
                </CardContent>
              </Card>
            </Box>

            {/* Información del Proceso */}
            <Box sx={{ flex: 1 }}>
              <Card elevation={1}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Assignment color="primary" />
                    Proceso Legal
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <Description fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Tipo de Proceso"
                        secondary={client.processType}
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon>
                        <Assignment fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Estado"
                        secondary={
                          <Chip
                            label={client.processStatus}
                            color={getStatusColor(client.processStatus || '')}
                            size="small"
                          />
                        }
                      />
                    </ListItem>
                    
                    {client.caseNumber && (
                      <ListItem>
                        <ListItemIcon>
                          <Description fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Número de Caso"
                          secondary={client.caseNumber}
                        />
                      </ListItem>
                    )}
                    
                    <ListItem>
                      <ListItemIcon>
                        <CalendarToday fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Fecha de Registro"
                        secondary={formatDate(client.createdAt)}
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon>
                        <CalendarToday fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Última Actualización"
                        secondary={formatDate(client.updatedAt)}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Box>
          </Box>

          {/* Información Adicional */}
          <Card elevation={1}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Resumen del Caso
              </Typography>
              <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="body1" gutterBottom>
                  <strong>Cliente:</strong> {client.fullName}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Proceso:</strong> {client.processType}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Estado Actual:</strong> {client.processStatus}
                </Typography>
                {client.caseNumber && (
                  <Typography variant="body2" gutterBottom>
                    <strong>Número de Caso:</strong> {client.caseNumber}
                  </Typography>
                )}
                <Typography variant="caption" color="text.secondary">
                  Registrado el {formatDate(client.createdAt)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose}>
          Cerrar
        </Button>
        <Button
          onClick={handleEdit}
          variant="contained"
          startIcon={<Edit />}
        >
          Editar Cliente
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClientDetails;
