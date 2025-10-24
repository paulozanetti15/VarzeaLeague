import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './MatchDetail.css';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import ModalTeams from '../../components/Modals/Teams/modelTeams';
import SelectTeamPlayersModal from '../../components/Dialogs/SelectTeamPlayersDialog';
import EditRulesModal from '../../components/Modals/Rules/RegrasFormEditModal';
import PunicaoRegisterModal from '../../components/Modals/Punicao/PartidasAmistosas/PunicaoPartidaAmistosoRegisterModal';
import PunicaoViewModal from '../../components/Modals/Punicao/PartidasAmistosas/PunicaoPartidaAmistosaViewModal';
import { SumulaCreate, SumulaView, SumulaEdit } from '../sumula';
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
  const { user } = useAuth();

  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [timeCadastrados, setTimeCadastrados] = useState<any[]>([]);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showSelectTeamPlayers, setShowSelectTeamPlayers] = useState(false);
  const [showEvalModal, setShowEvalModal] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [showEventsModal, setShowEventsModal] = useState(false);
  const [showPunicaoRegister, setShowPunicaoRegister] = useState(false);
  const [showPunicaoInfo, setShowPunicaoInfo] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [editRules, setEditRules] = useState(false);
  const [modal, setModal] = useState(false);
  const [hasSumula, setHasSumula] = useState(false);
  const [isWo, setIsWo] = useState(false);
  const [isEditingSumula, setIsEditingSumula] = useState(false);
  const [punishment, setPunishment] = useState<any>(null);
  



  const checkIfWo = (data: any) => {
    if (!data) {
      setIsWo(false);
      return false;
    }

    const status = String(data.status || '').toLowerCase();
    if (status === 'wo' || status === 'walkover' || data.isWO) {
      setIsWo(true);
      return true;
    }

    if (typeof data.homeScore === 'number' && typeof data.awayScore === 'number') {
      if ((data.homeScore === 0 && data.awayScore > 0) || (data.awayScore === 0 && data.homeScore > 0)) {
        setIsWo(true);
        return true;
      }
    }

    setIsWo(false);
    return false;
  };

  const checkSumulaExists = async () => {
    if (!id) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/matches/${id}/events`, { 
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        const hasEvents = (data.goals && data.goals.length > 0) || (data.cards && data.cards.length > 0);
        setHasSumula(hasEvents);
        return hasEvents;
      }
    } catch (error) {
      setHasSumula(false);
      return false;
    }
  };

  const handleFinalizeMatch = async () => {
    if (!id) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/matches/${id}/finalize`, { 
        method: 'POST', 
        headers: { 
          Authorization: `Bearer ${token}`, 
          'Content-Type':'application/json' 
        }
      });
      
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        toast.error(data.message || 'Erro ao finalizar');
        return;
      }
      
      window.alert('Partida finalizada');
      setMatch((previousMatch: any) => previousMatch ? { ...previousMatch, status: 'finalizada' } : previousMatch);
      setShowEventsModal(true);
    } catch (error: any) {
      toast.error(error.message || 'Falha ao finalizar');
    }
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

  const fetchPunishment = async (matchId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await axios.get(`http://localhost:3001/api/matches/${matchId}/punicao`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      let fetched = null;
      if (response.data) {
        if (Array.isArray(response.data)) {
          fetched = response.data.length > 0 ? response.data[0] : null;
        } else {
          fetched = response.data;
        }
      }

      setPunishment(fetched);
      return fetched;
    } catch (error) {
      setPunishment(null);
      return null;
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
        checkIfWo(response.data);
        await fetchPunishment(id!);
        await getTimeInscrito(id!);
        await checkSumulaExists();
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

  const handleViewEvents = async () => {
    // refresh punishment and sumula before deciding
    const latestPunishment = id ? await fetchPunishment(id) : null;
    const sumulaExists = await checkSumulaExists();
    // Sumula should only be visible after the match is finalized
    const statusLower = String(match?.status || '').toLowerCase();
    const isCompletedLocal = statusLower === 'finalizada';
    if (!isCompletedLocal) {
      toast.error('Súmula só disponível após a partida ser finalizada.');
      return;
    }

    // Frontend-only permission: admins, team captains or organizer can view/export the sumula
    const isTeamCaptain = user && timeCadastrados.some(t => Number(t.captainId) === Number(user.id));
    const isViewOnlyUser = user && (Number(user.userTypeId) === 1 || Number(user.userTypeId) === 3);
    const isOrganizerLocal = Boolean(user && match && Number(match.organizerId) === Number(user.id));
    const isAdminLocal = Boolean(user && Number(user.userTypeId) === 1);
    const canView = Boolean(isAdminLocal || isTeamCaptain || isOrganizerLocal || isViewOnlyUser);

    if (!canView) {
      toast.error('Sem permissão para visualizar a súmula.');
      return;
    }

    if (latestPunishment || isWo) {
      setIsEditingSumula(false);
      setShowEventsModal(true);
      return;
    }

    if (sumulaExists) {
      setIsEditingSumula(false);
      setShowEventsModal(true);
      return;
    }
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

  const handleOpenPunicao = async () => {
    if (!id) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await axios.get(`http://localhost:3001/api/matches/${id}/punicao`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const hasPunicao = Array.isArray(response.data) && response.data.length > 0;
      
      if (hasPunicao) {
        setShowPunicaoInfo(true);
      } else {
        setShowPunicaoRegister(true);
      }
    } catch (error) {
      setShowPunicaoRegister(true);
    }
  };

  

  const handlePunishmentModalClose = async () => {
    setShowPunicaoInfo(false);
    setShowPunicaoRegister(false);
    if (id) {
      await fetchPunishment(id);
      await getTimeInscrito(id);
      // Re-fetch match details to get updated status
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const resp = await axios.get(`http://localhost:3001/api/matches/${id}`, { headers: { Authorization: `Bearer ${token}` } });
          setMatch(resp.data);
          checkIfWo(resp.data);
        }
      } catch (err) {
        console.error('Erro ao atualizar detalhes da partida após manipular punição', err);
      }
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

  const isAdmin = user && user.userTypeId === 1;
  const isEventAdmin = user && user.userTypeId === 2;
  const isTeamAdmin = user && user.userTypeId === 3;
  const isOrganizer = user && match.organizerId === user.id;
  // compute statusLower and completion
  const statusLower = String(match?.status || '').toLowerCase();
  const isCompleted = statusLower === 'finalizada';
  // Só admin do time pode criar sumula, e apenas após finalização
  const canCreateSumula = Boolean(isTeamAdmin && isCompleted && !hasSumula);
  // Admin do sistema e admin do time só veem sumula se já existir e partida finalizada
  const canViewSumula = Boolean((isAdmin || isTeamAdmin) && hasSumula && isCompleted);
  const canDeleteMatch = isOrganizer || isAdmin;
  const effectiveMaxTeams = typeof (match?.maxTeams) === 'number' ? Number(match.maxTeams) : 2;

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
          isOrganizer={!!isOrganizer}
          isAdmin={!!isAdmin}
          isCompleted={isCompleted}
          matchId={id}
          effectiveMaxTeams={effectiveMaxTeams}
          onLeaveMatch={handleLeaveMatch}
          onOpenSelectTeamPlayers={handleOpenSelectTeamPlayers}
        />

        <MatchActions
          canDelete={canDeleteMatch || false}
          matchId={Number(id)}
          canEdit={isOrganizer || false}
          isCompleted={isCompleted}
          canApplyPunishment={isOrganizer || isAdmin || false}
          isWo={isWo}
          hasPunishment={!!punishment}
          disableComments={isWo || !!punishment}
          userTypeId={user?.userTypeId}
          teamsCount={timeCadastrados.length}
          registrationDeadline={match.registrationDeadline}
          matchStatus={match?.status}
          onDelete={handleOpenDeleteConfirm}
          onEdit={() => navigate(`/matches/edit/${id}`)}
          onEditRules={() => setEditRules(true)}
          onPunishment={handleOpenPunicao}
          hasSumula={hasSumula}
          onEvaluate={() => {
            console.log('Abrindo modal de avaliação');
            setShowEvalModal(true);
          }}
          onViewComments={() => {
            console.log('Abrindo modal de comentários');
            setShowCommentsModal(true);
          }}
          onFinalize={handleFinalizeMatch}
          onCreateSumula = {()=>setShowEventsModal(true)}
          onViewEvents={handleViewEvents}
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
            onClose={handlePunishmentModalClose}
            team={{ id: Number(id) }}
          />
        </>
      )}
      {(isOrganizer || isAdmin) && punishment && (
        <PunicaoViewModal
          show={showPunicaoInfo}
          onHide={() => setShowPunicaoInfo(false)}
          onClose={handlePunishmentModalClose}
          team={{ id: Number(id) }}
          idMatch={Number(id)}
        />
      )}

      {showEventsModal && !hasSumula && !punishment && isOrganizer && (
        <SumulaCreate
          matchId={Number(match.id)}
          isChampionship={false}
          show={showEventsModal}
          onClose={() => {
            setShowEventsModal(false);
            checkSumulaExists();
          }}
        />
      )}

      {showEventsModal && !isEditingSumula && (hasSumula || punishment) && isCompleted && (
        // Admin do sistema e admin do time só veem se já existir
        ((isAdmin || isTeamAdmin) ? hasSumula : true) && (
          <SumulaView
            matchId={Number(match.id)}
            isChampionship={false}
            show={showEventsModal}
            showDeleteConfirm={() => {}}
            canEdit={isEventAdmin && hasSumula}
            canDelete={isEventAdmin && hasSumula}
            onClose={() => {
              setShowEventsModal(false);
              setIsEditingSumula(false);
            }}
            onEdit={() => setIsEditingSumula(true)}
          />
        )
      )}

      {showEventsModal && isEditingSumula && (hasSumula) && isEventAdmin && isCompleted && (
        <SumulaEdit
          matchId={Number(match.id)}
          isChampionship={false}
          show={showEventsModal}
          onClose={() => {
            setShowEventsModal(false);
            setIsEditingSumula(false);
            checkSumulaExists();
          }}
        />
      )}

      <DeleteConfirmDialog
        open={openDeleteConfirm}
        onClose={handleCloseDeleteConfirm}
        onConfirm={handleDeleteMatch}
      />

      {match && (
        <>
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
        </>
      )}
    </div>
  );
}

export default MatchDetail;