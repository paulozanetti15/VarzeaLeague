import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion'; 
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import './ManageTeams.css';

interface Team {
  id: number;
  name: string;
  logo?: string;
  description: string;
  createdAt: string;
}

export function ManageTeams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/teams`);
      setTeams(response.data);
      setLoading(false);
    } catch (err) {
      setError('Erro ao carregar os times');
      setLoading(false);
    }
  };

  const handleCreateTeam = () => {
    navigate('/create-team');
  };

  const handleEditTeam = (teamId: number) => {
    navigate(`/edit-team/${teamId}`);
  };

  const handleDeleteTeam = async (teamId: number) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/teams/${teamId}`, {
        data: { confirm: true }
      });
      setTeams(teams.filter(team => team.id !== teamId));
      setDeleteConfirm(null);
    } catch (err) {
      setError('Erro ao deletar o time');
    }
  };

  if (loading) {
    return <div className="loading">Carregando times...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="manage-teams-container">
      <div className="teams-header">
        <h1>Gerenciar Times</h1>
        <button className="create-team-btn" onClick={handleCreateTeam}>
          <AddIcon sx={{ fontSize: 20 }} />
          Criar Novo Time
        </button>
      </div>

      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="back-btn"
        onClick={() => navigate('/teams')}
      >
        <ArrowBackIcon />
      </motion.button>

      <div className="teams-grid">
        {teams.map((team) => (
          <div key={team.id} className="team-card">
            <div className="team-logo">
              {team.logo ? (
                <img src={`${process.env.REACT_APP_API_URL}/uploads/${team.logo}`} alt={team.name} />
              ) : (
                <div className="default-logo">⚽</div>
              )}
            </div>
            <div className="team-info">
              <h3>{team.name}</h3>
              <p>{team.description}</p>
              <div className="team-actions">
                <button 
                  className="edit-team-btn"
                  onClick={() => handleEditTeam(team.id)}
                >
                  Editar Time
                </button>
                {deleteConfirm === team.id ? (
                  <div className="delete-confirmation">
                    <p>Tem certeza?</p>
                    <button 
                      className="confirm-delete-btn"
                      onClick={() => handleDeleteTeam(team.id)}
                    >
                      Sim
                    </button>
                    <button 
                      className="cancel-delete-btn"
                      onClick={() => setDeleteConfirm(null)}
                    >
                      Não
                    </button>
                  </div>
                ) : (
                  <button 
                    className="delete-team-btn"
                    onClick={() => setDeleteConfirm(team.id)}
                    title="Deletar time"
                  >
                    <DeleteIcon style={{ fontSize: 24, color: '#dc3545' }} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {teams.length === 0 && (
        <div className="no-teams">
          <p>Nenhum time cadastrado ainda.</p>
          <button onClick={handleCreateTeam}>Criar Primeiro Time</button>
        </div>
      )}
    </div>
  );
} 