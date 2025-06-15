import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const BackButton: React.FC<{ to?: string; label?: string }> = ({ to = -1, label = 'Voltar' }) => {
  const navigate = useNavigate();
  return (
    <Button
      variant="outlined"
      startIcon={<ArrowBackIcon />}
      sx={{
        mb: 2,
        borderRadius: 2,
        fontWeight: 600,
        background: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 2px 8px 0 rgba(31, 38, 135, 0.08)',
        textTransform: 'none',
      }}
      onClick={() => (typeof to === 'string' ? navigate(to) : navigate(-1))}
    >
      {label}
    </Button>
  );
};

export default BackButton; 