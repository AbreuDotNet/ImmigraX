import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  LinearProgress,
  Stack
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Send as SendIcon,
  Description as FormIcon,
  Preview as PreviewIcon,
  Email as EmailIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';

interface FormTemplate {
  id: string;
  name: string;
  description?: string;
  formType: string;
  processType: string;
  version: number;
  isActive: boolean;
  createdAt: string;
  sections: FormSection[];
  requiredDocuments: FormRequiredDocument[];
}

interface FormSection {
  id: string;
  title: string;
  description?: string;
  sectionOrder: number;
  isRequired: boolean;
  fields: FormField[];
}

interface FormField {
  id: string;
  fieldName: string;
  fieldLabel: string;
  fieldType: string;
  fieldOrder: number;
  isRequired: boolean;
  placeholder?: string;
  helpText?: string;
  options?: any;
  validationRules?: any;
}

interface FormRequiredDocument {
  id: string;
  documentType: string;
  documentName: string;
  description?: string;
  isRequired: boolean;
  acceptedFormats: string;
  maxFileSize: number;
  documentOrder: number;
}

interface ClientForm {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  formTitle: string;
  formType: string;
  status: string;
  accessToken: string;
  expiresAt?: string;
  submittedAt?: string;
  reviewedAt?: string;
  completionPercentage: number;
  instructions?: string;
  createdAt: string;
  updatedAt: string;
}

const FormsManagement: React.FC = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [clientForms, setClientForms] = useState<ClientForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [sendFormDialogOpen, setSendFormDialogOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    formType: '',
    processType: '',
    sections: [] as any[]
  });

  // Datos para envío de formulario
  const [sendFormData, setSendFormData] = useState({
    clientId: '',
    formTemplateId: '',
    formTitle: '',
    expiresAt: '',
    instructions: '',
    sendEmail: true
  });
  const [clients, setClients] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const templatesData = await apiService.getFormTemplates();
      const clientFormsData = await apiService.getClientForms();
      const clientsData = await apiService.getClients();
      
      setTemplates(templatesData || []);
      setClientForms(clientFormsData || []);
      setClients(clientsData || []);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    try {
      await apiService.createFormTemplate(newTemplate);
      setCreateDialogOpen(false);
      setNewTemplate({
        name: '',
        description: '',
        formType: '',
        processType: '',
        sections: []
      });
      loadData();
    } catch (error) {
      console.error('Error creando plantilla:', error);
    }
  };

  const handleSendForm = async () => {
    try {
      await apiService.sendFormToClient(sendFormData);
      setSendFormDialogOpen(false);
      setSendFormData({
        clientId: '',
        formTemplateId: '',
        formTitle: '',
        expiresAt: '',
        instructions: '',
        sendEmail: true
      });
      loadData();
    } catch (error) {
      console.error('Error enviando formulario:', error);
    }
  };

  const handleSendReminder = async (formId: string) => {
    try {
      await apiService.sendFormReminder(formId);
    } catch (error) {
      console.error('Error enviando recordatorio:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'default';
      case 'IN_PROGRESS': return 'primary';
      case 'COMPLETED': return 'success';
      case 'REVIEWED': return 'info';
      case 'EXPIRED': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Pendiente';
      case 'IN_PROGRESS': return 'En Progreso';
      case 'COMPLETED': return 'Completado';
      case 'REVIEWED': return 'Revisado';
      case 'EXPIRED': return 'Expirado';
      default: return status;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ width: '100%' }}>
          <LinearProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Gestión de Formularios
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Administra plantillas de formularios y envía formularios a clientes
        </Typography>
      </Box>

      {/* Botones de acción */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Crear Plantilla
        </Button>
        <Button
          variant="outlined"
          startIcon={<SendIcon />}
          onClick={() => setSendFormDialogOpen(true)}
        >
          Enviar Formulario
        </Button>
      </Box>

      {/* Plantillas de Formularios */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Plantillas de Formularios ({templates.length})
        </Typography>
        
        {templates.length === 0 ? (
          <Typography variant="body2" color="textSecondary">
            No hay plantillas de formularios disponibles.
          </Typography>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 3 }}>
            {templates.map((template) => (
            <Card key={template.id}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <FormIcon sx={{ mr: 1 }} />
                  <Typography variant="h6" component="div">
                    {template.name}
                  </Typography>
                </Box>
                
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  {template.description}
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip label={template.formType} size="small" />
                  <Chip label={template.processType} size="small" color="primary" />
                </Box>
                
                <Typography variant="caption" color="textSecondary">
                  Versión {template.version} • {template.sections?.length || 0} secciones
                </Typography>
              </CardContent>
              
              <CardActions>
                <Button size="small" startIcon={<PreviewIcon />}>
                  Vista Previa
                </Button>
                <Button size="small" startIcon={<EditIcon />}>
                  Editar
                </Button>
                <Button
                  size="small"
                  startIcon={<SendIcon />}
                  onClick={() => {
                    setSendFormData(prev => ({ ...prev, formTemplateId: template.id }));
                    setSendFormDialogOpen(true);
                  }}
                >
                  Enviar
                </Button>
              </CardActions>
            </Card>
          ))}
          </Box>
        )}
      </Paper>

      {/* Formularios Enviados a Clientes */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Formularios Enviados a Clientes ({clientForms.length})
        </Typography>
        
        {clientForms.length === 0 ? (
          <Typography variant="body2" color="textSecondary">
            No hay formularios enviados a clientes.
          </Typography>
        ) : (
          <Stack spacing={3}>
            {clientForms.map((form) => (
            <Card key={form.id}>
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="h6" component="div">
                        {form.formTitle}
                      </Typography>
                      <Chip
                        label={getStatusText(form.status)}
                        color={getStatusColor(form.status) as any}
                        size="small"
                        sx={{ ml: 2 }}
                      />
                    </Box>
                    
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                      Cliente: {form.clientName} ({form.clientEmail})
                    </Typography>
                    
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                      Tipo: {form.formType}
                    </Typography>
                    
                    {form.completionPercentage > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Typography variant="body2" sx={{ mr: 1 }}>
                            Progreso:
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {form.completionPercentage}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={form.completionPercentage}
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </Box>
                    )}
                    
                    <Typography variant="caption" color="textSecondary">
                      Enviado: {new Date(form.createdAt).toLocaleDateString()}
                      {form.expiresAt && ` • Expira: ${new Date(form.expiresAt).toLocaleDateString()}`}
                      {form.submittedAt && ` • Enviado: ${new Date(form.submittedAt).toLocaleDateString()}`}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 200 }}>
                    <Button
                      size="small"
                      startIcon={<PreviewIcon />}
                      onClick={() => navigate(`/forms/view/${form.id}`)}
                    >
                      Ver Formulario
                    </Button>
                    
                    {form.status === 'PENDING' && (
                      <Button
                        size="small"
                        startIcon={<EmailIcon />}
                        onClick={() => handleSendReminder(form.id)}
                      >
                        Enviar Recordatorio
                      </Button>
                    )}
                    
                    {form.status === 'COMPLETED' && (
                      <Button
                        size="small"
                        startIcon={<CheckCircleIcon />}
                        color="success"
                      >
                        Marcar Revisado
                      </Button>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
          </Stack>
        )}
      </Paper>

      {/* Dialog para crear plantilla */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Crear Nueva Plantilla de Formulario</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Nombre de la Plantilla"
              value={newTemplate.name}
              onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Descripción"
              multiline
              rows={3}
              value={newTemplate.description}
              onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
              sx={{ mb: 2 }}
            />
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Formulario</InputLabel>
                <Select
                  value={newTemplate.formType}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, formType: e.target.value }))}
                >
                  <MenuItem value="DS-160">DS-160 (Visa Application)</MenuItem>
                  <MenuItem value="I-130">I-130 (Family Petition)</MenuItem>
                  <MenuItem value="I-485">I-485 (Adjustment of Status)</MenuItem>
                  <MenuItem value="N-400">N-400 (Naturalization)</MenuItem>
                  <MenuItem value="CUSTOM">Personalizado</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth>
                <InputLabel>Tipo de Proceso</InputLabel>
                <Select
                  value={newTemplate.processType}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, processType: e.target.value }))}
                >
                  <MenuItem value="VISA_APPLICATION">Solicitud de Visa</MenuItem>
                  <MenuItem value="FAMILY_PETITION">Petición Familiar</MenuItem>
                  <MenuItem value="ADJUSTMENT_STATUS">Ajuste de Estatus</MenuItem>
                  <MenuItem value="NATURALIZATION">Naturalización</MenuItem>
                  <MenuItem value="OTHER">Otro</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleCreateTemplate}>
            Crear Plantilla
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para enviar formulario a cliente */}
      <Dialog
        open={sendFormDialogOpen}
        onClose={() => setSendFormDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Enviar Formulario a Cliente</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Cliente</InputLabel>
                <Select
                  value={sendFormData.clientId}
                  onChange={(e) => setSendFormData(prev => ({ ...prev, clientId: e.target.value }))}
                >
                  {clients.map((client) => (
                    <MenuItem key={client.id} value={client.id}>
                      {client.fullName} ({client.email})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl fullWidth>
                <InputLabel>Plantilla de Formulario</InputLabel>
                <Select
                  value={sendFormData.formTemplateId}
                  onChange={(e) => setSendFormData(prev => ({ ...prev, formTemplateId: e.target.value }))}
                >
                  {templates.map((template) => (
                    <MenuItem key={template.id} value={template.id}>
                      {template.name} ({template.formType})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            
            <TextField
              fullWidth
              label="Título del Formulario"
              value={sendFormData.formTitle}
              onChange={(e) => setSendFormData(prev => ({ ...prev, formTitle: e.target.value }))}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Fecha de Expiración"
              type="date"
              value={sendFormData.expiresAt}
              onChange={(e) => setSendFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Instrucciones para el Cliente"
              multiline
              rows={4}
              value={sendFormData.instructions}
              onChange={(e) => setSendFormData(prev => ({ ...prev, instructions: e.target.value }))}
              sx={{ mb: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSendFormDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSendForm}>
            Enviar Formulario
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default FormsManagement;
