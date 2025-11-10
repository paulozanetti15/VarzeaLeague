import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { getChampionshipMatches, getChampionshipTeams } from '../../../services/championshipsServices';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import './KnockoutBracket.css';

interface KnockoutBracketProps {
  championshipId: number;
  championshipName: string;
}

interface Match {
  id: number;
  teamHome?: { id: number; name: string; banner?: string };
  teamAway?: { id: number; name: string; banner?: string };
  scoreHome?: number;
  scoreAway?: number;
  round: number;
  status?: string;
}

interface BracketRound {
  roundNumber: number;
  roundName: string;
  matches: Match[];
}

const KnockoutBracket: React.FC<KnockoutBracketProps> = ({ championshipId, championshipName }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Função para determinar o nome da rodada baseado no número de times
  const getRoundName = (numTeams: number, roundNumber: number): string => {
    const rounds = [];
    let currentTeams = numTeams;
    let round = 1;
    
    while (currentTeams > 1) {
      if (currentTeams === 2) {
        rounds.push({ round, name: 'Final' });
      } else if (currentTeams === 4) {
        rounds.push({ round, name: 'Semifinal' });
      } else if (currentTeams === 8) {
        rounds.push({ round, name: 'Quartas de Final' });
      } else if (currentTeams === 16) {
        rounds.push({ round, name: 'Oitavas de Final' });
      } else {
        rounds.push({ round, name: `Rodada ${round}` });
      }
      currentTeams = Math.ceil(currentTeams / 2);
      round++;
    }
    
    const roundInfo = rounds.find(r => r.round === roundNumber);
    return roundInfo?.name || `Rodada ${roundNumber}`;
  };

  // Função para gerar chaveamento automático
  const generateBracket = (teamsList: any[], existingMatches: Match[]): BracketRound[] => {
    const numTeams = teamsList.length;
    
    if (numTeams === 0) return [];
    
    // Determinar número de rodadas necessárias
    let rounds: BracketRound[] = [];
    let currentRound = 1;
    let teamsInRound = numTeams;
    
    // Criar mapa de partidas existentes por rodada
    const matchesByRound = new Map<number, Match[]>();
    existingMatches.forEach(match => {
      if (!matchesByRound.has(match.round)) {
        matchesByRound.set(match.round, []);
      }
      matchesByRound.get(match.round)!.push(match);
    });
    
    // Gerar rodadas da primeira até a final
    const roundsList: BracketRound[] = [];
    let roundNum = 1;
    let teamsCount = numTeams;
    
    while (teamsCount > 1) {
      const roundName = getRoundName(numTeams, roundNum);
      const existingRoundMatches = matchesByRound.get(roundNum) || [];
      
      // Se já existem partidas para esta rodada, usar elas
      if (existingRoundMatches.length > 0) {
        roundsList.push({
          roundNumber: roundNum,
          roundName,
          matches: existingRoundMatches
        });
      } else if (roundNum === 1 && teamsList.length > 0) {
        // Gerar partidas automaticamente apenas para a primeira rodada se não houver partidas agendadas
        const matchesInRound: Match[] = [];
        const teamsForRound = [...teamsList];
        
        // Embaralhar times para sorteio
        const shuffled = teamsForRound.sort(() => Math.random() - 0.5);
        
        // Criar confrontos
        for (let i = 0; i < shuffled.length; i += 2) {
          if (i + 1 < shuffled.length) {
            matchesInRound.push({
              id: -roundNum * 1000 - i, // ID temporário negativo
              teamHome: {
                id: shuffled[i].id,
                name: shuffled[i].name,
                banner: shuffled[i].banner
              },
              teamAway: {
                id: shuffled[i + 1].id,
                name: shuffled[i + 1].name,
                banner: shuffled[i + 1].banner
              },
              scoreHome: undefined,
              scoreAway: undefined,
              round: roundNum,
              status: 'agendada'
            });
          } else {
            // Time sem par (bye) - avança direto
            matchesInRound.push({
              id: -roundNum * 1000 - i,
              teamHome: {
                id: shuffled[i].id,
                name: shuffled[i].name,
                banner: shuffled[i].banner
              },
              teamAway: undefined,
              scoreHome: undefined,
              scoreAway: undefined,
              round: roundNum,
              status: 'bye'
            });
          }
        }
        
        roundsList.push({
          roundNumber: roundNum,
          roundName,
          matches: matchesInRound
        });
      }
      // Para rodadas seguintes sem partidas, não adicionar (serão geradas quando houver partidas da rodada anterior)
      
      teamsCount = Math.ceil(teamsCount / 2);
      roundNum++;
    }
    
    return roundsList; // Retornar da primeira rodada até a final
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [matchesData, teamsData] = await Promise.all([
        getChampionshipMatches(championshipId).catch(() => []),
        getChampionshipTeams(championshipId).catch(() => [])
      ]);

      setTeams(teamsData || []);

      // Processar partidas existentes
      const processedMatches: Match[] = (matchesData || []).map((match: any) => {
        const teamsData = match.matchTeams || [];
        const homeTeam = teamsData[0]?.team;
        const awayTeam = teamsData[1]?.team;
        const round = match.matchChampionship?.Rodada || 1;

        return {
          id: match.id,
          teamHome: homeTeam ? { id: homeTeam.id, name: homeTeam.name, banner: homeTeam.banner } : undefined,
          teamAway: awayTeam ? { id: awayTeam.id, name: awayTeam.name, banner: awayTeam.banner } : undefined,
          scoreHome: 0, // Seria necessário buscar do MatchReportChampionship
          scoreAway: 0,
          round,
          status: match.status
        };
      });

      setMatches(processedMatches);
    } catch (error) {
      console.error('Erro ao carregar chaveamento:', error);
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

  const getTeamLogoUrl = (banner?: string | null) => {
    if (!banner) return null;
    if (banner.startsWith('/uploads')) {
      return `http://localhost:3001${banner}`;
    }
    return `http://localhost:3001/uploads/teams/${banner}`;
  };

  // Gerar chaveamento
  const bracketRounds = useMemo(() => {
    return generateBracket(teams, matches);
  }, [teams, matches]);

  if (loading) {
    return (
      <div className="knockout-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando chaveamento...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="knockout-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bracket-header">
        <h2 className="bracket-title">Chaveamento Mata-Mata</h2>
        <p className="bracket-subtitle">{championshipName}</p>
        {teams.length > 0 && (
          <p className="bracket-info">{teams.length} {teams.length === 1 ? 'time inscrito' : 'times inscritos'}</p>
        )}
      </div>

      {teams.length === 0 ? (
        <div className="no-bracket-message">
          <p>Nenhum time inscrito ainda.</p>
          <p className="message-subtitle">Os times aparecerão aqui quando forem inscritos no campeonato.</p>
        </div>
      ) : (
        <div className="bracket-wrapper">
          {bracketRounds
            .filter(round => round.matches.length > 0) // Filtrar rodadas vazias
            .map((round, roundIndex) => (
            <div key={round.roundNumber} className="bracket-round">
              <div className="round-header">
                <h3 className="round-title">{round.roundName}</h3>
              </div>
              <div className="round-matches">
                {round.matches.map((match, matchIndex) => (
                  <motion.div
                    key={match.id}
                    className="bracket-match"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: matchIndex * 0.1 }}
                  >
                    <div className="match-team">
                      <div className="team-info-bracket">
                        {match.teamHome?.banner ? (
                          <img
                            src={getTeamLogoUrl(match.teamHome.banner) || ''}
                            alt={match.teamHome.name}
                            className="team-logo-bracket"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className="team-logo-placeholder-bracket"
                          style={{ display: match.teamHome?.banner ? 'none' : 'flex' }}
                        >
                          <span>{match.teamHome?.name?.charAt(0) || '?'}</span>
                        </div>
                        <span className="team-name-bracket">{match.teamHome?.name || 'TBD'}</span>
                      </div>
                      {match.scoreHome !== undefined && match.scoreHome !== null && (
                        <span className="team-score">{match.scoreHome}</span>
                      )}
                    </div>
                    <div className="match-divider">VS</div>
                    <div className="match-team">
                      <div className="team-info-bracket">
                        {match.teamAway?.banner ? (
                          <img
                            src={getTeamLogoUrl(match.teamAway.banner) || ''}
                            alt={match.teamAway.name}
                            className="team-logo-bracket"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        {match.teamAway ? (
                          <div 
                            className="team-logo-placeholder-bracket"
                            style={{ display: match.teamAway?.banner ? 'none' : 'flex' }}
                          >
                            <span>{match.teamAway.name.charAt(0)}</span>
                          </div>
                        ) : (
                          <div className="team-logo-placeholder-bracket" style={{ display: 'flex' }}>
                            <span>?</span>
                          </div>
                        )}
                        <span className="team-name-bracket">{match.teamAway?.name || 'Aguardando'}</span>
                      </div>
                      {match.scoreAway !== undefined && match.scoreAway !== null && (
                        <span className="team-score">{match.scoreAway}</span>
                      )}
                    </div>
                    {match.status === 'bye' && (
                      <div className="bye-badge">BYE</div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
          {bracketRounds.filter(round => round.matches.length > 0).length === 0 && (
            <div className="no-bracket-message">
              <p>Chaveamento será gerado automaticamente quando houver partidas agendadas.</p>
              <p className="message-subtitle">
                {teams.length === 2 
                  ? 'Com 2 times, será uma Final'
                  : teams.length === 4
                  ? 'Com 4 times, será uma Semifinal'
                  : teams.length === 8
                  ? 'Com 8 times, serão Quartas de Final'
                  : teams.length === 16
                  ? 'Com 16 times, serão Oitavas de Final'
                  : `Com ${teams.length} times, serão ${Math.ceil(Math.log2(teams.length))} rodadas`}
              </p>
            </div>
          )}
        </div>
      )}

      {teams.length > 0 && bracketRounds.filter(round => round.matches.length > 0).length > 0 && (
        <div className="bracket-footer">
          <div className="trophy-icon">
            <EmojiEventsIcon />
          </div>
          <p className="footer-text">
            {teams.length === 2 
              ? 'Final - Campeão será decidido nesta partida'
              : `Campeão será decidido na Final após ${bracketRounds.filter(r => r.matches.length > 0).length} ${bracketRounds.filter(r => r.matches.length > 0).length === 1 ? 'rodada' : 'rodadas'}`}
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default KnockoutBracket;
