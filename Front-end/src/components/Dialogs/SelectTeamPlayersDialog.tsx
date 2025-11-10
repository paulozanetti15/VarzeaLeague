import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { fetchMatchById, getJoinedTeams, getAvailableForMatch, joinTeam } from '../../services/matchesFriendlyServices';
import { Modal, Button, Spinner } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { API_BASE_URL } from '../../config/api';
import './SelectTeamPlayersDialog.css';
import { getTeamBannerUrl } from '../../config/api';

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
  gender: string;
  dateOfBirth: string;
  posicao: string;
}

interface Rules {
  registrationDeadline: string;
  minimumAge: number;
  maximumAge: number;
  gender: string;
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
      const resp = await axios.get(`${API_BASE_URL}/match-rules/${matchId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Regras recebidas RAW:', resp.data);
      console.log('minimumAge:', resp.data.minimumAge, 'tipo:', typeof resp.data.minimumAge);
      console.log('maximumAge:', resp.data.maximumAge, 'tipo:', typeof resp.data.maximumAge);
      
      setRules({
        registrationDeadline: resp.data.registrationDeadline,
        minimumAge: Number(resp.data.minimumAge),
        maximumAge: Number(resp.data.maximumAge),
        gender: resp.data.gender
      });
    } catch (error) {
      console.error('Erro ao buscar regras:', error);
      setRules(null);
    }
  };

  const fetchMatch = async () => {
    try {
      const data = await fetchMatchById(matchId);
      const mod = (data?.matchType || (data as any)?.modalidade) as string | undefined;
      setModalidade(mod || null);
    } catch (e) {
      setModalidade(null);
    }
  };

  const fetchAvailableTeams = async () => {
    setTeamsLoading(true);
    try {
      const [myTeamsResp, registeredResp, availableResp] = await Promise.all([
        axios.get(`${API_BASE_URL}/teams`, { headers: { Authorization: `Bearer ${token}` } }),
        getJoinedTeams(matchId),
        getAvailableForMatch(matchId)
      ]);

      const myTeams: Team[] = myTeamsResp.data || [];
      const alreadyRegistered: Team[] = Array.isArray(registeredResp.data) ? registeredResp.data : [];
      const available: Team[] = availableResp.data || [];
      const registeredIds = new Set(alreadyRegistered.map(t => t.id));
      const availableIds = new Set(available.map(t => t.id));

      const decorated = myTeams.map(t => ({
        ...t,
        __disabled: registeredIds.has(t.id),
        __notInAvailable: !availableIds.has(t.id)
      }));

      setTeams(decorated as any);
    } catch (e: any) {
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
      
      const mappedPlayers = resp.data.map((p: any) => ({
        id: p.id,
        nome: p.nome,
        gender: p.sexo || p.gender,
        dateOfBirth: p.dateOfBirth,
        posicao: p.posicao
      }));
      
      console.log('Jogadores carregados:', mappedPlayers);
      setPlayers(mappedPlayers);
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
      fetchRules();
      fetchMatch();
      fetchAvailableTeams();
    }
  }, [show, user]);

  // Modal is controlled by parent via `show` prop; react-bootstrap Modal will handle focus/backdrop

  const playerMatchesRules = (player: Player): boolean => {
    if (!rules) return true;
    const birthDate = new Date(player.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear() - 
      (today.getMonth() < birthDate.getMonth() || 
       (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate()) ? 1 : 0);
    
    console.log(`Jogador: ${player.nome}, Data Nascimento: ${player.dateOfBirth}, Idade calculada: ${age}, Min: ${rules.minimumAge}, Max: ${rules.maximumAge}`);
    
    if (isNaN(age)) return false;
    if (age < rules.minimumAge || age > rules.maximumAge) {
      console.log(`❌ ${player.nome} INAPTO - Idade ${age} fora da faixa ${rules.minimumAge}-${rules.maximumAge}`);
      return false;
    }
      const normalizeText = (s?: string) => (s || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

    const ruleGenderNorm = normalizeText(rules.gender);
    const mixedVariants = ['ambos', 'sexo misto', 'misto', 'mixed'];
    if (!mixedVariants.includes(ruleGenderNorm)) {
      const normalizeGender = (gender: string | undefined): string => {
        if (!gender) return '';
        const g = (gender || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
        if (g === 'm' || g === 'masculino') return 'masculino';
        if (g === 'f' || g === 'feminino') return 'feminino';
        return g;
      };

      const playerGenderNorm = normalizeGender(player.gender);
      const ruleGenderNormFinal = normalizeText(rules.gender);
      if (!playerGenderNorm || playerGenderNorm !== ruleGenderNormFinal) {
        console.log(`❌ ${player.nome} INAPTO - Gênero ${playerGenderNorm} não corresponde a ${ruleGenderNormFinal}`);
        return false;
      }
    }
    
    console.log(`✅ ${player.nome} APTO`);
    return true;
  };

  const eligiblePlayers = useMemo(() => players.filter(playerMatchesRules), [players, rules]);
  const hasEligiblePlayers = eligiblePlayers.length > 0;

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
    return { gk: 1, line: 4 };
  }, [modalidade]);

  const selectedCounts = useMemo(() => {
    let gk = 0, line = 0;
    const map = new Map(players.map(p => [p.id, p] as [number, Player]));
    selectedPlayers.forEach(id => {
      const p = map.get(id);
      if (!p) return;
      if (!playerMatchesRules(p)) return;
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
      setError('');

      const resp = await joinTeam(matchId, { teamId: selectedTeamId, matchId });
      if (resp.status === 201 || resp.status === 200) {
        toast.success('Time vinculado à partida!');
        onHide();
        onSuccess && onSuccess();
      }
    } catch (e: any) {
      console.error('[SelectTeamPlayersDialog] Erro ao vincular time:', e);
      
      const errorMessage = e.response?.data?.message;
      
      if (e.response?.status === 409) {
        toast.error(errorMessage || 'Time já possui outra partida agendada neste horário');
        setError(errorMessage || 'Conflito de horário: Este time já está inscrito em outra partida no mesmo dia e horário');
      } else if (e.response?.status === 400) {
        toast.error(errorMessage || 'Não foi possível vincular o time');
        setError(errorMessage || 'Erro ao vincular time. Verifique se todos os requisitos foram atendidos');
      } else if (e.response?.status === 403) {
        toast.error('Você não tem permissão para inscrever este time');
        setError('Apenas o capitão do time pode inscrevê-lo na partida');
      } else {
        toast.error(errorMessage || 'Erro ao vincular time');
        setError(errorMessage || 'Erro ao vincular time. Tente novamente mais tarde');
      }
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
      size="xl"
    >
      <Modal.Header closeButton={!loading}>
        <Modal.Title>Vincular meu time à partida</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <div className="stm-alert-error" style={{
            background: 'linear-gradient(135deg, #fee 0%, #fdd 100%)',
            border: '1px solid #fcc',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '16px',
            color: '#c00',
            fontSize: '14px',
            lineHeight: '1.5'
          }}>
            <strong>⚠️ Atenção:</strong> {error}
          </div>
        )}
        {error && (
          <div className="stm-alert-error" style={{
            background: 'linear-gradient(135deg, #fee 0%, #fdd 100%)',
            border: '1px solid #fcc',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '16px',
            color: '#c00',
            fontSize: '14px',
            lineHeight: '1.5'
          }}>
            <strong>⚠️ Atenção:</strong> {error}
          </div>
        )}

        <div className="stm-section">
          <h5 className="stm-section-title">Selecione o Time</h5>
          {teamsLoading ? (
            <div className="stm-loading"><Spinner animation="border" /> Carregando times...</div>
          ) : teams.length === 0 ? (
            <div className="stm-empty">Você não tem times disponíveis para esta partida.</div>
          ) : (
            <div className="stm-team-list">
              {teams.map(team => {
                const disabled = (team as any).__disabled;
                const rawBanner = team.banner || '';
                const bannerUrl = getTeamBannerUrl(rawBanner);
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
          <h5 className="stm-section-title">
            Jogadores do Time {rules && <small>(Regras: {rules.gender} {rules.minimumAge}-{rules.maximumAge} anos)</small>}
          </h5>
          {modalidade && (
            <div className="stm-requirements-info">
              <div className="stm-requirements-header">
                Modalidade: <strong>{modalidade}</strong>
              </div>
              <div className="stm-requirements-body">
                <div>Seleção mínima necessária: <strong>{requirements.gk} {requirements.gk === 1 ? 'goleiro' : 'goleiros'}</strong> e <strong>{requirements.line} {requirements.line === 1 ? 'jogador de linha' : 'jogadores de linha'}</strong></div>
                <div className="stm-requirements-count">Selecionado: <strong>{selectedCounts.gk} {selectedCounts.gk === 1 ? 'goleiro' : 'goleiros'}</strong> • <strong>{selectedCounts.line} {selectedCounts.line === 1 ? 'jogador de linha' : 'jogadores de linha'}</strong></div>
              </div>
            </div>
          )}
          {selectedTeam && (
            playersLoading ? (
              <div className="stm-loading"><Spinner animation="border" size="sm" /> Carregando jogadores...</div>
            ) : (
              <div className="stm-player-list">
                {players.map(p => {
                  const eligible = playerMatchesRules(p);
                  const birthDate = new Date(p.dateOfBirth);
                  const today = new Date();
                  const age = today.getFullYear() - birthDate.getFullYear() - 
                    (today.getMonth() < birthDate.getMonth() || 
                     (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate()) ? 1 : 0);
                  return (
                    <label
                      key={p.id}
                      className={`stm-player-item ${selectedPlayers.includes(p.id) ? 'checked' : ''} ${!eligible ? 'ineligible' : ''}`}
                      title={!eligible ? 'Não atende às regras' : ''}
                    >
                      <div className='stm-player-info-container'>
                        <input
                          type="checkbox"
                          checked={selectedPlayers.includes(p.id)}
                          onChange={() => eligible && toggleSelectPlayer(p.id)}
                          disabled={loading || !eligible}
                        />
                        <div>
                          <span className="stm-player-name">{p.nome}</span>
                          <div className="stm-player-meta">
                            <span>{p.gender} • {age} anos</span>
                            <span className="player-position">{p.posicao}</span>
                            {!eligible && <span className="player-status">Inapto</span>}
                          </div>
                        </div>
                      </div>
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
        <Button
          variant="secondary"
          className="btn-cancelar"
          onClick={() => !loading && onHide()}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          variant="primary"
          className="btn-vincular"
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