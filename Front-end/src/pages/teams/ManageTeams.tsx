import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import AddIcon from '@mui/icons-material/Add';
import './ManageTeams.css';

const ManageTeams = () => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get('http://localhost:3001/api/teams', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTeams(response.data);
      console.log(`Carregados ${response.data.length} times visíveis para você`);
      
    } catch (err: any) {
      console.error('Erro ao buscar times:', err);
      
      if (err.response?.status === 401) {
        // Erro de autenticação
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }
      
      setError('Erro ao carregar times. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [navigate]);

  return (
    <div className="manage-teams-container">
      <div className="visibility-info">
        <h1>Seus Times</h1>
        <div className="info-message">
          <p>
            <strong>Nota:</strong> Você só pode ver times dos quais é capitão ou jogador. 
            Times que você não faz parte não aparecerão nesta lista.
          </p>
        </div>
      </div>
      
      {teams.length === 0 && !loading && !error && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="no-teams-message"
        >
          <h2>Nenhum time encontrado</h2>
          <p>Você só pode ver times dos quais é capitão ou jogador.</p>
          <p>Crie um novo time ou peça para ser adicionado a um time existente.</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="create-team-btn"
            onClick={() => navigate('/teams/create')}
          >
            <AddIcon sx={{ mr: 1 }} />
            Criar Novo Time
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};

export default ManageTeams; 