import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Modal, Button, Spinner } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { useAuth } from '../../../hooks/useAuth';
import '../../Dialogs/SelectTeamPlayersDialog.css';

interface SelectTeamPlayersChampionshipModalProps {
  show: boolean;
  onHide: () => void;
  championshipId: number;
  modalidade?: string | null; // pass from parent to avoid extra fetch
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

const SelectTeamPlayersChampionshipModal: React.FC<SelectTeamPlayersChampionshipModalProps> = ({ show, onHide, championshipId, modalidade, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [teamsLoading, setTeamsLoading] = useState(false);
  const [playersLoading, setPlayersLoading] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([]);
  const [error, setError] = useState<string>('');

  const token = useMemo(() => localStorage.getItem('token'), []);

  const fetchAvailableTeams = async () => {
    setTeamsLoading(true);
    try {
      const [myTeamsResp, registeredResp] = await Promise.all([
        axios.get(`http://localhost:3001/api/teams`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`http://localhost:3001/api/championships/${championshipId}/teams`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const myTeams: Team[] = myTeamsResp.data || [];
      const alreadyRegistered: Team[] = registeredResp.data || [];
      const registeredIds = new Set(alreadyRegistered.map(t => t.id));
      const decorated = myTeams.map(t => ({ ...t, __disabled: registeredIds.has(t.id) }));
      setTeams(decorated as any);
    } catch (e: any) {
      console.error('[SelectTeamPlayersChampionshipModal] Erro carregando times:', e);
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
      setError('');
      setSelectedTeamId(null);
      setPlayers([]);
      setSelectedPlayers([]);
      fetchAvailableTeams();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, user]);

  const toggleSelectPlayer = (id: number) => {
    setSelectedPlayers(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

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
    return { gk: 1, line: 4 }; // padrão
  }, [modalidade]);

  const selectedCounts = useMemo(() => {
    let gk = 0, line = 0;
    const map = new Map(players.map(p => [p.id, p] as [number, Player]));
    selectedPlayers.forEach(id => {
      const p = map.get(id);
      if (!p) return;
      if (isGoalkeeper(p)) gk += 1; else line += 1;
    });
    return { gk, line };
  }, [selectedPlayers, players]);

  const compositionMet = selectedCounts.gk >= requirements.gk && selectedCounts.line >= requirements.line;

  const handleConfirm = async () => {
    if (!selectedTeamId) {
      setError('Selecione um time.');
      return;
    }
    if (selectedPlayers.length === 0) {
      setError('Selecione pelo menos um jogador.');
      return;
    }
    if (!compositionMet) {
      setError(`Seleção insuficiente para a modalidade${modalidade ? ` ${modalidade}` : ''}. Necessário: ${requirements.gk} goleiro(s) e ${requirements.line} jogador(es) de linha. Selecionado: ${selectedCounts.gk} GKs e ${selectedCounts.line} linha.`);
      return;
    }
    try {
      setLoading(true);
      const resp = await axios.post(`http://localhost:3001/api/championships/${championshipId}/teams`, {
        teamId: selectedTeamId,
        championshipId
      }, { headers: { Authorization: `Bearer ${token}` }});
      if (resp.status === 200) {
        toast.success('Time inscrito no campeonato!');
        onHide();
        onSuccess && onSuccess();
        setTimeout(() => window.location.reload(), 1200);
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Erro ao inscrever time');
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
        <Modal.Title>Inscrever time no campeonato</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <div className="stm-alert-error">{error}</div>}
        <div className="stm-section">
          <h5 className="stm-section-title">1. Selecione o Time</h5>
          {teamsLoading ? (
            <div className="stm-loading"><Spinner animation="border" size="sm" /> Carregando times...</div>
          ) : teams.length === 0 ? (
            <div className="stm-empty">Você não possui times.</div>
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
                    title={disabled ? 'Time já inscrito neste campeonato' : ''}
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
          <h5 className="stm-section-title">2. Jogadores do Time</h5>
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
                  const checked = selectedPlayers.includes(p.id);
                  return (
                    <label
                      key={p.id}
                      className={`stm-player-item ${checked ? 'checked' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleSelectPlayer(p.id)}
                        disabled={loading}
                      />
                      <span className="stm-player-name">{p.nome}</span>
                      <span className="stm-player-meta">{p.posicao}</span>
                    </label>
                  );
                })}
                {players.length === 0 && !playersLoading && <div className="stm-empty">Time sem jogadores cadastrados.</div>}
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
          {loading ? 'Inscrevendo...' : 'Inscrever Time'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SelectTeamPlayersChampionshipModal;