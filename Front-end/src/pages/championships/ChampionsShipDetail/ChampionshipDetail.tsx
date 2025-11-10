import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getChampionshipTeams, getChampionshipById, deleteChampionship, leaveChampionshipWithTeam, getChampionshipMatches } from '../../../services/championships.service';
import { getUserTeams } from '../../../services/teams.service';
import trophy from '../../../assets/championship-trophy.svg';
import './ChampionshipDetail.css';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';
import PunicaoCampeonatoRegisterModal from '../../../components/Modals/Punishment/Championships/PunishmentChampionshipRegisterModal';
import PunicaoCampeonatoModalInfo from '../../../components/Modals/Punishment/Championships/PunishmentChampionshipInfoModal';
import SelectTeamPlayersChampionshipModal from '../../../components/Modals/Teams/SelectTeamPlayersChampionshipModal';
import RemoveTeamsFromChampionshipModal from '../../../components/Modals/Teams/RemoveTeamsFromChampionshipModal';
import { getChampionshipLogoUrl, getTeamBannerUrl } from '../../../config/api';

interface Championship {
  id: number;
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  created_by: number;
  modalidade?: string;
  nomequadra?: string;
  logo?: string | null;
  tipo?: 'liga' | 'mata-mata';
}

const ChampionshipDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [championship, setChampionship] = useState<Championship | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasEditPermission, setHasEditPermission] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [teams, setTeams] = useState<any[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showTeamSelectModal, setShowTeamSelectModal] = useState(false);
  const [userTeams, setUserTeams] = useState<any[]>([]);
  const [isLeavingTeamId, setIsLeavingTeamId] = useState<number | null>(null);
  const [selectedEnrolledTeamId, setSelectedEnrolledTeamId] = useState<number | null>(null);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveModalTeamId, setLeaveModalTeamId] = useState<number | null>(null);
  const [showPunicaoRegister, setShowPunicaoRegister] = useState(false);
  const [showPunicaoInfo, setShowPunicaoInfo] = useState(false);
  const [championshipMatches, setChampionshipMatches] = useState<any[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);

  const pendingLeaveRef = React.useRef<Set<number>>(new Set());

  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
  const isLogged = !!currentUser;

  // Times do usuário já inscritos e disponíveis para inscrição
  const enrolledTeamIds = useMemo(() => new Set((teams || []).map((t) => t.id)), [teams]);
  const availableUserTeams = useMemo(
    () => (userTeams || []).filter((ut) => !enrolledTeamIds.has(ut.id)),
    [userTeams, enrolledTeamIds]
  );

  const userEnrolledTeams = useMemo(
    () => (teams || []).filter((t) => (userTeams || []).some((ut) => ut.id === t.id)),
    [teams, userTeams]
  );

  const loadChampionshipTeams = useCallback(async () => {
    if (!id) return;
    try {
      console.log('Carregando times do campeonato:', id);
      const teamsData = await getChampionshipTeams(Number(id));
      console.log('Times carregados:', teamsData);
      setTeams(teamsData || []);
    } catch (err) {
      console.error('Erro ao carregar times:', err);
      setTeams([]);
    }
  }, [id]);

  const loadChampionshipMatches = useCallback(async () => {
    if (!id) return;
    try {
      setLoadingMatches(true);
      const matchesData = await getChampionshipMatches(Number(id));
      setChampionshipMatches(matchesData || []);
    } catch (err) {
      console.error('Erro ao carregar partidas do campeonato:', err);
      setChampionshipMatches([]);
    } finally {
      setLoadingMatches(false);
    }
  }, [id]);

  const loadUserTeams = useCallback(async () => {
    try {
      const userTeamsData = await getUserTeams();
      setUserTeams(Array.isArray(userTeamsData) ? userTeamsData : []);
    } catch (err) {
      console.error('Erro ao carregar times do usuário:', err);
    }
  }, []);

  useEffect(() => {
    const fetchChampionship = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await getChampionshipById(Number(id));
        console.log('Championship data loaded:', data);
        console.log('Championship logo:', data.logo);
        console.log('Championship logo URL:', data.logo ? getChampionshipLogoUrl(data.logo) : 'N/A');
        setChampionship(data);

        // Verificar permissões: admin_master (1) sempre tem permissão; creator com userType 2 (admin_eventos) tem permissão
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = Number(user.id);
        const userType = Number(user.userTypeId);

        const isCreator = data.created_by === userId;
        const fullPermission = userType === 1 || (userType === 2 && isCreator);

        setHasEditPermission(!!fullPermission);
        setIsAdmin(userType === 1);

      } catch (err: any) {
        setError(err.message || 'Erro ao carregar campeonato');
        toast.error('Erro ao carregar dados do campeonato');
      } finally {
        setLoading(false);
      }
    };

    fetchChampionship();
    loadChampionshipTeams();
    loadUserTeams();
    loadChampionshipMatches();
  }, [id, loadChampionshipTeams, loadUserTeams, loadChampionshipMatches]);

  React.useEffect(() => {
    if (userEnrolledTeams.length === 1 && !selectedEnrolledTeamId) {
      setSelectedEnrolledTeamId(userEnrolledTeams[0].id);
    }
    if (userEnrolledTeams.length === 0) setSelectedEnrolledTeamId(null);
  }, [userEnrolledTeams, selectedEnrolledTeamId]);

  const handleDeleteChampionship = async () => {
    if (!id) return;
    
    try {
      await deleteChampionship(Number(id));
      toast.success('Campeonato excluído com sucesso!');
      navigate('/championships');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao excluir campeonato');
    }
  };

  const handleOpenPunicao = () => {
    setShowPunicaoRegister(true);
  };

  const handleOpenRankingClassificacao = () => {
    navigate(`/championships/${id}/ranking-times`);
  };

  const handleJoinChampionship = () => {
    if (availableUserTeams.length === 0) {
      toast.error('Você não possui times disponíveis para este campeonato');
      return;
    }
    setShowTeamSelectModal(true);
  };

  const handleLeaveChampionship = async (teamId: number) => {
    console.log('handleLeaveChampionship called for teamId=', teamId);

    if (pendingLeaveRef.current.has(teamId) || isLeavingTeamId === teamId) {
      console.log('leave already in progress for teamId=', teamId);
      return;
    }

    pendingLeaveRef.current.add(teamId);

    try {
      setIsLeavingTeamId(teamId);
      const toastId = toast.loading('Removendo time...');

      const resp = await leaveChampionshipWithTeam(Number(id), teamId);
      console.log('leaveChampionshipWithTeam response:', resp);

      toast.dismiss(toastId);
      toast.success('Time removido do campeonato com sucesso!');

      await loadChampionshipTeams();
      await loadUserTeams();

      // avoid full reload when possible; but keep compatibility with previous behavior
      try {
        // small delay to let UI update
        setTimeout(() => window.location.reload(), 200);
      } catch {}
    } catch (err: any) {
      console.error('Erro ao remover time do campeonato:', err);
      toast.error(err.response?.data?.message || err.message || 'Erro ao remover time do campeonato');
    } finally {
      setIsLeavingTeamId(null);
      pendingLeaveRef.current.delete(teamId);
    }
  };

  const requestLeave = (teamId: number) => {
    setLeaveModalTeamId(teamId);
    setShowLeaveModal(true);
  };

  const [showRemoveTeamsModal, setShowRemoveTeamsModal] = useState(false);

  const isOwner = Boolean(currentUser) && Boolean(championship) && Number(currentUser?.id) === Number(championship?.created_by);
  const canManageTeams = isOwner || isAdmin;

  const userEnrolledCaptainTeams = useMemo(
    () => (userEnrolledTeams || []).filter((t) => Number(t.captainId) === Number(currentUser?.id)),
    [userEnrolledTeams, currentUser]
  );

  const confirmLeave = async () => {
    if (!leaveModalTeamId) return;
    setShowLeaveModal(false);
    const tid = leaveModalTeamId;
    setLeaveModalTeamId(null);
    await handleLeaveChampionship(tid);
  };

  // Note: removed low-level DOM fallback listeners to avoid interfering with React event flow.

  if (loading) {
    return (
      <div className="championship-detail-bg">
        <div className="championship-detail-container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Carregando campeonato...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !championship) {
    return (
      <div className="championship-detail-bg">
        <div className="championship-detail-container">
          <div className="error-container">
            <h2>Erro ao carregar campeonato</h2>
            <p>{error || 'Campeonato não encontrado'}</p>
            <button 
              className="back-button"
              onClick={() => navigate('/championships')}
            >
              Voltar para Campeonatos
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="championship-detail-bg">
      <div className="championship-detail-container">
        {/* Hero Section com Logo - Sempre exibir */}
        <motion.div
          className="championship-hero-banner"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="championship-hero-overlay"></div>
          {championship.logo && getChampionshipLogoUrl(championship.logo) ? (
            <img 
              src={getChampionshipLogoUrl(championship.logo)!} 
              alt={championship.name}
              className="championship-hero-logo-large"
              onError={(e) => {
                console.error('Erro ao carregar logo:', e);
                e.currentTarget.style.display = 'none';
                const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
                if (placeholder) placeholder.style.display = 'flex';
              }}
            />
          ) : (
            <div className="championship-hero-logo-placeholder-large">
              <EmojiEventsIcon style={{ fontSize: '120px', color: '#ffffff' }} />
            </div>
          )}
          <div className="championship-hero-content-overlay">
            <h1 className="championship-hero-title">{championship.name}</h1>
            <p className="championship-hero-subtitle">Detalhes do campeonato</p>
          </div>
        </motion.div>

        <motion.div
          className="championship-detail-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="championship-info-section">
            <div className="championship-info-hero">
              {getChampionshipLogoUrl(championship.logo) && (
                <div className="championship-logo-hero">
                  <img 
                    src={getChampionshipLogoUrl(championship.logo)!} 
                    alt={championship.name}
                    className="championship-hero-image"
                  />
                </div>
              )}
              
              <div className="championship-info-content">
                <div className="info-grid-modern">
                  {championship.modalidade && (
                    <div className="info-card-modern">
                      <div className="info-icon">⚽</div>
                      <div className="info-content-modern">
                        <span className="info-label-modern">Modalidade</span>
                        <span className="info-value-modern">{championship.modalidade}</span>
                      </div>
                    </div>
                  )}
                  
                  {championship.nomequadra && (
                    <div className="info-card-modern">
                      <div className="info-icon">🏟️</div>
                      <div className="info-content-modern">
                        <span className="info-label-modern">Quadra</span>
                        <span className="info-value-modern">{championship.nomequadra}</span>
                      </div>
                    </div>
                  )}
                  
                  {championship.start_date && (
                    <div className="info-card-modern">
                      <div className="info-icon">📅</div>
                      <div className="info-content-modern">
                        <span className="info-label-modern">Data de Início</span>
                        <span className="info-value-modern">
                          {new Date(championship.start_date).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {championship.end_date && (
                    <div className="info-card-modern">
                      <div className="info-icon">🏁</div>
                      <div className="info-content-modern">
                        <span className="info-label-modern">Data de Fim</span>
                        <span className="info-value-modern">
                          {new Date(championship.end_date).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                
                {championship.description && (
                  <div className="championship-description-modern">
                    <h4 className="description-title-modern">Sobre o Campeonato</h4>
                    <p className="description-text-modern">{championship.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="championship-actions-section">
            <h3 className="section-title">Ações</h3>
            
            <div className="actions-grid">
              {hasEditPermission ? (
                <>
                  <button
                    className="action-btn edit-btn"
                    onClick={() => navigate(`/championships/${id}/edit`)}
                  >
                    <span className="btn-icon">✏️</span>
                    Editar Campeonato
                  </button>

                  <button
                    className="action-btn delete-btn"
                    onClick={() => setShowDeleteModal(true)}
                  >
                    <span className="btn-icon">🗑️</span>
                    Excluir Campeonato
                  </button>

                  <button
                    className="action-btn warning-btn"
                    onClick={handleOpenPunicao}
                  >
                    <span className="btn-icon">⚠️</span>
                    Aplicar/Ver Punição
                  </button>

                  <button
                    className="action-btn schedule-btn"
                    onClick={() => navigate(`/championships/${id}/schedule-match`)}
                  >
                    <span className="btn-icon">📅</span>
                    Agendamento de Partidas
                  </button>

                  {canManageTeams && (
                    <button
                      className="action-btn delete-multiple-btn"
                      onClick={() => setShowRemoveTeamsModal(true)}
                    >
                      <span className="btn-icon">🗑️</span>
                      Excluir Times
                    </button>
                  )}

                    <button
                      className="action-btn ranking-btn"
                      onClick={handleOpenRankingClassificacao}
                    >
                      <span className="btn-icon">🏆</span>
                      Classificação
                    </button>
                </>
              ) : (
                <>
                  <button
                    className="action-btn ranking-btn"
                    onClick={handleOpenRankingClassificacao}
                  >
                    <span className="btn-icon">🏆</span>
                    Classificação
                  </button>

                  {userEnrolledCaptainTeams.length > 0 && (
                    <div className="leave-team-control" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      {userEnrolledCaptainTeams.length === 1 ? (
                        <button
                          className="out-btn"
                          onClick={() => requestLeave(userEnrolledCaptainTeams[0].id)}
                          disabled={isLeavingTeamId === userEnrolledCaptainTeams[0].id}
                          aria-label={`Sair do campeonato - ${userEnrolledCaptainTeams[0].name}`}
                        >
                          {isLeavingTeamId === userEnrolledCaptainTeams[0].id ? 'Saindo...' : 'Sair do Campeonato'}
                        </button>
                      ) : (
                        <>
                          <select
                            className="leave-team-select"
                            value={selectedEnrolledTeamId ?? ''}
                            onChange={(e) => setSelectedEnrolledTeamId(Number(e.target.value))}
                            aria-label="Selecionar time para sair"
                          >
                            <option value="">Selecione o time</option>
                            {userEnrolledCaptainTeams.map((t) => (
                              <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                          </select>
                          <button
                            className="action-btn delete-btn btn-leave-championship"
                            onClick={() => selectedEnrolledTeamId && requestLeave(selectedEnrolledTeamId)}
                            disabled={!selectedEnrolledTeamId || isLeavingTeamId === selectedEnrolledTeamId}
                            aria-label="Sair do campeonato"
                          >
                            <span className="btn-icon">🗑️</span>
                            {isLeavingTeamId ? 'Saindo...' : 'Sair do Campeonato'}
                          </button>
                        </>
                      )}
                    </div>
                  )}

                  {(isLogged && availableUserTeams.length > 0) && Number(currentUser?.userTypeId) === 3 && (
                    <button
                      className="action-btn join-btn"
                      onClick={handleJoinChampionship}
                    >
                      <span className="btn-icon">➕</span>
                      Inscrever Time
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="teams-section">
            <h3 className="section-title">Times Participantes</h3>
            
            {teams.length === 0 ? (
              <div className="no-teams-message">
                <p>Nenhum time inscrito neste campeonato ainda.</p>
              </div>
            ) : (
              <div className="teams-grid">
                {teams.map((team) => {
                  
                  return (
                  <div key={team.id} className="team-card">
                    <div className="team-logo">
                      {team.banner ? (
                        <img 
                          src={getTeamBannerUrl(team.banner) || ''} 
                          alt={`Logo do ${team.name}`}
                          className="team-logo-img"
                        />
                      ) : (
                        <div className="team-logo-placeholder">
                          <span className="logo-text">FC</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="team-info">
                      <h4 className="team-name">{team.name}</h4>
                      
                      {team.description && (
                        <p className="team-description">{team.description}</p>
                      )}
                      
                      {team.estado && team.cidade && (
                        <div className="team-location">
                          <span className="location-icon">📍</span>
                          <span className="location-text">{team.cidade}, {team.estado}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* per-card remove button removed; owner can remove multiple via the 'Excluir Times' action */}
                    
                    {/* leave button removed from team card; moved to actions area */}
                  </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Seção de Próximos Jogos */}
          <div className="championship-matches-section">
            <h3 className="section-title">Próximos Jogos</h3>
            
            {loadingMatches ? (
              <div className="loading-matches">
                <div className="loading-spinner"></div>
                <p>Carregando partidas...</p>
              </div>
            ) : championshipMatches.length === 0 ? (
              <div className="no-matches-message">
                <p>Nenhuma partida agendada ainda.</p>
              </div>
            ) : (
              <div className="matches-grid">
                {championshipMatches
                  .filter((match: any) => {
                    const matchDate = new Date(match.date);
                    const now = new Date();
                    return matchDate >= now || match.status === 'em_andamento';
                  })
                  .slice(0, 6)
                  .map((match: any) => {
                    const matchDate = new Date(match.date);
                    const teams = match.matchTeams || [];
                    const homeTeam = teams[0]?.team;
                    const awayTeam = teams[1]?.team;
                    const round = match.matchChampionship?.Rodada || 'N/A';


                    return (
                      <motion.div
                        key={match.id}
                        className="match-card-championship"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        onClick={() => navigate(`/matches/${match.id}`)}
                      >
                        <div className="match-card-header-championship">
                          <span className="match-round-badge">Rodada {round}</span>
                          <span className="match-date-championship">
                            {format(matchDate, "dd/MM/yyyy", { locale: ptBR })}
                          </span>
                        </div>

                        <div className="match-teams-championship">
                          <div className="match-team-championship">
                            <div className="team-logo-match">
                              {homeTeam?.banner ? (
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
                                className="team-logo-fallback-match"
                                style={{ display: homeTeam?.banner ? 'none' : 'flex' }}
                              >
                                <span>{homeTeam?.name?.charAt(0) || '?'}</span>
                              </div>
                            </div>
                            <span className="team-name-match">{homeTeam?.name || 'TBD'}</span>
                          </div>

                          <div className="match-vs-championship">VS</div>

                          <div className="match-team-championship">
                            <div className="team-logo-match">
                              {awayTeam?.banner ? (
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
                                className="team-logo-fallback-match"
                                style={{ display: awayTeam?.banner ? 'none' : 'flex' }}
                              >
                                <span>{awayTeam?.name?.charAt(0) || '?'}</span>
                              </div>
                            </div>
                            <span className="team-name-match">{awayTeam?.name || 'TBD'}</span>
                          </div>
                        </div>

                        <div className="match-info-championship">
                          <div className="match-info-item">
                            <AccessTimeIcon className="info-icon-small" />
                            <span>{format(matchDate, "HH:mm", { locale: ptBR })}</span>
                          </div>
                          {(match.location || match.nomequadra) && (
                            <div className="match-info-item">
                              <LocationOnIcon className="info-icon-small" />
                              <span>{match.nomequadra || match.location}</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
              </div>
            )}
          </div>
        </motion.div>

        {/* Modal de Confirmação de Exclusão */}
        <AnimatePresence>
          {showDeleteModal && (
            <motion.div
              className="delete-modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteModal(false)}
            >
              <motion.div
                className="delete-modal-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="delete-modal-header">
                  <h3 className="delete-modal-title">Confirmar Exclusão</h3>
                  <button 
                    className="delete-modal-close"
                    onClick={() => setShowDeleteModal(false)}
                    aria-label="Fechar"
                  >
                    ×
                  </button>
                </div>
                
                <div className="delete-modal-body">
                  <p className="delete-modal-message">
                    Tem certeza que deseja excluir o campeonato <strong>"{championship.name}"</strong>?
                  </p>
                  <p className="delete-modal-warning">
                    Esta ação não pode ser desfeita.
                  </p>
                </div>
                
                <div className="delete-modal-footer">
                  <button
                    className="delete-modal-btn delete-modal-btn-cancel"
                    onClick={() => setShowDeleteModal(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    className="delete-modal-btn delete-modal-btn-delete"
                    onClick={handleDeleteChampionship}
                  >
                    Excluir
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal de Confirmação de Saída de Time */}
        <AnimatePresence>
          {showLeaveModal && (
            <motion.div
              className="delete-modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLeaveModal(false)}
            >
              <motion.div
                className="delete-modal-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="delete-modal-header">
                  <h3 className="delete-modal-title">Confirmar Saída</h3>
                  <button
                    className="delete-modal-close"
                    onClick={() => setShowLeaveModal(false)}
                    aria-label="Fechar"
                  >
                    ×
                  </button>
                </div>

                <div className="delete-modal-body">
                  <p className="delete-modal-message">
                    Tem certeza que deseja remover este time do campeonato?
                  </p>
                </div>

                <div className="delete-modal-footer">
                  <button
                    className="delete-modal-btn delete-modal-btn-cancel"
                    onClick={() => setShowLeaveModal(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    className="delete-modal-btn delete-modal-btn-delete"
                    onClick={confirmLeave}
                  >
                    Confirmar Saída
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal de Seleção de Time */}
      <SelectTeamPlayersChampionshipModal
        show={showTeamSelectModal}
        onHide={() => setShowTeamSelectModal(false)}
        championshipId={Number(id)}
        modalidade={championship.modalidade}
        onSuccess={async () => {
          await loadChampionshipTeams();
          try {
            const updated = await getChampionshipById(Number(id));
            setChampionship(updated);
          } catch {}
        }}
      />

      <RemoveTeamsFromChampionshipModal
        show={showRemoveTeamsModal}
        onHide={() => setShowRemoveTeamsModal(false)}
        championshipId={Number(id)}
        onSuccess={async () => {
          await loadChampionshipTeams();
          await loadUserTeams();
        }}
      />

      {/* Modais de Punição */}
      {(hasEditPermission || isAdmin) && (
        <>
          <PunicaoCampeonatoRegisterModal
            show={showPunicaoRegister}
            onHide={() => setShowPunicaoRegister(false)}
            onClose={() => setShowPunicaoRegister(false)}
            championshipId={Number(id)}
          />
          <PunicaoCampeonatoModalInfo
            show={showPunicaoInfo}
            onHide={() => setShowPunicaoInfo(false)}
            onClose={() => setShowPunicaoInfo(false)}
            championshipId={Number(id)}
          />
        </>
      )}
    </div>
  );
};

export default ChampionshipDetail;