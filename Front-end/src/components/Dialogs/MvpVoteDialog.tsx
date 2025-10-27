import React from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { Button } from 'react-bootstrap';
import { MvpVoting } from '../../features/matches/MvpVoting/MvpVoting';
import './MatchDialogs.css';

interface MvpVoteDialogProps {
  open: boolean;
  onClose: () => void;
  matchId: number;
}

export const MvpVoteDialog: React.FC<MvpVoteDialogProps> = ({ open, onClose, matchId }) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Votação de MVP</DialogTitle>
      <DialogContent dividers>
        <MvpVoting matchId={matchId} />
      </DialogContent>
      <DialogActions>
        <Button variant="secondary" onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
};
