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
import { useAuth } from '../context/AuthContext';

interface ApiStatusProps {
  showDetails?: boolean;
}

const ApiStatus: React.FC<ApiStatusProps> = ({ showDetails = false }) => {
  const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected' | 'error'>('checking');
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const checkApiStatus = async () => {
      // Only check API status if user is authenticated
      if (!isAuthenticated) {
        setStatus('disconnected');
        setLastCheck(new Date());
        return;
      }

      try {
        // Try a simple health check - just verify the API responds
        const response = await fetch('http://localhost:5109/api/clients', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok || response.status === 401) {
          // 200 OK or 401 Unauthorized both mean API is responding
          setStatus('connected');
        } else {
          setStatus('disconnected');
        }
      } catch (error) {
        console.warn('API Health Check Failed:', error);
        setStatus('disconnected');
      } finally {
        setLastCheck(new Date());
      }
    };

    checkApiStatus();
    
    // Check API status every 30 seconds, but only if authenticated
    const interval = setInterval(() => {
      if (isAuthenticated) {
        checkApiStatus();
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [isAuthenticated]);

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
              {status === 'disconnected' && !isAuthenticated && 'Necesitas iniciar sesión para conectar con la API.'}
              {status === 'disconnected' && isAuthenticated && 'La API no está disponible. Mostrando datos de ejemplo para desarrollo.'}
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
