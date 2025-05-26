import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import AddIcon from '@mui/icons-material/Add';
import GroupIcon from '@mui/icons-material/Group';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import './TeamList.css';

interface Player {
  id: string;
  nome: string;
  sexo: string;
  ano: string;
  posicao: string;
}

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
  players?: Player[];
  primaryColor?: string;
  secondaryColor?: string;
  estado?: string;
  cidade?: string;
}

const TeamList = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
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

      const response = await axios.get('http://localhost:3001/api/teams/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTeams(response.data);
    } catch (err) {
      console.error('Erro ao buscar times:', err);
      setError('Erro ao carregar o time.');
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

  const togglePlayersList = (e: React.MouseEvent, teamId: string) => {
    e.stopPropagation();
    setExpandedTeam(expandedTeam === teamId ? null : teamId);
  };

  const teamCardVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.05 * i,
        duration: 0.3,
        ease: "easeOut"
      }
    })
  };

  const hasTeam = teams.length > 0;

  return (
    <div className="teams-container">
      <div className="top-navigation">
        <button className="back-btn" onClick={handleBack}>
          <ArrowBackIcon />
          <span>Voltar</span>
        </button>
      </div>

      <div className="teams-header">
        <h1 className="teams-title">Meu time</h1>
        <p className="teams-subtitle">Gerencie seu time e jogadores</p>
      </div>

      <div className="teams-actions">
        {!hasTeam && (
          <button
            className="create-team-btn"
            onClick={() => navigate('/teams/create')}
          >
            <AddIcon sx={{ mr: 1 }} />
            Criar meu time
          </button>
        )}
      </div>

      {!loading && error && (
        <div
          className="error-container"
          style={{ 
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "40px 20px", 
            marginBottom: "20px"
          }}
        >
          <div className="error-message">
            <p>{error}</p>
            <div style={{ height: "15px" }}></div>
            <button 
              className="retry-btn" 
              onClick={() => {
                setLoading(true);
                fetchTeams();
              }}
            >
              Tentar novamente
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando meu time...</p>
        </div>
      ) : !error && (
        <div className="teams-content">
          {hasTeam ? (
            <div className="team-container">
              {teams.slice(0, 1).map((team, index) => (
                <div
                  key={team.id}
                  className="team-card team-detail-card"
                >
                  <div className="team-banner" style={{ background: team.primaryColor && team.secondaryColor ? `linear-gradient(135deg, ${team.primaryColor} 0%, ${team.secondaryColor} 100%)` : undefined }}>
                    {team.banner ? (
                      <img 
                        src={`http://localhost:3001${team.banner}`} 
                        alt={team.name} 
                        className="team-banner-img" 
                      />
                    ) : (
                      <GroupIcon sx={{ fontSize: 40, color: '#fff' }} />
                    )}
                  </div>
                  <div className="team-info">
                    <h2 className="team-name">{team.name}</h2>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.2rem', marginBottom: '0.7rem' }}>
                      <span style={{ color: '#fff', fontWeight: 500, fontSize: '1.05rem', opacity: 0.85 }}>
                        {team.estado && <>{team.estado}{team.cidade ? ' - ' : ''}</>}{team.cidade}
                      </span>
                      {(team.primaryColor || team.secondaryColor) && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {team.primaryColor && <span title="Cor Primária" style={{ width: 22, height: 22, borderRadius: '50%', background: team.primaryColor, border: '2px solid #fff', display: 'inline-block', boxShadow: '0 1px 4px rgba(0,0,0,0.12)' }}></span>}
                          {team.secondaryColor && <span title="Cor Secundária" style={{ width: 22, height: 22, borderRadius: '50%', background: team.secondaryColor, border: '2px solid #fff', display: 'inline-block', boxShadow: '0 1px 4px rgba(0,0,0,0.12)' }}></span>}
                        </span>
                      )}
                    </div>
                    <p className="team-description">
                      {team.description || "Sem descrição disponível"}
                    </p>
                    <div className="team-stats">
                      <div className="stat">
                        <GroupIcon sx={{ fontSize: 20, color: '#2196F3' }} />
                        <span>{team.players?.length || 0} Jogadores</span>
                      </div>
                      <div className="stat">
                        <EmojiEventsIcon sx={{ fontSize: 20, color: '#FFD700' }} />
                        <span>{team.matchCount || 0} Partidas</span>
                      </div>
                    </div>
                    
                    {/* Botão para expandir/recolher lista de jogadores */}
                    <button 
                      className="players-toggle-btn" 
                      onClick={(e) => togglePlayersList(e, team.id)}
                    >
                      {expandedTeam === team.id ? (
                        <>
                          <ExpandLessIcon sx={{ mr: 1 }} />
                          Ocultar Jogadores
                        </>
                      ) : (
                        <>
                          <ExpandMoreIcon sx={{ mr: 1 }} />
                          Ver Jogadores
                        </>
                      )}
                    </button>
                    
                    {/* Lista de jogadores (expandível) */}
                    {expandedTeam === team.id && team.players && team.players.length > 0 && (
                      <div className="players-list-container">
                        <h3 className="players-list-title">Jogadores do Time</h3>
                        <div className="players-list">
                          {team.players.map((player) => (
                            <div key={player.id} className="player-card">
                              <div className="player-icon">
                                <SportsSoccerIcon style={{ 
                                  color: team.primaryColor || '#2196F3',
                                  fontSize: 22
                                }} />
                              </div>
                              <div className="player-info">
                                <span className="player-name">{player.nome}</span>
                                <div className="player-details">
                                  <span className="player-position">{player.posicao}</span>
                                  <span className="player-birth-year">{player.ano}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Mensagem quando não há jogadores */}
                    {expandedTeam === team.id && (!team.players || team.players.length === 0) && (
                      <div className="no-players-message">
                        Nenhum jogador cadastrado neste time.
                      </div>
                    )}

                    <button
                      className="edit-team-btn"
                      onClick={() => navigate(`/teams/edit/${team.id}`)}
                    >
                      <EditIcon sx={{ mr: 1 }} />
                      Editar meu time
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default TeamList; 