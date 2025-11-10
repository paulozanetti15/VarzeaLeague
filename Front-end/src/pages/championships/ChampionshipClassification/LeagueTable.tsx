import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { getChampionshipTeams } from '../../../services/championships.service';
import './LeagueTable.css';

const API_BASE = 'http://localhost:3001/api';

interface TeamStanding {
  nomeTime: string;
  pontuacaoTime: number;
  countVitorias: number;
  countDerrotas: number;
  countEmpates: number;
  saldogoals: number;
  goalsScore: number;
  againstgoals: number;
  teamId?: number;
  banner?: string;
}

interface LeagueTableProps {
  championshipId: number;
  championshipName: string;
}

const LeagueTable: React.FC<LeagueTableProps> = ({ championshipId, championshipName }) => {
  const [standings, setStandings] = useState<TeamStanding[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterName, setFilterName] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Buscar ranking e times inscritos em paralelo
      const [rankingResponse, teamsData] = await Promise.all([
        axios.get(`${API_BASE}/teams/${championshipId}/championship-ranking`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: [], status: 200 })),
        getChampionshipTeams(championshipId).catch(() => [])
      ]);

      if (rankingResponse.status === 200 && rankingResponse.data && rankingResponse.data.length > 0) {
        // Criar mapa de times com estatísticas
        const rankingMap = new Map<number, TeamStanding>();
        rankingResponse.data.forEach((team: TeamStanding) => {
          if (team.teamId) {
            rankingMap.set(team.teamId, team);
          }
        });

        // Mesclar times inscritos com ranking
        const mergedStandings: TeamStanding[] = (teamsData || []).map((team: any) => {
          const ranking = rankingMap.get(team.id);
          if (ranking) {
            return {
              ...ranking,
              teamId: team.id,
              banner: team.banner || ranking.banner
            };
          }
          // Time sem jogos ainda
          return {
            nomeTime: team.name,
            pontuacaoTime: 0,
            countVitorias: 0,
            countDerrotas: 0,
            countEmpates: 0,
            saldogoals: 0,
            goalsScore: 0,
            againstgoals: 0,
            teamId: team.id,
            banner: team.banner
          };
        });

        // Ordenar por pontos (desc), saldo de gols (desc), gols marcados (desc)
        const sorted = mergedStandings
          .map((team: TeamStanding) => ({
            ...team,
            gamesPlayed: (team.countVitorias || 0) + (team.countDerrotas || 0) + (team.countEmpates || 0)
          }))
          .sort((a: any, b: any) => {
            if (b.pontuacaoTime !== a.pontuacaoTime) {
              return b.pontuacaoTime - a.pontuacaoTime;
            }
            if (b.saldogoals !== a.saldogoals) {
              return b.saldogoals - a.saldogoals;
            }
            return b.goalsScore - a.goalsScore;
          });
        
        setStandings(sorted);
      } else {
        // Se não há ranking, mostrar apenas times inscritos
        const teamsStandings: TeamStanding[] = (teamsData || []).map((team: any) => ({
          nomeTime: team.name,
          pontuacaoTime: 0,
          countVitorias: 0,
          countDerrotas: 0,
          countEmpates: 0,
          saldogoals: 0,
          goalsScore: 0,
          againstgoals: 0,
          teamId: team.id,
          banner: team.banner
        }));
        setStandings(teamsStandings);
      }
    } catch (error) {
      console.error('Erro ao carregar classificação:', error);
      toast.error('Erro ao carregar classificação');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Atualizar a cada 10 segundos para pegar novos times inscritos
    const interval = setInterval(() => {
      fetchData();
    }, 10000);

    return () => clearInterval(interval);
  }, [championshipId]);

  const filteredStandings = useMemo(() => {
    if (!filterName.trim()) return standings;
    return standings.filter(team =>
      team.nomeTime.toLowerCase().includes(filterName.toLowerCase())
    );
  }, [standings, filterName]);

  const getTeamLogoUrl = (banner?: string | null) => {
    if (!banner) return null;
    if (banner.startsWith('/uploads')) {
      return `http://localhost:3001${banner}`;
    }
    return `http://localhost:3001/uploads/teams/${banner}`;
  };

  const getPositionColor = (position: number) => {
    if (position <= 4) return '#16A34A'; // Verde - zona de classificação
    if (position <= 6) return '#3B82F6'; // Azul - zona intermediária
    if (position >= standings.length - 3 && standings.length > 3) return '#DC2626'; // Vermelho - zona de rebaixamento
    return '#64748B'; // Cinza - zona neutra
  };

  if (loading) {
    return (
      <div className="league-table-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando classificação...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="league-table-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="table-header">
        <div className="header-content">
          <h2 className="table-title">Classificação</h2>
          <p className="table-subtitle">{championshipName}</p>
        </div>
        <div className="filter-container">
          <input
            type="text"
            placeholder="Buscar time..."
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            className="filter-input"
          />
        </div>
      </div>

      <div className="table-wrapper">
        <table className="standings-table">
          <thead>
            <tr>
              <th className="col-position">Pos</th>
              <th className="col-team">Clube</th>
              <th className="col-stat">Pts</th>
              <th className="col-stat">PJ</th>
              <th className="col-stat">VIT</th>
              <th className="col-stat">E</th>
              <th className="col-stat">DER</th>
              <th className="col-stat">GM</th>
              <th className="col-stat">GC</th>
              <th className="col-stat">SG</th>
              <th className="col-form">Últimas 5</th>
            </tr>
          </thead>
          <tbody>
            {filteredStandings.length === 0 ? (
              <tr>
                <td colSpan={11} className="no-data">
                  {standings.length === 0
                    ? 'Nenhum time participando ainda'
                    : 'Nenhum time encontrado com esse nome'}
                </td>
              </tr>
            ) : (
              filteredStandings.map((team, index) => {
                const position = index + 1;
                const gamesPlayed = (team.countVitorias || 0) + (team.countDerrotas || 0) + (team.countEmpates || 0);
                
                return (
                  <motion.tr
                    key={team.teamId || team.nomeTime}
                    className="table-row"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    style={{
                      borderLeft: `4px solid ${getPositionColor(position)}`
                    }}
                  >
                    <td className="col-position">
                      <span className="position-number">{position}º</span>
                    </td>
                    <td className="col-team">
                      <div className="team-cell">
                        {team.banner ? (
                          <img
                            src={getTeamLogoUrl(team.banner) || ''}
                            alt={team.nomeTime}
                            className="team-logo-table"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className="team-logo-placeholder-table"
                          style={{ display: team.banner ? 'none' : 'flex' }}
                        >
                          <span>{team.nomeTime.charAt(0)}</span>
                        </div>
                        <span className="team-name-table">{team.nomeTime}</span>
                      </div>
                    </td>
                    <td className="col-stat">
                      <span className="stat-value points">{team.pontuacaoTime || 0}</span>
                    </td>
                    <td className="col-stat">
                      <span className="stat-value">{gamesPlayed}</span>
                    </td>
                    <td className="col-stat">
                      <span className="stat-value wins">{team.countVitorias || 0}</span>
                    </td>
                    <td className="col-stat">
                      <span className="stat-value draws">{team.countEmpates || 0}</span>
                    </td>
                    <td className="col-stat">
                      <span className="stat-value losses">{team.countDerrotas || 0}</span>
                    </td>
                    <td className="col-stat">
                      <span className="stat-value">{team.goalsScore || 0}</span>
                    </td>
                    <td className="col-stat">
                      <span className="stat-value">{team.againstgoals || 0}</span>
                    </td>
                    <td className="col-stat">
                      <span className={`stat-value ${team.saldogoals > 0 ? 'positive' : team.saldogoals < 0 ? 'negative' : ''}`}>
                        {team.saldogoals > 0 ? '+' : ''}{team.saldogoals || 0}
                      </span>
                    </td>
                    <td className="col-form">
                      <div className="form-indicators">
                        {/* Placeholder para últimas 5 - seria necessário buscar histórico de jogos */}
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} className="form-indicator">-</span>
                        ))}
                      </div>
                    </td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="table-legend">
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#16A34A' }}></span>
          <span>Zona de Classificação</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#3B82F6' }}></span>
          <span>Zona Intermediária</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#DC2626' }}></span>
          <span>Zona de Rebaixamento</span>
        </div>
      </div>
    </motion.div>
  );
};

export default LeagueTable;
