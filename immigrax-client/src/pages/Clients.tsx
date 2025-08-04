import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Container,
  Fab,
} from '@mui/material';
import {
  Add,
  Search,
  Edit,
  Visibility,
  Email,
  Phone,
} from '@mui/icons-material';
import { Client } from '../types';
import apiService from '../services/apiService';
import ApiStatus from '../components/ApiStatus';

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

  const filteredClients = clients.filter(client =>
    client.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (client.caseNumber && client.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completado':
        return 'success';
      case 'En Proceso':
        return 'warning';
      case 'Pendiente':
        return 'error';
      default:
        return 'default';
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
          onClick={() => {/* TODO: Open create client modal */}}
        >
          Nuevo Cliente
        </Button>
      </Box>

      <ApiStatus />

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Buscar clientes por nombre, email o número de caso..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Contacto</TableCell>
                  <TableCell>Número de Caso</TableCell>
                  <TableCell>Tipo de Proceso</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Fecha de Registro</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id} hover>
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
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(client.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => {/* TODO: View client details */}}
                        title="Ver detalles"
                      >
                        <Visibility />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => {/* TODO: Edit client */}}
                        title="Editar cliente"
                      >
                        <Edit />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          {filteredClients.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No se encontraron clientes que coincidan con la búsqueda.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => {/* TODO: Open create client modal */}}
      >
        <Add />
      </Fab>
    </Container>
  );
};

export default Clients;
