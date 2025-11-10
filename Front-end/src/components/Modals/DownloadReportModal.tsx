import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Box,
  Typography,
  Alert
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface DownloadReportModalProps {
  isOpen: boolean;
  teamName: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
  playerCount?: number;
}

const DownloadReportModal: React.FC<DownloadReportModalProps> = ({
  isOpen,
  teamName,
  onConfirm,
  onCancel,
  loading,
  playerCount = 0
}) => {
  return (
    <Dialog
      open={isOpen}
      onClose={onCancel}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)'
        }
      }}
    >
      <DialogTitle
        sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          color: '#ffffff',
          fontWeight: 'bold',
          fontSize: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5
        }}
      >
        <FileDownloadIcon sx={{ fontSize: '1.5rem', color: '#ffffff' }} />
        <span style={{ color: '#ffffff' }}>Confirmar Download</span>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Box
            sx={{
              background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(21, 101, 192, 0.05) 100%)',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid rgba(25, 118, 210, 0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5
            }}
          >
            <CheckCircleIcon
              sx={{
                color: '#1976d2',
                fontSize: '2rem',
                flexShrink: 0
              }}
            />
            <Box>
              <Typography
                sx={{
                  fontSize: '0.875rem',
                  color: '#1565c0',
                  fontWeight: 600
                }}
              >
                Time:
              </Typography>
              <Typography
                sx={{
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  color: '#1565c0',
                  wordBreak: 'break-word'
                }}
              >
                {teamName}
              </Typography>
            </Box>
          </Box>

          <Alert
            severity="info"
            variant="filled"
            sx={{
              borderRadius: '8px',
              fontSize: '0.95rem',
              color: '#000000',
              '& .MuiAlert-icon': {
                color: '#000000'
              }
            }}
          >
            Será gerado um relatório em PDF contendo as estatísticas de todos os {playerCount} jogador{playerCount !== 1 ? 'es' : ''} do time.
          </Alert>

          <Typography
            sx={{
              fontSize: '0.9rem',
              color: '#1565c0',
              textAlign: 'center',
              fontStyle: 'italic',
              fontWeight: 500
            }}
          >
            ✓ O download será iniciado automaticamente após a confirmação
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          padding: '16px 24px',
          background: 'rgba(0, 0, 0, 0.02)',
          gap: 1
        }}
      >
        <Button
          onClick={onCancel}
          disabled={loading}
          sx={{
            color: '#1976d2',
            textTransform: 'none',
            fontSize: '1rem',
            fontWeight: 600,
            border: '1.5px solid #1976d2',
            '&:hover': {
              backgroundColor: 'rgba(25, 118, 210, 0.08)',
              borderColor: '#1565c0'
            }
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={onConfirm}
          disabled={loading}
          variant="contained"
          sx={{
            background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
            textTransform: 'none',
            fontSize: '1rem',
            fontWeight: 600,
            paddingX: 3,
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            '&:hover': {
              background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)'
            },
            '&:disabled': {
              background: 'rgba(0, 0, 0, 0.12)',
              color: 'rgba(0, 0, 0, 0.38)'
            }
          }}
        >
          {loading ? (
            <>
              <CircularProgress size={20} sx={{ color: '#ffffff' }} />
              <span style={{ color: '#ffffff' }}>Gerando…</span>
            </>
          ) : (
            <>
              <FileDownloadIcon fontSize="small" sx={{ color: '#ffffff' }} />
              <span style={{ color: '#ffffff' }}>Baixar PDF</span>
            </>
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DownloadReportModal;
