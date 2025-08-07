import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Box,
  Autocomplete,
  Alert,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale/es';
import { Appointment, Client, Priority } from '../types';
import apiService from '../services/apiService';

interface AppointmentFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (appointment: Appointment, clientName?: string) => void;
  appointment?: (Appointment & { clientName?: string }) | null;
  mode: 'create' | 'edit';
  initialDateTime?: Date;
}

const appointmentTypes = [
  'Consulta Inicial',
  'Entrevista Consular',
  'Revisión de Documentos',
  'Seguimiento',
  'Entrega de Documentos',
  'Reunión de Avance',
  'Preparación de Caso',
  'Audiencia',
  'Videoconferencia',
  'Otros'
];

// Helper functions for priority conversion
const convertNumericPriorityToEnum = (numericPriority: number): Priority => {
  switch (numericPriority) {
    case 0:
      return Priority.Baja;
    case 1:
      return Priority.Media;
    case 2:
      return Priority.Alta;
    default:
      return Priority.Media;
  }
};

const convertEnumPriorityToNumeric = (enumPriority: Priority): number => {
  switch (enumPriority) {
    case Priority.Baja:
      return 0;
    case Priority.Media:
      return 1;
    case Priority.Alta:
      return 2;
    default:
      return 1;
  }
};

const AppointmentForm: React.FC<AppointmentFormProps> = ({
  open,
  onClose,
  onSubmit,
  appointment,
  mode,
  initialDateTime
}) => {
  const [formData, setFormData] = useState<{
    clientId: string;
    title: string;
    description: string;
    appointmentType: string;
    priority: Priority;
    appointmentDate: Date;
  }>({
    clientId: '',
    title: '',
    description: '',
    appointmentType: '',
    priority: Priority.Media,
    appointmentDate: new Date(),
  });
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [clientsLoaded, setClientsLoaded] = useState(false);
  const [currentLawFirmId, setCurrentLawFirmId] = useState<string | null>(null);

  const loadClients = useCallback(async () => {
    try {
      console.log('Loading clients...'); // Debug log
      let clientsData;
      if (currentLawFirmId) {
        clientsData = await apiService.getClients(currentLawFirmId);
      } else {
        clientsData = await apiService.getClients();
      }
      console.log('Loaded clients:', clientsData); // Debug log
      setClients(clientsData);
      setClientsLoaded(true);
    } catch (error) {
      console.error('Error loading clients:', error);
      // For development, we can use mock clients if API fails
      const mockClients: Client[] = [
        {
          id: '11111111-1111-1111-1111-111111111111',
          fullName: 'Juan Pérez García',
          email: 'juan@example.com',
          phone: '+1234567890',
          address: 'Calle Principal 123',
          processType: 'Residencia Permanente',
          caseNumber: 'CASE-001',
          processStatus: 'En Proceso',
          notes: 'Cliente activo',
          lawFirmId: '12345678-1234-1234-1234-123456789012',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '22222222-2222-2222-2222-222222222222',
          fullName: 'María González López',
          email: 'maria@example.com',
          phone: '+1234567891',
          address: 'Avenida Central 456',
          processType: 'Ciudadanía',
          caseNumber: 'CASE-002',
          processStatus: 'En Proceso',
          notes: 'Documentos en revisión',
          lawFirmId: '12345678-1234-1234-1234-123456789012',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '33333333-3333-3333-3333-333333333333',
          fullName: 'Carlos Rodríguez Martín',
          email: 'carlos@example.com',
          phone: '+1234567892',
          address: 'Boulevard Norte 789',
          processType: 'Visa de Trabajo',
          caseNumber: 'CASE-003',
          processStatus: 'Completado',
          notes: 'Proceso finalizado exitosamente',
          lawFirmId: '12345678-1234-1234-1234-123456789012',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '44444444-4444-4444-4444-444444444444',
          fullName: 'Ana Silva Fernández',
          email: 'ana@example.com',
          phone: '+1234567893',
          address: 'Plaza Sur 321',
          processType: 'Reunificación Familiar',
          caseNumber: 'CASE-004',
          processStatus: 'En Proceso',
          notes: 'Esperando documentos',
          lawFirmId: '12345678-1234-1234-1234-123456789012',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '55555555-5555-5555-5555-555555555555',
          fullName: 'Roberto Jiménez',
          email: 'roberto@example.com',
          phone: '+1234567894',
          address: 'Calle Este 654',
          processType: 'Visa de Estudiante',
          caseNumber: 'CASE-005',
          processStatus: 'Iniciado',
          notes: 'Consulta inicial programada',
          lawFirmId: '12345678-1234-1234-1234-123456789012',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      setClients(mockClients);
      setClientsLoaded(true);
    }
  }, [currentLawFirmId]);

  const loadCurrentLawFirm = useCallback(async () => {
    try {
      const lawFirm = await apiService.getCurrentLawFirm();
      setCurrentLawFirmId(lawFirm.id);
      console.log('Loaded LawFirm ID:', lawFirm.id);
    } catch (error) {
      console.error('Error loading law firm:', error);
      // Use a fallback or show error
      setSubmitError('Error al cargar información de la firma legal');
    }
  }, []);

  useEffect(() => {
    if (open && !currentLawFirmId) {
      loadCurrentLawFirm();
    }
    
    // Load clients after we have the law firm ID
    if (open && currentLawFirmId && !clientsLoaded) {
      loadClients();
    }
    
    if (open) {
      if (mode === 'edit' && appointment) {
        console.log('=== Editing appointment Debug Info ===');
        console.log('Full appointment object:', appointment);
        console.log('appointment.clientId:', appointment.clientId);
        console.log('appointment.clientName:', appointment.clientName);
        console.log('typeof appointment.clientId:', typeof appointment.clientId);
        console.log('===================================');
        
        // Convert numeric priority to enum if needed
        let appointmentPriority: Priority = Priority.Media;
        if (typeof appointment.priority === 'number') {
          appointmentPriority = convertNumericPriorityToEnum(appointment.priority);
        } else if (appointment.priority) {
          appointmentPriority = appointment.priority;
        }
        
        const newFormData = {
          clientId: appointment.clientId && appointment.clientId !== 'undefined' 
            ? appointment.clientId 
            : '',
          title: appointment.title || '',
          description: appointment.description || '',
          appointmentType: appointment.appointmentType || '',
          priority: appointmentPriority,
          appointmentDate: new Date(appointment.appointmentDate),
        };
        console.log('Set form data for edit (clientId filtered):', newFormData); // Debug log
        setFormData(newFormData);
      } else {
        // Reset form for create mode
        setFormData({
          clientId: '',
          title: '',
          description: '',
          appointmentType: '',
          priority: Priority.Media,
          appointmentDate: initialDateTime || new Date(),
        });
        setSelectedClient(null);
      }
      setErrors({});
      setSubmitError('');
    }
  }, [open, mode, appointment, clientsLoaded, currentLawFirmId, initialDateTime, loadClients, loadCurrentLawFirm]);

  // Separate effect to handle client selection when clients are loaded
  useEffect(() => {
    if (mode === 'edit' && appointment && clients.length > 0) {
      let selectedClientToSet: Client | null = null;
      
      // First try to find by clientId if it exists
      if (formData.clientId && formData.clientId !== 'undefined') {
        selectedClientToSet = clients.find(c => c.id === formData.clientId) || null;
        console.log('Found client by ID:', selectedClientToSet); // Debug log
      }
      
      // If no client found by ID but we have clientName, try to find by name
      if (!selectedClientToSet && appointment.clientName) {
        selectedClientToSet = clients.find(c => c.fullName === appointment.clientName) || null;
        console.log('Found client by name:', selectedClientToSet); // Debug log
        
        // Update formData with the correct clientId if found
        if (selectedClientToSet) {
          setFormData(prev => ({ ...prev, clientId: selectedClientToSet!.id }));
        }
      }
      
      // If still no client found but we have clientName, create a mock client for display
      if (!selectedClientToSet && appointment.clientName) {
        const mockClient: Client = {
          id: appointment.clientId || 'mock-client-id',
          fullName: appointment.clientName,
          email: '',
          phone: '',
          address: '',
          processType: '',
          caseNumber: '',
          processStatus: '',
          notes: '',
          lawFirmId: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        console.log('Creating mock client for display:', mockClient); // Debug log
        selectedClientToSet = mockClient;
        setFormData(prev => ({ ...prev, clientId: mockClient.id }));
      }
      
      if (selectedClientToSet) {
        setSelectedClient(selectedClientToSet);
      } else {
        console.log('No client found or created'); // Debug log
        console.log('Available clients:', clients.map(c => ({ id: c.id, name: c.fullName }))); // Debug log
        console.log('Appointment clientName:', appointment.clientName); // Debug log
        console.log('FormData clientId:', formData.clientId); // Debug log
      }
    }
  }, [clients, mode, appointment, formData.clientId]);

  // Additional effect to ensure we always have the right client selected
  useEffect(() => {
    if (formData.clientId && clients.length > 0 && !selectedClient) {
      const client = clients.find(c => c.id === formData.clientId);
      if (client) {
        console.log('Force setting selected client:', client); // Debug log
        setSelectedClient(client);
      }
    }
  }, [formData.clientId, clients, selectedClient]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedClient) {
      newErrors.clientId = 'Debe seleccionar un cliente';
    }
    
    if (!formData.title.trim()) {
      newErrors.title = 'El título es obligatorio';
    }
    
    if (!formData.appointmentType) {
      newErrors.appointmentType = 'Debe seleccionar un tipo de cita';
    }

    if (!formData.appointmentDate) {
      newErrors.appointmentDate = 'La fecha y hora son obligatorias';
    } else if (formData.appointmentDate < new Date()) {
      newErrors.appointmentDate = 'La fecha debe ser futura';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Function to ensure valid GUID format
  const ensureGuid = (id: string): string => {
    // Check if it's already a GUID format
    const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (guidRegex.test(id)) {
      return id;
    }
    
    // For development/testing, generate a valid GUID from string hash
    // This ensures consistent GUIDs for the same input
    const hash = Array.from(id).reduce((hash, char) => {
      return ((hash << 5) - hash) + char.charCodeAt(0);
    }, 0);
    
    const hashStr = Math.abs(hash).toString(16).padStart(8, '0');
    return `${hashStr.substring(0, 8)}-${hashStr.substring(0, 4)}-4${hashStr.substring(1, 4)}-${'a' + hashStr.substring(1, 3)}-${hashStr}${hashStr.substring(0, 4)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSubmitError('');

    try {
      // Check if we have the law firm ID loaded
      if (!currentLawFirmId) {
        setSubmitError('Error: Información de la firma legal no disponible');
        return;
      }
      
      // Ensure both IDs are in proper GUID format
      const clientGuid = ensureGuid(selectedClient!.id);
      const lawFirmGuid = ensureGuid(currentLawFirmId);
      
      // Convert Priority enum to number for the backend
      const priorityValue = convertEnumPriorityToNumeric(formData.priority);
      
      const appointmentData = {
        clientId: clientGuid,
        lawFirmId: lawFirmGuid,
        title: formData.title,
        description: formData.description,
        appointmentType: formData.appointmentType,
        priority: priorityValue, // Send as number
        appointmentDate: formData.appointmentDate.toISOString(),
      };

      console.log('Sending appointment data:', appointmentData); // Debug log

      let result: Appointment;
      
      if (mode === 'edit' && appointment) {
        result = await apiService.updateAppointment(appointment.id, appointmentData as any);
      } else {
        result = await apiService.createAppointment(appointmentData as any);
      }

      // Pass the client name along with the appointment
      const clientName = selectedClient?.fullName || 'Cliente sin nombre';
      onSubmit(result, clientName);
      onClose();
    } catch (error: any) {
      console.error('Error saving appointment:', error);
      setSubmitError(
        error.response?.data?.message || 
        `Error al ${mode === 'edit' ? 'actualizar' : 'crear'} la cita`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      clientId: '',
      title: '',
      description: '',
      appointmentType: '',
      priority: Priority.Media,
      appointmentDate: new Date(),
    });
    setSelectedClient(null);
    setErrors({});
    setSubmitError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {mode === 'edit' ? 'Editar Cita' : 'Nueva Cita'}
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {submitError}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Autocomplete
              options={clients}
              getOptionLabel={(client) => client.fullName}
              value={selectedClient}
              onChange={(_, newValue) => {
                if (mode !== 'edit') { // Only allow changes in create mode
                  setSelectedClient(newValue);
                  setFormData(prev => ({ ...prev, clientId: newValue?.id || '' }));
                }
                if (errors.clientId) {
                  setErrors(prev => ({ ...prev, clientId: '' }));
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Cliente *"
                  error={!!errors.clientId}
                  helperText={errors.clientId}
                />
              )}
              disabled={loading}
              readOnly={mode === 'edit'}
            />

            <TextField
              fullWidth
              label="Título *"
              value={formData.title}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, title: e.target.value }));
                if (errors.title) {
                  setErrors(prev => ({ ...prev, title: '' }));
                }
              }}
              error={!!errors.title}
              helperText={errors.title}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth error={!!errors.appointmentType}>
                <InputLabel>Tipo de Cita *</InputLabel>
                <Select
                  value={formData.appointmentType}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, appointmentType: e.target.value }));
                    if (errors.appointmentType) {
                      setErrors(prev => ({ ...prev, appointmentType: '' }));
                    }
                  }}
                  label="Tipo de Cita *"
                >
                  {appointmentTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
                {errors.appointmentType && (
                  <FormHelperText>{errors.appointmentType}</FormHelperText>
                )}
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Prioridad</InputLabel>
                <Select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as Priority }))}
                  label="Prioridad"
                >
                  <MenuItem value={Priority.Baja}>Baja</MenuItem>
                  <MenuItem value={Priority.Media}>Media</MenuItem>
                  <MenuItem value={Priority.Alta}>Alta</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
              <DateTimePicker
                label="Fecha y Hora *"
                value={formData.appointmentDate}
                onChange={(newValue) => {
                  if (newValue) {
                    setFormData(prev => ({ ...prev, appointmentDate: newValue }));
                    if (errors.appointmentDate) {
                      setErrors(prev => ({ ...prev, appointmentDate: '' }));
                    }
                  }
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.appointmentDate,
                    helperText: errors.appointmentDate,
                  },
                }}
                minDate={new Date()}
              />
            </LocalizationProvider>

            <TextField
              fullWidth
              label="Descripción"
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe los detalles de la cita..."
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading}
          >
            {loading ? 'Guardando...' : (mode === 'edit' ? 'Actualizar' : 'Crear')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AppointmentForm;
