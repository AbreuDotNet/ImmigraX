import React from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip
} from '@mui/material';
import {
  PictureAsPdf as PdfIcon,
  Assessment as AssessmentIcon,
  Receipt as ReceiptIcon,
  Person as PersonIcon,
  TrendingUp as TrendingUpIcon,
  Construction as ConstructionIcon
} from '@mui/icons-material';

export default function Reports() {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
        📊 Reportes y Documentos
      </Typography>

      {/* Coming Soon Notice */}
      <Box sx={{ mb: 4, textAlign: 'center', p: 4, bgcolor: 'primary.main', color: 'white', borderRadius: 2 }}>
        <ConstructionIcon sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Sistema de Reportes en Desarrollo
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          Los reportes avanzados estarán disponibles próximamente. 
          La funcionalidad básica de reportes está implementada en el backend.
        </Typography>
        <Chip 
          label="MVP - Funcionalidad Completa en Backend" 
          variant="outlined" 
          sx={{ mt: 2, color: 'white', borderColor: 'white' }} 
        />
      </Box>

      <Grid container spacing={4}>
        {/* Tipos de Reportes Disponibles */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PdfIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" component="h2">
                  Reportes Implementados (Backend)
                </Typography>
              </Box>

              <List>
                <ListItem>
                  <ListItemIcon>
                    <PersonIcon fontSize="small" color="success" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Reporte de Cliente"
                    secondary="API: /api/reports/client/{id} - PDF completo con información del cliente"
                  />
                  <Chip label="✅ Listo" size="small" color="success" />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <ReceiptIcon fontSize="small" color="success" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Facturas de Pago"
                    secondary="API: /api/reports/invoice/{id} - Facturas oficiales en PDF"
                  />
                  <Chip label="✅ Listo" size="small" color="success" />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <AssessmentIcon fontSize="small" color="success" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Reporte Financiero"
                    secondary="API: /api/reports/financial - Análisis de ingresos y pagos"
                  />
                  <Chip label="✅ Listo" size="small" color="success" />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Características Técnicas */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" component="h2">
                  Funcionalidades Técnicas
                </Typography>
              </Box>

              <List>
                <ListItem>
                  <ListItemIcon>
                    <PdfIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Generación de PDF"
                    secondary="Sistema completo de reportes con PdfSharp/MigraDoc"
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <AssessmentIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Análisis de Datos"
                    secondary="Estadísticas financieras y métricas de rendimiento"
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <ReceiptIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Documentos Oficiales"
                    secondary="Facturas y reportes con formato profesional"
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <PersonIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Informes por Cliente"
                    secondary="Reportes detallados con historial completo"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Nota técnica */}
      <Box sx={{ mt: 4, p: 3, bgcolor: 'grey.100', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          📝 Nota Técnica para el MVP
        </Typography>
        <Typography variant="body2" color="text.secondary">
          El sistema de reportes está completamente implementado en el backend con los siguientes servicios:
        </Typography>
        <Box component="ul" sx={{ mt: 2 }}>
          <li>
            <Typography variant="body2">
              <strong>ReportService:</strong> Servicio completo para generación de PDFs
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>ReportsController:</strong> API endpoints funcionales para todos los reportes
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>ActivityLogService:</strong> Sistema de logging integrado en todos los módulos
            </Typography>
          </li>
        </Box>
      </Box>
    </Container>
  );
}
