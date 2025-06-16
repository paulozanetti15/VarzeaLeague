import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  Button,
  Alert,
  CircularProgress
} from '@mui/material';
import axios from 'axios';
import './PlayerSelectionModal.css';

interface Player {
  id: number;
  nome: string;
  ano: number;
  sexo: string;
  posicao: string;
  isEligible: boolean;
}

interface PlayerSelectionModalProps {
  open: boolean;
  onClose: () => void;
  matchId: number;
  onConfirm: (selectedPlayers: number[]) => void;
}

const PlayerSelectionModal: React.FC<PlayerSelectionModalProps> = ({
  open,
  onClose,
  matchId,
  onConfirm
}) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `http://localhost:3001/api/matches/${matchId}/team-players`,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        setPlayers(response.data);
      } catch (error: any) {
        setError(error.response?.data?.message || 'Erro ao carregar jogadores');
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchPlayers();
    }
  }, [open, matchId]);

  const handlePlayerToggle = (playerId: number) => {
    setSelectedPlayers(prev => {
      if (prev.includes(playerId)) {
        return prev.filter(id => id !== playerId);
      } else {
        return [...prev, playerId];
      }
    });
  };

  const handleConfirm = () => {
    if (selectedPlayers.length < 7) {
      setError('Selecione no mínimo 7 jogadores');
      return;
    }
    onConfirm(selectedPlayers);
  };

  const getIdade = (anoNascimento: number) => {
    const anoAtual = new Date().getFullYear();
    return anoAtual - anoNascimento;
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="player-selection-modal"
    >
      <Box className="player-selection-modal">
        <Typography variant="h6" component="h2" gutterBottom>
          Selecionar Jogadores para a Partida
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Selecione no mínimo 7 jogadores elegíveis para a partida.
              Jogadores não elegíveis estão desabilitados.
            </Typography>

            <Box className="players-list">
              {players.map((player) => (
                <FormControlLabel
                  key={player.id}
                  control={
                    <Checkbox
                      checked={selectedPlayers.includes(player.id)}
                      onChange={() => handlePlayerToggle(player.id)}
                      disabled={!player.isEligible}
                    />
                  }
                  label={
                    <Box className="player-info">
                      <Typography>
                        {player.nome}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {player.posicao} • {player.sexo} • {getIdade(player.ano)} anos
                      </Typography>
                      {!player.isEligible && (
                        <Typography variant="caption" color="error">
                          Não elegível (não atende aos requisitos da partida)
                        </Typography>
                      )}
                    </Box>
                  }
                  className={`player-item ${!player.isEligible ? 'ineligible' : ''}`}
                />
              ))}
            </Box>

            <Box className="modal-actions">
              <Typography color="text.secondary">
                {selectedPlayers.length} jogadores selecionados
              </Typography>
              <Box>
                <Button onClick={onClose} color="inherit">
                  Cancelar
                </Button>
                <Button
                  onClick={handleConfirm}
                  variant="contained"
                  disabled={selectedPlayers.length < 7}
                >
                  Confirmar ({selectedPlayers.length}/7+)
                </Button>
              </Box>
            </Box>
          </>
        )}
      </Box>
    </Modal>
  );
};

export default PlayerSelectionModal; 