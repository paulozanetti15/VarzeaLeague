import React, { useState, useEffect,useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import AddIcon from '@mui/icons-material/Add';
import GroupIcon from '@mui/icons-material/Group';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import EditIcon from '@mui/icons-material/Edit';
import BarChartIcon from '@mui/icons-material/BarChart';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SportsIcon from '@mui/icons-material/Sports';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import WcIcon from '@mui/icons-material/Wc';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { HistoricoContext } from '../../Context/HistoricoContext';
import './TeamList.css';
import { api } from '../../services/api';

// PDF export
// @ts-ignore - tipos serão resolvidos via dependência
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Player {
  id: string;
  nome: string;
  sexo: string;
  ano: string;
  posicao: string;
}

interface Team {
  id: number;
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
  const [expandedTeam, setExpandedTeam] = useState<number | null>(null);
  const [loadingPlayers, setLoadingPlayers] = useState<{ [key: string]: boolean }>({});
  const [teamPlayers, setTeamPlayers] = useState<{ [key: string]: Player[] }>({});
  const [playerStats, setPlayerStats] = useState<any[] | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const navigate = useNavigate();
  const historico = useContext(HistoricoContext);
  
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
  
  const fetchTeamPlayers = async (teamId: string | number) => {
    try {
      const key = String(teamId);
      setLoadingPlayers(prev => ({ ...prev, [key]: true }));
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get(`http://localhost:3001/api/teamplayers/${teamId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTeamPlayers(prev => ({ ...prev, [key]: response.data }));
    } catch (err) {
      console.error(`Erro ao buscar jogadores do time ${teamId}:`, err);
    } finally {
      const key = String(teamId);
      setLoadingPlayers(prev => ({ ...prev, [key]: false }));
    }
  };

  const togglePlayersList = (e: React.MouseEvent, teamId: number) => {
    e.stopPropagation();
    
    // Se estamos expandindo o time e ainda não buscamos os jogadores, busque-os
    const key = String(teamId);
    if (expandedTeam !== teamId && !teamPlayers[key]) {
      fetchTeamPlayers(key);
    }

    setExpandedTeam(expandedTeam === teamId ? null : Number(teamId));
  };
   useEffect(()=>{
    teams.slice(0, 1).map((team)=>{
      historico?.fetchHistorico(Number(team.id))
    }) 
  },[teams])
  const hasTeam = teams.length > 0;

  const handleGenerateReport = async () => {
    try {
      if (!hasTeam) return;
      setLoadingReport(true);
      const teamId = teams[0].id;
      const data = await api.teams.getPlayerStats(teamId);
      setPlayerStats(data?.stats || []);
    } catch (e) {
      console.error('Erro ao gerar relatório de jogadores:', e);
    } finally {
      setLoadingReport(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!playerStats || !hasTeam) return;
    const teamName = teams[0].name;
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const margin = 40;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text(`Relatório de Jogadores - ${teamName}`, margin, 50);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    const dateStr = new Date().toLocaleString();
    doc.text(`Gerado em: ${dateStr}`, margin, 70);
    // Linha divisória sutil
    doc.setDrawColor(200);
    doc.line(margin, 78, 555, 78);

    const headers = [['Jogador', 'Posição', 'Sexo', 'Gols', 'Amarelos', 'Vermelhos', 'Cartões']];
    const body = playerStats.map((p: any) => [
      p.nome || '-', p.posicao || '-', p.sexo || '-', String(p.gols || 0), String(p.amarelos || 0), String(p.vermelhos || 0), String(p.cartoes || 0)
    ]);

    autoTable(doc, {
      head: headers,
      body,
      startY: 90,
      theme: 'striped',
      styles: { fontSize: 10, cellPadding: 6, halign: 'center' },
      headStyles: { fillColor: [25, 118, 210], textColor: 255, halign: 'center' },
      columnStyles: {
        0: { cellWidth: 180 },
        1: { halign: 'center' },
        2: { halign: 'center' },
        3: { halign: 'center' },
        4: { halign: 'center' },
        5: { halign: 'center' },
        6: { halign: 'center' },
      }
    });
    const filename = `relatorio-jogadores-${teamName.replace(/\s+/g, '-').toLowerCase()}.pdf`;
    try {
      doc.save(filename);
    } catch (err) {
      // Fallback manual
      try {
        const blob = doc.output('blob');
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (e) {
        console.error('Falha ao iniciar download do PDF:', e);
      }
    }
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
              {teams.slice(0, 1).map((team) => (
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
                    
                    <AnimatePresence>
                      {expandedTeam === team.id && (
                        <motion.div 
                          className="team-players-expanded"
                          initial={{ opacity: 0, height: 0, overflow: "hidden" }}
                          animate={{ opacity: 1, height: "auto", transition: { duration: 0.3 } }}
                          exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
                        >
                          <h3 className="team-section-title">
                            <SportsSoccerIcon style={{ marginRight: '8px', color: team.primaryColor || '#2196F3' }} />
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
                                  className="team-player-item"
                                  style={{
                                    borderLeft: `4px solid ${team.primaryColor || '#2196F3'}`
                                  }}
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
                                      <PersonIcon style={{ fontSize: '1.2rem', marginRight: '6px', color: team.primaryColor || '#2196F3', flexShrink: 0 }} />
                                      <span className="player-name" title={player.nome}>{player.nome}</span>
                                    </div>
                                    <span 
                                      className="player-position"
                                      style={{
                                        backgroundColor: `${team.primaryColor || '#2196F3'}20`,
                                        color: team.primaryColor || '#64b5f6',
                                        flexShrink: 0
                                      }}
                                    >
                                      {player.posicao}
                                    </span>
                                  </div>
                                  <div className="player-details">
                                    <span className="player-year">
                                      <CalendarTodayIcon style={{ fontSize: '0.9rem', marginRight: '4px', flexShrink: 0 }} />
                                      {player.ano}
                                    </span>
                                    <span className="player-gender">
                                      <WcIcon style={{ fontSize: '0.9rem', marginRight: '4px', flexShrink: 0 }} />
                                      {player.sexo}
                                    </span>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          ) : (
                            <div className="team-no-players">
                              <SportsSoccerIcon style={{ fontSize: '2rem', opacity: 0.3, marginBottom: '8px' }} />
                              <p>Nenhum jogador cadastrado neste time</p>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="team-stats-wrapper">
                      <h3 className="team-section-title" style={{ marginTop: '1.4rem' }}>
                        <BarChartIcon style={{ marginRight: 8, color: team.primaryColor || '#29b6f6' }} />
                        Estatísticas do Time 
                      </h3>
                      <div className="team-stats-grid"onClick={()=>window.location.href="/historico"}>
                        <div className="team-stat-card" title="Partidas disputadas">
                          <SportsIcon className="stat-icon" />
                          <div className="stat-value">{historico?.amistosos}</div>
                          <div className="stat-label">Amistosos participados</div>
                        </div>
                        <div className="team-stat-card" onClick={()=>window.location.href="/historico"} title="Campeonatos inscritos">
                          <MilitaryTechIcon className="stat-icon" />
                          <div className="stat-value">{historico?.campeonatos}</div>
                          <div className="stat-label">Campeonatos Participados</div>
                        </div>
                        <div className="team-stat-card" title="Vitórias" onClick={()=>window.location.href="/historico"}>
                          <TrendingUpIcon className="stat-icon" />
                          <div className="stat-value" style={{ color: '#4caf50' }}>{historico?.vitoriasGeral}</div>
                          <div className="stat-label">Vitórias</div>
                        </div>
                        <div className="team-stat-card" onClick={()=>window.location.href="/historico"} title="Derrotas">
                          <WhatshotIcon className="stat-icon" />
                          <div className="stat-value" style={{ color: '#ef5350' }}>{historico?.derrotasGeral}</div>
                          <div className="stat-label">Derrotas</div>
                        </div>
                        <div className="team-stat-card" onClick={()=>window.location.href="/historico"} title="Derrotas">
                          <WhatshotIcon className="stat-icon" />
                          <div className="stat-value" style={{ color: '#f0eaea65' }}>{historico?.empatesGeral}</div>
                          <div className="stat-label">Empates</div>
                        </div>
                        <div className="team-stat-card wide" onClick={()=>window.location.href="/historico"} title="% de aproveitamento (vitórias/partidas)">
                          <TrendingUpIcon className="stat-icon" />
                          <div className="stat-value">{historico?.aproveitamentoCampeonatos}%</div>
                          <div className="stat-label">Aproveitamento em Campeonatos</div>
                        </div>
                        <div className="team-stat-card wide" onClick={()=>window.location.href="/historico"} title="% de aproveitamento (vitórias/partidas)">
                          <TrendingUpIcon className="stat-icon" />
                          <div className="stat-value">{historico?.aproveitamentoAmistosos}%</div>
                          <div className="stat-label">Desempenho em amistosos</div>
                        </div>
                      </div>
                    </div>
    
                    {playerStats && (
                      <div className="team-stats-wrapper" style={{ marginTop: '1.4rem' }}>
                        <h3 className="team-section-title" style={{ borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
                          <BarChartIcon style={{ marginRight: 8, color: team.primaryColor || '#29b6f6' }} />
                          Estatísticas por Jogador
                        </h3>
                        {playerStats.length === 0 ? (
                          <div className="team-no-players">
                            <p>Nenhuma estatística encontrada para os jogadores deste time.</p>
                          </div>
                        ) : (
                          <div style={{ overflowX: 'auto' }}>
                            <table className="team-stats-table">
                              <thead>
                                <tr>
                                  <th style={{ textAlign: 'left' }}>Jogador</th>
                                  <th>Posição</th>
                                  <th>Sexo</th>
                                  <th>Gols</th>
                                  <th>Amarelos</th>
                                  <th>Vermelhos</th>
                                  <th>Cartões</th>
                                </tr>
                              </thead>
                              <tbody>
                                {playerStats.map((p: any, idx: number) => (
                                  <tr key={`${p.playerId}-${idx}`}>
                                    <td style={{ textAlign: 'left' }}>{p.nome}</td>
                                    <td>{p.posicao || '-'}</td>
                                    <td>{p.sexo || '-'}</td>
                                    <td>{p.gols}</td>
                                    <td>{p.amarelos}</td>
                                    <td>{p.vermelhos}</td>
                                    <td>{p.cartoes}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="team-bottom-actions">
                      <button
                        className="edit-team-btn"
                        onClick={() => navigate(`/teams/edit/${team.id}`)}
                      >
                        <EditIcon sx={{ mr: 1 }} />
                        Editar meu time
                      </button>
                      <button
                        className="edit-team-btn"
                        onClick={handleGenerateReport}
                        disabled={loadingReport}
                      >
                        <BarChartIcon sx={{ mr: 1 }} />
                        {loadingReport ? 'Gerando…' : 'Gerar relatório de jogadores'}
                      </button>
                      {playerStats && playerStats.length > 0 && (
                        <button
                          className="edit-team-btn"
                          onClick={handleDownloadPDF}
                        >
                          <TrendingUpIcon sx={{ mr: 1 }} />
                          Baixar PDF
                        </button>
                      )}
                    </div>
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