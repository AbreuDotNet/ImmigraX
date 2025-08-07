import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Button,
  Card,
  CardHeader,
  ToggleButton,
  ToggleButtonGroup,
  Fab,
  CircularProgress,
} from '@mui/material';
import {
  Add,
  CalendarMonth,
  ViewList,
} from '@mui/icons-material';
import { Appointment, AppointmentWithClient, AppointmentStatus, Priority } from '../types';
import AppointmentsList from '../components/AppointmentsList';
import apiService from '../services/apiService';
import ApiStatus from '../components/ApiStatus';
import AppointmentForm from '../components/AppointmentForm';
import AppointmentDeleteConfirm from '../components/AppointmentDeleteConfirm';
import CalendarView from '../components/CalendarView';

// Mock data for development
const mockAppointments: AppointmentWithClient[] = [
  {
    id: '1',
    clientId: '11111111-1111-1111-1111-111111111111',
    lawFirmId: '12345678-1234-1234-1234-123456789012',
    title: 'Consulta Inicial - Residencia Permanente',
    description: 'Primera consulta para evaluar el caso de residencia permanente',
    appointmentType: 'Consulta',
    priority: Priority.Alta,
    appointmentDate: '2025-08-07T10:00:00Z',
    duration: 60,
    status: AppointmentStatus.Programada,
    createdBy: 'user1',
    createdAt: '2025-08-06T15:00:00Z',
    clientName: 'Juan Pérez García'
  },
  {
    id: '2',
    clientId: '22222222-2222-2222-2222-222222222222',
    lawFirmId: '12345678-1234-1234-1234-123456789012',
    title: 'Revisión de Documentos',
    description: 'Revisión de documentos para solicitud de ciudadanía',
    appointmentType: 'Revisión',
    priority: Priority.Media,
    appointmentDate: '2025-08-08T14:00:00Z',
    duration: 45,
    status: AppointmentStatus.Confirmada,
    createdBy: 'user1',
    createdAt: '2025-08-06T16:00:00Z',
    clientName: 'María González López'
  },
  {
    id: '3',
    clientId: '33333333-3333-3333-3333-333333333333',
    lawFirmId: '12345678-1234-1234-1234-123456789012',
    title: 'Entrega Final de Documentos',
    description: 'Entrega de documentos finales del proceso de visa de trabajo',
    appointmentType: 'Entrega',
    priority: Priority.Baja,
    appointmentDate: '2025-08-09T09:00:00Z',
    duration: 30,
    status: AppointmentStatus.Completada,
    createdBy: 'user1',
    createdAt: '2025-08-05T10:00:00Z',
    clientName: 'Carlos Rodríguez Martín'
  },
  {
    id: '4',
    clientId: '44444444-4444-4444-4444-444444444444',
    lawFirmId: '12345678-1234-1234-1234-123456789012',
    title: 'Cita de Seguimiento',
    description: 'Seguimiento del proceso de reunificación familiar',
    appointmentType: 'Seguimiento',
    priority: Priority.Alta,
    appointmentDate: '2025-08-10T11:30:00Z',
    duration: 30,
    status: AppointmentStatus.Programada,
    createdBy: 'user1',
    createdAt: '2025-08-06T17:00:00Z',
    clientName: 'Ana Silva Fernández'
  },
  {
    id: '5',
    clientId: '55555555-5555-5555-5555-555555555555',
    lawFirmId: '12345678-1234-1234-1234-123456789012',
    title: 'Consulta de Visa de Estudiante',
    description: 'Consulta sobre proceso de visa de estudiante',
    appointmentType: 'Consulta',
    priority: Priority.Media,
    appointmentDate: '2025-08-12T16:00:00Z',
    duration: 60,
    status: AppointmentStatus.Programada,
    createdBy: 'user1',
    createdAt: '2025-08-06T18:00:00Z',
    clientName: 'Roberto Jiménez'
  }
];

const Appointments: React.FC = () => {
  const [appointments, setAppointments] = useState<AppointmentWithClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  
  // Form states
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [newEventSlot, setNewEventSlot] = useState<{ start: Date; end: Date } | null>(null);
  
  // Delete confirmation states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<Appointment | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      // Try to fetch real data from API
      const appointmentsData = await apiService.getAppointments();
      // For now, we'll add mock client names since the API might not include them
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

  const handleCreateAppointment = () => {
    setSelectedAppointment(null);
    setFormMode('create');
    setFormOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!appointmentToDelete) return;

    try {
      setDeleteLoading(true);
      await apiService.deleteAppointment(appointmentToDelete.id);
      setAppointments(prev => prev.filter(apt => apt.id !== appointmentToDelete.id));
    } catch (err) {
      console.error('Error deleting appointment:', err);
    } finally {
      setDeleteLoading(false);
      setDeleteConfirmOpen(false);
      setAppointmentToDelete(null);
    }
  };

  const handleFormSubmit = (appointment: Appointment, clientName?: string) => {
    if (formMode === 'create') {
      const newAppointment = {
        ...appointment,
        clientName: clientName || 'Cliente desconocido',
        duration: 60
      };
      setAppointments(prev => [newAppointment, ...prev]);
    } else {
      setAppointments(prev =>
        prev.map(apt =>
          apt.id === appointment.id
            ? { ...appointment, clientName: clientName || apt.clientName, duration: apt.duration }
            : apt
        )
      );
    }
    setFormOpen(false);
    setNewEventSlot(null);
  };

  // New handlers for calendar
  const handleSelectEvent = (appointment: Appointment & { clientName?: string; duration?: number }) => {
    setSelectedAppointment(appointment);
    setFormMode('edit');
    setFormOpen(true);
  };

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    setNewEventSlot(slotInfo);
    setSelectedAppointment(null);
    setFormMode('create');
    setFormOpen(true);
  };

  // Edit and Delete handlers for list view
  const handleEditAppointment = (appointment: AppointmentWithClient) => {
    setSelectedAppointment(appointment);
    setFormMode('edit');
    setFormOpen(true);
  };

  const handleDeleteAppointment = (appointmentId: string) => {
    const appointment = appointments.find(apt => apt.id === appointmentId);
    if (appointment) {
      setAppointmentToDelete(appointment);
      setDeleteConfirmOpen(true);
    }
  };

  // Convert appointments to calendar format
  const calendarAppointments = appointments.map(appointment => ({
    ...appointment,
    start: new Date(appointment.appointmentDate),
    end: new Date(new Date(appointment.appointmentDate).getTime() + (appointment.duration || 60) * 60000),
  }));

  // Convert appointments for list view (they already have the right format)
  const listAppointments = appointments.map(appointment => ({
    ...appointment,
    start: new Date(appointment.appointmentDate),
    end: new Date(new Date(appointment.appointmentDate).getTime() + (appointment.duration || 60) * 60000),
  }));

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress size={50} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <ApiStatus />
      
      {/* Header */}
      <Card sx={{ mb: 3 }}>
        <CardHeader 
          title="Gestión de Citas"
          subheader="Administra todas tus citas desde el calendario"
          action={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(_, newView) => newView && setViewMode(newView)}
                size="small"
              >
                <ToggleButton value="calendar">
                  <CalendarMonth sx={{ mr: 1 }} />
                  Calendario
                </ToggleButton>
                <ToggleButton value="list">
                  <ViewList sx={{ mr: 1 }} />
                  Lista
                </ToggleButton>
              </ToggleButtonGroup>
              
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleCreateAppointment}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Nueva Cita
              </Button>
            </Box>
          }
        />
      </Card>

      {/* Calendar or List View */}
      {viewMode === 'calendar' ? (
        <CalendarView
          appointments={calendarAppointments}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          loading={loading}
        />
      ) : (
        <AppointmentsList 
          appointments={listAppointments}
          onEdit={(appointment) => {
            const fullAppointment = appointments.find(a => a.id === appointment.id);
            if (fullAppointment) {
              handleEditAppointment(fullAppointment);
            }
          }}
          onDelete={handleDeleteAppointment}
        />
      )}

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ 
          position: 'fixed', 
          bottom: 16, 
          right: 16,
          display: { xs: 'flex', md: 'none' }, // Solo mostrar en móviles
        }}
        onClick={handleCreateAppointment}
      >
        <Add />
      </Fab>

      {/* Modals */}
      <AppointmentForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setNewEventSlot(null);
        }}
        onSubmit={handleFormSubmit}
        appointment={selectedAppointment}
        mode={formMode}
        initialDateTime={newEventSlot?.start}
      />

      <AppointmentDeleteConfirm
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        appointment={appointmentToDelete}
        loading={deleteLoading}
      />
    </Container>
  );
};

export default Appointments;
