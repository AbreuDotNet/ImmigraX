import React from 'react';
import { Description } from '@mui/icons-material';
import ComingSoonPage from '../components/ComingSoonPage';

const Documents: React.FC = () => {
  return (
    <ComingSoonPage
      title="Documentos"
      description="Esta sección permitirá gestionar todos los documentos de los clientes, incluyendo subida de archivos, categorización, y control de versiones. Los usuarios podrán organizar documentos por cliente, tipo de proceso, y estado."
      icon={<Description sx={{ fontSize: 64, color: 'primary.main' }} />}
    />
  );
};

export default Documents;
