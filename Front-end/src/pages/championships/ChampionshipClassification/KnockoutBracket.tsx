import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { getChampionshipMatches, getChampionshipTeams } from '../../../services/championships.service';
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
  matchIndex?: number; // Índice do confronto na rodada
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
      } else if (currentTeams === 32) {
        rounds.push({ round, name: '32ª de Final' });
      } else {
        rounds.push({ round, name: `Rodada ${round}` });
      }
      currentTeams = Math.ceil(currentTeams / 2);
      round++;
    }
    
    const roundInfo = rounds.find(r => r.round === roundNumber);
    return roundInfo?.name || `Rodada ${roundNumber}`;
  };

  // Função para gerar chaveamento completo seguindo regras de torneios mata-mata
  const generateBracket = (teamsList: any[], existingMatches: Match[]): BracketRound[] => {
    const numTeams = teamsList.length;
    
    if (numTeams === 0) return [];
    
    if (numTeams === 1) {
      return [{
        roundNumber: 1,
        roundName: 'Final',
        matches: [{
          id: -1,
          teamHome: {
            id: teamsList[0].id,
            name: teamsList[0].name,
            banner: teamsList[0].banner
          },
          teamAway: undefined,
          round: 1,
          status: 'bye',
          matchIndex: 0
        }]
      }];
    }

    // Criar mapa de partidas existentes por rodada
    const matchesByRound = new Map<number, Map<number, Match>>();
    existingMatches.forEach(match => {
      if (!matchesByRound.has(match.round)) {
        matchesByRound.set(match.round, new Map());
      }
      const matchIndex = match.matchIndex ?? 0;
      matchesByRound.get(match.round)!.set(matchIndex, match);
    });

    // Calcular número de rodadas necessárias baseado no número real de times
    // Para n times, precisamos de ceil(log2(n)) rodadas
    let teamsCount = numTeams;
    let numRounds = 0;
    while (teamsCount > 1) {
      teamsCount = Math.ceil(teamsCount / 2);
      numRounds++;
    }
    
    const roundsList: BracketRound[] = [];
    
    // Embaralhar times para sorteio (simulando sorteio de copa do mundo)
    const shuffledTeams = [...teamsList].sort(() => Math.random() - 0.5);
    
    // Gerar todas as rodadas do chaveamento
    for (let roundNum = 1; roundNum <= numRounds; roundNum++) {
      const roundName = getRoundName(numTeams, roundNum);
      const matchesInRound: Match[] = [];
      
      if (roundNum === 1) {
        // Primeira rodada: distribuir todos os times
        const existingRoundMatches = matchesByRound.get(roundNum);
        
        if (existingRoundMatches && existingRoundMatches.size > 0) {
          // Usar partidas existentes
          existingRoundMatches.forEach((match, index) => {
            matchesInRound.push({ ...match, matchIndex: index });
          });
        } else {
          // Gerar chaveamento automático para primeira rodada
          const teamsForRound = [...shuffledTeams];
          const numMatches = Math.ceil(teamsForRound.length / 2);
          
          for (let i = 0; i < numMatches; i++) {
            const team1Index = i * 2;
            const team2Index = i * 2 + 1;
            
            if (team2Index < teamsForRound.length) {
              // Confronto normal
              matchesInRound.push({
                id: -roundNum * 10000 - i,
                teamHome: {
                  id: teamsForRound[team1Index].id,
                  name: teamsForRound[team1Index].name,
                  banner: teamsForRound[team1Index].banner
                },
                teamAway: {
                  id: teamsForRound[team2Index].id,
                  name: teamsForRound[team2Index].name,
                  banner: teamsForRound[team2Index].banner
                },
                scoreHome: undefined,
                scoreAway: undefined,
                round: roundNum,
                status: 'agendada',
                matchIndex: i
              });
            } else {
              // Time sem par (bye) - avança direto
              matchesInRound.push({
                id: -roundNum * 10000 - i,
                teamHome: {
                  id: teamsForRound[team1Index].id,
                  name: teamsForRound[team1Index].name,
                  banner: teamsForRound[team1Index].banner
                },
                teamAway: undefined,
                scoreHome: undefined,
                scoreAway: undefined,
                round: roundNum,
                status: 'bye',
                matchIndex: i
              });
            }
          }
        }
      } else {
        // Rodadas seguintes: gerar baseado na rodada anterior
        const prevRound = roundsList[roundNum - 2];
        const numMatches = Math.ceil(prevRound.matches.length / 2);
        const existingRoundMatches = matchesByRound.get(roundNum);
        
        if (existingRoundMatches && existingRoundMatches.size > 0) {
          // Usar partidas existentes
          existingRoundMatches.forEach((match, index) => {
            matchesInRound.push({ ...match, matchIndex: index });
          });
        } else {
          // Gerar partidas para próxima rodada (vencedores da rodada anterior)
          for (let i = 0; i < numMatches; i++) {
            matchesInRound.push({
              id: -roundNum * 10000 - i,
              teamHome: undefined,
              teamAway: undefined,
              scoreHome: undefined,
              scoreAway: undefined,
              round: roundNum,
              status: 'agendada',
              matchIndex: i
            });
          }
        }
      }
      
      if (matchesInRound.length > 0) {
        roundsList.push({
          roundNumber: roundNum,
          roundName,
          matches: matchesInRound
        });
      }
    }
    
    return roundsList;
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
      const processedMatches: Match[] = (matchesData || []).map((match: any, index: number) => {
        const teamsData = match.matchTeams || [];
        const homeTeam = teamsData[0]?.team;
        const awayTeam = teamsData[1]?.team;
        const round = match.matchChampionship?.Rodada || 1;

        return {
          id: match.id,
          teamHome: homeTeam ? { id: homeTeam.id, name: homeTeam.name, banner: homeTeam.banner } : undefined,
          teamAway: awayTeam ? { id: awayTeam.id, name: awayTeam.name, banner: awayTeam.banner } : undefined,
          scoreHome: match.matchReportChampionship?.scoreHome ?? undefined,
          scoreAway: match.matchReportChampionship?.scoreAway ?? undefined,
          round,
          status: match.status,
          matchIndex: index
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

  // Gerar chaveamento completo sempre que houver times
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
          <div className="bracket-tree">
            {bracketRounds.map((round) => (
              <div key={round.roundNumber} className="bracket-round">
                <div className="round-header">
                  <h3 className="round-title">{round.roundName}</h3>
                  <span className="round-matches-count">{round.matches.length} {round.matches.length === 1 ? 'confronto' : 'confrontos'}</span>
                </div>
                <div className="round-matches">
                  {round.matches.map((match, matchIndex) => (
                    <motion.div
                      key={`${round.roundNumber}-${match.matchIndex ?? matchIndex}`}
                      className={`bracket-match ${match.status === 'bye' ? 'match-bye' : ''} ${match.scoreHome !== undefined && match.scoreAway !== undefined ? 'match-completed' : ''}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: matchIndex * 0.05 }}
                    >
                      {match.status === 'bye' && (
                        <div className="bye-badge">BYE</div>
                      )}
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
                            <span>{match.teamHome?.name?.charAt(0)?.toUpperCase() || '?'}</span>
                          </div>
                          <span className="team-name-bracket">{match.teamHome?.name || 'Aguardando'}</span>
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
                              <span>{match.teamAway.name.charAt(0).toUpperCase()}</span>
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
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {teams.length > 0 && bracketRounds.length > 0 && (
        <div className="bracket-footer">
          <div className="trophy-icon">
            <EmojiEventsIcon />
          </div>
          <p className="footer-text">
            {bracketRounds.length === 1 && bracketRounds[0].roundName === 'Final'
              ? 'Final - Campeão será decidido nesta partida'
              : `Chaveamento completo com ${bracketRounds.length} ${bracketRounds.length === 1 ? 'rodada' : 'rodadas'}. O campeão será decidido na Final.`}
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default KnockoutBracket;
