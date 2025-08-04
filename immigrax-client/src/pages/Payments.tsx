import React from 'react';
import { Payment } from '@mui/icons-material';
import ComingSoonPage from '../components/ComingSoonPage';

const Payments: React.FC = () => {
  return (
    <ComingSoonPage
      title="Pagos"
      description="Esta sección permitirá gestionar todos los pagos y facturación del despacho. Incluirá seguimiento de pagos pendientes, historial de transacciones, generación de facturas, y reportes financieros."
      icon={<Payment sx={{ fontSize: 64, color: 'success.main' }} />}
    />
  );
};

export default Payments;
