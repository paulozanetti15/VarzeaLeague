import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Button, Container, Paper, Typography, Divider, IconButton, Box, CircularProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import GroupIcon from '@mui/icons-material/Group';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import './TeamList.css';

interface Team {
  id: string;
  name: string;
  description: string;
  playerCount: number;
  matchCount: number;
  ownerId?: number;
  isCurrentUserCaptain?: boolean;
  banner?: string;
  createdAt?: string;
  players?: any[];
}

const TeamList = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
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
    } catch (err) {
      console.error('Erro ao buscar times:', err);
      setError('Erro ao carregar os times. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleTeamClick = (teamId: string) => {
    navigate(`/teams/edit/${teamId}`);
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="teams-container">
      <div className="header-top-bar">
        <button 
          className="back-button"
          onClick={handleBack}
        >
          <ArrowBackIcon sx={{ fontSize: 24 }} />
          Início
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="teams-header"
      >
        <h1 className="teams-title">Times</h1>
        <p className="teams-subtitle">Gerencie seus times e jogadores</p>
      </motion.div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="create-team-btn"
        onClick={() => navigate('/teams/create')}
      >
        <AddIcon sx={{ mr: 1 }} />
        Criar Novo Time
      </motion.button>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando times...</p>
        </div>
      ) : error ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="error-message"
        >
          {error}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="teams-grid"
        >
          {teams.length > 0 ? (
            teams.map((team, index) => (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="team-card"
                onClick={() => handleTeamClick(team.id)}
              >
                <div className="team-banner">
                  {team.banner ? (
                    <img 
                      src={team.banner} 
                      alt={team.name} 
                      className="team-banner-img" 
                    />
                  ) : (
                    <GroupIcon sx={{ fontSize: 40, color: '#fff' }} />
                  )}
                </div>
                <div className="team-info">
                  <h2 className="team-name">{team.name}</h2>
                  <p className="team-description">
                    {team.description || "Sem descrição disponível"}
                  </p>
                  <div className="team-stats">
                    <div className="stat">
                      <GroupIcon sx={{ fontSize: 20, color: '#2196F3' }} />
                      <span>{team.players?.length || team.playerCount || 0} Jogadores</span>
                    </div>
                    <div className="stat">
                      <EmojiEventsIcon sx={{ fontSize: 20, color: '#FFD700' }} />
                      <span>{team.matchCount || 0} Partidas</span>
                    </div>
                  </div>
                  {team.isCurrentUserCaptain && (
                    <div className="captain-badge-container">
                      <span className="captain-badge">Capitão</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="no-teams-message">
              <p>Você ainda não tem times cadastrados.</p>
              <button 
                className="create-first-team-btn"
                onClick={() => navigate('/teams/create')}
              >
                Criar meu primeiro time
              </button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default TeamList; 