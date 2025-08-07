import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  Chip,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Person,
  Event,
  Schedule,
  CalendarToday,
  Business,
  PriorityHigh,
  Description,
} from '@mui/icons-material';
import { Appointment } from '../types';
import apiService from '../services/apiService';

interface AppointmentDetailsProps {
  open: boolean;
  onClose: () => void;
  appointmentId: string | null;
  onEdit?: (appointment: Appointment) => void;
}

const AppointmentDetails: React.FC<AppointmentDetailsProps> = ({
  open,
  onClose,
  appointmentId,
  onEdit
}) => {
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchAppointmentDetails = useCallback(async () => {
    if (!appointmentId) return;

    setLoading(true);
    setError('');

    try {
      const appointmentData = await apiService.getAppointment(appointmentId);
      setAppointment(appointmentData);
    } catch (err: any) {
      console.error('Error fetching appointment details:', err);
      setError(err.response?.data?.message || 'Error al cargar los detalles de la cita');
    } finally {
      setLoading(false);
    }
  }, [appointmentId]);

  React.useEffect(() => {
    if (open && appointmentId) {
      fetchAppointmentDetails();
    }
  }, [open, appointmentId, fetchAppointmentDetails]);

  const handleEdit = () => {
    if (appointment && onEdit) {
      onEdit(appointment);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      time: date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completada':
        return 'success';
      case 'confirmada':
        return 'info';
      case 'programada':
        return 'warning';
      case 'cancelada':
        return 'error';
      case 'reprogramada':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: number | string) => {
    // Handle both number and string priority values
    let priorityValue: string;
    if (typeof priority === 'number') {
      switch (priority) {
        case 0:
          priorityValue = 'baja';
          break;
        case 1:
          priorityValue = 'media';
          break;
        case 2:
          priorityValue = 'alta';
          break;
        default:
          priorityValue = 'media';
      }
    } else {
      priorityValue = priority?.toLowerCase() || 'media';
    }

    switch (priorityValue) {
      case 'alta':
        return 'error';
      case 'media':
        return 'warning';
      case 'baja':
        return 'success';
      default:
        return 'default';
    }
  };

  const getPriorityLabel = (priority: number | string) => {
    // Handle both number and string priority values
    if (typeof priority === 'number') {
      switch (priority) {
        case 0:
          return 'Baja';
        case 1:
          return 'Media';
        case 2:
          return 'Alta';
        default:
          return 'Media';
      }
    } else {
      switch (priority?.toLowerCase()) {
        case 'alta':
          return 'Alta';
        case 'media':
          return 'Media';
        case 'baja':
          return 'Baja';
        default:
          return priority || 'Media';
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Event color="primary" />
          Detalles de la Cita
        </Box>
      </DialogTitle>

      <DialogContent>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {appointment && !loading && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Título y Estado */}
            <Box>
              <Typography variant="h5" gutterBottom>
                {appointment.title}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Chip
                  label={appointment.status}
                  color={getStatusColor(appointment.status)}
                  size="small"
                />
                {appointment.priority && (
                  <Chip
                    icon={<PriorityHigh />}
                    label={getPriorityLabel(appointment.priority)}
                    color={getPriorityColor(appointment.priority)}
                    size="small"
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>

            <Divider />

            {/* Información del Cliente */}
            <Box>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Person color="primary" />
                Cliente
              </Typography>
              <Typography variant="body1">
                {appointment.client?.fullName || 'N/A'}
              </Typography>
            </Box>

            <Divider />

            {/* Fecha y Hora */}
            <Box>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarToday color="primary" />
                Fecha y Hora
              </Typography>
              {(() => {
                const dateTime = formatDateTime(appointment.appointmentDate);
                return (
                  <>
                    <Typography variant="body1">
                      <strong>Fecha:</strong> {dateTime.date}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Hora:</strong> {dateTime.time}
                    </Typography>
                  </>
                );
              })()}
            </Box>

            <Divider />

            {/* Tipo de Cita */}
            {appointment.appointmentType && (
              <>
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Schedule color="primary" />
                    Tipo de Cita
                  </Typography>
                  <Chip
                    icon={<Event />}
                    label={appointment.appointmentType}
                    variant="outlined"
                    size="medium"
                  />
                </Box>
                <Divider />
              </>
            )}

            {/* Descripción */}
            {appointment.description && (
              <>
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Description color="primary" />
                    Descripción
                  </Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {appointment.description}
                  </Typography>
                </Box>
                <Divider />
              </>
            )}

            {/* Información de Creación */}
            <Box>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Business color="primary" />
                Información Adicional
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Creado:</strong> {new Date(appointment.createdAt).toLocaleString('es-ES')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>ID:</strong> {appointment.id}
              </Typography>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Cerrar
        </Button>
        {appointment && onEdit && (
          <Button variant="contained" onClick={handleEdit}>
            Editar
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AppointmentDetails;
