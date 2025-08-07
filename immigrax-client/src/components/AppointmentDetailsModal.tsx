import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Divider,
  IconButton,
  Avatar,
} from '@mui/material';
import {
  Close,
  Event,
  Person,
  Description,
  Schedule,
  Edit,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { Appointment, AppointmentStatus } from '../types';

interface AppointmentDetailsModalProps {
  open: boolean;
  onClose: () => void;
  appointment: Appointment & { clientName?: string; duration?: number };
  onEdit: () => void;
}

const AppointmentDetailsModal: React.FC<AppointmentDetailsModalProps> = ({
  open,
  onClose,
  appointment,
  onEdit,
}) => {
  const getStatusColor = (status: AppointmentStatus): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (status) {
      case AppointmentStatus.Programada:
        return 'info';
      case AppointmentStatus.Confirmada:
        return 'success';
      case AppointmentStatus.Completada:
        return 'primary';
      case AppointmentStatus.Cancelada:
        return 'error';
      case AppointmentStatus.Reprogramada:
        return 'warning';
      default:
        return 'default';
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: format(date, 'EEEE, dd MMMM yyyy', { locale: es }),
      time: format(date, 'HH:mm', { locale: es }),
    };
  };

  const { date, time } = formatDateTime(appointment.appointmentDate);
  const duration = appointment.duration || 60;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <Event />
            </Avatar>
            <Box>
              <Typography variant="h6" component="div">
                Detalles de la Cita
              </Typography>
              <Chip
                label={appointment.status}
                color={getStatusColor(appointment.status)}
                size="small"
                sx={{ mt: 0.5 }}
              />
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Título */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Título
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {appointment.title || 'Sin título'}
            </Typography>
          </Box>

          {/* Cliente */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Person fontSize="small" color="action" />
              <Typography variant="subtitle2" color="text.secondary">
                Cliente
              </Typography>
            </Box>
            <Typography variant="body1">
              {appointment.clientName || 'Cliente no especificado'}
            </Typography>
          </Box>

          <Divider />

          {/* Fecha y Hora */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Schedule fontSize="small" color="action" />
              <Typography variant="subtitle2" color="text.secondary">
                Fecha y Hora
              </Typography>
            </Box>
            <Typography variant="body1" fontWeight="medium" gutterBottom>
              {date}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {time} - {format(new Date(new Date(appointment.appointmentDate).getTime() + duration * 60000), 'HH:mm', { locale: es })} ({duration} min)
            </Typography>
          </Box>

          {/* Tipo */}
          {appointment.appointmentType && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Tipo de Cita
              </Typography>
              <Typography variant="body1">
                {appointment.appointmentType}
              </Typography>
            </Box>
          )}

          {/* Descripción */}
          {appointment.description && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Description fontSize="small" color="action" />
                <Typography variant="subtitle2" color="text.secondary">
                  Descripción
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {appointment.description}
              </Typography>
            </Box>
          )}

          {/* Prioridad */}
          {appointment.priority && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Prioridad
              </Typography>
              <Chip
                label={appointment.priority}
                color={
                  appointment.priority === 'Alta' ? 'error' :
                  appointment.priority === 'Media' ? 'warning' : 'default'
                }
                size="small"
              />
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={onClose}
          color="inherit"
        >
          Cerrar
        </Button>
        <Button
          onClick={onEdit}
          variant="contained"
          startIcon={<Edit />}
        >
          Editar Cita
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AppointmentDetailsModal;
