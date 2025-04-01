import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import GroupIcon from '@mui/icons-material/Group';
import DescriptionIcon from '@mui/icons-material/Description';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningIcon from '@mui/icons-material/Warning';
import './EditTeam.css';

interface TeamFormData {
  name: string;
  description: string;
  playerEmails: string[];
}

interface Team {
  id: string;
  name: string;
  description: string;
  players: {
    id: string;
    email: string;
  }[];
}

const EditTeam: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState<TeamFormData>({
    name: '',
    description: '',
    playerEmails: [''],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [team, setTeam] = useState<Team | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);

  useEffect(() => {
    if (!id) {
      setError('ID do time não especificado. Redirecionando para a lista de times...');
      setTimeout(() => navigate('/teams'), 2000);
      return;
    }
    
    fetchTeam();
  }, [id, navigate]);

  const fetchTeam = async () => {
    setLoadingInitial(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get(`http://localhost:3001/api/teams/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const teamData = response.data;
      setTeam(teamData);
      setFormData({
        name: teamData.name,
        description: teamData.description,
        playerEmails: teamData.players.map((player: { email: string }) => player.email).length > 0 
          ? teamData.players.map((player: { email: string }) => player.email) 
          : [''],
      });
    } catch (err) {
      console.error('Erro ao buscar time:', err);
      setError('Erro ao carregar o time. Tente novamente.');
    } finally {
      setLoadingInitial(false);
    }
  };

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

      // Filtra os emails vazios antes de enviar
      const filteredEmails = formData.playerEmails.filter(email => email.trim() !== '');
      
      // Verifica se os dados obrigatórios estão preenchidos
      if (!formData.name || !formData.description) {
        setError('Nome e descrição são obrigatórios.');
        setLoading(false);
        return;
      }

      // Dados no formato que o backend espera
      const dataToSend = {
        name: formData.name,
        description: formData.description,
        playerEmails: filteredEmails
      };
      
      console.log('Enviando dados:', dataToSend);

      const response = await axios({
        method: 'put',
        url: `http://localhost:3001/api/teams/${id}`,
        data: dataToSend,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Resposta da API:', response.data);
      navigate('/teams');
    } catch (err: any) {
      console.error('Erro ao atualizar time:', err);
      // Mostra mensagem de erro mais detalhada, se disponível
      if (err.response?.data?.message) {
        setError(`Erro: ${err.response.data.message}`);
      } else if (err.response?.data?.error) {
        setError(`Erro: ${err.response.data.error}`);
      } else {
        setError('Erro ao atualizar time. Tente novamente.');
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

  const handleDeleteTeam = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      await axios({
        method: 'delete',
        url: `http://localhost:3001/api/teams/${id}`,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        data: { confirm: true }
      });

      navigate('/teams');
    } catch (err: any) {
      console.error('Erro ao deletar time:', err);
      if (err.response?.data?.message) {
        setError(`Erro: ${err.response.data.message}`);
      } else if (err.response?.data?.error) {
        setError(`Erro: ${err.response.data.error}`);
      } else {
        setError('Erro ao deletar time. Tente novamente.');
      }
      setShowDeleteConfirm(false);
    }
  };

  if (loadingInitial) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Carregando time...</p>
      </div>
    );
  }

  if (error && !team) {
    return (
      <div className="error-container" style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center',
        background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
        color: 'white',
        padding: '2rem'
      }}>
        <div style={{ 
          background: 'rgba(220, 53, 69, 0.2)', 
          padding: '2rem', 
          borderRadius: '10px',
          textAlign: 'center',
          maxWidth: '500px'
        }}>
          <span role="img" aria-label="error" style={{ fontSize: '48px', marginBottom: '16px', display: 'block' }}>❌</span>
          <h2>Erro</h2>
          <p>{error}</p>
          <button 
            onClick={() => navigate('/teams')}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              color: 'white',
              marginTop: '20px',
              cursor: 'pointer'
            }}
          >
            Voltar para Lista de Times
          </button>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Time não encontrado. Redirecionando...</p>
      </div>
    );
  }

  return (
    <div className="edit-team-container">
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
        <div className="form-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <h1 className="form-title">Editar Time</h1>
        </div>

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

          {/* Seção de Exclusão do Time */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="form-group delete-section"
          >
            <label className="form-label delete-label">
              <WarningIcon sx={{ mr: 1, color: '#dc3545' }} />
              Área de Perigo
            </label>
            <div className="delete-card">
              <div className="delete-card-content">
                <h3>Deletar Time</h3>
                <p>Esta ação não pode ser desfeita. Todos os dados do time serão permanentemente excluídos.</p>
                <button 
                  type="button"
                  className="delete-team-btn"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <DeleteIcon sx={{ mr: 1 }} />
                  Deletar Time
                </button>
              </div>
            </div>
          </motion.div>

          <div className="form-buttons">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </motion.button>
          </div>
        </form>
      </motion.div>

      {showDeleteConfirm && (
        <div className="delete-modal">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="delete-modal-content"
          >
            <div className="warning-icon-container">
              <WarningIcon style={{ fontSize: 60, color: '#dc3545' }} />
            </div>
            <h2>Confirmar Deleção</h2>
            <p>Tem certeza que deseja deletar o time "<strong>{team?.name}</strong>"?</p>
            <p className="warning-text">Esta ação não pode ser desfeita!</p>
            
            <div className="delete-modal-actions">
              <button 
                className="confirm-delete-btn"
                onClick={handleDeleteTeam}
              >
                Sim, Deletar Time
              </button>
              <button 
                className="cancel-delete-btn"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default EditTeam; 