import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Badge,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  CloudUpload as UploadIcon,
  Description as DocumentIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  InsertDriveFile as FileIcon,
  ExpandMore as ExpandMoreIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import apiService from '../services/apiService';

interface Document {
  id: string;
  clientId: string;
  clientName: string;
  fileName: string;
  originalFileName: string;
  fileType: string;
  fileSize: number;
  documentType: string;
  uploadedAt: string;
  description?: string;
}

const documentTypes = [
  'Pasaporte',
  'Visa',
  'Acta de Nacimiento',
  'Acta de Matrimonio',
  'Diploma',
  'Certificado Médico',
  'Antecedentes Penales',
  'Contrato de Trabajo',
  'Evidencia Financiera',
  'Formulario I-94',
  'Formulario I-20',
  'Otros'
];

const Documents: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [newDocument, setNewDocument] = useState({
    clientId: '',
    documentType: '',
    description: ''
  });
  const [clients, setClients] = useState<Array<{id: string, fullName: string}>>([]);

  useEffect(() => {
    loadClients();
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      // Simulando datos de documentos ya que el endpoint puede no existir aún
      const mockDocuments: Document[] = [
        {
          id: '1',
          clientId: '1',
          clientName: 'María García',
          fileName: 'passport_maria_garcia.pdf',
          originalFileName: 'Pasaporte María García.pdf',
          fileType: 'application/pdf',
          fileSize: 2048576,
          documentType: 'Pasaporte',
          uploadedAt: '2025-01-15T10:30:00Z',
          description: 'Pasaporte vigente para solicitud de visa'
        },
        {
          id: '2',
          clientId: '1',
          clientName: 'María García',
          fileName: 'birth_certificate_maria.pdf',
          originalFileName: 'Acta Nacimiento María García.pdf',
          fileType: 'application/pdf',
          fileSize: 1200000,
          documentType: 'Acta de Nacimiento',
          uploadedAt: '2025-01-12T09:00:00Z',
          description: 'Acta de nacimiento apostillada'
        },
        {
          id: '3',
          clientId: '1',
          clientName: 'María García',
          fileName: 'medical_maria.jpg',
          originalFileName: 'Certificado Médico María.jpg',
          fileType: 'image/jpeg',
          fileSize: 850000,
          documentType: 'Certificado Médico',
          uploadedAt: '2025-01-10T14:20:00Z'
        },
        {
          id: '4',
          clientId: '2',
          clientName: 'Juan Rodríguez',
          fileName: 'passport_juan.pdf',
          originalFileName: 'Pasaporte Juan Rodríguez.pdf',
          fileType: 'application/pdf',
          fileSize: 1800000,
          documentType: 'Pasaporte',
          uploadedAt: '2025-01-14T11:15:00Z',
          description: 'Pasaporte renovado recientemente'
        },
        {
          id: '5',
          clientId: '2',
          clientName: 'Juan Rodríguez',
          fileName: 'visa_juan.jpg',
          originalFileName: 'Visa Actual Juan.jpg',
          fileType: 'image/jpeg',
          fileSize: 950000,
          documentType: 'Visa',
          uploadedAt: '2025-01-13T16:45:00Z'
        },
        {
          id: '6',
          clientId: '3',
          clientName: 'Ana López',
          fileName: 'diploma_ana.pdf',
          originalFileName: 'Diploma Universitario Ana López.pdf',
          fileType: 'application/pdf',
          fileSize: 1500000,
          documentType: 'Diploma',
          uploadedAt: '2025-01-08T09:15:00Z',
          description: 'Título universitario apostillado'
        },
        {
          id: '7',
          clientId: '3',
          clientName: 'Ana López',
          fileName: 'marriage_certificate_ana.pdf',
          originalFileName: 'Acta Matrimonio Ana López.pdf',
          fileType: 'application/pdf',
          fileSize: 1100000,
          documentType: 'Acta de Matrimonio',
          uploadedAt: '2025-01-05T13:30:00Z'
        }
      ];
      
      setDocuments(mockDocuments);
    } catch (error) {
      console.error('Error loading documents:', error);
      setError('Error al cargar los documentos');
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      const response = await apiService.getClients();
      if (response && response.length > 0) {
        setClients(response);
      } else {
        // Usar datos mock si no hay respuesta o está vacía
        setClients([
          { id: '1', fullName: 'María García' },
          { id: '2', fullName: 'Juan Rodríguez' },
          { id: '3', fullName: 'Ana López' },
        ]);
      }
    } catch (error) {
      console.warn('API no disponible, usando datos mock para clientes');
      // Datos mock si la API no está disponible
      setClients([
        { id: '1', fullName: 'María García' },
        { id: '2', fullName: 'Juan Rodríguez' },
        { id: '3', fullName: 'Ana López' },
      ]);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !newDocument.clientId || !newDocument.documentType) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      // Simulando la subida del documento
      const mockUploadedDoc: Document = {
        id: Date.now().toString(),
        clientId: newDocument.clientId,
        clientName: clients.find(c => c.id === newDocument.clientId)?.fullName || '',
        fileName: `doc_${Date.now()}_${selectedFile.name}`,
        originalFileName: selectedFile.name,
        fileType: selectedFile.type,
        fileSize: selectedFile.size,
        documentType: newDocument.documentType,
        uploadedAt: new Date().toISOString(),
        description: newDocument.description
      };

      setDocuments(prev => [mockUploadedDoc, ...prev]);
      setOpenDialog(false);
      setSelectedFile(null);
      setNewDocument({ clientId: '', documentType: '', description: '' });
      setError(null);
    } catch (error) {
      console.error('Error uploading document:', error);
      setError('Error al subir el documento');
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <PdfIcon color="error" />;
    if (fileType.includes('image')) return <ImageIcon color="info" />;
    return <FileIcon color="action" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Agrupar documentos por cliente
  const groupDocumentsByClient = () => {
    const grouped: {[key: string]: Document[]} = {};
    
    documents.forEach(doc => {
      if (!grouped[doc.clientId]) {
        grouped[doc.clientId] = [];
      }
      grouped[doc.clientId].push(doc);
    });
    
    return grouped;
  };

  const getClientName = (clientId: string) => {
    // Primero intentar encontrar el cliente en la lista de clientes
    const client = clients.find(c => c.id === clientId);
    if (client) {
      return client.fullName;
    }
    
    // Si no se encuentra, buscar en los documentos por el clientName
    const document = documents.find(d => d.clientId === clientId);
    if (document && document.clientName) {
      return document.clientName;
    }
    
    return 'Cliente Desconocido';
  };

  const getDocumentTypeColor = (type: string) => {
    const colors: {[key: string]: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"} = {
      'Pasaporte': 'primary',
      'Visa': 'secondary',
      'Acta de Nacimiento': 'info',
      'Acta de Matrimonio': 'success',
      'Certificado Médico': 'warning',
      'Antecedentes Penales': 'error',
    };
    return colors[type] || 'default';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Cargando documentos...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: 'text.primary' }}>
            📁 Gestión de Documentos
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Administra todos los documentos de tus clientes de forma organizada
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          size="large"
          sx={{
            borderRadius: 3,
            px: 3,
            py: 1.5,
            textTransform: 'none',
            fontSize: '1rem',
            fontWeight: 600,
            boxShadow: 3,
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            '&:hover': {
              boxShadow: 6,
              transform: 'translateY(-2px)',
              background: 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)',
            },
            transition: 'all 0.3s ease'
          }}
        >
          📤 Subir Documento
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mt: 3 }}>
        {Object.entries(groupDocumentsByClient()).map(([clientId, clientDocuments]) => (
          <Paper 
            key={clientId} 
            sx={{ 
              mb: 3, 
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: 4,
                borderColor: 'primary.light',
              }
            }}
          >
            <Accordion sx={{ boxShadow: 'none' }}>
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon />}
                sx={{ 
                  backgroundColor: 'grey.50',
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  minHeight: 72,
                  '&:hover': {
                    backgroundColor: 'grey.100',
                  },
                  '& .MuiAccordionSummary-content': {
                    margin: '16px 0',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', pr: 2 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    backgroundColor: 'primary.main',
                    color: 'white',
                    borderRadius: '50%',
                    width: 48,
                    height: 48,
                    mr: 3,
                    justifyContent: 'center'
                  }}>
                    <PersonIcon />
                  </Box>
                  
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      {getClientName(clientId)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {clientDocuments.length} documento{clientDocuments.length !== 1 ? 's' : ''} subido{clientDocuments.length !== 1 ? 's' : ''}
                    </Typography>
                  </Box>

                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      setNewDocument(prev => ({ ...prev, clientId }));
                      setOpenDialog(true);
                    }}
                    sx={{ 
                      mr: 2,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontSize: '0.875rem',
                      '&:hover': {
                        backgroundColor: 'primary.light',
                        color: 'white',
                        borderColor: 'primary.light',
                      }
                    }}
                  >
                    Agregar Documento
                  </Button>
                  
                  <Chip 
                    label={clientDocuments.length}
                    color="primary"
                    variant="filled"
                    size="small"
                    sx={{ 
                      minWidth: 24,
                      height: 24,
                      fontSize: '0.75rem',
                      fontWeight: 'bold'
                    }}
                  />
                </Box>
              </AccordionSummary>
              
              <AccordionDetails sx={{ p: 0, backgroundColor: 'background.paper' }}>
                <List sx={{ width: '100%' }}>
                  {clientDocuments.map((document, index) => (
                    <React.Fragment key={document.id}>
                      <ListItem
                        sx={{
                          py: 3,
                          px: 3,
                          transition: 'background-color 0.2s ease',
                          '&:hover': {
                            backgroundColor: 'action.hover',
                          },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 56 }}>
                          <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            backgroundColor: 'primary.light',
                            color: 'primary.contrastText'
                          }}>
                            {getFileIcon(document.fileType)}
                          </Box>
                        </ListItemIcon>
                        
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                              <Typography 
                                variant="subtitle1" 
                                sx={{ 
                                  fontWeight: 600,
                                  color: 'text.primary',
                                  flexGrow: 1
                                }}
                              >
                                {document.originalFileName}
                              </Typography>
                              <Chip 
                                label={document.documentType}
                                color={getDocumentTypeColor(document.documentType)}
                                size="small"
                                variant="outlined"
                                sx={{ fontWeight: 500 }}
                              />
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                📊 Tamaño: {formatFileSize(document.fileSize)} • 
                                📅 Subido: {new Date(document.uploadedAt).toLocaleDateString('es-ES', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </Typography>
                              {document.description && (
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    mt: 1,
                                    p: 1.5,
                                    backgroundColor: 'grey.50',
                                    borderRadius: 1,
                                    fontStyle: 'italic',
                                    color: 'text.secondary',
                                    border: '1px solid',
                                    borderColor: 'divider'
                                  }}
                                >
                                  💬 {document.description}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                        
                        <ListItemSecondaryAction>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton 
                              size="small" 
                              color="primary"
                              title="Visualizar documento"
                              sx={{
                                backgroundColor: 'primary.light',
                                color: 'white',
                                '&:hover': {
                                  backgroundColor: 'primary.main',
                                }
                              }}
                            >
                              <ViewIcon fontSize="small" />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              color="success"
                              title="Descargar documento"
                              sx={{
                                backgroundColor: 'success.light',
                                color: 'white',
                                '&:hover': {
                                  backgroundColor: 'success.main',
                                }
                              }}
                            >
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              color="error"
                              title="Eliminar documento"
                              sx={{
                                backgroundColor: 'error.light',
                                color: 'white',
                                '&:hover': {
                                  backgroundColor: 'error.main',
                                }
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </ListItemSecondaryAction>
                      </ListItem>
                      
                      {index < clientDocuments.length - 1 && (
                        <Divider sx={{ mx: 3 }} />
                      )}
                    </React.Fragment>
                  ))}
                  
                  {/* Mensaje de estado vacío para cada cliente */}
                  {clientDocuments.length === 0 && (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                      <DocumentIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                        No hay documentos para este cliente
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => {
                          setNewDocument(prev => ({ ...prev, clientId }));
                          setOpenDialog(true);
                        }}
                        sx={{ borderRadius: 2 }}
                      >
                        Subir Primer Documento
                      </Button>
                    </Box>
                  )}
                </List>
              </AccordionDetails>
            </Accordion>
          </Paper>
        ))}
      </Box>

      {documents.length === 0 && (
        <Paper 
          sx={{ 
            p: 6, 
            textAlign: 'center', 
            mt: 4,
            borderRadius: 3,
            border: '2px dashed',
            borderColor: 'divider',
            backgroundColor: 'grey.50'
          }}
        >
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2
          }}>
            <Box sx={{
              backgroundColor: 'primary.light',
              borderRadius: '50%',
              p: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <DocumentIcon sx={{ fontSize: 64, color: 'white' }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary' }}>
              📂 No hay documentos disponibles
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400 }}>
              Comienza subiendo el primer documento para organizar los archivos de tus clientes de manera profesional
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
              sx={{
                mt: 2,
                px: 4,
                py: 1.5,
                borderRadius: 3,
                textTransform: 'none',
                fontSize: '1.1rem',
                fontWeight: 600,
                background: 'linear-gradient(45deg, #4CAF50 30%, #66BB6A 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #388E3C 30%, #4CAF50 90%)',
                  transform: 'translateY(-2px)',
                  boxShadow: 6,
                },
                transition: 'all 0.3s ease'
              }}
            >
              🚀 Subir Primer Documento
            </Button>
          </Box>
        </Paper>
      )}

      {/* Dialog para subir documento */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        maxWidth="md" 
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 3,
            boxShadow: 24,
          }
        }}
      >
        <DialogTitle sx={{ 
          backgroundColor: 'primary.main', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          fontSize: '1.25rem',
          fontWeight: 600
        }}>
          <UploadIcon />
          📤 Subir Nuevo Documento
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel sx={{ fontWeight: 500 }}>👤 Cliente</InputLabel>
              <Select
                value={newDocument.clientId}
                onChange={(e) => setNewDocument(prev => ({...prev, clientId: e.target.value}))}
                sx={{ borderRadius: 2 }}
              >
                {clients.map((client) => (
                  <MenuItem key={client.id} value={client.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <PersonIcon color="primary" />
                      {client.fullName}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel sx={{ fontWeight: 500 }}>📋 Tipo de Documento</InputLabel>
              <Select
                value={newDocument.documentType}
                onChange={(e) => setNewDocument(prev => ({...prev, documentType: e.target.value}))}
                sx={{ borderRadius: 2 }}
              >
                {documentTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <DocumentIcon color="primary" />
                      {type}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="💬 Descripción (opcional)"
              multiline
              rows={3}
              value={newDocument.description}
              onChange={(e) => setNewDocument(prev => ({...prev, description: e.target.value}))}
              sx={{ 
                '& .MuiOutlinedInput-root': { 
                  borderRadius: 2 
                },
                '& .MuiInputLabel-root': {
                  fontWeight: 500
                }
              }}
              placeholder="Agrega una descripción detallada del documento..."
            />
            
            <Paper
              elevation={0}
              sx={{
                border: '3px dashed',
                borderColor: selectedFile ? 'success.main' : 'primary.light',
                borderRadius: 3,
                p: 4,
                textAlign: 'center',
                cursor: 'pointer',
                backgroundColor: selectedFile ? 'success.50' : 'primary.50',
                transition: 'all 0.3s ease',
                '&:hover': { 
                  borderColor: selectedFile ? 'success.dark' : 'primary.main',
                  backgroundColor: selectedFile ? 'success.100' : 'primary.100',
                  transform: 'scale(1.02)'
                }
              }}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <input
                id="file-input"
                type="file"
                hidden
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <Box sx={{
                  backgroundColor: selectedFile ? 'success.main' : 'primary.main',
                  borderRadius: '50%',
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <UploadIcon sx={{ fontSize: 48, color: 'white' }} />
                </Box>
                <Typography variant="h6" sx={{ 
                  fontWeight: 600,
                  color: selectedFile ? 'success.dark' : 'primary.dark'
                }}>
                  {selectedFile ? `✅ ${selectedFile.name}` : '📎 Selecciona un archivo'}
                </Typography>
                <Typography color="text.secondary" sx={{ fontSize: '0.9rem' }}>
                  📄 Formatos soportados: PDF, DOC, DOCX, JPG, PNG
                </Typography>
                {selectedFile && (
                  <Chip
                    label={`📊 Tamaño: ${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`}
                    color="success"
                    variant="outlined"
                    sx={{ mt: 1 }}
                  />
                )}
              </Box>
            </Paper>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button 
            onClick={() => setOpenDialog(false)}
            variant="outlined"
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
              px: 3
            }}
          >
            ❌ Cancelar
          </Button>
          <Button 
            onClick={handleUpload} 
            variant="contained"
            disabled={!selectedFile || !newDocument.clientId || !newDocument.documentType}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 4,
              background: 'linear-gradient(45deg, #4CAF50 30%, #66BB6A 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #388E3C 30%, #4CAF50 90%)',
                boxShadow: 6,
              },
              '&:disabled': {
                background: 'grey.300',
                color: 'grey.500'
              }
            }}
          >
            🚀 Subir Documento
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Documents;
