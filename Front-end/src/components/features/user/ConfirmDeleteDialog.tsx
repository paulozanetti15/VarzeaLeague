import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, Alert } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

interface ConfirmDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  error?: string | null;
}

const ConfirmDeleteDialog: React.FC<ConfirmDeleteDialogProps> = ({ open, onClose, onConfirm, error }) => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth="xs"
    className="user-management-modal"
    TransitionComponent={undefined as any} // Passar Transition se necessário
    TransitionProps={{ timeout: 300 } as any}
  >
    <DialogTitle className="user-management-modal-title user-management-delete-dialog-title">
      <ErrorOutlineIcon className="user-management-error-icon" />Confirmar Exclusão
    </DialogTitle>
    <DialogContent className="user-management-delete-dialog-content">
      <Typography className="user-management-modal-content user-management-delete-dialog-text-spacing">
        Tem certeza que deseja excluir este usuário?
      </Typography>
      <Typography className="user-management-modal-content user-management-delete-dialog-error-text">
        Esta ação não pode ser desfeita.
      </Typography>
      {error && (
        <Box className="user-management-delete-error-box">
          <Alert severity="error" className="user-management-delete-error-alert">{error}</Alert>
        </Box>
      )}
    </DialogContent>
    <DialogActions className="user-management-modal-actions user-management-delete-dialog-actions">
      <Button
        onClick={onClose}
        variant="text"
        color="primary"
        className="user-management-delete-dialog-cancel-btn"
      >
        Cancelar
      </Button>
      <Button 
        onClick={onConfirm} 
        variant="contained" 
        color="error"
        className="user-management-delete-dialog-delete-btn"
      >
        Excluir
      </Button>
    </DialogActions>
  </Dialog>
);

export default ConfirmDeleteDialog;
