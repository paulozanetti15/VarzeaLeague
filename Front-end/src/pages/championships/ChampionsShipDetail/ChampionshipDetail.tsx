import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../../services/api';
import trophy from '../../../assets/championship-trophy.svg';
import './ChampionshipDetail.css';
import toast from 'react-hot-toast';
import { Button, Modal } from 'react-bootstrap';

interface Championship {
  id: number;
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  created_by: number;
}

const ChampionshipDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [championship, setChampionship] = useState<Championship | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasEditPermission, setHasEditPermission] = useState(false);
  const [teams, setTeams] = useState<any[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showTeamSelectModal, setShowTeamSelectModal] = useState(false);
  const [userTeams, setUserTeams] = useState<any[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [isLeavingTeamId, setIsLeavingTeamId] = useState<number | null>(null);

  // Times do usuário já inscritos e disponíveis para inscrição
  const enrolledTeamIds = useMemo(() => new Set((teams || []).map((t) => t.id)), [teams]);
  const hasUserTeamInChampionship = useMemo(
    () => (userTeams || []).some((ut) => enrolledTeamIds.has(ut.id)),
    [userTeams, enrolledTeamIds]
  );
  const availableUserTeams = useMemo(
    () => (userTeams || []).filter((ut) => !enrolledTeamIds.has(ut.id)),
    [userTeams, enrolledTeamIds]
  );

  const loadChampionshipTeams = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const resp = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/championships/${id}/join-team`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (resp.ok) {
          const teamsData = await resp.json();
          setTeams(Array.isArray(teamsData) ? teamsData : []);
        } else {
          setTeams([]);
        }
      }
    } catch (e) {
      console.error('Erro ao buscar times do campeonato', e);
      setTeams([]);
    }
  }, [id]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchChampionshipDetails = async () => {
      try {
        setLoading(true);
        const data = await api.championships.getById(Number(id));
        setChampionship(data);
        
        // Verificar permissões do usuário
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const isCreator = user.id === data.created_by;
        // Apenas o criador pode editar/excluir
        if (isCreator) {
          setHasEditPermission(true);
        } else {
          setHasEditPermission(false);
        }

        // Buscar times já inscritos neste campeonato
        await loadChampionshipTeams();

        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar detalhes do campeonato');
        setLoading(false);
      }
    };

    const fetchUserTeams = async () => {
      try {
        const teams = await api.teams.getUserTeams();
        setUserTeams(teams);
      } catch (err) {
        console.error('Erro ao carregar times do usuário:', err);
      }
    };

    fetchChampionshipDetails();
    fetchUserTeams();
  }, [id, navigate, loadChampionshipTeams]);

  const handleDeleteChampionship = async () => {
    try {
      await api.championships.delete(Number(id));
      toast.success('Campeonato excluído com sucesso!');
      navigate('/championships');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao excluir campeonato');
    }
  };

  // Removed join as individual flow (not used here)

  const handleJoinWithTeam = async () => {
    if (!selectedTeamId) {
      toast.error('Selecione um time para entrar no campeonato');
      return;
    }
    try {
      setIsJoining(true);
      await api.championships.joinWithTeam(Number(id), selectedTeamId);
      toast.success('Seu time entrou no campeonato com sucesso!');
      setShowTeamSelectModal(false);
      // Atualiza o campeonato
      const updatedChampionship = await api.championships.getById(Number(id));
      setChampionship(updatedChampionship);
      // Recarrega a lista de times inscritos
      await (async () => {
        try { await (async () => { /* ensure awaited */ })(); } catch (_) {}
        await (async () => { /* noop */ })();
        await (async () => loadChampionshipTeams())();
      })();
      setIsJoining(false);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao entrar no campeonato com o time');
      setIsJoining(false);
    }
  };

  const handleLeaveWithTeam = async (teamId: number) => {
    try {
      setIsLeavingTeamId(teamId);
      await api.championships.leaveWithTeam(Number(id), teamId);
      toast.success('Seu time saiu do campeonato.');
      await (async () => loadChampionshipTeams())();
      setIsLeavingTeamId(null);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao sair do campeonato com o time');
      setIsLeavingTeamId(null);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Não definida';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="championship-detail-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando detalhes do campeonato...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="championship-detail-container">
        <div className="error-container">
          <h2>Erro ao carregar dados</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!championship) {
    return (
      <div className="championship-detail-container">
        <div className="error-container">
          <h2>Campeonato não encontrado</h2>
          
        </div>
      </div>
    );
  }

  return (
    <div className="championship-detail-container">

      <div className="detail-content">
        <div className="championship-header">
          <img 
            src={trophy} 
            alt="Troféu" 
            className="championship-trophy-detail" 
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} 
          />
          <h1>{championship.name}</h1>
        </div>

        <div className="championship-info">
          <div className="info-row">
            <span className="info-label">Descrição:</span>
            <span className="info-value">{championship.description || 'Sem descrição'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Início:</span>
            <span className="info-value">{formatDate(championship.start_date)}</span>
          </div>          <div className="info-row">
            <span className="info-label">Término:</span>
            <span className="info-value">{formatDate(championship.end_date)}</span>
          </div>
        </div>

        <div className="championship-actions">
          {hasEditPermission ? (
            <>
              <button
                className="edit-button"
                onClick={() => navigate(`/championships/${id}/edit`)}
              >
                Editar Campeonato
              </button>
              <button
                className="delete-button"
                onClick={() => setShowDeleteModal(true)}
              >
                Excluir Campeonato
              </button>
            </>
          ) : (
            <>
              {!hasUserTeamInChampionship ? (
                <button
                  className="join-team-button"
                  onClick={() => { setSelectedTeamId(null); setShowTeamSelectModal(true); }}
                  disabled={isJoining || availableUserTeams.length === 0}
                >
                  {isJoining ? 'Entrando...' : 'Entrar com Time'}
                </button>
              ) : (
                <div style={{ fontSize: 14, color: '#ffffff' }}>
                  Você já possui um time inscrito neste campeonato.
                </div>
              )}
            </>
          )}
        </div>

        <div className="championship-teams-section">
          <h3>Times Participantes</h3>
          {teams && teams.length > 0 ? (
            <div className="teams-list">
              {teams.map((team) => {
                const isUserTeam = userTeams?.some((ut) => ut.id === team.id);
                return (
                  <div key={team.id} className="team-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <span>{team.name}</span>
                    {isUserTeam && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleLeaveWithTeam(team.id)}
                        disabled={isLeavingTeamId === team.id}
                      >
                        {isLeavingTeamId === team.id ? 'Saindo...' : 'Sair do campeonato'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p>Nenhum time inscrito neste campeonato ainda.</p>
          )}
        </div>
      </div>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Exclusão</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Tem certeza que deseja excluir o campeonato "{championship.name}"? Esta ação não pode ser desfeita.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDeleteChampionship}>
            Excluir
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showTeamSelectModal} onHide={() => setShowTeamSelectModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Selecione um Time</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {availableUserTeams.length > 0 ? (
            <>
              <p>Selecione um dos seus times para entrar no campeonato:</p>
              <div className="team-selection-list">
                {availableUserTeams.map((team) => (
                  <div 
                    key={team.id} 
                    className={`team-selection-item ${selectedTeamId === team.id ? 'selected' : ''}`}
                    onClick={() => setSelectedTeamId(team.id)}
                  >
                    {team.name}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p>
              {userTeams.length === 0
                ? 'Você não tem times cadastrados. Crie um time antes de entrar no campeonato.'
                : 'Todos os seus times já estão inscritos neste campeonato.'}
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowTeamSelectModal(false)}>
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            onClick={handleJoinWithTeam}
            disabled={!selectedTeamId || isJoining}
          >
            {isJoining ? 'Entrando...' : 'Entrar com o Time'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ChampionshipDetail;
