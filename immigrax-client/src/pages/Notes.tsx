import React from 'react';
import { Note } from '@mui/icons-material';
import ComingSoonPage from '../components/ComingSoonPage';

const Notes: React.FC = () => {
  return (
    <ComingSoonPage
      title="Notas"
      description="Esta sección permitirá gestionar notas y comentarios importantes sobre los clientes y casos. Los usuarios podrán crear notas categorizadas, marcar notas importantes, y llevar un historial detallado de comunicaciones."
      icon={<Note sx={{ fontSize: 64, color: 'warning.main' }} />}
    />
  );
};

export default Notes;
