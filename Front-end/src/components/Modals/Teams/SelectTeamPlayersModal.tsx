import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Modal, Button, Spinner } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { useAuth } from '../../../hooks/useAuth';
import './SelectTeamPlayersModal.css';

interface SelectTeamPlayersModalProps {
  show: boolean;
  onHide: () => void;
  matchId: number;
  onSuccess?: () => void;
}

interface Team {
  id: number;
  name: string;
  captainId: number;
  banner?: string;
}

interface Player {
  id: number;
  nome: string;
  sexo: string;
  ano: string; // ano de nascimento
  posicao: string;
}

interface Rules {
  dataLimite: string;
  idadeMinima: number;
  idadeMaxima: number;
  genero: string; // Masculino | Feminino | Ambos
}

const SelectTeamPlayersModal: React.FC<SelectTeamPlayersModalProps> = ({ show, onHide, matchId, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [teamsLoading, setTeamsLoading] = useState(false);
  const [playersLoading, setPlayersLoading] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([]);
  const [rules, setRules] = useState<Rules | null>(null);
  const [error, setError] = useState<string>('');
  const [modalidade, setModalidade] = useState<string | null>(null);

  const token = useMemo(() => localStorage.getItem('token'), []);

  const fetchRules = async () => {
    try {
      const resp = await axios.get(`http://localhost:3001/api/rules/${matchId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRules(resp.data);
    } catch {
      // Se não existem regras, deixa null
      console.warn('[SelectTeamPlayersModal] Nenhuma regra encontrada para partida', matchId);
      setRules(null);
    }
  };

  const fetchMatch = async () => {
    try {
      const resp = await axios.get(`http://localhost:3001/api/matches/${matchId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const mod = resp?.data?.modalidade as string | undefined;
      setModalidade(mod || null);
    } catch (e) {
      console.warn('[SelectTeamPlayersModal] Não foi possível obter a modalidade da partida', e);
      setModalidade(null);
    }
  };

  const fetchAvailableTeams = async () => {
    // Não retornar cedo se user ainda não carregou; o backend identifica pelo token
    console.debug('[SelectTeamPlayersModal] fetchAvailableTeams start', { matchId, hasUser: !!user });
    setTeamsLoading(true);
    try {
      const [myTeamsResp, registeredResp, availableResp] = await Promise.all([
        axios.get(`http://localhost:3001/api/teams`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`http://localhost:3001/api/matches/${matchId}/join-team`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`http://localhost:3001/api/matches/${matchId}/available`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const myTeams: Team[] = myTeamsResp.data || [];
      const alreadyRegistered: Team[] = registeredResp.data || [];
      const available: Team[] = availableResp.data || [];
      const registeredIds = new Set(alreadyRegistered.map(t => t.id));
      const availableIds = new Set(available.map(t => t.id));

      // Exibir TODOS os meus times, desativando os que já estão inscritos ou não retornaram em available
      const decorated = myTeams.map(t => ({
        ...t,
        __disabled: registeredIds.has(t.id),
        __notInAvailable: !availableIds.has(t.id) // para debug se necessário
      }));

      if (decorated.length === 0) {
        console.info('[SelectTeamPlayersModal] Usuário não possui times.');
      }
      setTeams(decorated as any);
    } catch (e: any) {
      console.error('[SelectTeamPlayersModal] Erro carregando times:', e);
      setError(e.response?.data?.message || 'Erro ao carregar times');
    } finally {
      setTeamsLoading(false);
    }
  };

  const fetchPlayers = async (teamId: number) => {
    setPlayersLoading(true);
    setPlayers([]);
    setSelectedPlayers([]);
    try {
      const resp = await axios.get(`http://localhost:3001/api/players/team/${teamId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPlayers(resp.data);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Erro ao carregar jogadores');
    } finally {
      setPlayersLoading(false);
    }
  };

  useEffect(() => {
    if (show) {
      console.debug('[SelectTeamPlayersModal] Modal aberto, iniciando carregamentos');
      setError('');
      setSelectedTeamId(null);
      setPlayers([]);
      setSelectedPlayers([]);
      fetchRules();
      fetchMatch();
      fetchAvailableTeams();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, user]);

  const playerMatchesRules = (player: Player): boolean => {
    if (!rules) return true; // sem regras, todos
    const currentYear = new Date().getFullYear();
    const age = currentYear - parseInt(player.ano, 10);
    if (isNaN(age)) return false;
    if (age < rules.idadeMinima || age > rules.idadeMaxima) return false;
    if (rules.genero !== 'Ambos' && player.sexo !== rules.genero) return false;
    return true;
  };

  const eligiblePlayers = useMemo(() => players.filter(playerMatchesRules), [players, rules]);
  const hasEligiblePlayers = eligiblePlayers.length > 0;

  // Modalidade: requisitos mínimos de seleção
  const normalize = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const isGoalkeeper = (p: Player) => {
    const pos = normalize(p.posicao || '');
    return pos === 'goleiro' || pos === 'gk' || pos === 'goalkeeper' || pos.includes('goleir');
  };

  const requirements = useMemo(() => {
    const mod = modalidade ? normalize(modalidade) : '';
    if (mod === 'futsal') return { gk: 1, line: 4 };
    if (mod === 'fut7' || mod === 'fut 7' || mod === 'society' || mod === 'futebol7') return { gk: 1, line: 6 };
    if (mod === 'futebol campo' || mod === 'futeboldecampo' || mod === 'campo') return { gk: 1, line: 10 };
    // padrão conservador: exigir ao menos 1 goleiro e 4 de linha
    return { gk: 1, line: 4 };
  }, [modalidade]);

  const selectedCounts = useMemo(() => {
    let gk = 0, line = 0;
    const map = new Map(players.map(p => [p.id, p] as [number, Player]));
    selectedPlayers.forEach(id => {
      const p = map.get(id);
      if (!p) return;
      if (!playerMatchesRules(p)) return; // garantir só contar elegíveis
      if (isGoalkeeper(p)) gk += 1; else line += 1;
    });
    return { gk, line };
  }, [selectedPlayers, players, rules]);

  const compositionMet = selectedCounts.gk >= requirements.gk && selectedCounts.line >= requirements.line;

  const toggleSelectPlayer = (id: number) => {
    setSelectedPlayers(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const handleConfirm = async () => {
    if (!selectedTeamId) {
      setError('Selecione um time.');
      return;
    }
    if (!hasEligiblePlayers) {
      setError('Nenhum jogador do time atende às regras.');
      return;
    }
    if (selectedPlayers.length === 0) {
      setError('Selecione ao menos um jogador elegível.');
      return;
    }
    if (!compositionMet) {
      setError(`Seleção insuficiente para a modalidade${modalidade ? ` ${modalidade}` : ''}. Necessário: ${requirements.gk} goleiro(s) e ${requirements.line} jogador(es) de linha. Selecionado: ${selectedCounts.gk} GKs e ${selectedCounts.line} linha.`);
      return;
    }
    try {
      setLoading(true);
      const resp = await axios.post(`http://localhost:3001/api/matches/${matchId}/join-team`, {
        teamId: selectedTeamId,
        matchId
      }, { headers: { Authorization: `Bearer ${token}` }});
      if (resp.status === 201 || resp.status === 200) {
        toast.success('Time vinculado à partida!');
        onHide();
        onSuccess && onSuccess();
        setTimeout(() => window.location.reload(), 1200);
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Erro ao vincular time');
    } finally {
      setLoading(false);
    }
  };

  const selectedTeam = teams.find(t => t.id === selectedTeamId);

  return (
    <Modal
      show={show}
      onHide={() => !loading && onHide()}
      centered
      backdrop="static"
      keyboard={!loading}
      className="select-team-players-modal"
    >
      <Modal.Header closeButton={!loading}>
        <Modal.Title>Vincular meu time à partida</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <div className="stm-alert-error">{error}</div>}
        <div className="stm-section">
          <h5 className="stm-section-title">1. Selecione o Time</h5>
          {teamsLoading ? (
            <div className="stm-loading"><Spinner animation="border" size="sm" /> Carregando times...</div>
          ) : teams.length === 0 ? (
            <div className="stm-empty">Você não tem times disponíveis para esta partida.</div>
          ) : (
            <div className="stm-team-list">
              {teams.map(team => {
                const disabled = (team as any).__disabled;
                const rawBanner = team.banner || '';
                const bannerUrl = rawBanner.startsWith('/uploads')
                  ? `http://localhost:3001${rawBanner}`
                  : rawBanner
                    ? `http://localhost:3001/uploads/teams/${rawBanner}`
                    : null;
                return (
                  <button
                    key={team.id}
                    type="button"
                    className={`stm-team-card ${selectedTeamId === team.id ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
                    onClick={() => {
                      if (disabled) return;
                      setSelectedTeamId(team.id);
                      fetchPlayers(team.id);
                    }}
                    disabled={disabled || (playersLoading && selectedTeamId === team.id)}
                    title={disabled ? 'Time já inscrito nesta partida' : ''}
                  >
                    {bannerUrl && <img src={bannerUrl} alt={team.name} className="stm-team-banner" />}
                    <span>{team.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="stm-section">
          <h5 className="stm-section-title">2. Jogadores do Time {rules && <small>(Regras: {rules.genero} {rules.idadeMinima}-{rules.idadeMaxima} anos)</small>}</h5>
          {modalidade && (
            <div className="stm-hint" style={{ marginBottom: 8 }}>
              Modalidade: <strong>{modalidade}</strong> • Necessário selecionar no mínimo: <strong>{requirements.gk} goleiro(s)</strong> e <strong>{requirements.line} jogador(es) de linha</strong>.
              <div style={{ marginTop: 4 }}>Selecionado: {selectedCounts.gk} goleiro(s) • {selectedCounts.line} jogador(es) de linha.</div>
            </div>
          )}
          {selectedTeam && (
            playersLoading ? (
              <div className="stm-loading"><Spinner animation="border" size="sm" /> Carregando jogadores...</div>
            ) : (
              <div className="stm-player-list">
                {players.map(p => {
                  const eligible = playerMatchesRules(p);
                  const age = new Date().getFullYear() - parseInt(p.ano, 10);
                  return (
                    <label
                      key={p.id}
                      className={`stm-player-item ${selectedPlayers.includes(p.id) ? 'checked' : ''} ${!eligible ? 'ineligible' : ''}`}
                      title={!eligible ? 'Não atende às regras' : ''}
                    >
                      <input
                        type="checkbox"
                        checked={selectedPlayers.includes(p.id)}
                        onChange={() => eligible && toggleSelectPlayer(p.id)}
                        disabled={loading || !eligible}
                      />
                      <span className="stm-player-name">{p.nome}</span>
                      <span className="stm-player-meta">{p.sexo} • {age} anos • {p.posicao}{!eligible ? ' • Inapto' : ''}</span>
                    </label>
                  );
                })}
                {players.length === 0 && !playersLoading && <div className="stm-empty">Time sem jogadores cadastrados.</div>}
                {players.length > 0 && !hasEligiblePlayers && <div className="stm-hint">Todos os jogadores estão fora das regras.</div>}
              </div>
            )
          )}
          {!selectedTeam && <div className="stm-hint">Selecione um time para listar jogadores.</div>}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={loading}>Cancelar</Button>
        <Button
          variant="primary"
          onClick={handleConfirm}
          disabled={loading || !selectedTeamId || selectedPlayers.length === 0 || !compositionMet}
        >
          {loading ? 'Vinculando...' : 'Vincular Time'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SelectTeamPlayersModal;
