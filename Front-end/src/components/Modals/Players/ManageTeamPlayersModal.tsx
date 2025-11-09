import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './ManageTeamPlayersModal.css';
import CloseIcon from '@mui/icons-material/Close';


interface PlayerData {
  id?: number;
  nome: string;
  gender: string;
  dateOfBirth: string;
  posicao: string;
}

interface PlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (player: PlayerData) => void;
  editingPlayer?: PlayerData | null;
}

const PlayerModal: React.FC<PlayerModalProps> = ({ isOpen, onClose, onSave, editingPlayer }) => {
  const [player, setPlayer] = useState<PlayerData>({
    nome: '',
    gender: '',
    dateOfBirth: '',
    posicao: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (editingPlayer) {
      setPlayer(editingPlayer);
    } else {
      setPlayer({
        nome: '',
        gender: '',
        dateOfBirth: '',
        posicao: ''
      });
    }
    // Resetar o estado de submissão quando o modal for aberto/fechado
    setIsSubmitted(false);
  }, [editingPlayer, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPlayer({ ...player, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    
    // Validação
    if (!player.nome.trim()) {
      alert('Nome do jogador é obrigatório.');
      return;
    }
    if (!player.gender) {
      alert('Sexo do jogador é obrigatório.');
      return;
    }
    if (!player.dateOfBirth) {
      alert('Data de nascimento do jogador é obrigatória.');
      return;
    }
    
    const birthDate = new Date(player.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    
    if (isNaN(birthDate.getTime())) {
      alert('Data de nascimento inválida.');
      return;
    }
    
    if (age < 6 || age > 100) {
      alert('Idade do jogador deve estar entre 6 e 100 anos.');
      return;
    }
    
    if (!player.posicao) {
      alert('Posição do jogador é obrigatória.');
      return;
    }
    
    onSave(player);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="player-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="player-modal-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div className="player-modal-header">
              <h2>{editingPlayer ? 'Editar Jogador' : 'Adicionar Jogador'}</h2>
              <button className="close-button" onClick={onClose}>
                <CloseIcon />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} ref={formRef}>
              <div className={`player-form-group ${isSubmitted ? 'submitted' : ''}`}>
                <label htmlFor="nome">Nome do Jogador</label>
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  value={player.nome}
                  onChange={handleChange}
                  placeholder="Digite o nome do jogador"
                  required
                />
              </div>
              
              <div className={`player-form-group ${isSubmitted ? 'submitted' : ''}`}>
                <label htmlFor="gender">Sexo</label>
                <select
                  id="gender"
                  name="gender"
                  value={player.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecione</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Feminino">Feminino</option>
                </select>
              </div>
              
              <div className={`player-form-group ${isSubmitted ? 'submitted' : ''}`}>
                <label htmlFor="dateOfBirth">Data de Nascimento</label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={player.dateOfBirth}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              
              <div className={`player-form-group ${isSubmitted ? 'submitted' : ''}`}>
                <label htmlFor="posicao">Posição</label>
                <select
                  id="posicao"
                  name="posicao"
                  value={player.posicao}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecione</option>
                  <option value="Goleiro">Goleiro</option>
                  <option value="Defensor">Defensor</option>
                  <option value="Meio Campo">Meio Campo</option>
                  <option value="Atacante">Atacante</option>
                </select>
              </div>
              
              <div className="player-form-actions">
                <button type="button" className="cancel-button" onClick={onClose}>
                  Cancelar
                </button>
                <button type="submit" className="save-button">
                  {editingPlayer ? 'Atualizar' : 'Adicionar'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PlayerModal; 