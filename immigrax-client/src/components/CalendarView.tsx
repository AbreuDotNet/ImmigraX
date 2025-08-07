import React, { useState, useCallback, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, View, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './CalendarView.css';
import {
  Box,
  Paper,
  Typography,
  Chip,
  IconButton,
  useTheme,
  alpha,
  CircularProgress,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Today,
} from '@mui/icons-material';
import { Appointment, AppointmentStatus } from '../types';

// Configure date-fns localizer
const locales = { 'es': es };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { locale: es }),
  getDay,
  locales,
});

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: Appointment & { clientName?: string; duration?: number };
}

interface CalendarViewProps {
  appointments: (Appointment & { clientName?: string; duration?: number })[];
  onSelectEvent: (appointment: Appointment & { clientName?: string; duration?: number }) => void;
  onSelectSlot: (slotInfo: { start: Date; end: Date }) => void;
  loading?: boolean;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  appointments,
  onSelectEvent,
  onSelectSlot,
  loading = false,
}) => {
  const theme = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<View>(Views.WEEK);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Convert appointments to calendar events
  const events: CalendarEvent[] = useMemo(() => {
    if (!appointments || appointments.length === 0) {
      return [];
    }
    
    return appointments.map((appointment) => {
      try {
        const startDate = new Date(appointment.appointmentDate);
        const duration = appointment.duration || 60; // Default 60 minutes
        const endDate = new Date(startDate.getTime() + duration * 60000);

        // Validar que las fechas sean válidas
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          console.warn('Invalid date for appointment:', appointment);
          return null;
        }

        return {
          id: appointment.id || 'unknown',
          title: appointment.title || `Cita - ${appointment.clientName || 'Cliente'}`,
          start: startDate,
          end: endDate,
          resource: {
            ...appointment,
            status: appointment.status || AppointmentStatus.Programada, // Default status
            clientName: appointment.clientName || 'Cliente sin nombre',
          },
        };
      } catch (error) {
        console.error('Error processing appointment:', appointment, error);
        return null;
      }
    }).filter(Boolean) as CalendarEvent[];
  }, [appointments]);

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
    onSelectEvent(event.resource);
  }, [onSelectEvent]);

  const handleSelectSlot = useCallback((slotInfo: { start: Date; end: Date }) => {
    onSelectSlot(slotInfo);
  }, [onSelectSlot]);

  const handleNavigate = useCallback((date: Date) => {
    setCurrentDate(date);
  }, []);

  const handleViewChange = useCallback((view: View) => {
    setCurrentView(view);
  }, []);

  const getStatusColor = (status?: AppointmentStatus) => {
    if (!status) return theme.palette.grey[500];
    
    switch (status) {
      case AppointmentStatus.Programada:
        return theme.palette.info.main;
      case AppointmentStatus.Confirmada:
        return theme.palette.success.main;
      case AppointmentStatus.Completada:
        return theme.palette.primary.main;
      case AppointmentStatus.Cancelada:
        return theme.palette.error.main;
      case AppointmentStatus.Reprogramada:
        return theme.palette.warning.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getPriorityColor = (priority?: string) => {
    if (!priority || typeof priority !== 'string') return theme.palette.grey[500];
    
    switch (priority.toLowerCase()) {
      case 'alta':
        return theme.palette.error.main; // Rojo para alta prioridad
      case 'media':
        return theme.palette.warning.main; // Naranja para media prioridad
      case 'baja':
        return theme.palette.success.main; // Verde para baja prioridad
      default:
        return theme.palette.grey[500];
    }
  };

  // Función combinada que da prioridad a la prioridad, luego al estado
  const getEventColor = (appointment: any) => {
    // Validar que appointment existe
    if (!appointment) return theme.palette.grey[500];
    
    // Si tiene prioridad alta, usar color de prioridad
    if (appointment.priority && typeof appointment.priority === 'string' && appointment.priority.toLowerCase() === 'alta') {
      return getPriorityColor('alta');
    }
    // Si está cancelada, usar color de estado
    if (appointment.status === AppointmentStatus.Cancelada) {
      return getStatusColor(appointment.status);
    }
    // Si tiene prioridad válida, usar color de prioridad
    if (appointment.priority && typeof appointment.priority === 'string') {
      return getPriorityColor(appointment.priority);
    }
    // Por defecto, usar color de estado
    return getStatusColor(appointment.status || 'Programada');
  };

  // Custom event component
  const EventComponent = ({ event }: { event: CalendarEvent }) => {
    try {
      const eventColor = getEventColor(event.resource);
      const statusClass = `status-${(event.resource.status || 'default').toLowerCase().replace(/\s+/g, '-')}`;
      const priorityValue = event.resource.priority && typeof event.resource.priority === 'string' 
        ? event.resource.priority.toLowerCase() 
        : 'media';
      const priorityClass = `priority-${priorityValue}`;
      
      // Determine if we're in week/day view vs month view for styling
      const isTimeView = currentView === Views.WEEK || currentView === Views.DAY;
      
      return (
        <Box
          className={`${statusClass} ${priorityClass}`}
          sx={{
            p: isTimeView ? 1 : 0.5,
            borderRadius: 1,
            backgroundColor: alpha(eventColor, 0.9),
            color: 'white',
            borderLeft: `4px solid ${eventColor}`,
            height: '100%',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            minHeight: isTimeView ? '60px' : '24px', // Minimum height for better visibility
            '&:hover': {
              backgroundColor: eventColor,
              transform: 'scale(1.02)',
              boxShadow: 2,
            },
            transition: 'all 0.2s ease',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Indicador de prioridad - siempre visible para prioridad alta */}
          {event.resource.priority && typeof event.resource.priority === 'string' && event.resource.priority.toLowerCase() === 'alta' && (
            <Box
              sx={{
                position: 'absolute',
                top: 4,
                right: 4,
                width: isTimeView ? 12 : 8,
                height: isTimeView ? 12 : 8,
                borderRadius: '50%',
                backgroundColor: '#f44336', // Red color directly
                border: '2px solid white',
                zIndex: 10,
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}
            />
          )}
          
          {/* Cliente - texto más grande arriba */}
          <Typography 
            variant="caption" 
            fontWeight="bold" 
            display="block" 
            noWrap
            sx={{ 
              fontSize: isTimeView ? '0.6rem' : '0.65rem', 
              lineHeight: 1.2,
              mb: isTimeView ? 0.2 : 0.1,
              color: 'white',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
              pr: 2 // Padding right to avoid overlap with priority indicator
            }}
          >
            {event.resource.clientName || 'Cliente'}
          </Typography>
          
          {/* Título - texto más pequeño abajo */}
          <Typography 
            variant="caption" 
            display="block" 
            noWrap
            sx={{ 
              fontSize: isTimeView ? '0.55rem' : '0.6rem', 
              lineHeight: 1.1,
              mb: isTimeView ? 0.3 : 0.1,
              opacity: 0.95,
              pr: 2 // Padding right to avoid overlap with priority indicator
            }}
          >
            {event.title || 'Sin título'}
          </Typography>

          {/* Información adicional solo para vista semanal/diaria */}
          {isTimeView && (
            <>
              <Typography 
                variant="caption" 
                noWrap
                sx={{ fontSize: '0.5rem', opacity: 0.9, lineHeight: 1.1, mb: 0.2 }}
              >
                {event.start ? format(event.start, 'HH:mm') : ''} - {event.end ? format(event.end, 'HH:mm') : ''}
              </Typography>
              
              {/* Mostrar prioridad si existe */}
              {event.resource.priority && typeof event.resource.priority === 'string' && (
                <Typography 
                  variant="caption" 
                  noWrap
                  sx={{ 
                    fontSize: '0.45rem', 
                    opacity: 0.85, 
                    lineHeight: 1,
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    backgroundColor: alpha('white', 0.25),
                    px: 0.4,
                    py: 0.1,
                    borderRadius: 0.3,
                    mt: 'auto',
                    alignSelf: 'flex-start'
                  }}
                >
                  {event.resource.priority}
                </Typography>
              )}
            </>
          )}
        </Box>
      );
    } catch (error) {
      console.error('Error rendering event:', error, event);
      return (
        <Box sx={{ p: 0.5, backgroundColor: 'error.light', color: 'white', borderRadius: 1 }}>
          <Typography variant="caption">Error en evento</Typography>
        </Box>
      );
    }
  };

  // Custom toolbar
  const CustomToolbar = (toolbar: any) => {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
          p: 1,
          backgroundColor: alpha(theme.palette.primary.main, 0.05),
          borderRadius: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={() => toolbar.onNavigate('PREV')}>
            <ChevronLeft />
          </IconButton>
          <IconButton onClick={() => toolbar.onNavigate('TODAY')}>
            <Today />
          </IconButton>
          <IconButton onClick={() => toolbar.onNavigate('NEXT')}>
            <ChevronRight />
          </IconButton>
          <Typography variant="h6" sx={{ ml: 2, fontWeight: 'bold' }}>
            {toolbar.label}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          {[
            { key: Views.MONTH, label: 'Mes' },
            { key: Views.WEEK, label: 'Semana' },
            { key: Views.DAY, label: 'Día' },
            { key: Views.AGENDA, label: 'Agenda' },
          ].map((view) => (
            <Chip
              key={view.key}
              label={view.label}
              onClick={() => toolbar.onView(view.key)}
              color={currentView === view.key ? 'primary' : 'default'}
              variant={currentView === view.key ? 'filled' : 'outlined'}
              size="small"
            />
          ))}
        </Box>
      </Box>
    );
  };

  const messages = {
    allDay: 'Todo el día',
    previous: 'Anterior',
    next: 'Siguiente',
    today: 'Hoy',
    month: 'Mes',
    week: 'Semana',
    day: 'Día',
    agenda: 'Agenda',
    date: 'Fecha',
    time: 'Hora',
    event: 'Evento',
    showMore: (total: number) => `+${total} más`,
    noEventsInRange: 'No hay citas en este rango de fechas',
  };

  return (
    <>
      <Paper sx={{ p: 2, height: 'calc(100vh - 200px)', position: 'relative' }}>
        {loading && (
          <Box 
            sx={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              zIndex: 1000
            }}
          >
            <CircularProgress />
          </Box>
        )}
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          date={currentDate}
          view={currentView}
          onNavigate={handleNavigate}
          onView={handleViewChange}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable
          popup
          messages={messages}
          components={{
            toolbar: CustomToolbar,
            event: EventComponent,
          }}
          step={30}
          timeslots={2}
          min={new Date(2023, 0, 1, 7, 0)} // 7:00 AM
          max={new Date(2023, 0, 1, 21, 0)} // 9:00 PM
          showMultiDayTimes
          getNow={() => new Date()}
          dayLayoutAlgorithm="no-overlap"
          formats={{
            timeGutterFormat: 'HH:mm',
            eventTimeRangeFormat: ({ start, end }) =>
              `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`,
            dayFormat: 'ccc dd/MM',
            dateFormat: 'dd',
            monthHeaderFormat: 'MMMM yyyy',
            dayHeaderFormat: 'eeee dd/MM',
            dayRangeHeaderFormat: ({ start, end }) =>
              `${format(start, 'dd/MM')} - ${format(end, 'dd/MM')}`,
          }}
          style={{ height: '100%' }}
        />
      </Paper>

      {selectedEvent && (
        <div>
          {/* Event details will be handled by parent component */}
        </div>
      )}
    </>
  );
};

export default CalendarView;
