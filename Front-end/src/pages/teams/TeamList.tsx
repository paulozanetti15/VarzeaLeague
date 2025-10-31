import React, { useState, useEffect, useContext } from 'react';
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

import { HistoricoContext } from '../../Context/HistoricoContext';
import useTeams from '../../hooks/useTeams';
import { usePDFGenerator } from '../../hooks/usePDFGenerator';

import type { PlayerStats } from '../../interfaces/team';

import TeamStats from '../../components/features/Teams/TeamStats';
import PlayerStatsTable from '../../components/features/Teams/PlayerStatsTable';
import TeamActionButtons from '../../components/features/Teams/TeamActionButtons';

import './TeamList.css';

const TeamList = () => {
  const { teams, loading, error, teamPlayers, loadingPlayers, fetchTeams, fetchTeamPlayers, fetchTeamPlayerStats } = useTeams();
  const [expandedTeam, setExpandedTeam] = useState<number | null>(null);
  const [playerStats, setPlayerStats] = useState<PlayerStats[] | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const navigate = useNavigate();
  const historico = useContext(HistoricoContext);
  const { generatePlayerStatsPDF } = usePDFGenerator();

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
      alert('Relatório de jogadores gerado com sucesso!');
    } catch (e) {
      console.error('Erro ao gerar relatório de jogadores:', e);
    } finally {
      setLoadingReport(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!playerStats || !hasTeam) return;

    const teamName = teams[0].name;
    generatePlayerStatsPDF(playerStats, teamName);
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
              {teams.slice(0, 1).map((team) => (
                <div
                  key={team.id}
                  className="team-card team-detail-card"
                >
                  <div className={`team-banner ${team.primaryColor && team.secondaryColor ? 'team-banner-gradient' : ''}`}>
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

                    <div className="team-location-colors">
                      {(team.estado || team.cidade) && (
                        <span className="location-badge">
                          {team.estado && <>{team.estado}{team.cidade ? ' - ' : ''}</>}{team.cidade}
                          {(team.primaryColor || team.secondaryColor) && (
                            <span className="colors-container-inline">
                              {team.primaryColor && (
                                <span
                                  title="Cor Primária"
                                  className="color-indicator-inline"
                                  style={{ backgroundColor: team.primaryColor }}
                                />
                              )}
                              {team.secondaryColor && (
                                <span
                                  title="Cor Secundária"
                                  className="color-indicator-inline"
                                  style={{ backgroundColor: team.secondaryColor }}
                                />
                              )}
                            </span>
                          )}
                        </span>
                      )}
                      {!(team.estado || team.cidade) && (team.primaryColor || team.secondaryColor) && (
                        <span className="colors-container">
                          {team.primaryColor && (
                            <span
                              title="Cor Primária"
                              className="color-indicator"
                              style={{ backgroundColor: team.primaryColor }}
                            />
                          )}
                          {team.secondaryColor && (
                            <span
                              title="Cor Secundária"
                              className="color-indicator"
                              style={{ backgroundColor: team.secondaryColor }}
                            />
                          )}
                        </span>
                      )}
                    </div>

                    <p className="team-description-inline">
                      {team.description || "Sem descrição disponível"}
                    </p>
                    <div className="team-stats-inline">
                      <div className="stat-inline">
                        <GroupIcon className="stat-icon" sx={{ fontSize: 22 }} />
                        <span className="stat-text">{team.players?.length || 0} Jogadores</span>
                      </div>
                      <div className="stat-inline-alt">
                        <EmojiEventsIcon className="stat-icon" sx={{ fontSize: 22 }} />
                        <span className="stat-text">{team.matchCount || 0} Partidas</span>
                      </div>
                    </div>
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

                    <AnimatePresence>
                      {expandedTeam === team.id && (
                        <motion.div
                          className="team-players-expanded"
                          initial={{ opacity: 0, height: 0, overflow: "hidden" }}
                          animate={{ opacity: 1, height: "auto", transition: { duration: 0.3 } }}
                          exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
                        >
                          <h3 className="team-section-title">
                            <SportsSoccerIcon className="team-section-title-icon" />
                            Jogadores do Time
                          </h3>
                          {loadingPlayers[team.id] ? (
                            <div className="team-loading-players">
                              <div className="loading-spinner-small"></div>
                              <span>Carregando jogadores...</span>
                            </div>
                          ) : teamPlayers[team.id] && teamPlayers[team.id].length > 0 ? (
                            <div className="team-players-grid">
                              {teamPlayers[team.id].map((player, playerIndex) => (
                                <motion.div
                                  key={player.id || playerIndex}
                                  className={`team-player-item ${team.primaryColor ? 'team-player-item-border' : ''}`}
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
                                    <div className="player-icon-name-row">
                                      <PersonIcon className="player-icon" />
                                      <span className="player-name" title={player.nome}>{player.nome}</span>
                                    </div>
                                    <div className="player-info-below">
                                      <span className="player-position player-position-shrink">
                                        {player.posicao}
                                      </span>
                                      <span className="player-year">
                                        <CalendarTodayIcon className="player-detail-icon" />
                                        {player.ano}
                                      </span>
                                      <span className="player-gender">
                                        <WcIcon className="player-detail-icon" />
                                        {player.sexo}
                                      </span>
                                    </div>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          ) : (
                            <div className="team-no-players">
                              <SportsSoccerIcon className="team-no-players-icon" />
                              <p>Nenhum jogador cadastrado neste time</p>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <TeamStats
                      historico={historico}
                      primaryColor={team.primaryColor}
                    />
                    <PlayerStatsTable
                      playerStats={playerStats}
                      primaryColor={team.primaryColor}
                      className="team-stats-wrapper-margin"
                    />

                    <TeamActionButtons
                      teamId={team.id}
                      playerStats={playerStats}
                      loadingReport={loadingReport}
                      onGenerateReport={handleGenerateReport}
                      onDownloadPDF={handleDownloadPDF}
                      className="team-action-buttons-margin"
                    />
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