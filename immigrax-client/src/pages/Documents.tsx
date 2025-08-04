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
  Card,
  CardContent,
  CardActions,
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
    loadDocuments();
    loadClients();
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
          clientId: '2',
          clientName: 'Juan Rodríguez',
          fileName: 'birth_certificate_juan.jpg',
          originalFileName: 'Acta Nacimiento Juan.jpg',
          fileType: 'image/jpeg',
          fileSize: 1536000,
          documentType: 'Acta de Nacimiento',
          uploadedAt: '2025-01-10T14:20:00Z',
          description: 'Acta de nacimiento apostillada'
        },
        {
          id: '3',
          clientId: '3',
          clientName: 'Ana López',
          fileName: 'medical_certificate_ana.pdf',
          originalFileName: 'Certificado Médico Ana López.pdf',
          fileType: 'application/pdf',
          fileSize: 896000,
          documentType: 'Certificado Médico',
          uploadedAt: '2025-01-08T09:15:00Z',
          description: 'Examen médico para inmigración'
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
      setClients(response || []);
    } catch (error) {
      // Datos mock si la API no está disponible
      const mockClients = [
        { id: '1', fullName: 'María García' },
        { id: '2', fullName: 'Juan Rodríguez' },
        { id: '3', fullName: 'Ana López' },
      ];
      setClients(mockClients);
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Gestión de Documentos
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          size="large"
        >
          Subir Documento
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box 
        sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
          gap: 3 
        }}
      >
        {documents.map((document) => (
          <Card key={document.id}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                {getFileIcon(document.fileType)}
                <Typography variant="h6" sx={{ ml: 1, flexGrow: 1 }}>
                  {document.originalFileName}
                </Typography>
              </Box>
              
              <Typography color="text.secondary" gutterBottom>
                Cliente: {document.clientName}
              </Typography>
              
              <Chip 
                label={document.documentType}
                color={getDocumentTypeColor(document.documentType)}
                size="small"
                sx={{ mb: 1 }}
              />
              
              <Typography variant="body2" color="text.secondary">
                Tamaño: {formatFileSize(document.fileSize)}
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                Subido: {new Date(document.uploadedAt).toLocaleDateString()}
              </Typography>
              
              {document.description && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {document.description}
                </Typography>
              )}
            </CardContent>
            
            <CardActions>
              <IconButton size="small" color="primary">
                <ViewIcon />
              </IconButton>
              <IconButton size="small" color="success">
                <DownloadIcon />
              </IconButton>
              <IconButton size="small" color="error">
                <DeleteIcon />
              </IconButton>
            </CardActions>
          </Card>
        ))}
      </Box>

      {documents.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center', mt: 3 }}>
          <DocumentIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No hay documentos disponibles
          </Typography>
          <Typography color="text.secondary">
            Sube tu primer documento para comenzar
          </Typography>
        </Paper>
      )}

      {/* Dialog para subir documento */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Subir Nuevo Documento</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Cliente</InputLabel>
              <Select
                value={newDocument.clientId}
                onChange={(e) => setNewDocument(prev => ({...prev, clientId: e.target.value}))}
              >
                {clients.map((client) => (
                  <MenuItem key={client.id} value={client.id}>
                    {client.fullName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>Tipo de Documento</InputLabel>
              <Select
                value={newDocument.documentType}
                onChange={(e) => setNewDocument(prev => ({...prev, documentType: e.target.value}))}
              >
                {documentTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Descripción (opcional)"
              multiline
              rows={3}
              value={newDocument.description}
              onChange={(e) => setNewDocument(prev => ({...prev, description: e.target.value}))}
            />
            
            <Box
              border="2px dashed #ccc"
              borderRadius={2}
              p={3}
              textAlign="center"
              sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <input
                id="file-input"
                type="file"
                hidden
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              <UploadIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
              <Typography variant="h6" color="text.secondary">
                {selectedFile ? selectedFile.name : 'Selecciona un archivo'}
              </Typography>
              <Typography color="text.secondary">
                Formatos soportados: PDF, DOC, DOCX, JPG, PNG
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button 
            onClick={handleUpload} 
            variant="contained"
            disabled={!selectedFile || !newDocument.clientId || !newDocument.documentType}
          >
            Subir Documento
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Documents;
