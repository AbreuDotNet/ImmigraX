import React, { useState, useEffect } from 'react';
import {
  Alert,
  Chip,
  Box,
  Typography,
} from '@mui/material';
import {
  CheckCircle,
  Error,
  Warning,
} from '@mui/icons-material';
import apiService from '../services/apiService';

interface ApiStatusProps {
  showDetails?: boolean;
}

const ApiStatus: React.FC<ApiStatusProps> = ({ showDetails = false }) => {
  const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected' | 'error'>('checking');
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        // Try to fetch dashboard data as a health check
        await apiService.getDashboardData();
        setStatus('connected');
      } catch (error) {
        console.warn('API Health Check Failed:', error);
        setStatus('disconnected');
      } finally {
        setLastCheck(new Date());
      }
    };

    checkApiStatus();
    
    // Check API status every 30 seconds
    const interval = setInterval(checkApiStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusInfo = () => {
    switch (status) {
      case 'checking':
        return {
          color: 'default' as const,
          icon: <Warning />,
          text: 'Verificando...',
          severity: 'info' as const
        };
      case 'connected':
        return {
          color: 'success' as const,
          icon: <CheckCircle />,
          text: 'API Conectada',
          severity: 'success' as const
        };
      case 'disconnected':
        return {
          color: 'warning' as const,
          icon: <Warning />,
          text: 'Modo Sin Conexión',
          severity: 'warning' as const
        };
      case 'error':
        return {
          color: 'error' as const,
          icon: <Error />,
          text: 'Error de Conexión',
          severity: 'error' as const
        };
    }
  };

  const statusInfo = getStatusInfo();

  if (!showDetails && status === 'connected') {
    return null; // Don't show anything if connected and details not requested
  }

  return (
    <Box sx={{ mb: 2 }}>
      <Chip
        icon={statusInfo.icon}
        label={statusInfo.text}
        color={statusInfo.color}
        size="small"
        variant="outlined"
      />
      
      {showDetails && (
        <Alert severity={statusInfo.severity} sx={{ mt: 1 }}>
          <Box>
            <Typography variant="body2">
              {status === 'connected' && 'Conectado a la API de .NET. Los datos se cargan en tiempo real.'}
              {status === 'disconnected' && 'La API no está disponible. Mostrando datos de ejemplo para desarrollo.'}
              {status === 'checking' && 'Verificando conexión con la API...'}
              {status === 'error' && 'Error al conectar con la API. Verifica que el servidor esté ejecutándose.'}
            </Typography>
            {lastCheck && (
              <Typography variant="caption" color="text.secondary">
                Última verificación: {lastCheck.toLocaleTimeString()}
              </Typography>
            )}
          </Box>
        </Alert>
      )}
    </Box>
  );
};

export default ApiStatus;
