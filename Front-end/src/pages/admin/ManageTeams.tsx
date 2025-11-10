import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import GroupsIcon from '@mui/icons-material/Groups';
import './ManageTeams.css';

interface Team {
  id: number;
  name: string;
  description?: string;
  banner?: string;
  primaryColor?: string;
  secondaryColor?: string;
  state?: string;
  city?: string;
  CEP?: string;
  isDeleted: boolean;
  createdAt?: string;
  created_at?: string;
  captain?: {
    id: number;
    name: string;
    email: string;
  };
  _count?: {
    players: number;
  };
}

const ManageTeams: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  useEffect(() => {
    fetchAllTeams();
  }, []);

  const fetchAllTeams = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/teams/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTeams(response.data || []);
    } catch (error: any) {
      console.error('Erro ao carregar times:', error);
      toast.error('Erro ao carregar times do sistema');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeam = async () => {
    if (!teamToDelete) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE}/teams/${teamToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { confirm: true }
      });
      
      toast.success(`Time "${teamToDelete.name}" excluído com sucesso!`);
      setTeams(teams.filter(t => t.id !== teamToDelete.id));
      setShowDeleteModal(false);
      setTeamToDelete(null);
    } catch (error: any) {
      console.error('Erro ao excluir time:', error);
      toast.error(error.response?.data?.message || 'Erro ao excluir time');
    }
  };

  const openDeleteModal = (team: Team) => {
    setTeamToDelete(team);
    setShowDeleteModal(true);
  };

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.captain?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTeamBannerUrl = (banner?: string) => {
    if (!banner) return null;
    if (banner.startsWith('http')) return banner;
    return `http://localhost:3001/uploads/teams/${banner}`;
  };

  if (loading) {
    return (
      <div className="admin-manage-teams-container">
        <div className="admin-loading-spinner">
          <div className="admin-spinner"></div>
          <p>Carregando times...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-manage-teams-container">
      <motion.div
        className="admin-manage-teams-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="admin-header-content">
          <GroupsIcon className="admin-header-icon" />
          <div>
            <h1>Gerenciar Times</h1>
            <p>Administre todos os times cadastrados no sistema</p>
          </div>
        </div>
        <div className="admin-teams-stats">
          <div className="admin-stat-card">
            <span className="admin-stat-number">{teams.length}</span>
            <span className="admin-stat-label">Times Cadastrados</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-number">{filteredTeams.length}</span>
            <span className="admin-stat-label">Resultados</span>
          </div>
        </div>
      </motion.div>

      <div className="admin-search-section">
        <div className="admin-search-box">
          <SearchIcon className="admin-search-icon" />
          <input
            type="text"
            placeholder="Buscar por nome do time, cidade ou capitão..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="admin-search-input"
          />
        </div>
      </div>

      <div className="admin-teams-grid">
        <AnimatePresence>
          {filteredTeams.length === 0 ? (
            <motion.div
              className="admin-no-results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <p>Nenhum time encontrado</p>
            </motion.div>
          ) : (
            filteredTeams.map((team, index) => (
              <motion.div
                key={team.id}
                className="admin-team-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <div className="admin-team-card-header">
                  {team.banner ? (
                    <img
                      src={getTeamBannerUrl(team.banner) || ''}
                      alt={team.name}
                      className="admin-team-banner"
                    />
                  ) : (
                    <div className="admin-team-banner-placeholder">
                      <GroupsIcon />
                    </div>
                  )}
                </div>
                
                <div className="admin-team-card-body">
                  <h3 className="admin-team-name">{team.name}</h3>
                  
                  {team.description && (
                    <p className="admin-team-description">{team.description}</p>
                  )}
                  
                  <div className="admin-team-info">
                    {team.city && team.state && (
                      <div className="admin-info-item">
                        <span className="admin-info-label">📍 Localização:</span>
                        <span className="admin-info-value">{team.city}, {team.state}</span>
                      </div>
                    )}
                    
                    {team.captain && (
                      <div className="admin-info-item">
                        <span className="admin-info-label">👤 Capitão:</span>
                        <span className="admin-info-value">{team.captain.name}</span>
                      </div>
                    )}
                    
                    <div className="admin-info-item">
                      <span className="admin-info-label">📅 Criado em:</span>
                      <span className="admin-info-value">
                        {new Date(team.createdAt || team.created_at || '').toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>

                  <div className="admin-team-colors">
                    {team.primaryColor && (
                      <div className="admin-color-badge">
                        <div
                          className="admin-color-circle"
                          style={{ backgroundColor: team.primaryColor }}
                        />
                        <span>Primária</span>
                      </div>
                    )}
                    {team.secondaryColor && (
                      <div className="admin-color-badge">
                        <div
                          className="admin-color-circle"
                          style={{ backgroundColor: team.secondaryColor }}
                        />
                        <span>Secundária</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="admin-team-card-footer">
                  <button
                    className="admin-delete-btn"
                    onClick={() => openDeleteModal(team)}
                  >
                    <DeleteIcon />
                    Excluir Time
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showDeleteModal && teamToDelete && (
          <motion.div
            className="admin-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              className="admin-modal-content"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2>Confirmar Exclusão</h2>
              <p>
                Tem certeza que deseja excluir o time <strong>"{teamToDelete.name}"</strong>?
              </p>
              <p className="admin-warning-text">
                ⚠️ Esta ação não pode ser desfeita. Todos os dados do time serão removidos.
              </p>
              <div className="admin-modal-actions">
                <button
                  className="admin-btn-cancel"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancelar
                </button>
                <button
                  className="admin-btn-confirm"
                  onClick={handleDeleteTeam}
                >
                  Sim, Excluir
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageTeams;
