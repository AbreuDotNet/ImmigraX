import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  Alert,
  Chip,
} from '@mui/material';
import {
  Warning,
  Event,
  Person,
  CalendarToday,
} from '@mui/icons-material';
import { Appointment } from '../types';

interface AppointmentDeleteConfirmProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  appointment: Appointment | null;
  loading?: boolean;
}

const AppointmentDeleteConfirm: React.FC<AppointmentDeleteConfirmProps> = ({
  open,
  onClose,
  onConfirm,
  appointment,
  loading = false
}) => {
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('es-ES'),
      time: date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
          <Warning />
          Eliminar Cita
        </Box>
      </DialogTitle>

      <DialogContent>
        <Alert severity="error" sx={{ mb: 3 }}>
          Esta acción no se puede deshacer. La cita será eliminada permanentemente del sistema.
        </Alert>

        {appointment && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body1">
              ¿Estás seguro de que deseas eliminar la siguiente cita?
            </Typography>

            <Box 
              sx={{ 
                bgcolor: 'grey.50', 
                p: 2, 
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'grey.200'
              }}
            >
              {/* Título y Estado */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Event color="primary" />
                  <Typography variant="h6">
                    {appointment.title}
                  </Typography>
                </Box>
                <Chip
                  label={appointment.status}
                  color={getStatusColor(appointment.status)}
                  size="small"
                />
              </Box>

              {/* Cliente */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Person color="action" fontSize="small" />
                <Typography variant="body2">
                  <strong>Cliente:</strong> {appointment.client?.fullName || 'N/A'}
                </Typography>
              </Box>

              {/* Fecha y Hora */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <CalendarToday color="action" fontSize="small" />
                <Typography variant="body2">
                  <strong>Fecha:</strong> {(() => {
                    const dateTime = formatDateTime(appointment.appointmentDate);
                    return `${dateTime.date} a las ${dateTime.time}`;
                  })()}
                </Typography>
              </Box>

              {/* Tipo de Cita */}
              {appointment.appointmentType && (
                <Typography variant="body2">
                  <strong>Tipo:</strong> {appointment.appointmentType}
                </Typography>
              )}
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button 
          onClick={onConfirm} 
          variant="contained" 
          color="error"
          disabled={loading}
        >
          {loading ? 'Eliminando...' : 'Eliminar Cita'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AppointmentDeleteConfirm;
