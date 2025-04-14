import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { toast } from 'react-hot-toast';
import './MatchDetail.css';
import { Person, Event, AccessTime, LocationOn, Warning, CheckCircle, Group, Directions, ArrowBack as ArrowBackIcon } from '@mui/icons-material';

interface Match {
  id: number;
  title: string;
  date: string;
  location: string;
  maxPlayers: number;
  description: string;
  price: number | null;
  status: string;
  organizerId: number;
  organizer: {
    id: number;
    name: string;
    email: string;
  };
  players: Array<{
    id: number;
    name: string;
    email: string;
    isTeam?: boolean;
    teamId?: number;
    playerCount?: number;
  }>;
  teams?: Array<{
    id: number;
    name: string;
    players: Array<{
      id: number;
      name: string;
      email: string;
    }>;
    captainId?: number;
  }>;
}

const MatchDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [match, setMatch] = useState<Match>({} as Match);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [showTeamOptions, setShowTeamOptions] = useState(false);
  const [userTeams, setUserTeams] = useState<any[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [totalPlayersCount, setTotalPlayersCount] = useState(0);

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchMatchDetails();
  }, [id]);

  const fetchMatchDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.matches.getById(Number(id));
      setMatch(response);
      
      // Calcular o total de jogadores
      if (response.players) {
        const totalPlayers = calculateTotalPlayers();
        setTotalPlayersCount(totalPlayers);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar detalhes da partida:', error);
      setError('Não foi possível carregar os detalhes da partida. Por favor, tente novamente mais tarde.');
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isUserInMatch = () => {
    if (!match.players || !Array.isArray(match.players) || !currentUser.id) return false;
    return match.players.some(player => player.id === currentUser.id);
  };

  const handleJoinMatch = async () => {
    try {
      setJoining(true);
      
      const response = await api.matches.join(Number(id));
      
      if (response) {
        toast.success('Você entrou na partida com sucesso!');
        fetchMatchDetails(); // Atualizar a lista de jogadores
      }
    } catch (error: any) {
      console.error('Erro ao entrar na partida:', error);
      
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Não foi possível entrar na partida. Por favor, tente novamente.');
      }
    } finally {
      setJoining(false);
    }
  };

  const handleShowTeamOptions = async () => {
    try {
      // Buscar os times do usuário
      const response = await api.teams.list();
      const teams = response.filter((team: any) => team.isCurrentUserCaptain);
      setUserTeams(teams);
      setShowTeamOptions(true);
    } catch (error) {
      console.error('Erro ao buscar times do usuário:', error);
      toast.error('Não foi possível carregar seus times. Por favor, tente novamente.');
    }
  };

  const handleTeamSelection = (teamId: number) => {
    setSelectedTeamId(teamId);
  };

  const handleJoinAsTeam = async () => {
    if (!selectedTeamId) {
      toast.error('Por favor, selecione um time para participar.');
      return;
    }
    
    try {
      setJoining(true);
      
      const response = await api.matches.joinWithTeam(Number(id), selectedTeamId);
      
      if (response) {
        toast.success('Seu time foi adicionado à partida com sucesso!');
        setShowTeamOptions(false);
        fetchMatchDetails(); // Atualizar a lista de jogadores
      }
    } catch (error: any) {
      console.error('Erro ao adicionar time à partida:', error);
      
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Não foi possível adicionar seu time à partida. Por favor, tente novamente.');
      }
    } finally {
      setJoining(false);
    }
  };

  const calculateTotalPlayers = () => {
    if (!match.players || !Array.isArray(match.players)) {
      return 0;
    }
    
    let total = 0;
    
    for (const player of match.players) {
      if (player.isTeam && player.teamId) {
        // Se for um time, verificar o número de jogadores desse time
        if (match.teams && Array.isArray(match.teams)) {
          const team = match.teams.find(t => t.id === player.teamId);
          if (team && team.players && Array.isArray(team.players)) {
            total += team.players.length;
          } else if (player.playerCount) {
            total += player.playerCount;
          } else {
            total += 1; // Se não sabemos quantos, consideramos 1
          }
        } else if (player.playerCount) {
          total += player.playerCount;
        } else {
          total += 1; // Se não sabemos quantos, consideramos 1
        }
      } else {
        // Jogador individual
        total += 1;
      }
    }
    
    return total;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Carregando detalhes da partida...</p>
      </div>
    );
  }

  return (
    <div className="match-detail-container">
      <button className="back-button" onClick={() => navigate('/matches')}>
        <ArrowBackIcon />
      </button>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <div className="match-detail-content">
        <h1 className="match-title">{match.title}</h1>
        
        <div className="match-info-panel">
          <div className="match-info-section">
            <div className="info-item">
              <Event className="info-icon" />
              <div className="info-content">
                <h3>Data</h3>
                <p>{match.date ? formatDate(match.date) : 'Data não informada'}</p>
              </div>
            </div>
            
            <div className="info-item">
              <AccessTime className="info-icon" />
              <div className="info-content">
                <h3>Horário</h3>
                <p>{match.date ? formatTime(match.date) : 'Horário não informado'}</p>
              </div>
            </div>
            
            <div className="info-item">
              <LocationOn className="info-icon" />
              <div className="info-content">
                <h3>Local</h3>
                <p>{match.location || 'Local não informado'}</p>
                {match.location && (
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(match.location)}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="directions-link"
                  >
                    <Directions fontSize="small" /> Ver no mapa
                  </a>
                )}
              </div>
            </div>
          </div>
          
          <div className="match-info-section">
            <div className="info-item">
              <Group className="info-icon" />
              <div className="info-content">
                <h3>Jogadores</h3>
                <p>{totalPlayersCount} / {match.maxPlayers}</p>
                <div className="capacity-indicator">
                  <div 
                    className="capacity-bar" 
                    style={{ 
                      width: `${Math.min(100, (totalPlayersCount / match.maxPlayers) * 100)}%`,
                      backgroundColor: totalPlayersCount >= match.maxPlayers ? '#ff4c4c' : '#2e7d32'
                    }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="info-item">
              <Person className="info-icon" />
              <div className="info-content">
                <h3>Organizador</h3>
                <p>{match.organizer ? match.organizer.name : 'Organizador não informado'}</p>
              </div>
            </div>
            
            {match.price !== null && match.price !== undefined && (
              <div className="info-item">
                <div className="info-icon price-icon">R$</div>
                <div className="info-content">
                  <h3>Preço</h3>
                  <p>{match.price !== null && match.price !== undefined && Number(match.price) > 0 
                      ? `R$ ${Number(match.price).toFixed(2)}` 
                      : 'Gratuito'}</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {match.description && (
          <div className="match-description">
            <h2>Descrição</h2>
            <p>{match.description}</p>
          </div>
        )}
        
        {/* Seção de participar / sair da partida */}
        <div className="match-participation">
          {isUserInMatch() ? (
            <div className="already-joined">
              <CheckCircle className="joined-icon" />
              <p>Você já está participando desta partida!</p>
              <button 
                className="leave-button"
                onClick={async () => {
                  try {
                    const response = await api.matches.leave(Number(id));
                    toast.success('Você saiu da partida com sucesso!');
                    fetchMatchDetails();
                  } catch (error) {
                    console.error('Erro ao sair da partida:', error);
                    toast.error('Não foi possível sair da partida. Por favor, tente novamente.');
                  }
                }}
              >
                Sair da partida
              </button>
            </div>
          ) : totalPlayersCount >= match.maxPlayers ? (
            <div className="match-full">
              <Warning className="full-icon" />
              <p>Esta partida já está completa!</p>
            </div>
          ) : showTeamOptions ? (
            <div className="team-selection">
              <h3>Selecione um time para participar</h3>
              {userTeams.length > 0 ? (
                <>
                  <div className="teams-list">
                    {userTeams.map((team) => (
                      <div 
                        key={team.id} 
                        className={`team-option ${selectedTeamId === team.id ? 'selected' : ''}`}
                        onClick={() => handleTeamSelection(team.id)}
                      >
                        <div className="team-option-content">
                          <h4>{team.name}</h4>
                          <p>{team.players ? team.players.length : 0} jogadores</p>
                        </div>
                        {selectedTeamId === team.id && (
                          <div className="team-selected-indicator">
                            <CheckCircle />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="team-action-buttons">
                    <button 
                      className="join-team-button"
                      onClick={handleJoinAsTeam}
                      disabled={!selectedTeamId || joining}
                    >
                      {joining ? 'Adicionando...' : 'Adicionar time à partida'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="no-teams">
                  <p>Você não tem times para participar desta partida.</p>
                  <button 
                    className="create-team-btn" 
                    onClick={() => navigate('/teams/create')}
                  >
                    Criar um Time
                  </button>
                </div>
              )}
              <button 
                className="cancel-button" 
                onClick={() => setShowTeamOptions(false)}
              >
                Cancelar
              </button>
            </div>
          ) : (
            <div className="join-options">
              <button 
                className="join-button" 
                onClick={handleJoinMatch}
                disabled={joining || loading || totalPlayersCount >= match.maxPlayers}
              >
                {joining ? 'Entrando...' : 'Entrar como Jogador'}
              </button>
              
              <button 
                className="join-team-button"
                onClick={handleShowTeamOptions}
                disabled={joining || loading || totalPlayersCount >= match.maxPlayers}
              >
                Entrar com um Time
              </button>
            </div>
          )}
        </div>
        
        {/* Lista de jogadores */}
        <div className="players-list-section">
          <h2>Jogadores Participantes ({totalPlayersCount}/{match.maxPlayers})</h2>
          
          {match.players && match.players.length > 0 ? (
            <div className="players-grid">
              {match.players.map((player) => (
                <div key={player.id} className={`player-card ${player.isTeam ? 'team-card' : ''}`}>
                  <div className="player-card-content">
                    <h3>{player.name}</h3>
                    {player.isTeam && player.playerCount && (
                      <div className="team-player-count">
                        <Group fontSize="small" />
                        <span>{player.playerCount} jogadores</span>
                      </div>
                    )}
                    {player.id === currentUser.id && (
                      <div className="current-user-badge">Você</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-players">
              <p>Nenhum jogador participando ainda.</p>
              <p>Seja o primeiro a entrar!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchDetail;
