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
  Avatar,
} from '@mui/material';
import {
  Add,
  Search,
  Edit,
  Visibility,
  Event,
  Schedule,
} from '@mui/icons-material';
import { Appointment, AppointmentStatus } from '../types';
import apiService from '../services/apiService';
import ApiStatus from '../components/ApiStatus';

// Mock data for development
const mockAppointments: AppointmentWithClient[] = [
  {
    id: '1',
    clientId: 'client1',
    lawFirmId: 'firm1',
    title: 'Consulta Inicial - Residencia Permanente',
    description: 'Primera consulta para evaluar el caso de residencia permanente',
    appointmentType: 'Consulta',
    appointmentDate: '2024-08-05T10:00:00Z',
    duration: 60,
    status: AppointmentStatus.Programada,
    createdBy: 'user1',
    createdAt: '2024-08-04T15:00:00Z',
    // Mock client data
    clientName: 'Juan Pérez García'
  },
  {
    id: '2',
    clientId: 'client2',
    lawFirmId: 'firm1',
    title: 'Revisión de Documentos',
    description: 'Revisión de documentos para solicitud de ciudadanía',
    appointmentType: 'Revisión',
    appointmentDate: '2024-08-06T14:00:00Z',
    duration: 45,
    status: AppointmentStatus.Confirmada,
    createdBy: 'user1',
    createdAt: '2024-08-04T16:00:00Z',
    clientName: 'María González López'
  },
  {
    id: '3',
    clientId: 'client3',
    lawFirmId: 'firm1',
    title: 'Entrega Final de Documentos',
    description: 'Entrega de documentos finales del proceso de visa de trabajo',
    appointmentType: 'Entrega',
    appointmentDate: '2024-08-03T09:00:00Z',
    duration: 30,
    status: AppointmentStatus.Completada,
    createdBy: 'user1',
    createdAt: '2024-08-02T10:00:00Z',
    clientName: 'Carlos Rodríguez Martín'
  },
  {
    id: '4',
    clientId: 'client4',
    lawFirmId: 'firm1',
    title: 'Cita de Seguimiento',
    description: 'Seguimiento del proceso de reunificación familiar',
    appointmentType: 'Seguimiento',
    appointmentDate: '2024-08-07T11:30:00Z',
    duration: 30,
    status: AppointmentStatus.Programada,
    createdBy: 'user1',
    createdAt: '2024-08-04T17:00:00Z',
    clientName: 'Ana Silva Fernández'
  }
];

interface AppointmentWithClient extends Appointment {
  clientName: string;
  duration: number;
}

const Appointments: React.FC = () => {
  const [appointments, setAppointments] = useState<AppointmentWithClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        // Try to fetch real data from API
        const appointmentsData = await apiService.getAppointments();
        // For now, we'll add mock client names since the API doesn't include them
        const appointmentsWithClients = appointmentsData.map((apt, index) => ({
          ...apt,
          clientName: mockAppointments[index]?.clientName || 'Cliente Desconocido',
          duration: 60 // Default duration
        }));
        setAppointments(appointmentsWithClients);
      } catch (err) {
        console.warn('API not available, using mock data:', err);
        // Fallback to mock data if API is not available
        await new Promise(resolve => setTimeout(resolve, 1000));
        setAppointments(mockAppointments);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const filteredAppointments = appointments.filter(appointment =>
    appointment.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.appointmentType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completada':
        return 'success';
      case 'Confirmada':
        return 'info';
      case 'Programada':
        return 'warning';
      case 'Cancelada':
        return 'error';
      case 'Reprogramada':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('es-ES'),
      time: date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography>Cargando citas...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Citas
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {/* TODO: Open create appointment modal */}}
        >
          Nueva Cita
        </Button>
      </Box>

      <ApiStatus />

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Buscar citas por título, cliente o tipo..."
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
                  <TableCell>Título</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Fecha y Hora</TableCell>
                  <TableCell>Duración</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAppointments.map((appointment) => {
                  const dateTime = formatDateTime(appointment.appointmentDate);
                  return (
                    <TableRow key={appointment.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                            {getInitials(appointment.clientName)}
                          </Avatar>
                          <Typography variant="subtitle2">
                            {appointment.clientName}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {appointment.title}
                        </Typography>
                        {appointment.description && (
                          <Typography variant="body2" color="text.secondary">
                            {appointment.description}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={<Event />}
                          label={appointment.appointmentType}
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Typography variant="body2" fontWeight="bold">
                            {dateTime.date}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {dateTime.time}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Schedule fontSize="small" color="action" />
                          <Typography variant="body2">
                            {appointment.duration} min
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={appointment.status}
                          color={getStatusColor(appointment.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => {/* TODO: View appointment details */}}
                          title="Ver detalles"
                        >
                          <Visibility />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => {/* TODO: Edit appointment */}}
                          title="Editar cita"
                        >
                          <Edit />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          
          {filteredAppointments.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No se encontraron citas que coincidan con la búsqueda.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => {/* TODO: Open create appointment modal */}}
      >
        <Add />
      </Fab>
    </Container>
  );
};

export default Appointments;
