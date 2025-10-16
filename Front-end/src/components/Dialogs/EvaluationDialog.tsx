import React from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { Button } from 'react-bootstrap';
import { MatchEvaluations } from '../MatchEvaluations/MatchEvaluations';
import './MatchDialogs.css';

interface EvaluationDialogProps {
  open: boolean;
  onClose: () => void;
  matchId: number;
  readOnly?: boolean;
  title?: string;
}

export const EvaluationDialog: React.FC<EvaluationDialogProps> = ({
  open,
  onClose,
  matchId,
  readOnly = false,
  title = 'Avaliações da Partida'
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        <MatchEvaluations matchId={matchId} readOnly={readOnly} />
      </DialogContent>
      <DialogActions>
        <Button variant="secondary" onClick={onClose}>
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
