import React from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Alert,
} from '@mui/material';
import {
  Construction,
} from '@mui/icons-material';

interface ComingSoonPageProps {
  title: string;
  description: string;
  icon?: React.ReactElement;
}

const ComingSoonPage: React.FC<ComingSoonPageProps> = ({ title, description, icon }) => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        {title}
      </Typography>

      <Card>
        <CardContent>
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              py: 8,
              gap: 3
            }}
          >
            {icon || <Construction sx={{ fontSize: 64, color: 'text.secondary' }} />}
            
            <Typography variant="h5" color="text.secondary" textAlign="center">
              Página en Construcción
            </Typography>
            
            <Typography variant="body1" color="text.secondary" textAlign="center" maxWidth="md">
              {description}
            </Typography>

            <Alert severity="info" sx={{ mt: 2 }}>
              Esta funcionalidad estará disponible próximamente. El sistema se está desarrollando de forma modular.
            </Alert>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ComingSoonPage;
