import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import GroupIcon from '@mui/icons-material/Group';
import DescriptionIcon from '@mui/icons-material/Description';
import './CreateTeam.css';

interface TeamFormData {
  name: string;
  description: string;
  playerEmails: string[];
}

const CreateTeam: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<TeamFormData>({
    name: '',
    description: '',
    playerEmails: [''],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Verifica se os dados obrigatórios estão preenchidos
      if (!formData.name || !formData.description) {
        setError('Nome e descrição são obrigatórios.');
        setLoading(false);
        return;
      }

      // Filtra os emails vazios antes de enviar
      const filteredEmails = formData.playerEmails.filter(email => email.trim() !== '');
      
      // Dados no formato que o backend espera
      const dataToSend = {
        name: formData.name,
        description: formData.description,
        playerEmails: filteredEmails
      };
      
      console.log('Enviando dados:', dataToSend);
      
      const response = await axios({
        method: 'post',
        url: 'http://localhost:3001/api/teams',
        data: dataToSend,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Resposta da API:', response.data);
      navigate('/teams');
    } catch (err: any) {
      console.error('Erro ao criar time:', err);
      
      if (err.response) {
        console.log('Status do erro:', err.response.status);
        console.log('Detalhes do erro:', err.response.data);
      }
      
      // Mostra mensagem de erro diretamente da API
      if (err.response?.data?.message) {
        setError(`Erro: ${err.response.data.message}`);
      } else if (err.response?.data?.error) {
        setError(`${err.response.data.error}`);
      } else {
        setError('Erro ao criar time. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const addPlayerEmail = () => {
    setFormData(prev => ({
      ...prev,
      playerEmails: [...prev.playerEmails, ''],
    }));
  };

  const removePlayerEmail = (index: number) => {
    setFormData(prev => ({
      ...prev,
      playerEmails: prev.playerEmails.filter((_, i) => i !== index),
    }));
  };

  const updatePlayerEmail = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      playerEmails: prev.playerEmails.map((email, i) => 
        i === index ? value : email
      ),
    }));
  };

  return (
    <div className="create-team-container">
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        className="soccer-ball-container"
      >
        <SportsSoccerIcon sx={{ fontSize: 40, color: '#2196F3' }} />
      </motion.div>

      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="back-btn"
        onClick={() => navigate('/teams')}
      >
        <ArrowBackIcon sx={{ fontSize: 24, color: '#fff' }} />
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="form-container"
      >
        <h1 className="form-title">Criar Novo Time</h1>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="error-message"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="form-group"
          >
            <label className="form-label">
              <GroupIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Nome do Time
            </label>
            <input
              type="text"
              className="form-control"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Digite o nome do time"
              required
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="form-group"
          >
            <label className="form-label">
              <DescriptionIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Descrição
            </label>
            <textarea
              className="form-control"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva seu time"
              rows={3}
              required
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="form-group"
          >
            <label className="form-label">
              <GroupIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Emails dos Jogadores (Opcional)
            </label>
            <div className="player-emails">
              {formData.playerEmails.map((email, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="player-email"
                >
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => updatePlayerEmail(index, e.target.value)}
                    placeholder="Digite o email do jogador (opcional)"
                  />
                  {formData.playerEmails.length > 1 && (
                    <button
                      type="button"
                      className="remove-player-btn"
                      onClick={() => removePlayerEmail(index)}
                    >
                      <RemoveIcon />
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              className="add-player-btn"
              onClick={addPlayerEmail}
            >
              <AddIcon sx={{ mr: 1 }} />
              Adicionar Jogador
            </motion.button>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Criando...' : 'Criar Time'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateTeam; 