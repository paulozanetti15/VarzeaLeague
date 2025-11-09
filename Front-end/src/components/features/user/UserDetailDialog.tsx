import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Avatar, Typography, Stack } from '@mui/material';

interface UserDetailDialogProps {
  open: boolean;
  onClose: () => void;
  user: any;
}

const UserDetailDialog: React.FC<UserDetailDialogProps> = ({ open, onClose, user }) => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth="sm"
    fullWidth
    className="user-management-modal"
    TransitionComponent={undefined as any} // Passar Transition se necessário
  >
    <DialogTitle className="user-management-modal-title">Detalhes do Usuário</DialogTitle>
    <DialogContent>
      {user && (
        <Stack spacing={2} alignItems="center" className="user-management-detail-stack">
          <Avatar className="user-management-modal-avatar">{user.name[0]}</Avatar>
          <Typography className="user-management-modal-content"><b>Nome:</b> {user.name}</Typography>
          <Typography className="user-management-modal-content"><b>Email:</b> {user.email}</Typography>
          <Typography className="user-management-modal-content"><b>CPF:</b> {user.cpf}</Typography>
          <Typography className="user-management-modal-content"><b>Telefone:</b> {user.phone}</Typography>
          <Typography className="user-management-modal-content"><b>Sexo:</b> {user.gender}</Typography>
          <Typography className="user-management-modal-content"><b>Tipo de Usuário:</b> {user.usertype?.name || 'Sem tipo'}</Typography>
        </Stack>
      )}
    </DialogContent>
    <DialogActions className="user-management-modal-actions">
      <Button onClick={onClose} variant="contained" color="primary">
        Fechar
      </Button>
    </DialogActions>
  </Dialog>
);

export default UserDetailDialog;
