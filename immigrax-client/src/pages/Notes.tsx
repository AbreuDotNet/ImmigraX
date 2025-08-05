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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: 'text.primary' }}>
            📝 Notas de Clientes
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Gestiona y organiza todas las notas importantes de tus clientes
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
            background: 'linear-gradient(45deg, #FF6B6B 30%, #FF8E8E 90%)',
            '&:hover': {
              boxShadow: 6,
              transform: 'translateY(-2px)',
              background: 'linear-gradient(45deg, #FF5252 30%, #FF6B6B 90%)',
            },
            transition: 'all 0.3s ease'
          }}
        >
          ✨ Nueva Nota
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
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(2, 1fr)',
            lg: 'repeat(3, 1fr)'
          },
          gap: 3
        }}
      >
        {notes.map((note) => (
          <Card 
            key={note.id} 
            sx={{ 
              position: 'relative',
              borderRadius: 3,
              boxShadow: 3,
              border: '1px solid',
              borderColor: note.isImportant ? 'warning.light' : 'divider',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: 8,
                transform: 'translateY(-4px)',
                borderColor: note.isImportant ? 'warning.main' : 'primary.light',
              },
              background: note.isImportant 
                ? 'linear-gradient(135deg, #FFF8E1 0%, #FFFFFF 100%)'
                : 'linear-gradient(135deg, #F8F9FA 0%, #FFFFFF 100%)',
              overflow: 'hidden'
            }}
          >
            {/* Header with priority indicator */}
            <Box
              sx={{
                background: note.priority === 'Crítica' 
                  ? 'linear-gradient(45deg, #F44336 30%, #FF6B6B 90%)'
                  : note.priority === 'Alta'
                  ? 'linear-gradient(45deg, #FF9800 30%, #FFB74D 90%)'
                  : note.priority === 'Media'
                  ? 'linear-gradient(45deg, #2196F3 30%, #64B5F6 90%)'
                  : 'linear-gradient(45deg, #4CAF50 30%, #81C784 90%)',
                height: 6,
                width: '100%'
              }}
            />
            
            {/* Important flag */}
            {note.isImportant && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  zIndex: 2,
                  backgroundColor: 'warning.main',
                  borderRadius: '50%',
                  p: 0.5,
                  boxShadow: 2
                }}
              >
                <FlagIcon sx={{ color: 'white', fontSize: '1rem' }} />
              </Box>
            )}
            
            <CardContent sx={{ p: 3, pb: 1 }}>
              {/* Title and Priority */}
              <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={2}>
                <Typography 
                  variant="h6" 
                  component="h3" 
                  sx={{ 
                    fontWeight: 600,
                    color: 'text.primary',
                    fontSize: '1.1rem',
                    lineHeight: 1.3,
                    pr: note.isImportant ? 5 : 0
                  }}
                >
                  {note.title}
                  {note.priority === 'Crítica' && (
                    <HighPriorityIcon 
                      sx={{ 
                        ml: 1, 
                        verticalAlign: 'middle',
                        color: 'error.main',
                        fontSize: '1.2rem'
                      }} 
                    />
                  )}
                </Typography>
              </Box>
              
              {/* Client and metadata */}
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 0.5,
                    backgroundColor: 'primary.light',
                    color: 'white',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 2,
                    fontSize: '0.8rem'
                  }}
                >
                  <PersonIcon sx={{ fontSize: '1rem' }} />
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {note.clientName}
                  </Typography>
                </Box>
              </Box>

              {/* Category and Priority chips */}
              <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                <Chip 
                  label={note.category}
                  size="small"
                  variant="outlined"
                  sx={{ 
                    borderRadius: 1.5,
                    fontWeight: 500,
                    fontSize: '0.75rem'
                  }}
                />
                <Chip 
                  label={note.priority}
                  size="small"
                  color={priorityColors[note.priority]}
                  sx={{ 
                    borderRadius: 1.5,
                    fontWeight: 600,
                    fontSize: '0.75rem'
                  }}
                />
              </Box>
              
              {/* Content */}
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'text.secondary',
                  lineHeight: 1.5,
                  mb: 2,
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {note.content}
              </Typography>
              
              {/* Footer with author and date */}
              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  pt: 2,
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  mt: 2
                }}
              >
                <Box display="flex" alignItems="center" gap={1}>
                  <Avatar 
                    sx={{ 
                      width: 28, 
                      height: 28, 
                      fontSize: '0.75rem',
                      backgroundColor: 'primary.main'
                    }}
                  >
                    {note.createdBy.charAt(0)}
                  </Avatar>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                    {note.createdBy}
                  </Typography>
                </Box>
                
                <Box display="flex" alignItems="center" gap={0.5}>
                  <TimeIcon sx={{ fontSize: '1rem', color: 'text.disabled' }} />
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(note.createdAt)}
                  </Typography>
                  {note.updatedAt !== note.createdAt && (
                    <Typography variant="caption" color="warning.main" sx={{ ml: 0.5, fontStyle: 'italic' }}>
                      (editado)
                    </Typography>
                  )}
                </Box>
              </Box>
            </CardContent>
            
            <CardActions sx={{ px: 3, pb: 2, pt: 0, justifyContent: 'flex-end' }}>
              <IconButton 
                size="small" 
                onClick={() => handleEditNote(note)}
                sx={{
                  backgroundColor: 'info.light',
                  color: 'white',
                  width: 32,
                  height: 32,
                  '&:hover': {
                    backgroundColor: 'info.main',
                    transform: 'scale(1.1)',
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                <EditIcon sx={{ fontSize: '1rem' }} />
              </IconButton>
              <IconButton 
                size="small" 
                onClick={() => handleDeleteNote(note.id)}
                sx={{
                  backgroundColor: 'error.light',
                  color: 'white',
                  width: 32,
                  height: 32,
                  ml: 1,
                  '&:hover': {
                    backgroundColor: 'error.main',
                    transform: 'scale(1.1)',
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                <DeleteIcon sx={{ fontSize: '1rem' }} />
              </IconButton>
            </CardActions>
          </Card>
        ))}
      </Box>

      {notes.length === 0 && (
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
              <NotesIcon sx={{ fontSize: 64, color: 'white' }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary' }}>
              📝 No hay notas disponibles
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400 }}>
              Comienza creando tu primera nota para organizar información importante de tus clientes
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
                background: 'linear-gradient(45deg, #FF6B6B 30%, #FF8E8E 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #FF5252 30%, #FF6B6B 90%)',
                  transform: 'translateY(-2px)',
                  boxShadow: 6,
                },
                transition: 'all 0.3s ease'
              }}
            >
              🚀 Crear Primera Nota
            </Button>
          </Box>
        </Paper>
      )}

      {/* Dialog para crear/editar nota */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
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
          <NotesIcon />
          {editingNote ? '✏️ Editar Nota' : '📝 Nueva Nota'}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel id="client-select-label" sx={{ fontWeight: 500 }}>👤 Cliente</InputLabel>
              <Select
                labelId="client-select-label"
                label="👤 Cliente"
                value={newNote.clientId}
                onChange={(e) => setNewNote(prev => ({...prev, clientId: e.target.value}))}
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
            
            <TextField
              fullWidth
              label="📝 Título de la Nota"
              value={newNote.title}
              onChange={(e) => setNewNote(prev => ({...prev, title: e.target.value}))}
              sx={{ 
                '& .MuiOutlinedInput-root': { 
                  borderRadius: 2 
                },
                '& .MuiInputLabel-root': {
                  fontWeight: 500
                }
              }}
              placeholder="Escribe un título descriptivo para la nota..."
            />
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel id="category-select-label" sx={{ fontWeight: 500 }}>📂 Categoría</InputLabel>
                <Select
                  labelId="category-select-label"
                  label="📂 Categoría"
                  value={newNote.category}
                  onChange={(e) => setNewNote(prev => ({...prev, category: e.target.value}))}
                  sx={{ borderRadius: 2 }}
                >
                  {noteCategories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl fullWidth>
                <InputLabel id="priority-select-label" sx={{ fontWeight: 500 }}>⚡ Prioridad</InputLabel>
                <Select
                  labelId="priority-select-label"
                  label="⚡ Prioridad"
                  value={newNote.priority}
                  onChange={(e) => setNewNote(prev => ({...prev, priority: e.target.value as Note['priority']}))}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="Baja">🟢 Baja</MenuItem>
                  <MenuItem value="Media">🔵 Media</MenuItem>
                  <MenuItem value="Alta">🟡 Alta</MenuItem>
                  <MenuItem value="Crítica">🔴 Crítica</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            <TextField
              fullWidth
              label="💬 Contenido de la Nota"
              multiline
              rows={6}
              value={newNote.content}
              onChange={(e) => setNewNote(prev => ({...prev, content: e.target.value}))}
              sx={{ 
                '& .MuiOutlinedInput-root': { 
                  borderRadius: 2 
                },
                '& .MuiInputLabel-root': {
                  fontWeight: 500
                }
              }}
              placeholder="Escribe el contenido detallado de la nota..."
            />
            
            <Paper
              elevation={0}
              sx={{
                border: '1px solid',
                borderColor: newNote.isImportant ? 'warning.main' : 'divider',
                borderRadius: 2,
                p: 2,
                backgroundColor: newNote.isImportant ? 'warning.50' : 'grey.50',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': { 
                  borderColor: newNote.isImportant ? 'warning.dark' : 'primary.main',
                  backgroundColor: newNote.isImportant ? 'warning.100' : 'primary.50',
                }
              }}
              onClick={() => setNewNote(prev => ({...prev, isImportant: !prev.isImportant}))}
            >
              <Box display="flex" alignItems="center" gap={2}>
                <Box sx={{
                  backgroundColor: newNote.isImportant ? 'warning.main' : 'grey.400',
                  borderRadius: '50%',
                  p: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FlagIcon sx={{ color: 'white', fontSize: '1.2rem' }} />
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {newNote.isImportant ? '🚩 Nota Importante' : '📄 Nota Regular'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {newNote.isImportant 
                      ? 'Esta nota se destacará visualmente en la lista'
                      : 'Haz clic para marcar esta nota como importante'
                    }
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button 
            onClick={handleCloseDialog}
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
            onClick={handleSaveNote} 
            variant="contained"
            disabled={!newNote.clientId || !newNote.title || !newNote.content}
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
                color: '#ffffff'
              }
            }}
          >
            {editingNote ? '💾 Actualizar Nota' : '🚀 Crear Nota'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Notes;
