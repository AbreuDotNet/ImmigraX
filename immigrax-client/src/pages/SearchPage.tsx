import React from 'react';
import { Search } from '@mui/icons-material';
import ComingSoonPage from '../components/ComingSoonPage';

const SearchPage: React.FC = () => {
  return (
    <ComingSoonPage
      title="Búsqueda"
      description="Esta sección permitirá realizar búsquedas avanzadas en toda la base de datos del sistema. Los usuarios podrán buscar clientes, documentos, citas, notas y más, con filtros avanzados y resultados organizados."
      icon={<Search sx={{ fontSize: 64, color: 'info.main' }} />}
    />
  );
};

export default SearchPage;
