import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';

interface MatchFinalizeModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { goals: number; yellowCards: number; redCards: number }) => void;
}

const MatchFinalizeModal: React.FC<MatchFinalizeModalProps> = ({ open, onClose, onSubmit }) => {
  const [goals, setGoals] = useState(0);
  const [yellowCards, setYellowCards] = useState(0);
  const [redCards, setRedCards] = useState(0);

  const handleSubmit = () => {
    onSubmit({ goals, yellowCards, redCards });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Finalizar Partida</DialogTitle>
      <DialogContent>
        <TextField
          label="Total de Gols"
          type="number"
          fullWidth
          margin="normal"
          value={goals}
          onChange={e => setGoals(Number(e.target.value))}
        />
        <TextField
          label="Cartões Amarelos"
          type="number"
          fullWidth
          margin="normal"
          value={yellowCards}
          onChange={e => setYellowCards(Number(e.target.value))}
        />
        <TextField
          label="Cartões Vermelhos"
          type="number"
          fullWidth
          margin="normal"
          value={redCards}
          onChange={e => setRedCards(Number(e.target.value))}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">Cancelar</Button>
        <Button onClick={handleSubmit} color="primary" variant="contained">Salvar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default MatchFinalizeModal;
