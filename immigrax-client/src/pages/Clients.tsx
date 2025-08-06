import React, { useState, useEffect } from 'react';
import {
  Box,  Card,  CardContent,  Typography,  Button,  Table,  TableBody,  TableCell,
  TableContainer,  TableHead,  TableRow,  Paper,  Chip,  IconButton,  TextField,
  InputAdornment,  Container,  Fab,  Alert,  Snackbar,  Tooltip
} from '@mui/material';
import {   Add,  Search,  Edit,  Visibility,  Email,  Phone,  Delete } from '@mui/icons-material';
import { Client } from '../types';
import apiService from '../services/apiService';
import ApiStatus from '../components/ApiStatus';
import ClientForm from '../components/clients/ClientForm';
import ClientDetails from '../components/clients/ClientDetails';
import ClientDeleteConfirm from '../components/clients/ClientDeleteConfirm';

// Mock data for development
const mockClients: Client[] = [
  {
    id: '1',
    fullName: 'Juan Pérez García',
    email: 'juan.perez@email.com',
    phone: '+1-555-0123',
    caseNumber: 'CASE-2024-001',
    processType: 'Residencia Permanente',
    processStatus: 'En Proceso',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    lawFirmId: 'firm1'
  },
  {
    id: '2',
    fullName: 'María González López',
    email: 'maria.gonzalez@email.com',
    phone: '+1-555-0124',
    caseNumber: 'CASE-2024-002',
    processType: 'Ciudadanía',
    processStatus: 'Pendiente',
    createdAt: '2024-01-16T14:00:00Z',
    updatedAt: '2024-01-16T14:00:00Z',
    lawFirmId: 'firm1'
  },
  {
    id: '3',
    fullName: 'Carlos Rodríguez Martín',
    email: 'carlos.rodriguez@email.com',
    phone: '+1-555-0125',
    caseNumber: 'CASE-2024-003',
    processType: 'Visa de Trabajo',
    processStatus: 'Completado',
    createdAt: '2024-01-10T09:30:00Z',
    updatedAt: '2024-01-10T09:30:00Z',
    lawFirmId: 'firm1'
  },
  {
    id: '4',
    fullName: 'Ana Silva Fernández',
    email: 'ana.silva@email.com',
    phone: '+1-555-0126',
    caseNumber: 'CASE-2024-004',
    processType: 'Reunificación Familiar',
    processStatus: 'En Proceso',
    createdAt: '2024-01-20T11:15:00Z',
    updatedAt: '2024-01-20T11:15:00Z',
    lawFirmId: 'firm1'
  }
];

const Clients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [clientFormOpen, setClientFormOpen] = useState(false);
  const [clientDetailsOpen, setClientDetailsOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  
  // Selected client states
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  
  // Notification states
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });
  
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        // Try to fetch real data from API
        const clientsData = await apiService.getClients();
        setClients(clientsData);
      } catch (err) {
        console.warn('API not available, using mock data:', err);
        // Fallback to mock data if API is not available
        await new Promise(resolve => setTimeout(resolve, 1000));
        setClients(mockClients);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const refreshClients = async () => {
    try {
      const clientsData = await apiService.getClients();
      setClients(clientsData);
    } catch (err) {
      console.warn('Error refreshing clients:', err);
      showNotification('Error al actualizar la lista de clientes', 'error');
    }
  };

  const showNotification = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // CRUD operations
  const handleCreateClient = () => {
    setFormMode('create');
    setSelectedClient(null);
    setClientFormOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setFormMode('edit');
    setSelectedClient(client);
    setClientFormOpen(true);
  };

  const handleViewClient = (clientId: string) => {
    setSelectedClientId(clientId);
    setClientDetailsOpen(true);
  };

  const handleDeleteClient = (client: Client) => {
    setSelectedClient(client);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedClient) return;

    setDeleteLoading(true);
    try {
      await apiService.deleteClient(selectedClient.id);
      await refreshClients();
      showNotification('Cliente eliminado exitosamente', 'success');
      setDeleteConfirmOpen(false);
      setSelectedClient(null);
    } catch (err: any) {
      console.error('Error deleting client:', err);
      showNotification(err.response?.data?.message || 'Error al eliminar el cliente', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCloseForm = () => {
    setClientFormOpen(false);
    setSelectedClient(null);
  };

  const handleSaveClient = async () => {
    await refreshClients();
    showNotification(
      formMode === 'create' ? 'Cliente creado exitosamente' : 'Cliente actualizado exitosamente',
      'success'
    );
  };

  const handleCloseDetails = () => {
    setClientDetailsOpen(false);
    setSelectedClientId(null);
  };

  const handleEditFromDetails = (client: Client) => {
    setSelectedClient(client);
    setFormMode('edit');
    setClientDetailsOpen(false);
    setClientFormOpen(true);
  };

  const filteredClients = clients.filter(client =>
    client.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (client.caseNumber && client.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusColor = (status: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
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
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography>Cargando clientes...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Clientes
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateClient}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            py: 1.5,
            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
            '&:hover': {
              boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)',
              transform: 'translateY(-1px)',
            },
            transition: 'all 0.2s ease-in-out'
          }}
        >
          Nuevo Cliente
        </Button>
      </Box>

      <ApiStatus />

      <Card sx={{ mb: 3, borderRadius: 2, boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Buscar clientes por nombre, email o número de caso..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="action" />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.main',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderWidth: 2,
                }
              }
            }}
          />
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 2, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'grey.50' }}>
                  <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Cliente</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Contacto</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Número de Caso</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Tipo de Proceso</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Estado</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Fecha de Registro</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, color: 'text.primary' }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow 
                    key={client.id} 
                    hover
                    sx={{
                      '&:hover': {
                        backgroundColor: 'rgba(25, 118, 210, 0.04)',
                        transform: 'scale(1.001)',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                      },
                      transition: 'all 0.2s ease-in-out'
                    }}
                  >
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {client.fullName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Email fontSize="small" color="action" />
                          <Typography variant="body2">{client.email}</Typography>
                        </Box>
                        {client.phone && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Phone fontSize="small" color="action" />
                            <Typography variant="body2">{client.phone}</Typography>
                          </Box>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {client.caseNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {client.processType}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={client.processStatus}
                        color={getStatusColor(client.processStatus || '')}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          borderRadius: 2,
                          px: 1,
                          textTransform: 'uppercase',
                          fontSize: '0.75rem',
                          letterSpacing: '0.5px'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(client.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                        <Tooltip title="Ver detalles" arrow>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewClient(client.id);
                            }}
                            sx={{ 
                              color: 'primary.main',
                              '&:hover': { 
                                backgroundColor: 'primary.50',
                                transform: 'scale(1.1)'
                              },
                              transition: 'all 0.2s ease-in-out'
                            }}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Editar cliente" arrow>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditClient(client);
                            }}
                            sx={{ 
                              color: 'warning.main',
                              '&:hover': { 
                                backgroundColor: 'warning.50',
                                transform: 'scale(1.1)'
                              },
                              transition: 'all 0.2s ease-in-out'
                            }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Delete" arrow>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClient(client);
                            }}
                            sx={{ 
                              color: 'error.main',
                              '&:hover': { 
                                backgroundColor: 'error.50',
                                transform: 'scale(1.1)'
                              },
                              transition: 'all 0.2s ease-in-out'
                            }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          {filteredClients.length === 0 && (
            <Box sx={{ 
              textAlign: 'center', 
              py: 8, 
              px: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2
            }}>
              <Search sx={{ fontSize: 48, color: 'text.disabled' }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No se encontraron clientes
              </Typography>
              <Typography variant="body2" color="text.disabled">
                {searchTerm 
                  ? `No hay clientes que coincidan con "${searchTerm}"`
                  : "Aún no hay clientes registrados. ¡Agrega el primero!"
                }
              </Typography>
              {!searchTerm && (
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleCreateClient}
                  sx={{ mt: 2, borderRadius: 2 }}
                >
                  Crear primer cliente
                </Button>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      <Fab
        color="primary"
        aria-label="add"
        onClick={handleCreateClient}
        sx={{ 
          position: 'fixed', 
          bottom: 24, 
          right: 24,
          boxShadow: '0 8px 24px rgba(25, 118, 210, 0.4)',
          '&:hover': {
            boxShadow: '0 12px 32px rgba(25, 118, 210, 0.5)',
            transform: 'scale(1.1)',
          },
          transition: 'all 0.3s ease-in-out'
        }}
      >
        <Add />
      </Fab>

      {/* Modals */}
      <ClientForm
        open={clientFormOpen}
        onClose={handleCloseForm}
        onSave={handleSaveClient}
        client={selectedClient}
        mode={formMode}
      />

      <ClientDetails
        open={clientDetailsOpen}
        onClose={handleCloseDetails}
        onEdit={handleEditFromDetails}
        clientId={selectedClientId}
      />

      <ClientDeleteConfirm
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        client={selectedClient}
        loading={deleteLoading}
      />

      {/* Notifications */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Clients;
