import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import AddIcon from '@mui/icons-material/Add';
import GroupIcon from '@mui/icons-material/Group';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import WcIcon from '@mui/icons-material/Wc';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';

import { HistoricoContext } from '../../Context/HistoricoContext';
import useTeams from '../../hooks/useTeams';
import { usePDFGenerator } from '../../hooks/usePDFGenerator';

import type { PlayerStats } from '../../interfaces/team';

import TeamStats from '../../components/features/Teams/TeamStats';
import PlayerStatsTable from '../../components/features/Teams/PlayerStatsTable';
import TeamActionButtons from '../../components/features/Teams/TeamActionButtons';
import DownloadReportModal from '../../components/Modals/DownloadReportModal';

import './TeamList.css';

const TeamList = () => {
  const { teams, loading, error, teamPlayers, loadingPlayers, fetchTeams, fetchTeamPlayers, fetchTeamPlayerStats } = useTeams();
  const [expandedTeam, setExpandedTeam] = useState<number | null>(null);
  const [playerStats, setPlayerStats] = useState<PlayerStats[] | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const navigate = useNavigate();
  const historico = useContext(HistoricoContext);
  const { generatePlayerStatsPDF } = usePDFGenerator();
  const apiBaseUrl = useMemo(() => {
    const envUrl = import.meta.env.VITE_API_URL as string | undefined;
    if (!envUrl) return 'http://localhost:3001';
    // remove trailing /api if provided to keep base host
    return envUrl.endsWith('/api') ? envUrl.slice(0, -4) : envUrl;
  }, []);

  const resolveTeamImage = (raw?: string | null) => {
    if (!raw) return null;
    if (/^https?:\/\//i.test(raw)) return raw;
    if (raw.startsWith('/')) return `${apiBaseUrl}${raw}`;
    return `${apiBaseUrl}/uploads/teams/${raw}`;
  };

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  useEffect(() => {
    teams.slice(0, 1).map((team) => {
      historico?.fetchHistorico(Number(team.id))
    })
  }, [teams])

  const hasTeam = teams.length > 0;

  const togglePlayersList = (e: React.MouseEvent, teamId: number) => {
    e.stopPropagation();

    const key = String(teamId);
    if (expandedTeam !== teamId && !teamPlayers[key]) {
      fetchTeamPlayers(teamId);
    }

    setExpandedTeam(expandedTeam === teamId ? null : Number(teamId));
  };

  const handleGenerateReport = async () => {
    try {
      if (!hasTeam) return;
      setLoadingReport(true);
      const teamId = teams[0].id;
      const data = await fetchTeamPlayerStats(teamId);
      setPlayerStats(data?.stats || []);
    } catch (e) {
      console.error('Erro ao gerar relatório de jogadores:', e);
    } finally {
      setLoadingReport(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!playerStats || !hasTeam) return;
    setShowDownloadModal(true);
  };

  const handleConfirmDownload = async () => {
    try {
      setIsDownloading(true);
      if (!playerStats || !hasTeam) return;

      const teamName = teams[0].name;
      generatePlayerStatsPDF(playerStats, teamName);
      
      setShowDownloadModal(false);
    } catch (e) {
      console.error('Erro ao baixar PDF:', e);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCancelDownload = () => {
    setShowDownloadModal(false);
  };

  return (
    <div className="teams-container">
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
        <div className="error-container-inline">
          <div className="error-message-inline">
            <p>{error}</p>
            <div className="error-spacer"></div>
            <button className="retry-btn" onClick={() => fetchTeams()}>Tentar novamente</button>
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
              {teams.slice(0, 1).map((team) => {
                const bannerUrl = resolveTeamImage((team as any).logo || (team as any).logoUrl || team.banner);
                const playersCount = team.players?.length ?? team.playerCount ?? 0;
                const matchesCount = team.matchCount ?? (team as any).quantidadePartidas ?? 0;
                const locationText = [team.estado, team.cidade].filter(Boolean).join(' - ');
                const heroBackground = team.primaryColor || team.secondaryColor
                  ? `linear-gradient(135deg, ${team.primaryColor || '#1976d2'}, ${team.secondaryColor || team.primaryColor || '#0d47a1'})`
                  : undefined;

                return (
                  <div
                    key={team.id}
                    className="team-view-main-grid"
                  >
                    {/* Seção lateral esquerda - Logo e informações principais */}
                    <div className="team-sidebar-section">
                      <div 
                        className="team-sidebar-content"
                        style={heroBackground ? { background: heroBackground } : undefined}
                      >
                        <div className="team-sidebar-overlay" />
                        <div className="team-logo-container">
                          {bannerUrl ? (
                            <img
                              src={bannerUrl}
                              alt={`Escudo do ${team.name}`}
                              className="team-logo-display"
                            />
                          ) : (
                            <div className="team-logo-placeholder-display">
                              <ShieldOutlinedIcon />
                              <span>Sem escudo</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="team-sidebar-info">
                          <div className="team-role-badges">
                            <span className={`team-role-badge ${team.isCurrentUserCaptain ? 'team-role-badge--captain' : 'team-role-badge--member'}`}>
                              {team.isCurrentUserCaptain ? 'Capitão' : 'Membro'}
                            </span>
                            {matchesCount > 0 && (
                              <span className="team-role-badge team-role-badge--matches">
                                {matchesCount} {matchesCount === 1 ? 'partida' : 'partidas'}
                              </span>
                            )}
                          </div>
                          
                          <h2 className="team-sidebar-name">{team.name}</h2>
                          
                          <div className="team-sidebar-meta">
                            {locationText && (
                              <span className="team-meta-badge">
                                {locationText}
                              </span>
                            )}
                            {(team.primaryColor || team.secondaryColor) && (
                              <span className="team-meta-badge team-colors-badge">
                                {team.primaryColor && (
                                  <span
                                    className="color-indicator-sidebar"
                                    title="Cor primária"
                                    style={{ backgroundColor: team.primaryColor }}
                                  />
                                )}
                                {team.secondaryColor && (
                                  <span
                                    className="color-indicator-sidebar"
                                    title="Cor secundária"
                                    style={{ backgroundColor: team.secondaryColor }}
                                  />
                                )}
                              </span>
                            )}
                          </div>
                          
                          <div className="team-sidebar-stats">
                            <div className="team-sidebar-stat">
                              <GroupIcon />
                              <div>
                                <strong>{playersCount}</strong>
                                <span>{playersCount === 1 ? 'Jogador' : 'Jogadores'}</span>
                              </div>
                            </div>
                            <div className="team-sidebar-stat">
                              <EmojiEventsIcon />
                              <div>
                                <strong>{matchesCount}</strong>
                                <span>{matchesCount === 1 ? 'Partida' : 'Partidas'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="team-description-container">
                          <label className="team-description-label">Descrição do Time</label>
                          <p className="team-description-text">
                            {team.description || 'Sem descrição cadastrada para este time.'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Seção principal direita - Estatísticas, jogadores e ações */}
                    <div className="team-main-section">
                      <div className="team-body-section">
                        <div className="team-section-header">
                          <div className="team-section-title-group">
                            <h3>Elenco</h3>
                          </div>
                          <button
                            className="players-toggle-btn modern"
                            onClick={(e) => togglePlayersList(e, team.id)}
                          >
                            {expandedTeam === team.id ? (
                              <>
                                <ExpandLessIcon sx={{ mr: 1 }} />
                                Ocultar jogadores
                              </>
                            ) : (
                              <>
                                <ExpandMoreIcon sx={{ mr: 1 }} />
                                Ver jogadores
                              </>
                            )}
                          </button>
                        </div>

                        <AnimatePresence initial={false}>
                          {expandedTeam === team.id && (
                            <motion.div
                              className="team-players-expanded modern"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto', transition: { duration: 0.3 } }}
                              exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
                            >
                              {loadingPlayers[team.id] ? (
                                <div className="team-loading-players">
                                  <div className="loading-spinner-small"></div>
                                  <span>Carregando jogadores...</span>
                                </div>
                              ) : teamPlayers[team.id] && teamPlayers[team.id].length > 0 ? (
                                <div className="team-players-grid modern">
                                  {teamPlayers[team.id].map((player, playerIndex) => (
                                    <motion.div
                                      key={player.id || playerIndex}
                                      className={`team-player-item modern ${team.primaryColor ? 'team-player-item-border' : ''}`}
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{
                                        opacity: 1,
                                        y: 0,
                                        transition: {
                                          delay: Math.min(0.03 * playerIndex, 0.2),
                                          duration: 0.2
                                        }
                                      }}
                                    >
                                      <div className="player-name-position">
                                        <div className="player-name-container">
                                          <PersonIcon className="player-icon" />
                                          <span className="player-name" title={player.nome}>{player.nome}</span>
                                        </div>
                                        <span className="player-position player-position-shrink">
                                          {player.posicao}
                                        </span>
                                      </div>
                                      <div className="player-details">
                                        <span className="player-year">
                                          <CalendarTodayIcon className="player-detail-icon" />
                                          {player.ano}
                                        </span>
                                        <span className="player-gender">
                                          <WcIcon className="player-detail-icon" />
                                          {player.sexo}
                                        </span>
                                      </div>
                                    </motion.div>
                                  ))}
                                </div>
                              ) : (
                                <div className="team-no-players modern">
                                  <SportsSoccerIcon className="team-no-players-icon" />
                                  <p>Nenhum jogador cadastrado neste time</p>
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <TeamStats
                        historico={historico}
                        primaryColor={team.primaryColor}
                        className="team-stats-wrapper-margin modern"
                      />

                      <PlayerStatsTable
                        playerStats={playerStats}
                        primaryColor={team.primaryColor}
                        className="team-stats-wrapper-margin modern"
                      />

                      <TeamActionButtons
                        teamId={team.id}
                        playerStats={playerStats}
                        loadingReport={loadingReport}
                        onGenerateReport={handleGenerateReport}
                        onDownloadPDF={handleDownloadPDF}
                        className="team-action-buttons-margin modern"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      )}

      <DownloadReportModal
        isOpen={showDownloadModal}
        teamName={teams.length > 0 ? teams[0].name : ''}
        onConfirm={handleConfirmDownload}
        onCancel={handleCancelDownload}
        loading={isDownloading}
        playerCount={playerStats?.length || 0}
      />
    </div>
  );
};

export default TeamList;