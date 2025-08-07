import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
  Box,
  CircularProgress
} from '@mui/material';
import { Warning } from '@mui/icons-material';
import { Client } from '../../types';

interface ClientDeleteConfirmProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  client: Client | null;
  loading?: boolean;
}

const ClientDeleteConfirm: React.FC<ClientDeleteConfirmProps> = ({
  open,
  onClose,
  onConfirm,
  client,
  loading = false
}) => {
  if (!client) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Warning color="warning" />
        Confirmar Eliminación
      </DialogTitle>
      
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Esta acción no se puede deshacer.
        </Alert>
        
        <Typography variant="body1" gutterBottom>
          ¿Estás seguro de que deseas eliminar el cliente <strong>{client.fullName}</strong>?
        </Typography>
        
        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="body2" gutterBottom>
            <strong>Cliente:</strong> {client.fullName}
          </Typography>
          <Typography variant="body2" gutterBottom>
            <strong>Proceso:</strong> {client.processType}
          </Typography>
          {client.caseNumber && (
            <Typography variant="body2" gutterBottom>
              <strong>Número de Caso:</strong> {client.caseNumber}
            </Typography>
          )}
          <Typography variant="body2">
            <strong>Estado:</strong> {client.processStatus}
          </Typography>
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Se eliminarán también todos los documentos, citas, pagos y notas asociados a este cliente.
        </Typography>
      </DialogContent>
      
      <DialogActions sx={{ p: 2 }}>
        <Button 
          onClick={onClose} 
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Eliminando...' : 'Eliminar Cliente'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClientDeleteConfirm;
