import React, { useState, useEffect } from 'react';
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
  Typography,
  Alert,
  CircularProgress,
  Box
} from '@mui/material';
import { Client, ClientCreateRequest } from '../../types';
import apiService from '../../services/apiService';

interface ClientFormProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  client?: Client | null;
  mode: 'create' | 'edit';
}

const PROCESS_TYPES = [
  'Residencia Permanente',
  'Ciudadanía',
  'Visa de Trabajo',
  'Visa de Estudiante',
  'Visa de Turista',
  'Reunificación Familiar',
  'Asilo',
  'TPS',
  'DACA',
  'Otro'
];

const PROCESS_STATUS = [
  'Pendiente',
  'En Proceso',
  'En Revisión',
  'Documentos Pendientes',
  'Completado',
  'Cancelado'
];

const ClientForm: React.FC<ClientFormProps> = ({
  open,
  onClose,
  onSave,
  client,
  mode
}) => {
  const [formData, setFormData] = useState<ClientCreateRequest>({
    lawFirmId: '',
    fullName: '',
    email: '',
    phone: '',
    address: '',
    processType: '',
    caseNumber: '',
    processStatus: 'Pendiente'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (client && mode === 'edit') {
      setFormData({
        lawFirmId: client.lawFirmId,
        fullName: client.fullName,
        email: client.email || '',
        phone: client.phone || '',
        address: client.address || '',
        processType: client.processType,
        caseNumber: client.caseNumber || '',
        processStatus: client.processStatus || 'Pendiente'
      });
    } else {
      // Reset form for create mode
      setFormData({
        lawFirmId: '',
        fullName: '',
        email: '',
        phone: '',
        address: '',
        processType: '',
        caseNumber: '',
        processStatus: 'Pendiente'
      });
    }
    setError(null);
    setFieldErrors({});
  }, [client, mode, open]);

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.fullName.trim()) {
      errors.fullName = 'El nombre completo es requerido';
    }
    
    if (!formData.processType) {
      errors.processType = 'El tipo de proceso es requerido';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'El email no es válido';
    }
    
    if (formData.phone && !/^[+]?[1-9][\d\-().\s]+$/.test(formData.phone)) {
      errors.phone = 'El número de teléfono no es válido';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof ClientCreateRequest) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSelectChange = (field: keyof ClientCreateRequest) => (
    event: any
  ) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear field error when user selects
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (mode === 'create') {
        // For create mode, we need to get the law firm ID from the user's context
        // For now, we'll use a default law firm ID - this should be improved
        const clientData: ClientCreateRequest = {
          ...formData,
          lawFirmId: '00000000-0000-0000-0000-000000000001' // Default law firm ID
        };
        
        await apiService.createClient(clientData);
      } else if (client) {
        await apiService.updateClient(client.id, formData);
      }
      
      onSave();
      handleClose();
    } catch (err: any) {
      console.error('Error saving client:', err);
      setError(err.response?.data?.message || 'Error al guardar el cliente');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      lawFirmId: '',
      fullName: '',
      email: '',
      phone: '',
      address: '',
      processType: '',
      caseNumber: '',
      processStatus: 'Pendiente'
    });
    setError(null);
    setFieldErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6">
          {mode === 'create' ? 'Nuevo Cliente' : 'Editar Cliente'}
        </Typography>
      </DialogTitle>
      
      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            fullWidth
            label="Nombre Completo *"
            value={formData.fullName}
            onChange={handleInputChange('fullName')}
            error={!!fieldErrors.fullName}
            helperText={fieldErrors.fullName}
            disabled={loading}
          />
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleInputChange('email')}
              error={!!fieldErrors.email}
              helperText={fieldErrors.email}
              disabled={loading}
            />
            
            <TextField
              fullWidth
              label="Teléfono"
              value={formData.phone}
              onChange={handleInputChange('phone')}
              error={!!fieldErrors.phone}
              helperText={fieldErrors.phone}
              disabled={loading}
              placeholder="+1-555-0123"
            />
          </Box>
          
          <TextField
            fullWidth
            label="Dirección"
            multiline
            rows={2}
            value={formData.address}
            onChange={handleInputChange('address')}
            disabled={loading}
          />
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth error={!!fieldErrors.processType}>
              <InputLabel>Tipo de Proceso *</InputLabel>
              <Select
                value={formData.processType}
                onChange={handleSelectChange('processType')}
                label="Tipo de Proceso *"
                disabled={loading}
              >
                {PROCESS_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
              {fieldErrors.processType && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                  {fieldErrors.processType}
                </Typography>
              )}
            </FormControl>
            
            <TextField
              fullWidth
              label="Número de Caso"
              value={formData.caseNumber}
              onChange={handleInputChange('caseNumber')}
              disabled={loading}
              placeholder="CASE-2024-001"
            />
          </Box>
          
          <FormControl fullWidth>
            <InputLabel>Estado del Proceso</InputLabel>
            <Select
              value={formData.processStatus}
              onChange={handleSelectChange('processStatus')}
              label="Estado del Proceso"
              disabled={loading}
            >
              {PROCESS_STATUS.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 2 }}>
        <Button 
          onClick={handleClose} 
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Guardando...' : (mode === 'create' ? 'Crear Cliente' : 'Guardar Cambios')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClientForm;
