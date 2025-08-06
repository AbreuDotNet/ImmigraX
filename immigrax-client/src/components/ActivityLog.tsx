import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Typography,
  Box,
  Chip,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  PersonAdd,
  Event,
  Email,
  Description,
  AttachMoney,
  Note,
  Phone,
  Edit,
  CheckCircle,
  Cancel,
  Upload,
  Send,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { ActivityLog as ActivityLogType, ActivityType } from '../types';
import apiService from '../services/apiService';

interface ActivityLogProps {
  maxItems?: number;
  clientId?: string; // If provided, show activities for specific client only
}

const ActivityLog: React.FC<ActivityLogProps> = ({ maxItems = 10, clientId }) => {
  const [activities, setActivities] = useState<ActivityLogType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const getMockActivities = (): ActivityLogType[] => [
    {
      id: '1',
      userId: 'user1',
      userName: 'Dr. Carlos Rodriguez',
      clientId: 'client1',
      clientName: 'María González',
      activityType: ActivityType.EMAIL_SENT,
      description: 'Envió email con documentos requeridos',
      metadata: { subject: 'Documentos para proceso migratorio' },
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    },
    {
      id: '2',
      userId: 'user1',
      userName: 'Dr. Carlos Rodriguez',
      clientId: 'client2',
      clientName: 'Juan Pérez',
      activityType: ActivityType.APPOINTMENT_CONFIRMED,
      description: 'Confirmó cita para consulta inicial',
      metadata: { appointmentDate: '2025-08-10T10:00:00Z' },
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    },
    {
      id: '3',
      userId: 'user1',
      userName: 'Dr. Carlos Rodriguez',
      clientId: 'client3',
      clientName: 'Ana López',
      activityType: ActivityType.DOCUMENT_REVIEWED,
      description: 'Revisó y aprobó documentos del cliente',
      metadata: { documentType: 'Certificado de Nacimiento' },
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    },
    {
      id: '4',
      userId: 'user1',
      userName: 'Dr. Carlos Rodriguez',
      clientId: 'client1',
      clientName: 'María González',
      activityType: ActivityType.PAYMENT_RECEIVED,
      description: 'Registró pago de honorarios',
      metadata: { amount: 1500, paymentMethod: 'Transferencia' },
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    },
    {
      id: '5',
      userId: 'user1',
      userName: 'Dr. Carlos Rodriguez',
      clientId: 'client4',
      clientName: 'Roberto Silva',
      activityType: ActivityType.PHONE_CALL_MADE,
      description: 'Llamada telefónica de seguimiento',
      metadata: { duration: '15 min', notes: 'Cliente satisfecho con el progreso' },
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    },
  ];

  const loadActivities = React.useCallback(async () => {
    try {
      setLoading(true);
      // Try to get real data from API
      const data = await apiService.getActivityLog(clientId, maxItems);
      setActivities(data);
    } catch (err) {
      console.error('Error loading activities:', err);
      setError('Error al cargar actividades');
      // Fallback to mock data for development
      setActivities(getMockActivities());
    } finally {
      setLoading(false);
    }
  }, [clientId, maxItems]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const getActivityIcon = (type: ActivityType) => {
    const iconProps = { fontSize: 'small' as const };
    
    switch (type) {
      case ActivityType.CLIENT_CREATED:
        return <PersonAdd {...iconProps} color="primary" />;
      case ActivityType.CLIENT_UPDATED:
        return <Edit {...iconProps} color="info" />;
      case ActivityType.APPOINTMENT_SCHEDULED:
        return <Event {...iconProps} color="primary" />;
      case ActivityType.APPOINTMENT_CONFIRMED:
        return <CheckCircle {...iconProps} color="success" />;
      case ActivityType.APPOINTMENT_CANCELLED:
        return <Cancel {...iconProps} color="error" />;
      case ActivityType.EMAIL_SENT:
        return <Email {...iconProps} color="info" />;
      case ActivityType.DOCUMENT_UPLOADED:
        return <Upload {...iconProps} color="warning" />;
      case ActivityType.DOCUMENT_REVIEWED:
        return <Description {...iconProps} color="success" />;
      case ActivityType.PAYMENT_RECEIVED:
        return <AttachMoney {...iconProps} color="success" />;
      case ActivityType.PAYMENT_REMINDER_SENT:
        return <AttachMoney {...iconProps} color="warning" />;
      case ActivityType.NOTE_ADDED:
        return <Note {...iconProps} color="info" />;
      case ActivityType.FORM_SENT:
        return <Send {...iconProps} color="primary" />;
      case ActivityType.FORM_COMPLETED:
        return <CheckCircle {...iconProps} color="success" />;
      case ActivityType.CASE_STATUS_UPDATED:
        return <Edit {...iconProps} color="warning" />;
      case ActivityType.PHONE_CALL_MADE:
        return <Phone {...iconProps} color="info" />;
      default:
        return <Note {...iconProps} />;
    }
  };

  const getActivityColor = (type: ActivityType): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (type) {
      case ActivityType.APPOINTMENT_CONFIRMED:
      case ActivityType.PAYMENT_RECEIVED:
      case ActivityType.DOCUMENT_REVIEWED:
      case ActivityType.FORM_COMPLETED:
        return 'success';
      case ActivityType.APPOINTMENT_CANCELLED:
        return 'error';
      case ActivityType.PAYMENT_REMINDER_SENT:
      case ActivityType.CASE_STATUS_UPDATED:
        return 'warning';
      case ActivityType.EMAIL_SENT:
      case ActivityType.PHONE_CALL_MADE:
      case ActivityType.NOTE_ADDED:
        return 'info';
      case ActivityType.CLIENT_CREATED:
      case ActivityType.APPOINTMENT_SCHEDULED:
      case ActivityType.FORM_SENT:
        return 'primary';
      default:
        return 'default';
    }
  };

  const getActivityTypeLabel = (type: ActivityType): string => {
    const labels: Record<ActivityType, string> = {
      [ActivityType.CLIENT_CREATED]: 'Cliente Creado',
      [ActivityType.CLIENT_UPDATED]: 'Cliente Actualizado',
      [ActivityType.APPOINTMENT_SCHEDULED]: 'Cita Programada',
      [ActivityType.APPOINTMENT_CONFIRMED]: 'Cita Confirmada',
      [ActivityType.APPOINTMENT_CANCELLED]: 'Cita Cancelada',
      [ActivityType.EMAIL_SENT]: 'Email Enviado',
      [ActivityType.DOCUMENT_UPLOADED]: 'Documento Subido',
      [ActivityType.DOCUMENT_REVIEWED]: 'Documento Revisado',
      [ActivityType.PAYMENT_RECEIVED]: 'Pago Recibido',
      [ActivityType.PAYMENT_REMINDER_SENT]: 'Recordatorio de Pago',
      [ActivityType.NOTE_ADDED]: 'Nota Agregada',
      [ActivityType.FORM_SENT]: 'Formulario Enviado',
      [ActivityType.FORM_COMPLETED]: 'Formulario Completado',
      [ActivityType.CASE_STATUS_UPDATED]: 'Estado Actualizado',
      [ActivityType.PHONE_CALL_MADE]: 'Llamada Realizada',
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader title="Actividades Recientes" />
        <CardContent>
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader title="Actividades Recientes" />
        <CardContent>
          <Alert severity="error">{error}</Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader 
        title="Actividades Recientes"
        subheader={`Últimas ${activities.length} actividades registradas`}
      />
      <CardContent>
        {activities.length === 0 ? (
          <Alert severity="info">No hay actividades registradas aún</Alert>
        ) : (
          <List disablePadding>
            {activities.map((activity, index) => (
              <React.Fragment key={activity.id}>
                <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 40, mt: 1 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'transparent' }}>
                      {getActivityIcon(activity.activityType)}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="body2" component="span" fontWeight="medium">
                          {activity.userName}
                        </Typography>
                        <Chip
                          label={getActivityTypeLabel(activity.activityType)}
                          size="small"
                          color={getActivityColor(activity.activityType)}
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.primary" gutterBottom>
                          {activity.description}
                        </Typography>
                        {activity.clientName && (
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Cliente: {activity.clientName}
                          </Typography>
                        )}
                        {activity.metadata && (
                          <Typography variant="caption" color="text.secondary">
                            {activity.metadata.subject && `Asunto: ${activity.metadata.subject}`}
                            {activity.metadata.amount && `Monto: $${activity.metadata.amount.toLocaleString()}`}
                            {activity.metadata.duration && `Duración: ${activity.metadata.duration}`}
                          </Typography>
                        )}
                        <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                          {formatDistanceToNow(new Date(activity.createdAt), { 
                            addSuffix: true, 
                            locale: es 
                          })}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                {index < activities.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityLog;
