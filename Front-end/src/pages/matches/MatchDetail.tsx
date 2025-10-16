import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './MatchDetail.css';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import ModalTeams from '../../components/Modals/Teams/modelTeams';
import SelectTeamPlayersModal from '../../components/Dialogs/SelectTeamPlayersDialog';
import EditRulesModal from '../../components/Modals/Regras/RegrasFormEditModal';
import PunicaoRegisterModal from '../../components/Modals/Punicao/PartidasAmistosas/PunicaoPartidaAmistosoRegisterModal';
import PunicaoInfoModal from '../../components/Modals/Punicao/PartidasAmistosas/PunicaoPartidaAmistosaModalInfo';
import SumulaPartidaAmistosaModal from '../sumula/SumulaPartidasAmistosas';
import {
  MatchHeader,
  MatchInfoSection,
  MatchDescription,
  MatchRules,
  TeamsList
} from '../../components/features/matches/MatchDetail';
import { MatchActions } from '../../components/features/matches/MatchActions/MatchActions';
import { DeleteConfirmDialog } from '../../components/Dialogs/DeleteConfirmDialog';
import { EvaluationDialog } from '../../components/Dialogs/EvaluationDialog';
const MatchDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeCadastrados, setTimeCadastrados] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [modal, setModal] = useState(false); // legacy
  const [showSelectTeamPlayers, setShowSelectTeamPlayers] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [editRules, setEditRules] = useState(false);
  const [showPunicaoRegister, setShowPunicaoRegister] = useState(false);
  const [showPunicaoInfo, setShowPunicaoInfo] = useState(false);
  const { user } = useAuth();
  const [showEvalModal, setShowEvalModal] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [showEventsModal, setShowEventsModal] = useState(false);
  const [goals, setGoals] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [goalEmail, setGoalEmail] = useState<string>('');
  const [cardEmail, setCardEmail] = useState<string>('');
  const [cardType, setCardType] = useState<'yellow'|'red'>('yellow');
  const [cardMinute, setCardMinute] = useState<number | ''>('');
  // jogadores carregados para seleção (admin de time ou sistema)
  const [availablePlayers, setAvailablePlayers] = useState<any[]>([]);
  const [selectedGoalPlayer, setSelectedGoalPlayer] = useState<string>('');
  const [selectedCardPlayer, setSelectedCardPlayer] = useState<string>('');


  const fetchEvents = async () => {
    if (!id) return;
    try {
  // setEventsLoading(true);
      const token = localStorage.getItem('token');
      const resp = await fetch(`http://localhost:3001/api/matches/${id}/events`, { headers: { Authorization: `Bearer ${token}` }});
      if (resp.ok) {
        const data = await resp.json();
        setGoals(data.goals || []);
        setCards(data.cards || []);
      }
    } catch (e) {
      console.error('Erro ao buscar eventos', e);
    } finally {
  // setEventsLoading(false);
    }
  };
  const handleFinalizeMatch = async () => {
    if (!id) return;
    try {
      const token = localStorage.getItem('token');
      const resp = await fetch(`http://localhost:3001/api/matches/${id}/finalize`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type':'application/json' }});
      if (!resp.ok) {
        const data = await resp.json().catch(()=>({}));
        toast.error(data.message || 'Erro ao finalizar');
        return;
      }
      toast.success('Partida finalizada');
      // Atualiza status local
      setMatch((m: any) => m ? { ...m, status: 'completed' } : m);
     
      setShowEventsModal(true);
    } catch (e:any) {
      toast.error(e.message || 'Falha ao finalizar');
    }
  };

  const handleAddGoal = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const body: any = {};
      if (selectedGoalPlayer) {
        body.playerId = Number(selectedGoalPlayer); // novo fluxo usando playerId
      } else if (goalEmail.trim()) {
        body.email = goalEmail.trim(); // fallback legado
      }
      const resp = await fetch(`http://localhost:3001/api/matches/${id}/goals`, { method:'POST', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body: JSON.stringify(body) });
      if (!resp.ok) { toast.error('Erro ao adicionar gol'); return; }
      setGoalEmail(''); setSelectedGoalPlayer('');
      await fetchEvents();
    } catch (err) { console.error(err); }
  };

  const getTimeInscrito = async (matchId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Token não encontrado');
        return;
      }
      const response = await axios.get(`http://localhost:3001/api/matches/${matchId}/join-team`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setTimeCadastrados(response.data);
    } catch (error) {
      console.error('Erro ao buscar times cadastrados:', error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchMatchDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:3001/api/matches/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setMatch(response.data);
        await getTimeInscrito(id!);
      } catch (err: any) {
        console.error('Erro ao carregar detalhes:', err);
        if (err.response?.status === 401) {
          navigate('/login');
          return;
        }
        setError('Não foi possível carregar os detalhes da partida. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchMatchDetails();
  }, [id, navigate]);

  // Carrega jogadores (Players) dos times participantes da partida
  const fetchMatchPlayers = async (teamId?: string) => {
    if (!id) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const query = teamId ? `?teamId=${teamId}` : '';
      const resp = await fetch(`http://localhost:3001/api/matches/${id}/roster-players${query}`, { headers: { Authorization: `Bearer ${token}` } });
      if (resp.ok) {
        const json = await resp.json();
        setAvailablePlayers(json.players || []);
      } else {
        setAvailablePlayers([]);
      }
    } catch (e) { console.error('Erro ao carregar roster de jogadores', e); setAvailablePlayers([]); }
  };
  
  const handleLeaveMatch = async (matchId: string | undefined, teamId: number) => {
    if (!matchId) return;
    const numericMatchId = Number(matchId);
    try {
      const response = await axios.delete(`http://localhost:3001/api/matches/${numericMatchId}/join-team/${teamId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.status === 200) {
        toast.success('Time removido da partida com sucesso!');
        setTimeout(() => {
          window.location.reload();
        }, 800);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Erro ao sair da partida. Tente novamente.';
      toast.error(msg);
    }
  };

  const handleModalClose = () => {
    setModal(false);
  };

  const handleOpenSelectTeamPlayers = () => {
    setShowSelectTeamPlayers(true);
  };

  const handleCloseSelectTeamPlayers = () => {
    setShowSelectTeamPlayers(false);
  };
  const handleDeleteMatch = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await axios.delete(`http://localhost:3001/api/matches/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.status === 200) {
        toast.success('Partida excluída com sucesso!');
        navigate('/matches', { state: { filter: 'my' } }); // Redirect to my ma
      } else {
        toast.error('Erro ao excluir a partida. Tente novamente.');
      }
    } catch (err: any) {
      console.error('Erro ao excluir partida:', err);
      toast.error(err.response?.data?.message || 'Erro ao excluir partida. Tente novamente.');
    } finally {
      setLoading(false);
      setOpenDeleteConfirm(false);
    }
  };

  const handleOpenDeleteConfirm = () => {
    setOpenDeleteConfirm(true);
  };

  const handleCloseDeleteConfirm = () => {
    setOpenDeleteConfirm(false);
  };

  // Abre fluxo de punição: se já existir punição para a partida, abre Info; senão, abre Register
  const handleOpenPunicao = async () => {
    if (!id) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const resp = await axios.get(`http://localhost:3001/api/matches/${id}/punicao`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const hasPunicao = Array.isArray(resp.data) && resp.data.length > 0;
      if (hasPunicao) {
        setShowPunicaoInfo(true);
      } else {
        setShowPunicaoRegister(true);
      }
    } catch (e) {
      // Em caso de erro ao checar, abre o registro por padrão
      setShowPunicaoRegister(true);
    }
  };

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .address-info {
        margin: 10px 0;
        padding: 8px 12px;
        background-color: #f5f5f5;
        border-radius: 4px;
        font-size: 0.9em;
        line-height: 1.4;
        border-left: 3px solid #3f51b5;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  if (loading) {
    return <div className="match-detail-container loading">Carregando detalhes da partida...</div>;
  }
  
  if (error) {
    return <div className="match-detail-container error">{error}</div>;
  }
  
  if (!match) {
    return <div className="match-detail-container error">Partida não encontrada.</div>;
  }

  const isOrganizer = user && match.organizerId === user.id;
  const isAdmin = user && user.userTypeId === 1;
  const canDeleteMatch = isOrganizer || isAdmin;
  const statusLower = String(match.status || '').toLowerCase();
  const isCompleted = statusLower === 'completed';
  // Definir capacidade padrão de 2 times quando não houver regra explicitando maxTeams
  const effectiveMaxTeams = typeof (match?.maxTeams) === 'number' ? Number(match.maxTeams) : 2;
  const currentTeamsCount = timeCadastrados.length;

  return (
    <div className="match-detail-container">
      <div className="detail-content">
        <MatchHeader
          title={match.title}
          organizerName={match.organizer.name}
        />

        <MatchInfoSection match={match} />

        <MatchDescription description={match.description} />

        <MatchRules
          match={match}
          showRulesModal={showRulesModal}
          onShowRulesModal={setShowRulesModal}
        />

        <TeamsList
          teams={timeCadastrados}
          match={match}
          userId={user?.id}
          userTypeId={user?.userTypeId}
          isOrganizer={isOrganizer}
          isAdmin={isAdmin}
          isCompleted={isCompleted}
          matchId={id}
          effectiveMaxTeams={effectiveMaxTeams}
          onLeaveMatch={handleLeaveMatch}
          onOpenSelectTeamPlayers={handleOpenSelectTeamPlayers}
        />

        <MatchActions
          matchId={id}
          canDeleteMatch={canDeleteMatch}
          isOrganizer={isOrganizer}
          isAdmin={isAdmin}
          isCompleted={isCompleted}
          onDeleteMatch={handleOpenDeleteConfirm}
          onOpenPunicao={handleOpenPunicao}
          onEditRules={() => setEditRules(true)}
          onShowEvalModal={() => setShowEvalModal(true)}
          onShowCommentsModal={() => setShowCommentsModal(true)}
          onFinalizeMatch={handleFinalizeMatch}
          onShowEventsModal={() => setShowEventsModal(true)}
          onFetchEvents={fetchEvents}
          onFetchMatchPlayers={fetchMatchPlayers}
        />
      </div>

      {/* Modais */}
      {modal && (
        <ModalTeams
          show={modal}
          onHide={handleModalClose}
          matchid={id ? Number(id) : 0}
        />
      )}

      {showSelectTeamPlayers && (
        <SelectTeamPlayersModal
          show={showSelectTeamPlayers}
          onHide={handleCloseSelectTeamPlayers}
          matchId={id ? Number(id) : 0}
          onSuccess={() => {
            getTimeInscrito(id!);
          }}
        />
      )}

      {isOrganizer && editRules && (
        <EditRulesModal
          show={editRules}
          onHide={handleModalClose}
          onClose={() => setEditRules(false)}
          userId={Number(user?.id)}
          partidaDados={match}
        />
      )}

      {(isOrganizer || isAdmin) && (
        <>
          <PunicaoRegisterModal
            show={showPunicaoRegister}
            onHide={() => setShowPunicaoRegister(false)}
            onClose={() => {
              setShowPunicaoRegister(false);
              getTimeInscrito(id!);
            }}
            team={{ id: Number(id) }}
          />
          <PunicaoInfoModal
            show={showPunicaoInfo}
            onHide={() => setShowPunicaoInfo(false)}
            onClose={() => setShowPunicaoInfo(false)}
            team={{ id: Number(id) }}
            idMatch={Number(id)}
          />
        </>
      )}

      {showEventsModal && (
        <SumulaPartidaAmistosaModal
          id={Number(match.id)}
          show={showEventsModal}
          onHide={() => setShowEventsModal(false)}
          canSave={Boolean(isOrganizer)}
        />
      )}

      <DeleteConfirmDialog
        open={openDeleteConfirm}
        onClose={handleCloseDeleteConfirm}
        onConfirm={handleDeleteMatch}
      />

      <EvaluationDialog
        open={showEvalModal}
        onClose={() => setShowEvalModal(false)}
        matchId={Number(match.id)}
        readOnly={false}
      />
      
      <EvaluationDialog
        open={showCommentsModal}
        onClose={() => setShowCommentsModal(false)}
        matchId={Number(match.id)}
        readOnly={true}
        title="Comentários da Partida"
      />
    </div>
  );
}

export default MatchDetail;