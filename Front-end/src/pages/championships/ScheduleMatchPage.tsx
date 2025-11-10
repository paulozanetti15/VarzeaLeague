import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getChampionshipById, getChampionshipTeams, createChampionshipMatch } from '../../services/championshipsServices';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EventIcon from '@mui/icons-material/Event';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import './ScheduleMatchPage.css';

interface Championship {
  id: number;
  name: string;
  nomequadra?: string;
  logo?: string | null;
}

interface Team {
  id: number;
  name: string;
  banner?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  description?: string;
  cidade?: string;
  estado?: string;
}

const ScheduleMatchPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [championship, setChampionship] = useState<Championship | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    teamHomeId: '',
    teamAwayId: '',
    date: '',
    time: '',
    location: '',
    rodada: ''
  });

  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});

  const getTeamLogoUrl = (banner?: string | null) => {
    if (!banner) return null;
    if (banner.startsWith('/uploads')) {
      return `http://localhost:3001${banner}`;
    }
    return `http://localhost:3001/uploads/teams/${banner}`;
  };

  const getChampionshipLogoUrl = (logo?: string | null) => {
    if (!logo) return null;
    if (logo.startsWith('/uploads')) {
      return `http://localhost:3001${logo}`;
    }
    return `http://localhost:3001/uploads/championships/${logo}`;
  };

  const selectedHomeTeam = teams.find(t => t.id === Number(formData.teamHomeId));
  const selectedAwayTeam = teams.find(t => t.id === Number(formData.teamAwayId));

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const [champData, teamsData] = await Promise.all([
          getChampionshipById(Number(id)),
          getChampionshipTeams(Number(id))
        ]);
        
        setChampionship(champData);
        setTeams(teamsData || []);
        
        // Preencher local padrão com nome da quadra do campeonato
        if (champData.nomequadra) {
          setFormData(prev => ({ ...prev, location: champData.nomequadra || '' }));
        }
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar dados');
        toast.error('Erro ao carregar dados do campeonato');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpar erro do campo quando o usuário começar a digitar
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.teamHomeId) errors.teamHomeId = 'Selecione o time mandante';
    if (!formData.teamAwayId) errors.teamAwayId = 'Selecione o time visitante';
    if (formData.teamHomeId === formData.teamAwayId) {
      errors.teamAwayId = 'Os times devem ser diferentes';
    }
    if (!formData.date) errors.date = 'Data é obrigatória';
    if (!formData.time) errors.time = 'Hora é obrigatória';
    if (!formData.location.trim()) errors.location = 'Local é obrigatório';
    if (!formData.rodada) errors.rodada = 'Rodada é obrigatória';
    
    // Validar se a data é futura
    if (formData.date && formData.time) {
      const dateTimeStr = `${formData.date}T${formData.time}`;
      const matchDateTime = new Date(dateTimeStr);
      const now = new Date();
      
      if (isNaN(matchDateTime.getTime())) {
        errors.date = 'Data/hora inválida';
      } else if (matchDateTime <= now) {
        errors.date = 'A data da partida deve ser futura';
      }
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !id) return;
    
    setSubmitting(true);
    setError(null);
    
    try {
      await createChampionshipMatch(Number(id), {
        teamHomeId: Number(formData.teamHomeId),
        teamAwayId: Number(formData.teamAwayId),
        date: formData.date,
        time: formData.time,
        location: formData.location.trim(),
        rodada: Number(formData.rodada)
      });
      
      toast.success('Partida agendada com sucesso!');
      navigate(`/championships/${id}`);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao agendar partida';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="schedule-match-bg">
        <div className="schedule-match-container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Carregando dados do campeonato...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !championship) {
    return (
      <div className="schedule-match-bg">
        <div className="schedule-match-container">
          <div className="error-container">
            <p>{error}</p>
            <button onClick={() => navigate('/championships')} className="back-btn">
              Voltar para Campeonatos
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="schedule-match-bg">
      <div className="schedule-match-container">
        {/* Header com Destaque */}
        <motion.div
          className="schedule-match-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <button 
            onClick={() => navigate(`/championships/${id}`)} 
            className="header-back-button"
          >
            <ArrowBackIcon /> Voltar
          </button>
          
          <div className="championship-hero-section">
            <div className="championship-hero-content">
              {championship?.logo ? (
                <motion.div 
                  className="championship-hero-logo"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <img 
                    src={getChampionshipLogoUrl(championship.logo) || ''} 
                    alt={championship.name}
                  />
                  <div className="logo-glow"></div>
                </motion.div>
              ) : (
                <motion.div 
                  className="championship-hero-logo-placeholder"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <EmojiEventsIcon />
                </motion.div>
              )}
              
              <div className="championship-hero-text">
                <motion.h1 
                  className="championship-hero-title"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  {championship?.name}
                </motion.h1>
                <motion.div 
                  className="championship-hero-subtitle"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <EventIcon />
                  <span>Agendar Nova Partida</span>
                </motion.div>
              </div>
            </div>
            
            <div className="championship-hero-decoration">
              <div className="decoration-circle circle-1"></div>
              <div className="decoration-circle circle-2"></div>
              <div className="decoration-circle circle-3"></div>
            </div>
          </div>
        </motion.div>

        <div className="schedule-match-content">
          {/* Preview da Partida */}
          {(selectedHomeTeam || selectedAwayTeam) && (
            <motion.div
              className="match-preview-card"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="match-preview-header">
                <EventIcon />
                <span>Preview da Partida</span>
              </div>
              <div className="match-preview-teams">
                <div className="preview-team">
                  {selectedHomeTeam ? (
                    <>
                      <div 
                        className="preview-team-logo"
                        style={{
                          background: selectedHomeTeam.primaryColor && selectedHomeTeam.secondaryColor
                            ? `linear-gradient(135deg, ${selectedHomeTeam.primaryColor} 0%, ${selectedHomeTeam.secondaryColor} 100%)`
                            : undefined
                        }}
                      >
                        {selectedHomeTeam.banner ? (
                          <img src={getTeamLogoUrl(selectedHomeTeam.banner) || ''} alt={selectedHomeTeam.name} />
                        ) : (
                          <span>{selectedHomeTeam.name.charAt(0)}</span>
                        )}
                      </div>
                      <span className="preview-team-name">{selectedHomeTeam.name}</span>
                    </>
                  ) : (
                    <div className="preview-team-placeholder">Time Mandante</div>
                  )}
                </div>
                
                <div className="preview-vs">
                  <span>VS</span>
                </div>
                
                <div className="preview-team">
                  {selectedAwayTeam ? (
                    <>
                      <div 
                        className="preview-team-logo"
                        style={{
                          background: selectedAwayTeam.primaryColor && selectedAwayTeam.secondaryColor
                            ? `linear-gradient(135deg, ${selectedAwayTeam.primaryColor} 0%, ${selectedAwayTeam.secondaryColor} 100%)`
                            : undefined
                        }}
                      >
                        {selectedAwayTeam.banner ? (
                          <img src={getTeamLogoUrl(selectedAwayTeam.banner) || ''} alt={selectedAwayTeam.name} />
                        ) : (
                          <span>{selectedAwayTeam.name.charAt(0)}</span>
                        )}
                      </div>
                      <span className="preview-team-name">{selectedAwayTeam.name}</span>
                    </>
                  ) : (
                    <div className="preview-team-placeholder">Time Visitante</div>
                  )}
                </div>
              </div>
              {formData.date && formData.time && (
                <div className="match-preview-details">
                  <span>
                    <CalendarMonthIcon /> {format(new Date(`${formData.date}T${formData.time}`), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                  </span>
                  {formData.location && (
                    <span>
                      <LocationOnIcon /> {formData.location}
                    </span>
                  )}
                  {formData.rodada && (
                    <span>
                      <EmojiEventsIcon /> Rodada {formData.rodada}
                    </span>
                  )}
                </div>
              )}
            </motion.div>
          )}

          <motion.div
            className="schedule-match-form-wrapper"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {error && (
              <div className="error-message">
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="schedule-match-form">
              {/* Seleção de Times com Cards */}
              <div className="form-section teams-section">
                <h3 className="section-title">
                  <SportsSoccerIcon /> Selecionar Times
                </h3>
                
                <div className="teams-cards-container">
                  <div className="team-selection-column">
                    <label className="team-column-label">
                      <span>Time Mandante</span>
                      {selectedHomeTeam && <CheckCircleIcon className="selected-icon" />}
                    </label>
                    <div className="teams-grid">
                      <AnimatePresence>
                        {teams.map((team) => {
                          const isSelected = team.id === Number(formData.teamHomeId);
                          const isDisabled = team.id === Number(formData.teamAwayId);
                          
                          return (
                            <motion.div
                              key={team.id}
                              className={`team-card-selectable ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                              onClick={() => {
                                if (!isDisabled) {
                                  setFormData(prev => ({ ...prev, teamHomeId: String(team.id) }));
                                  if (fieldErrors.teamHomeId) {
                                    setFieldErrors(prev => {
                                      const newErrors = { ...prev };
                                      delete newErrors.teamHomeId;
                                      return newErrors;
                                    });
                                  }
                                }
                              }}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              whileHover={!isDisabled ? { scale: 1.05 } : {}}
                              whileTap={!isDisabled ? { scale: 0.95 } : {}}
                            >
                              <div 
                                className="team-card-logo"
                                style={{
                                  background: team.primaryColor && team.secondaryColor
                                    ? `linear-gradient(135deg, ${team.primaryColor} 0%, ${team.secondaryColor} 100%)`
                                    : team.banner 
                                    ? undefined
                                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                }}
                              >
                                {team.banner ? (
                                  <img 
                                    src={getTeamLogoUrl(team.banner) || ''} 
                                    alt={team.name}
                                  />
                                ) : (
                                  <span className="team-initial">{team.name.charAt(0)}</span>
                                )}
                              </div>
                              <div className="team-card-info">
                                <h4 className="team-card-name">{team.name}</h4>
                                {(team.cidade || team.estado) && (
                                  <p className="team-card-location">
                                    {team.cidade}{team.cidade && team.estado ? ', ' : ''}{team.estado}
                                  </p>
                                )}
                              </div>
                              {isSelected && (
                                <div className="team-card-check">
                                  <CheckCircleIcon />
                                </div>
                              )}
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                    {fieldErrors.teamHomeId && (
                      <span className="field-error">{fieldErrors.teamHomeId}</span>
                    )}
                  </div>

                  <div className="vs-divider-large">
                    <span>VS</span>
                  </div>

                  <div className="team-selection-column">
                    <label className="team-column-label">
                      <span>Time Visitante</span>
                      {selectedAwayTeam && <CheckCircleIcon className="selected-icon" />}
                    </label>
                    <div className="teams-grid">
                      <AnimatePresence>
                        {teams.map((team) => {
                          const isSelected = team.id === Number(formData.teamAwayId);
                          const isDisabled = team.id === Number(formData.teamHomeId);
                          
                          return (
                            <motion.div
                              key={team.id}
                              className={`team-card-selectable ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                              onClick={() => {
                                if (!isDisabled) {
                                  setFormData(prev => ({ ...prev, teamAwayId: String(team.id) }));
                                  if (fieldErrors.teamAwayId) {
                                    setFieldErrors(prev => {
                                      const newErrors = { ...prev };
                                      delete newErrors.teamAwayId;
                                      return newErrors;
                                    });
                                  }
                                }
                              }}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              whileHover={!isDisabled ? { scale: 1.05 } : {}}
                              whileTap={!isDisabled ? { scale: 0.95 } : {}}
                            >
                              <div 
                                className="team-card-logo"
                                style={{
                                  background: team.primaryColor && team.secondaryColor
                                    ? `linear-gradient(135deg, ${team.primaryColor} 0%, ${team.secondaryColor} 100%)`
                                    : team.banner 
                                    ? undefined
                                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                }}
                              >
                                {team.banner ? (
                                  <img 
                                    src={getTeamLogoUrl(team.banner) || ''} 
                                    alt={team.name}
                                  />
                                ) : (
                                  <span className="team-initial">{team.name.charAt(0)}</span>
                                )}
                              </div>
                              <div className="team-card-info">
                                <h4 className="team-card-name">{team.name}</h4>
                                {(team.cidade || team.estado) && (
                                  <p className="team-card-location">
                                    {team.cidade}{team.cidade && team.estado ? ', ' : ''}{team.estado}
                                  </p>
                                )}
                              </div>
                              {isSelected && (
                                <div className="team-card-check">
                                  <CheckCircleIcon />
                                </div>
                              )}
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                    {fieldErrors.teamAwayId && (
                      <span className="field-error">{fieldErrors.teamAwayId}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Data e Hora */}
              <div className="form-section">
                <h3 className="section-title">
                  <CalendarMonthIcon /> Data e Hora da Partida
                </h3>
                <div className="datetime-grid">
                  <div className="form-group">
                    <label className="form-label" htmlFor="date">
                      Data
                    </label>
                    <div className="input-with-icon">
                      <CalendarMonthIcon className="input-icon" />
                      <input
                        type="date"
                        id="date"
                        name="date"
                        className={`form-control ${fieldErrors.date ? 'error' : ''}`}
                        value={formData.date}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    {fieldErrors.date && (
                      <span className="field-error">{fieldErrors.date}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="time">
                      Hora
                    </label>
                    <div className="input-with-icon">
                      <AccessTimeIcon className="input-icon" />
                      <input
                        type="time"
                        id="time"
                        name="time"
                        className={`form-control ${fieldErrors.time ? 'error' : ''}`}
                        value={formData.time}
                        onChange={handleInputChange}
                      />
                    </div>
                    {fieldErrors.time && (
                      <span className="field-error">{fieldErrors.time}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Local e Rodada */}
              <div className="form-section">
                <h3 className="section-title">
                  <LocationOnIcon /> Local e Rodada
                </h3>
                <div className="location-rodada-grid">
                  <div className="form-group">
                    <label className="form-label" htmlFor="location">
                      Local da Partida
                    </label>
                    <div className="input-with-icon">
                      <LocationOnIcon className="input-icon" />
                      <input
                        type="text"
                        id="location"
                        name="location"
                        className={`form-control ${fieldErrors.location ? 'error' : ''}`}
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="Nome da quadra/campo"
                      />
                    </div>
                    {fieldErrors.location && (
                      <span className="field-error">{fieldErrors.location}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="rodada">
                      Rodada
                    </label>
                    <div className="input-with-icon">
                      <EmojiEventsIcon className="input-icon" />
                      <input
                        type="number"
                        id="rodada"
                        name="rodada"
                        className={`form-control ${fieldErrors.rodada ? 'error' : ''}`}
                        value={formData.rodada}
                        onChange={handleInputChange}
                        placeholder="Ex: 1, 2, 3..."
                        min="1"
                      />
                    </div>
                    {fieldErrors.rodada && (
                      <span className="field-error">{fieldErrors.rodada}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Botões */}
              <div className="form-buttons">
                <button
                  type="button"
                  onClick={() => navigate(`/championships/${id}`)}
                  className="cancel-btn"
                >
                  Cancelar
                </button>
                <motion.button
                  type="submit"
                  className="submit-btn"
                  disabled={submitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {submitting ? (
                    <>
                      <div className="button-spinner"></div>
                      Agendando...
                    </>
                  ) : (
                    <>
                      <EventIcon /> Agendar Partida
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleMatchPage;

