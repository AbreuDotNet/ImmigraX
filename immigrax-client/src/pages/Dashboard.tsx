import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  Alert,
  CircularProgress,
  Container,
  Stack,
  Snackbar,
} from '@mui/material';
import {
  People,
  Event,
  AttachMoney,
  Warning,
} from '@mui/icons-material';
import { DashboardData } from '../types';
import apiService from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import ActivityLog from '../components/ActivityLog';

// Mock data for development - replace with API call
const mockData: DashboardData = {
  executiveSummary: {
    totalClients: 156,
    activeClients: 134,
    totalRevenue: 45000,
    pendingPayments: 8500,
    upcomingAppointments: [
      {
        clientName: "Juan Pérez",
        appointmentType: "Consulta",
        appointmentDate: "2024-01-15T10:00:00Z",
        status: "Programada"
      },
      {
        clientName: "María González",
        appointmentType: "Revisión de Documentos",
        appointmentDate: "2024-01-16T14:00:00Z",
        status: "Confirmada"
      }
    ],
    casesByStatus: [
      { status: "En Proceso", count: 15 },
      { status: "Pendiente", count: 8 },
      { status: "Completado", count: 23 }
    ]
  },
  performanceMetrics: {
    completedAppointments: 45,
    documentsUploaded: 67,
    averageResponseHours: 2.5,
    resolutionRate: 78,
    periodRevenue: 12000
  },
  alerts: [
    {
      type: "urgente",
      message: "Cita urgente con Juan Pérez mañana a las 10:00 AM"
    },
    {
      type: "warning",
      message: "Documento de María González pendiente de revisión"
    },
    {
      type: "info",
      message: "Pago de Carlos Rodríguez recibido"
    }
  ]
};

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiNotification, setApiNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      // If user is not authenticated, use mock data immediately
      if (!isAuthenticated) {
        console.log('User not authenticated, using mock data');
        setData(mockData);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
       // console.log('Attempting to fetch dashboard data from API...');
        
        // Try to fetch real dashboard data
        const response = await apiService.getDashboardData();
        // console.log('Dashboard data fetched successfully:', response);
        setData(response);
        
        // Show success notification
        setApiNotification({
          open: true,
          message: '✅ API conectada correctamente. Datos actualizados.',
          severity: 'success'
        });
      } catch (err) {
        console.warn('Dashboard API failed, using mock data:', err);
        setError('Dashboard API temporalmente no disponible');
        
        // Show error notification
        setApiNotification({
          open: true,
          message: '⚠️ API no disponible. Usando datos de prueba.',
          severity: 'warning'
        });
        
        // Fallback to mock data if API fails
        await new Promise(resolve => setTimeout(resolve, 500));
        setData(mockData);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAuthenticated]);

  const handleCloseNotification = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setApiNotification(prev => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!data) {
    return (
      <Alert severity="warning" sx={{ mt: 2 }}>
        No se pudieron cargar los datos del dashboard
      </Alert>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 4,
        p: 3,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: 2,
        color: 'white'
      }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ mb: 1, color: 'white' }}>
            Dashboard Ejecutivo
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
            Sistema de Gestión Legal SynerVisa
          </Typography>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Box 
        sx={{ 
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)'
          },
          gap: 3,
          mb: 4
        }}
      >
        <Card>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <People color="primary" />
              <Box>
                <Typography color="textSecondary" gutterBottom>
                  Total Clientes
                </Typography>
                <Typography variant="h5">
                  {data.executiveSummary.totalClients}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {data.executiveSummary.activeClients} activos
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <AttachMoney color="success" />
              <Box>
                <Typography color="textSecondary" gutterBottom>
                  Ingresos del Mes
                </Typography>
                <Typography variant="h5">
                  ${data.executiveSummary.totalRevenue.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  ${data.executiveSummary.pendingPayments.toLocaleString()} pendientes
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Event color="info" />
              <Box>
                <Typography color="textSecondary" gutterBottom>
                  Citas esta Semana
                </Typography>
                <Typography variant="h5">
                  {data.executiveSummary.upcomingAppointments.length}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  próximos 7 días
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Warning color="warning" />
              <Box>
                <Typography color="textSecondary" gutterBottom>
                  Tareas Pendientes
                </Typography>
                <Typography variant="h5">
                  {data.performanceMetrics.completedAppointments}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  tareas completadas
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Box>

      {/* Performance Metrics and Alerts */}
      <Box 
        sx={{ 
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(2, 1fr)'
          },
          gap: 3
        }}
      >
        {/* Performance Metrics */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Métricas de Rendimiento
          </Typography>
          <Stack spacing={2}>
            <Box>
              <Typography variant="body2" color="textSecondary">
                Documentos Subidos
              </Typography>
              <Typography variant="h6">
                {data.performanceMetrics.documentsUploaded}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="textSecondary">
                Tasa de Resolución
              </Typography>
              <Typography variant="h6">
                {data.performanceMetrics.resolutionRate}%
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="textSecondary">
                Tiempo Promedio de Respuesta
              </Typography>
              <Typography variant="h6">
                {data.performanceMetrics.averageResponseHours} horas
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="textSecondary">
                Ingresos del Período
              </Typography>
              <Typography variant="h6">
                ${data.performanceMetrics.periodRevenue.toLocaleString()}
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {/* Activity Log */}
        <ActivityLog maxItems={8} />

        {/* Alerts */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Alertas y Notificaciones
          </Typography>
          <List>
            {data.alerts.map((alert, index) => (
              <ListItem key={index} divider>
                <ListItemText
                  primary={alert.message}
                  secondary={`Tipo: ${alert.type}`}
                />
                <Chip
                  label={alert.type}
                  size="small"
                  color={
                    alert.type === 'urgente' ? 'error' :
                    alert.type === 'warning' ? 'warning' : 'info'
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Box>

      <Alert severity="info" sx={{ mt: 3 }}>
        Dashboard configurado correctamente. Los datos se actualizan automáticamente.
      </Alert>

      {/* Notification Snackbar */}
      <Snackbar
        open={apiNotification.open}
        autoHideDuration={3000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={apiNotification.severity}
          sx={{ 
            width: '100%',
            boxShadow: 4,
            borderRadius: 2
          }}
        >
          {apiNotification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Dashboard;
