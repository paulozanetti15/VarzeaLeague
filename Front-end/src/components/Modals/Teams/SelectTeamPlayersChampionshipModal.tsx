import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Modal, Button, Spinner } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { useAuth } from '../../../hooks/useAuth';
import { API_BASE_URL } from '../../../config/api';
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
  gender: string;
  ano: string;
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
    console.log(`[fetchAvailableTeams] Iniciando busca de times para campeonato ${championshipId}`);
    try {
      console.log('[SelectTeamPlayersChampionshipModal] Buscando times...');
      const [myTeamsResp, registeredResp] = await Promise.all([
        axios.get(`${API_BASE_URL}/teams`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/championships/${championshipId}/teams`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const myTeams: Team[] = myTeamsResp.data || [];
      const alreadyRegistered: Team[] = registeredResp.data || [];
      console.log('[SelectTeamPlayersChampionshipModal] Times encontrados:', myTeams.length);
      console.log('[SelectTeamPlayersChampionshipModal] Times já inscritos:', alreadyRegistered.length);
      const registeredIds = new Set(alreadyRegistered.map(t => t.id));
      console.log(`[fetchAvailableTeams] IDs registrados (Set):`, Array.from(registeredIds));
      
      const decorated = myTeams.map(t => {
        const isRegistered = registeredIds.has(t.id);
        console.log(`[fetchAvailableTeams] Time ${t.name} (ID: ${t.id}): registrado = ${isRegistered}`);
        return { ...t, __disabled: isRegistered };
      });
      console.log(`[fetchAvailableTeams] Times decorados:`, decorated);
      
      setTeams(decorated as any);
    } catch (e: any) {
      console.error('[fetchAvailableTeams] Erro carregando times:', e);
      console.error('[fetchAvailableTeams] Response:', e.response);
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
      const resp = await axios.get(`${API_BASE_URL}/players/team/${teamId}`, {
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
      console.log('[SelectTeamPlayersChampionshipModal] Modal aberto, championshipId:', championshipId);
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
      setError("");
      const resp = await axios.post(`${API_BASE_URL}/championships/${championshipId}/teams`, {
        teamId: selectedTeamId,
        championshipId
      }, { headers: { Authorization: `Bearer ${token}` }});
      
      if (resp.status === 200 || resp.status === 201) {
        toast.success('Time inscrito no campeonato com sucesso!');
        onHide();
        if (onSuccess) onSuccess();
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch (e: any) {
      const errorMsg = e.response?.data?.message || 'Erro ao inscrever time no campeonato';
      toast.error(errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveChampionship = async (teamId: number) => {
    if (!window.confirm('Tem certeza que deseja remover este time do campeonato?')) {
      return;
    }
    
    try {
      setLoading(true);
      setError("");
      const resp = await axios.delete(`${API_BASE_URL}/championships/${championshipId}/teams/${teamId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (resp.status === 200 || resp.status === 204) {
        toast.success('Time removido do campeonato com sucesso!');
        fetchAvailableTeams();
        if (onSuccess) onSuccess();
      }
    } catch (e: any) {
      const errorMsg = e.response?.data?.message || 'Erro ao remover time do campeonato';
      toast.error(errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const selectedTeam = teams.find(t => t.id === selectedTeamId);
  const isSelectedTeamAlreadyRegistered = selectedTeam ? (selectedTeam as any).__disabled : false;

  return (
    <Modal
      show={show}
      onHide={() => !loading && onHide()}
      centered
      backdrop="static"
      keyboard={!loading}
      className="select-team-players-modal"
      size="xl"
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
                console.log(`[Team ${team.name}] disabled:`, disabled);
                const rawBanner = team.banner || '';
                const bannerUrl = rawBanner.startsWith('/uploads')
                  ? `http://localhost:3001${rawBanner}`
                  : rawBanner
                    ? `http://localhost:3001/uploads/teams/${rawBanner}`
                    : null;
                return (
                  <div key={team.id} className="stm-team-card-wrapper">
                    <button
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
                    {disabled && ((team.captainId === user?.id) || Number(user?.userTypeId) === 1) && (
                      <button
                        type="button"
                        className="stm-leave-btn"
                        onClick={() => handleLeaveChampionship(team.id)}
                        disabled={loading}
                        title="Sair do campeonato"
                      >
                        <i className="bi bi-x-circle"></i> Sair
                      </button>
                    )}
                  </div>
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
          {isSelectedTeamAlreadyRegistered && selectedTeam && (
            <div className="stm-hint" style={{ background: 'rgba(76, 175, 80, 0.1)', borderLeft: '4px solid #4caf50', color: '#2e7d32' }}>
              ✓ Este time já está inscrito no campeonato
            </div>
          )}
        </div>
        <div className="stm-bottom-actions">
          <Button 
            variant="secondary" 
            onClick={onHide} 
            disabled={loading}
          >
            Cancelar
          </Button>
          {!isSelectedTeamAlreadyRegistered && (
            <Button
              variant="success"
              onClick={handleConfirm}
              disabled={loading || !selectedTeamId || selectedPlayers.length === 0 || !compositionMet}
            >
              {loading ? 'Inscrevendo...' : 'Inscrever Time'}
            </Button>
          )}
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default SelectTeamPlayersChampionshipModal;