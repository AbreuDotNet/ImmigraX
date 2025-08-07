import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Avatar,
  Tooltip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Divider,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  EventNote as EventNoteIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import { format, isToday, isTomorrow, isYesterday } from 'date-fns';
import { es } from 'date-fns/locale';
import { AppointmentWithClient, Priority } from '../types';

// Helper function to convert priority to string for display and sorting
const getPriorityString = (priority: Priority | number | undefined): string => {
  if (typeof priority === 'number') {
    switch (priority) {
      case 0: return 'Baja';
      case 1: return 'Media';
      case 2: return 'Alta';
      default: return 'Media';
    }
  }
  return priority || 'Media';
};

interface AppointmentsListProps {
  appointments: AppointmentWithClient[];
  onEdit: (appointment: AppointmentWithClient) => void;
  onDelete: (appointmentId: string) => void;
}

const AppointmentsList: React.FC<AppointmentsListProps> = ({
  appointments,
  onEdit,
  onDelete,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Función para obtener color del status
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'programada': return '#2196f3';
      case 'confirmada': return '#4caf50';
      case 'completada': return '#673ab7';
      case 'cancelada': return '#f44336';
      case 'reprogramada': return '#ff9800';
      default: return '#757575';
    }
  };

  // Función para obtener color de prioridad
  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'alta': return '#f44336';
      case 'media': return '#ff9800';
      case 'baja': return '#4caf50';
      default: return '#757575';
    }
  };

  // Función para formatear fecha
  const formatDate = (date: Date) => {
    if (isToday(date)) {
      return `Hoy, ${format(date, 'HH:mm', { locale: es })}`;
    } else if (isTomorrow(date)) {
      return `Mañana, ${format(date, 'HH:mm', { locale: es })}`;
    } else if (isYesterday(date)) {
      return `Ayer, ${format(date, 'HH:mm', { locale: es })}`;
    } else {
      return format(date, "dd 'de' MMMM, HH:mm", { locale: es });
    }
  };

  // Filtrar citas
  const filteredAppointments = appointments
    .filter(appointment => {
      const matchesSearch = 
        (appointment.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (appointment.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || getPriorityString(appointment.priority) === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((a, b) => {
      // Ordenar por fecha y luego por prioridad
      const aStartTime = a.start?.getTime() || new Date(a.appointmentDate || '').getTime();
      const bStartTime = b.start?.getTime() || new Date(b.appointmentDate || '').getTime();
      const dateCompare = aStartTime - bStartTime;
      if (dateCompare !== 0) return dateCompare;
      
      const priorityOrder = { 'Alta': 1, 'Media': 2, 'Baja': 3 };
      const aPriorityString = getPriorityString(a.priority);
      const bPriorityString = getPriorityString(b.priority);
      return priorityOrder[aPriorityString as keyof typeof priorityOrder] - 
             priorityOrder[bPriorityString as keyof typeof priorityOrder];
    });

  const handleStatusFilterChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value as string);
  };

  const handlePriorityFilterChange = (event: SelectChangeEvent) => {
    setPriorityFilter(event.target.value as string);
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <EventNoteIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h5" component="h1" sx={{ flexGrow: 1 }}>
            Lista de Citas
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {filteredAppointments.length} de {appointments.length} citas
          </Typography>
        </Box>

        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Buscar citas, clientes o notas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            size="small"
            sx={{ flex: 1, minWidth: 300 }}
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Estado</InputLabel>
            <Select
              value={statusFilter}
              label="Estado"
              onChange={handleStatusFilterChange}
            >
              <MenuItem value="all">Todos</MenuItem>
              <MenuItem value="Programada">Programada</MenuItem>
              <MenuItem value="Confirmada">Confirmada</MenuItem>
              <MenuItem value="Completada">Completada</MenuItem>
              <MenuItem value="Cancelada">Cancelada</MenuItem>
              <MenuItem value="Reprogramada">Reprogramada</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Prioridad</InputLabel>
            <Select
              value={priorityFilter}
              label="Prioridad"
              onChange={handlePriorityFilterChange}
            >
              <MenuItem value="all">Todas</MenuItem>
              <MenuItem value="Alta">Alta</MenuItem>
              <MenuItem value="Media">Media</MenuItem>
              <MenuItem value="Baja">Baja</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Appointments List */}
        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          {filteredAppointments.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No se encontraron citas
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'No hay citas programadas'}
              </Typography>
            </Box>
          ) : (
            <List sx={{ py: 0 }}>
              {filteredAppointments.map((appointment, index) => (
                <React.Fragment key={appointment.id}>
                    <ListItem
                      sx={{
                        py: 2,
                        px: 2,
                        border: `2px solid ${getPriorityColor(getPriorityString(appointment.priority))}20`,
                        borderRadius: 2,
                        mb: 1,
                        backgroundColor: 'background.paper',
                        '&:hover': {
                          backgroundColor: 'action.hover',
                          transform: 'translateY(-1px)',
                          boxShadow: 2,
                        },
                        transition: 'all 0.2s ease',
                        borderLeft: `6px solid ${getStatusColor(appointment.status)}`,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                        <Avatar
                          sx={{
                            bgcolor: getPriorityColor(getPriorityString(appointment.priority)),
                            width: 40,
                            height: 40,
                          }}
                        >
                          {getPriorityString(appointment.priority) === 'Alta' ? '!' : 
                           getPriorityString(appointment.priority) === 'Media' ? '•' : '↓'}
                        </Avatar>
                      </Box>                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                          <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
                            {appointment.title || 'Cita sin título'}
                          </Typography>
                          <Chip
                            label={appointment.status}
                            size="small"
                            sx={{
                              backgroundColor: getStatusColor(appointment.status),
                              color: 'white',
                              fontWeight: 500,
                            }}
                          />
                          <Chip
                            label={getPriorityString(appointment.priority)}
                            size="small"
                            variant="outlined"
                            sx={{
                              borderColor: getPriorityColor(getPriorityString(appointment.priority)),
                              color: getPriorityColor(getPriorityString(appointment.priority)),
                              fontWeight: 500,
                            }}
                          />
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                            <PersonIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {appointment.clientName}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                            <ScheduleIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {appointment.start ? formatDate(appointment.start) : format(new Date(appointment.appointmentDate || ''), 'EEEE, dd MMMM yyyy', { locale: es })} - {appointment.end ? format(appointment.end, 'HH:mm') : format(new Date(appointment.appointmentDate || ''), 'HH:mm')}
                            </Typography>
                          </Box>
                          {appointment.description && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              {appointment.description}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                    
                    <ListItemSecondaryAction>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Editar cita">
                          <IconButton
                            edge="end"
                            color="primary"
                            onClick={() => onEdit(appointment)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar cita">
                          <IconButton
                            edge="end"
                            color="error"
                            onClick={() => onDelete(appointment.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < filteredAppointments.length - 1 && (
                    <Divider variant="inset" component="li" sx={{ ml: 8 }} />
                  )}
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default AppointmentsList;
