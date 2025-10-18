import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './ManagePlayerModal.css';
import CloseIcon from '@mui/icons-material/Close';


interface PlayerData {
  id?: number;
  nome: string;
  sexo: string;
  ano: string;
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
    sexo: '',
    ano: '',
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
        sexo: '',
        ano: '',
        posicao: ''
      });
    }
    // Resetar o estado de submissão quando o modal for aberto/fechado
    setIsSubmitted(false);
  }, [editingPlayer, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'ano') {
      // Remove qualquer caractere não numérico
      const numericValue = value.replace(/\D/g, '');

      if (numericValue.length === 4) {
        const ano = parseInt(numericValue);
      }
      
      setPlayer({ ...player, [name]: numericValue });
    } else {
      setPlayer({ ...player, [name]: value });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    
    // Validação
    if (!player.nome.trim()) {
      alert('Nome do jogador é obrigatório.');
      return;
    }
    if (!player.sexo) {
      alert('Sexo do jogador é obrigatório.');
      return;
    }
    if (!player.ano) {
      alert('Ano de nascimento do jogador é obrigatório.');
      return;
    }
    
    const anoNascimento = parseInt(player.ano);
    if (isNaN(anoNascimento) || anoNascimento < 1925 || anoNascimento > 2019) {
      alert(`Ano de nascimento inválido. Deve ser entre 1925 e ${2019}.`);
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
                <label htmlFor="sexo">Sexo</label>
                <select
                  id="sexo"
                  name="sexo"
                  value={player.sexo}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecione</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Feminino">Feminino</option>
                </select>
              </div>
              
              <div className={`player-form-group ${isSubmitted ? 'submitted' : ''}`}>
                <label htmlFor="ano">Ano de Nascimento</label>
                <input
                  type="text"
                  id="ano"
                  name="ano"
                  value={player.ano}
                  onChange={handleChange}
                  placeholder="Ex: 1990"
                  maxLength={4}
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