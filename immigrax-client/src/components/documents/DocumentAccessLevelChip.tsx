import React from 'react';
import {
  Box,
  Chip,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Public as PublicIcon,
  Lock as LockIcon,
  Security as SecurityIcon,
  EnhancedEncryption as EnhancedEncryptionIcon,
} from '@mui/icons-material';
import { DocumentAccessLevel } from '../../types';
import documentPermissionService from '../../services/documentPermissionService';

interface DocumentAccessLevelChipProps {
  accessLevel: DocumentAccessLevel;
  size?: 'small' | 'medium';
  variant?: 'filled' | 'outlined';
  showIcon?: boolean;
  showDescription?: boolean;
}

const DocumentAccessLevelChip: React.FC<DocumentAccessLevelChipProps> = ({
  accessLevel,
  size = 'small',
  variant = 'filled',
  showIcon = true,
  showDescription = false
}) => {
  const getIcon = () => {
    switch (accessLevel) {
      case DocumentAccessLevel.Public:
        return <PublicIcon />;
      case DocumentAccessLevel.Restricted:
        return <LockIcon />;
      case DocumentAccessLevel.Confidential:
        return <SecurityIcon />;
      case DocumentAccessLevel.HighlyConfidential:
        return <EnhancedEncryptionIcon />;
      default:
        return <LockIcon />;
    }
  };

  const getLabel = () => {
    switch (accessLevel) {
      case DocumentAccessLevel.Public:
        return 'Público';
      case DocumentAccessLevel.Restricted:
        return 'Restringido';
      case DocumentAccessLevel.Confidential:
        return 'Confidencial';
      case DocumentAccessLevel.HighlyConfidential:
        return 'Altamente Confidencial';
      default:
        return 'Desconocido';
    }
  };

  const color = documentPermissionService.getAccessLevelColor(accessLevel);
  const description = documentPermissionService.getAccessLevelDescription(accessLevel);

  const chip = (
    <Chip
      icon={showIcon ? getIcon() : undefined}
      label={getLabel()}
      size={size}
      variant={variant}
      sx={{
        backgroundColor: variant === 'filled' ? color : 'transparent',
        color: variant === 'filled' ? 'white' : color,
        borderColor: variant === 'outlined' ? color : undefined,
        fontWeight: 'bold',
        '& .MuiChip-icon': {
          color: variant === 'filled' ? 'white' : color,
        },
      }}
    />
  );

  if (showDescription) {
    return (
      <Tooltip 
        title={
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              {getLabel()}
            </Typography>
            <Typography variant="body2">
              {description}
            </Typography>
          </Box>
        }
        placement="top"
      >
        {chip}
      </Tooltip>
    );
  }

  return chip;
};

export default DocumentAccessLevelChip;
