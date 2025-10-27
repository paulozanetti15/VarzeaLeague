import React from 'react';
import { Box, Typography } from '@mui/material';

interface PasswordStrengthIndicatorProps {
  passwordStrength: {
    strength: string;
    score: number;
    requirements: {
      length: boolean;
      uppercase: boolean;
      lowercase: boolean;
      number: boolean;
      special: boolean;
    };
  } | null;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ passwordStrength }) => {
  if (!passwordStrength) return null;

  const getStrengthLabel = (strength: string) => {
    switch (strength) {
      case 'weak': return 'Fraca';
      case 'medium': return 'Média';
      case 'strong': return 'Forte';
      case 'very-strong': return 'Muito Forte';
      default: return 'Fraca';
    }
  };

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'weak': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'strong': return '#10b981';
      case 'very-strong': return '#059669';
      default: return '#ef4444';
    }
  };

  return (
    <Box sx={{ mt: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography variant="body2" sx={{ mr: 1, fontWeight: 600 }}>
          Força da senha:
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: getStrengthColor(passwordStrength.strength),
            fontWeight: 700
          }}
        >
          {getStrengthLabel(passwordStrength.strength)}
        </Typography>
      </Box>

      <Box sx={{ mb: 1 }}>
        <Box
          sx={{
            height: 4,
            borderRadius: 2,
            backgroundColor: '#e5e7eb',
            overflow: 'hidden'
          }}
        >
          <Box
            sx={{
              height: '100%',
              width: `${(passwordStrength.score / 5) * 100}%`,
              backgroundColor: getStrengthColor(passwordStrength.strength),
              transition: 'width 0.3s ease'
            }}
          />
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography
            variant="caption"
            sx={{
              color: passwordStrength.requirements.length ? '#10b981' : '#ef4444',
              mr: 0.5
            }}
          >
            {passwordStrength.requirements.length ? '✓' : '✗'}
          </Typography>
          <Typography variant="caption">Mín. 8 caracteres</Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography
            variant="caption"
            sx={{
              color: passwordStrength.requirements.uppercase ? '#10b981' : '#ef4444',
              mr: 0.5
            }}
          >
            {passwordStrength.requirements.uppercase ? '✓' : '✗'}
          </Typography>
          <Typography variant="caption">Maiúscula</Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography
            variant="caption"
            sx={{
              color: passwordStrength.requirements.lowercase ? '#10b981' : '#ef4444',
              mr: 0.5
            }}
          >
            {passwordStrength.requirements.lowercase ? '✓' : '✗'}
          </Typography>
          <Typography variant="caption">Minúscula</Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography
            variant="caption"
            sx={{
              color: passwordStrength.requirements.number ? '#10b981' : '#ef4444',
              mr: 0.5
            }}
          >
            {passwordStrength.requirements.number ? '✓' : '✗'}
          </Typography>
          <Typography variant="caption">Número</Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gridColumn: '1 / -1' }}>
          <Typography
            variant="caption"
            sx={{
              color: passwordStrength.requirements.special ? '#10b981' : '#ef4444',
              mr: 0.5
            }}
          >
            {passwordStrength.requirements.special ? '✓' : '✗'}
          </Typography>
          <Typography variant="caption">Símbolo especial</Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default PasswordStrengthIndicator;