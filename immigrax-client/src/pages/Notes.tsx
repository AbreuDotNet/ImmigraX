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
  Avatar,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Notes as NotesIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
  PriorityHigh as HighPriorityIcon,
  Flag as FlagIcon,
} from '@mui/icons-material';
import apiService from '../services/apiService';

interface Note {
  id: string;
  clientId: string;
  clientName: string;
  title: string;
  content: string;
  category: string;
  priority: 'Baja' | 'Media' | 'Alta' | 'Crítica';
  isImportant: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

const noteCategories = [
  'Consulta General',
  'Documentación',
  'Seguimiento de Caso',
  'Recordatorio',
  'Reunión',
  'Llamada Telefónica',
  'Email',
  'Observaciones Legales',
  'Progreso del Caso',
  'Otros'
];

const priorityColors = {
  'Baja': 'success' as const,
  'Media': 'info' as const,
  'Alta': 'warning' as const,
  'Crítica': 'error' as const,
};

const Notes: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [newNote, setNewNote] = useState({
    clientId: '',
    title: '',
    content: '',
    category: '',
    priority: 'Media' as Note['priority'],
    isImportant: false
  });
  const [clients, setClients] = useState<Array<{id: string, fullName: string}>>([]);

  useEffect(() => {
    loadNotes();
    loadClients();
  }, []);

  const loadNotes = async () => {
    try {
      setLoading(true);
      // Simulando datos de notas ya que el endpoint puede no existir aún
      const mockNotes: Note[] = [
        {
          id: '1',
          clientId: '1',
          clientName: 'María García',
          title: 'Revisión de documentos',
          content: 'Cliente presentó todos los documentos requeridos para el proceso de visa. Falta apostillar el acta de nacimiento. Programar seguimiento para la próxima semana.',
          category: 'Documentación',
          priority: 'Media',
          isImportant: true,
          createdAt: '2025-01-15T10:30:00Z',
          updatedAt: '2025-01-15T10:30:00Z',
          createdBy: 'Daniel Abreu'
        },
        {
          id: '2',
          clientId: '2',
          clientName: 'Juan Rodríguez',
          title: 'Consulta telefónica',
          content: 'Cliente llamó preocupado por los tiempos de procesamiento. Se le explicó el proceso y se tranquilizó. Solicitar actualización al USCIS.',
          category: 'Llamada Telefónica',
          priority: 'Baja',
          isImportant: false,
          createdAt: '2025-01-10T14:20:00Z',
          updatedAt: '2025-01-10T14:20:00Z',
          createdBy: 'María González'
        },
        {
          id: '3',
          clientId: '3',
          clientName: 'Ana López',
          title: 'URGENTE: Fecha de audiencia',
          content: 'USCIS programó audiencia para el 25 de enero. Contactar inmediatamente al cliente para preparación. Revisar todos los documentos y preparar estrategia.',
          category: 'Observaciones Legales',
          priority: 'Crítica',
          isImportant: true,
          createdAt: '2025-01-08T09:15:00Z',
          updatedAt: '2025-01-08T09:15:00Z',
          createdBy: 'Daniel Abreu'
        },
        {
          id: '4',
          clientId: '1',
          clientName: 'María García',
          title: 'Progreso del caso',
          content: 'Caso avanzando según lo esperado. Documentos enviados al USCIS. Tiempo estimado de respuesta: 3-4 meses.',
          category: 'Progreso del Caso',
          priority: 'Media',
          isImportant: false,
          createdAt: '2025-01-05T16:45:00Z',
          updatedAt: '2025-01-05T16:45:00Z',
          createdBy: 'Ana Secretaria'
        }
      ];
      
      // Ordenar por fecha de creación (más recientes primero)
      mockNotes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setNotes(mockNotes);
    } catch (error) {
      console.error('Error loading notes:', error);
      setError('Error al cargar las notas');
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

  const handleSaveNote = async () => {
    if (!newNote.clientId || !newNote.title || !newNote.content) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      const noteToSave: Note = {
        id: editingNote?.id || Date.now().toString(),
        clientId: newNote.clientId,
        clientName: clients.find(c => c.id === newNote.clientId)?.fullName || '',
        title: newNote.title,
        content: newNote.content,
        category: newNote.category,
        priority: newNote.priority,
        isImportant: newNote.isImportant,
        createdAt: editingNote?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'Usuario Actual'
      };

      if (editingNote) {
        // Editar nota existente
        setNotes(prev => prev.map(note => 
          note.id === editingNote.id ? noteToSave : note
        ));
      } else {
        // Crear nueva nota
        setNotes(prev => [noteToSave, ...prev]);
      }

      handleCloseDialog();
      setError(null);
    } catch (error) {
      console.error('Error saving note:', error);
      setError('Error al guardar la nota');
    }
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setNewNote({
      clientId: note.clientId,
      title: note.title,
      content: note.content,
      category: note.category,
      priority: note.priority,
      isImportant: note.isImportant
    });
    setOpenDialog(true);
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes(prev => prev.filter(note => note.id !== noteId));
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingNote(null);
    setNewNote({
      clientId: '',
      title: '',
      content: '',
      category: '',
      priority: 'Media',
      isImportant: false
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Cargando notas...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Notas de Clientes
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          size="large"
        >
          Nueva Nota
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {notes.map((note) => (
          <Card key={note.id} sx={{ position: 'relative' }}>
            {note.isImportant && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  zIndex: 1
                }}
              >
                <FlagIcon color="warning" />
              </Box>
            )}
            
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                <Box flex={1}>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {note.title}
                    {note.priority === 'Crítica' && (
                      <HighPriorityIcon color="error" sx={{ ml: 1, verticalAlign: 'middle' }} />
                    )}
                  </Typography>
                  
                  <Box display="flex" alignItems="center" gap={2} mb={1}>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <PersonIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {note.clientName}
                      </Typography>
                    </Box>
                    
                    <Chip 
                      label={note.category}
                      size="small"
                      variant="outlined"
                    />
                    
                    <Chip 
                      label={note.priority}
                      size="small"
                      color={priorityColors[note.priority]}
                    />
                  </Box>
                </Box>
              </Box>
              
              <Typography variant="body1" paragraph>
                {note.content}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" alignItems="center" gap={1}>
                  <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                    {note.createdBy.charAt(0)}
                  </Avatar>
                  <Typography variant="body2" color="text.secondary">
                    {note.createdBy}
                  </Typography>
                </Box>
                
                <Box display="flex" alignItems="center" gap={0.5}>
                  <TimeIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(note.createdAt)}
                  </Typography>
                  {note.updatedAt !== note.createdAt && (
                    <Typography variant="body2" color="text.secondary">
                      (editado)
                    </Typography>
                  )}
                </Box>
              </Box>
            </CardContent>
            
            <CardActions>
              <IconButton 
                size="small" 
                color="primary"
                onClick={() => handleEditNote(note)}
              >
                <EditIcon />
              </IconButton>
              <IconButton 
                size="small" 
                color="error"
                onClick={() => handleDeleteNote(note.id)}
              >
                <DeleteIcon />
              </IconButton>
            </CardActions>
          </Card>
        ))}
      </Box>

      {notes.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center', mt: 3 }}>
          <NotesIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No hay notas disponibles
          </Typography>
          <Typography color="text.secondary">
            Crea tu primera nota para comenzar
          </Typography>
        </Paper>
      )}

      {/* Dialog para crear/editar nota */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingNote ? 'Editar Nota' : 'Nueva Nota'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Cliente</InputLabel>
              <Select
                value={newNote.clientId}
                onChange={(e) => setNewNote(prev => ({...prev, clientId: e.target.value}))}
              >
                {clients.map((client) => (
                  <MenuItem key={client.id} value={client.id}>
                    {client.fullName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Título"
              value={newNote.title}
              onChange={(e) => setNewNote(prev => ({...prev, title: e.target.value}))}
            />
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Categoría</InputLabel>
                <Select
                  value={newNote.category}
                  onChange={(e) => setNewNote(prev => ({...prev, category: e.target.value}))}
                >
                  {noteCategories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl fullWidth>
                <InputLabel>Prioridad</InputLabel>
                <Select
                  value={newNote.priority}
                  onChange={(e) => setNewNote(prev => ({...prev, priority: e.target.value as Note['priority']}))}
                >
                  <MenuItem value="Baja">Baja</MenuItem>
                  <MenuItem value="Media">Media</MenuItem>
                  <MenuItem value="Alta">Alta</MenuItem>
                  <MenuItem value="Crítica">Crítica</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            <TextField
              fullWidth
              label="Contenido"
              multiline
              rows={6}
              value={newNote.content}
              onChange={(e) => setNewNote(prev => ({...prev, content: e.target.value}))}
            />
            
            <Box display="flex" alignItems="center">
              <input
                type="checkbox"
                id="important-checkbox"
                checked={newNote.isImportant}
                onChange={(e) => setNewNote(prev => ({...prev, isImportant: e.target.checked}))}
              />
              <label htmlFor="important-checkbox" style={{ marginLeft: 8 }}>
                <Typography variant="body2">
                  Marcar como importante
                </Typography>
              </label>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button 
            onClick={handleSaveNote} 
            variant="contained"
            disabled={!newNote.clientId || !newNote.title || !newNote.content}
          >
            {editingNote ? 'Actualizar' : 'Crear'} Nota
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Notes;
