import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import axios from 'axios';
import './PublicMatchDetail.css';
import { API_BASE, getTeamBannerUrl, getChampionshipLogoUrl } from '../../config/api';

interface Match {
  id: number;
  title: string;
  date: string;
  location?: string;
  nomequadra?: string;
  description?: string;
  status?: string;
  modalidade?: string;
  organizer?: {
    id: number;
    name: string;
  };
  matchChampionship?: {
    id: number;
    championship_id: number;
    Rodada: number;
    championship?: {
      id: number;
      name: string;
      logo?: string;
      modalidade?: string;
    };
  };
  matchTeams?: Array<{
    team: {
      id: number;
      name: string;
      banner?: string;
      primaryColor?: string;
      secondaryColor?: string;
    };
  }>;
}

const PublicMatchDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMatchDetails = async () => {
      try {
        setLoading(true);
        // Tentar buscar sem autenticação primeiro
        const response = await axios.get(`${API_BASE}/matches/${id}`);
        setMatch(response.data);
      } catch (err: any) {
        console.error('Erro ao carregar detalhes:', err);
        if (err.response?.status === 401) {
          // Se precisar de autenticação, tentar com token se disponível
          const token = localStorage.getItem('token');
          if (token) {
            try {
              const authResponse = await axios.get(`${API_BASE}/matches/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              setMatch(authResponse.data);
            } catch (authErr) {
              setError('Não foi possível carregar os detalhes da partida.');
            }
          } else {
            setError('Não foi possível carregar os detalhes da partida.');
          }
        } else {
          setError('Não foi possível carregar os detalhes da partida.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMatchDetails();
    }
  }, [id]);


  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'em_andamento':
        return 'Em Andamento';
      case 'finalizada':
        return 'Finalizada';
      case 'confirmada':
        return 'Confirmada';
      case 'cancelada':
        return 'Cancelada';
      default:
        return 'Agendada';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'em_andamento':
        return '#16A34A';
      case 'finalizada':
        return '#6B7280';
      case 'confirmada':
        return '#2196F3';
      case 'cancelada':
        return '#DC2626';
      default:
        return '#92400E';
    }
  };

  if (loading) {
    return (
      <div className="public-match-detail-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando informações do jogo...</p>
        </div>
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="public-match-detail-container">
        <div className="error-container">
          <p>{error || 'Jogo não encontrado'}</p>
          <button onClick={() => navigate('/')} className="back-btn">
            <ArrowBackIcon /> Voltar para a página inicial
          </button>
        </div>
      </div>
    );
  }

  const matchDate = new Date(match.date);
  const teams = match.matchTeams || [];
  const homeTeam = teams[0]?.team;
  const awayTeam = teams[1]?.team;
  const isChampionship = !!match.matchChampionship;
  const championship = match.matchChampionship?.championship;

  return (
    <div className="public-match-detail-container">
      <div className="public-match-detail-content">
        {/* Header */}
        <motion.div
          className="public-match-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <button onClick={() => navigate('/')} className="back-btn">
            <ArrowBackIcon /> Voltar
          </button>
        </motion.div>

        {/* Championship Header Section */}
        {isChampionship && championship && (
          <motion.div
            className="championship-header-section"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
          >
            {championship.logo && (
              <img
                src={getChampionshipLogoUrl(championship.logo) || ''}
                alt={championship.name}
                className="championship-logo-large"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
            <h2 className="championship-title">{championship.name}</h2>
          </motion.div>
        )}

        {/* Match Title */}
        <motion.div
          className="match-title-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h1 className="match-title">{match.title}</h1>
          <div className="match-status-badge" style={{ backgroundColor: getStatusColor(match.status) + '20', color: getStatusColor(match.status) }}>
            {getStatusLabel(match.status)}
          </div>
        </motion.div>

        {/* Teams Section */}
        {homeTeam && awayTeam && (
          <motion.div
            className="teams-display-section"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="team-display">
              <div
                className="team-logo-large"
                style={{
                  background: homeTeam.primaryColor && homeTeam.secondaryColor
                    ? `linear-gradient(135deg, ${homeTeam.primaryColor} 0%, ${homeTeam.secondaryColor} 100%)`
                    : undefined
                }}
              >
                {homeTeam.banner ? (
                  <img 
                    src={getTeamBannerUrl(homeTeam.banner) || ''} 
                    alt={homeTeam.name}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className="team-logo-fallback"
                  style={{ display: homeTeam.banner ? 'none' : 'flex' }}
                >
                  <span>{homeTeam.name.charAt(0)}</span>
                </div>
              </div>
              <h2 className="team-name-large">{homeTeam.name}</h2>
            </div>

            <div className="vs-divider-large">
              <span>VS</span>
            </div>

            <div className="team-display">
              <div
                className="team-logo-large"
                style={{
                  background: awayTeam.primaryColor && awayTeam.secondaryColor
                    ? `linear-gradient(135deg, ${awayTeam.primaryColor} 0%, ${awayTeam.secondaryColor} 100%)`
                    : undefined
                }}
              >
                {awayTeam.banner ? (
                  <img 
                    src={getTeamBannerUrl(awayTeam.banner) || ''} 
                    alt={awayTeam.name}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className="team-logo-fallback"
                  style={{ display: awayTeam.banner ? 'none' : 'flex' }}
                >
                  <span>{awayTeam.name.charAt(0)}</span>
                </div>
              </div>
              <h2 className="team-name-large">{awayTeam.name}</h2>
            </div>
          </motion.div>
        )}

        {/* Match Info Cards */}
        <motion.div
          className="match-info-cards"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="info-card">
            <CalendarMonthIcon className="info-icon" />
            <div className="info-content">
              <span className="info-label">Data</span>
              <span className="info-value">
                {format(matchDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </span>
            </div>
          </div>

          <div className="info-card">
            <AccessTimeIcon className="info-icon" />
            <div className="info-content">
              <span className="info-label">Horário</span>
              <span className="info-value">
                {format(matchDate, "HH:mm", { locale: ptBR })}
              </span>
            </div>
          </div>

          {(match.location || match.nomequadra) && (
            <div className="info-card">
              <LocationOnIcon className="info-icon" />
              <div className="info-content">
                <span className="info-label">Local</span>
                <span className="info-value">
                  {match.nomequadra || match.location || 'Não informado'}
                </span>
              </div>
            </div>
          )}

          {match.modalidade && (
            <div className="info-card">
              <SportsSoccerIcon className="info-icon" />
              <div className="info-content">
                <span className="info-label">Modalidade</span>
                <span className="info-value">{match.modalidade}</span>
              </div>
            </div>
          )}

          {isChampionship && match.matchChampionship && (
            <div className="info-card">
              <EmojiEventsIcon className="info-icon" />
              <div className="info-content">
                <span className="info-label">Rodada</span>
                <span className="info-value">Rodada {match.matchChampionship.Rodada}</span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Description */}
        {match.description && (
          <motion.div
            className="match-description-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h3 className="section-title">Sobre o Jogo</h3>
            <p className="description-text">{match.description}</p>
          </motion.div>
        )}

        {/* Call to Action */}
        <motion.div
          className="cta-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <p className="cta-text">Quer participar ou acompanhar mais detalhes?</p>
          <div className="cta-buttons">
            <button onClick={() => navigate('/login')} className="cta-btn primary">
              Fazer Login
            </button>
            <button onClick={() => navigate('/register')} className="cta-btn secondary">
              Criar Conta
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PublicMatchDetail;

