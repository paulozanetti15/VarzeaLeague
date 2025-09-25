import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import './MatchDetail.css';
import toast from 'react-hot-toast';
import RegrasFormInfoModal from '../../components/Modals/Regras/RegrasFormInfoModal';
import { Button } from 'react-bootstrap';
import axios from 'axios';
import { Card } from 'react-bootstrap';
import ModalTeams from '../../components/Modals/Teams/modelTeams'; // legacy (pode ser removido futuramente)
import SelectTeamPlayersModal from '../../components/Modals/Teams/SelectTeamPlayersModal';
import { useAuth } from '../../hooks/useAuth';
import EditRulesModal from '../../components/Modals/Regras/RegrasFormEditModal';
import PunicaoRegisterModal from '../../components/Modals/Punicao/PartidasAmistosas/PunicaoPartidaAmistosoRegisterModal';
import PunicaoInfoModal from '../../components/Modals/Punicao/PartidasAmistosas/PunicaoPartidaAmistosaModalInfo';

// Subcomponente para avaliações (rating + comentários) com UI aprimorada
const StarRating: React.FC<{ value: number; onChange: (v:number)=>void; size?: number }> = ({ value, onChange, size = 26 }) => {
  return (
    <div className="stars-wrapper" role="radiogroup" aria-label="Nota da partida">
      {[1,2,3,4,5].map(n => {
        const active = n <= value;
        return (
          <button
            key={n}
            type="button"
            className={`star-btn ${active ? 'active' : ''}`}
            aria-checked={active}
            aria-label={`${n} estrela${n>1?'s':''}`}
            onClick={() => onChange(n)}
          >
            <svg width={size} height={size} viewBox="0 0 24 24" fill={active ? '#ffb400' : 'none'} stroke={active ? '#ffb400' : '#cccccc'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </button>
        );
      })}
    </div>
  );
};

const MatchEvaluationsSection: React.FC<{ matchId: number; readOnly?: boolean }> = ({ matchId, readOnly }) => {
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [summary, setSummary] = useState<{ average: number; count: number } | null>(null);
  const [myRating, setMyRating] = useState<number>(0);
  const [myComment, setMyComment] = useState('');
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');

  const fetchAll = async () => {
    try {
      const [listRes, sumRes] = await Promise.all([
        fetch(`http://localhost:3001/api/matches/${matchId}/evaluations`).then(r => r.json()),
        fetch(`http://localhost:3001/api/matches/${matchId}/evaluations/summary`).then(r => r.json())
      ]);
      setEvaluations(Array.isArray(listRes) ? listRes : []);
      if (sumRes && typeof sumRes.average !== 'undefined') setSummary(sumRes);
      // Preencher minha avaliação se existir
      if (Array.isArray(listRes)) {
        const uid = localStorage.getItem('userId');
        if (uid) {
          const mine = listRes.find((e: any) => String(e.evaluator_id) === uid);
          if (mine) { setMyRating(mine.rating); setMyComment(mine.comment || ''); }
        }
      }
    } catch (e) {
      console.error('Erro ao carregar avaliações', e);
    }
  };

  useEffect(() => { fetchAll(); }, [matchId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) { toast.error('Não autenticado'); return; }
    if (myRating < 1 || myRating > 5) { toast.error('Nota deve ser de 1 a 5'); return; }
    setLoading(true);
    try {
      const resp = await fetch(`http://localhost:3001/api/matches/${matchId}/evaluations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rating: myRating, comment: myComment })
      });
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.message || 'Erro ao salvar avaliação');
      }
      toast.success('Avaliação salva');
      await fetchAll();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="match-evaluations-section">
      <div className="eval-header-line">
        <h3 className="eval-title">Avaliações</h3>
        {summary && (
          <div className="evaluation-summary-chip" title={`${summary.count} ${summary.count===1?'avaliação':'avaliações'}`}>⭐ {summary.average} <span className="count">({summary.count})</span></div>
        )}
      </div>
      {!readOnly && (
      <form className="evaluation-form fancy" onSubmit={handleSubmit}>
        <div className="rating-input block">
          <label className="field-label">Sua Nota</label>
          <StarRating value={myRating} onChange={setMyRating} />
        </div>
        <div className="comment-input block">
          <label className="field-label">Comentário</label>
            <textarea className="comment-box" value={myComment} onChange={e => setMyComment(e.target.value)} rows={4} placeholder="Compartilhe pontos positivos, organização, fair play..." />
        </div>
        <div className="actions-row">
          <button type="submit" className="submit-eval-btn" disabled={loading || myRating===0}>{loading ? 'Salvando...' : (myRating? 'Salvar Avaliação' : 'Selecione a nota')}</button>
          {myRating>0 && <span className="edit-hint">Você pode alterar depois.</span>}
        </div>
      </form>
      )}
      <div className="evaluation-list modern">
        {evaluations.length === 0 && <div className="empty">Nenhuma avaliação ainda. Seja o primeiro a opinar!</div>}
        {evaluations.map(ev => {
          const mine = localStorage.getItem('userId') && String(ev.evaluator_id) === localStorage.getItem('userId');
          return (
            <div key={ev.id} className={`evaluation-item cardish ${mine? 'mine':''}`}>
              <div className="evaluation-header">
                <div className="stars-inline" aria-label={`Nota ${ev.rating}`}>
                  {[1,2,3,4,5].map(n => <span key={n} className={n<=ev.rating? 's filled':'s'}>★</span>)}
                </div>
                <span className="date">{new Date(ev.createdAt).toLocaleDateString('pt-BR')}</span>
              </div>
              {ev.comment && <div className="comment-body">{ev.comment}</div>}
              {mine && <div className="badge-mine">Sua avaliação</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
};
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
  // const [eventsLoading, setEventsLoading] = useState(false); // loading não utilizado após refatoração
  const [goals, setGoals] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  // Email opcional para associar evento a um atleta
  const [goalEmail, setGoalEmail] = useState<string>('');
  const [cardEmail, setCardEmail] = useState<string>('');
  const [cardType, setCardType] = useState<'yellow'|'red'>('yellow');
  const [cardMinute, setCardMinute] = useState<number | ''>('');
  // jogadores carregados para seleção (admin de time ou sistema)
  const [availablePlayers, setAvailablePlayers] = useState<any[]>([]);
  const [selectedGoalPlayer, setSelectedGoalPlayer] = useState<string>('');
  const [selectedCardPlayer, setSelectedCardPlayer] = useState<string>('');
  const [selectedTeamForEvents, setSelectedTeamForEvents] = useState<string>('');

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

  const handleDeleteGoal = async (goalId: number) => {
    if (!id) return;
    const token = localStorage.getItem('token');
    try {
      const resp = await fetch(`http://localhost:3001/api/matches/${id}/goals/${goalId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` }});
      if (!resp.ok) { toast.error('Erro ao excluir gol'); return; }
      setGoals(g => g.filter(gl => gl.id !== goalId));
    } catch (e) { console.error(e); toast.error('Falha ao excluir gol'); }
  };

  const handleDeleteCard = async (cardId: number) => {
    if (!id) return;
    const token = localStorage.getItem('token');
    try {
      const resp = await fetch(`http://localhost:3001/api/matches/${id}/cards/${cardId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` }});
      if (!resp.ok) { toast.error('Erro ao excluir cartão'); return; }
      setCards(c => c.filter(cd => cd.id !== cardId));
    } catch (e) { console.error(e); toast.error('Falha ao excluir cartão'); }
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
      await fetchEvents();
      await fetchMatchPlayers();
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

  const handleAddCard = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const payload: any = { cardType, minute: cardMinute === '' ? undefined : Number(cardMinute) };
      if (selectedCardPlayer) {
        payload.playerId = Number(selectedCardPlayer);
      } else if (cardEmail.trim()) {
        payload.email = cardEmail.trim();
      }
      const resp = await fetch(`http://localhost:3001/api/matches/${id}/cards`, { method:'POST', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body: JSON.stringify(payload) });
      if (!resp.ok) { toast.error('Erro ao adicionar cartão'); return; }
      setCardEmail(''); setCardMinute(''); setCardType('yellow'); setSelectedCardPlayer('');
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
    
    const response = await axios.delete(`http://localhost:3001/api/matches/${numericMatchId}/join-team/${teamId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    if (response.status === 200) {
      toast.success('Time removido da partida com sucesso!');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } else {
      toast.error('Erro ao sair da partida. Tente novamente.');
    }
  };
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'Data não informada';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Data inválida';
      return format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch (error) {
      return 'Data inválida';
    }
  };
  
  const formatTime = (timeString: string | undefined): string => {
    if (!timeString) {
      if (match?.date && match.date.includes(' ')) {
        const timePart = match.date.split(' ')[1];
        return timePart.slice(0, 5); // Retorna apenas HH:MM
      }
      return 'Horário não informado';
    }
    return timeString.slice(0, 5); // Extrai apenas hora e minuto (HH:MM) se existir
  };
  
  const formatPrice = (price: number | string | null | undefined): string => {
    if (price === null || price === undefined) return 'Gratuito';
    return `R$ ${Number(price).toFixed(2).replace('.', ',')}`;
  };
  const handleModalClose = () => {
    setModal(false);
  }
  // legacy modal (não utilizado atualmente)
  const handleOpenSelectTeamPlayers = () => {
    setShowSelectTeamPlayers(true);
  }
  const handleCloseSelectTeamPlayers = () => {
    setShowSelectTeamPlayers(false);
  }
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

  return (
    <div className="match-detail-container">
      <div className="detail-content">
        <div className="match-header">
          <h1>{match.title}</h1>
          <div className="match-organizer">
            <SportsSoccerIcon /> Organizado por: {match.organizer.name || 'Desconhecido'}
          </div>
        </div>
        
        <div className="match-info">
          <div className="info-row">
            <div className="info-label">Data:</div>
            <div className="info-value">{formatDate(match.date)}</div>
          </div>
          
          <div className="info-row">
            <div className="info-label">Horário:</div>
            <div className="info-value">{formatTime(match.time)}</div>
          </div>
          
          {match.duration && (
            <div className="info-row">
              <div className="info-label">Duração:</div>
              <div className="info-value">{match.duration}</div>
            </div>
          )}
          <div className="info-row">
            <div className="info-label">Nome Quadra:</div>
            <div className="info-value">
              {match.nomequadra || 'Nome da quadra não informado'}
            </div>
          </div>
          <div className="info-row">
            <div className="info-label">Local:</div>
            <div className="info-value">
              {match.location?.address || (typeof match.location === 'string' ? match.location : 'Endereço não informado')}
            </div>
          </div>
          <div className="info-row">
            <div className="info-label">Modalidade:</div>
            <div className="info-value">
              {match.modalidade || 'Modalidade não informada'}
            </div>
          </div>
          <div className="info-row">
            <div className="info-label">Valor da quadra:</div>
            <div className="info-value">
              {formatPrice(match.price)}
            </div>
          </div>
        </div>
        {match.description && (
          <div className="match-description">
            <h3>Descrição</h3>
            <p>{match.description}</p>
          </div>
        )}
        <div className="match-description">
          <h3>Regras</h3>
          <Button 
            className="view-rules-btn" 
            variant="primary" 
            onClick={() => setShowRulesModal(true)}
          >
            <i className="fas fa-clipboard-list me-2"></i>
            Visualizar regras
          </Button>
        </div>
        {match && (
          <RegrasFormInfoModal
            idpartida={match.id} 
            show={showRulesModal} 
            onHide={() => setShowRulesModal(false)}
          />
        )}
        <div className="match-description">
          <h3>Times Participantes</h3>
          <div className="teams-list">
            {timeCadastrados.length > 0 ? (
              <>
                {timeCadastrados.map((team: any) => (
                  <Card className="team-card" key={team.id}> 
                    <Card.Body>
                      {team.banner &&
                        <Card.Img
                         src={`http://localhost:3001/uploads/teams/${team.banner}`} 
                         variant='top'
                        />
                      }
                      <div className='d-flex flex-column align-items-center text-center'>
                        <Card.Title>{team.name}</Card.Title>
                        <Button variant="danger" onClick={() => handleLeaveMatch(id,team.id)}>
                          Sair da Partida
                        </Button>
                      </div>  
                    </Card.Body>
                  </Card>
                ))}
                {timeCadastrados.length === 1 && <div className="versus-text">X</div>}
              </>

            ) : (
              <div className="no-teams-wrapper">
                <div className="no-teams-text">Nenhum time inscrito ainda.</div>
                {match.status === 'open' && user?.userTypeId === 3 && (typeof match.maxTeams !== 'number' || match.countTeams < match.maxTeams) && (
                  <Button 
                    variant="success" 
                    onClick={handleOpenSelectTeamPlayers} 
                    className="join-match-btn"
                  >
                    <i className="fas fa-link"></i>
                    Vincular meu Time
                  </Button>
                )}
              </div>
            )}
          </div>
            <div className='d-flex gap-2 container justify-content-center'>
              {canDeleteMatch && (
                <Button
                  variant="danger"
                  onClick={handleOpenDeleteConfirm}
                >
                  <DeleteIcon /> Excluir Partida
                </Button>
              )}     
                {(isOrganizer || isAdmin) && (
                  <>
                    <Button
                      variant="warning"
                      onClick={handleOpenPunicao}
                    >
                      Aplicar/Ver Punição
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => navigate(`/matches/edit/${id}`)}
                    >
                      <EditIcon/> Editar Partida 
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setEditRules(true)}
                    >
                      <EditIcon/> Editar Regras   
                    </Button>
                  </>
                )}
                <div className='d-flex gap-2 flex-wrap justify-content-center'>
                  <Button
                    variant='primary'
                    title='Avaliar / comentar partida'
                    onClick={() => setShowEvalModal(true)}
                  >
                    Avaliar / Comentar
                  </Button>
                  <Button
                    variant='outline-light'
                    title='Ver comentários e notas'
                    onClick={() => setShowCommentsModal(true)}
                  >
                    Ver Comentários
                  </Button>
                  {isOrganizer && !isCompleted && (
                    <Button
                      variant='warning'
                      title='Finalizar partida'
                      onClick={handleFinalizeMatch}
                    >
                      Finalizar Partida
                    </Button>
                  )}
                  {isCompleted && (
                    <Button
                      variant='outline-warning'
                      title='Ver / editar eventos (gols e cartões)'
                      onClick={() => { fetchEvents(); fetchMatchPlayers(); setShowEventsModal(true); }}
                    >
                      Eventos da Partida
                    </Button>
                  )}
                </div>
              
            </div>
        </div>
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
              // refresh teams list after success
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
        {/* Punição: registrar ou visualizar/editar */}
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
      </div>
      <Dialog
        open={openDeleteConfirm}
        onClose={handleCloseDeleteConfirm}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirmar Exclusão"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Tem certeza de que deseja excluir esta partida? Esta ação é irreversível.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirm} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleDeleteMatch} color="primary" autoFocus>
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
      {/* Modal de Avaliações */}
      <Dialog
        open={showEvalModal}
        onClose={() => setShowEvalModal(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Avaliações da Partida</DialogTitle>
        <DialogContent dividers>
          <MatchEvaluationsSection matchId={Number(match.id)} />
        </DialogContent>
        <DialogActions>
          <Button variant="secondary" onClick={() => setShowEvalModal(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>
      {/* Modal somente leitura de comentários */}
      <Dialog
        open={showCommentsModal}
        onClose={() => setShowCommentsModal(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Comentários da Partida</DialogTitle>
        <DialogContent dividers>
          <MatchEvaluationsSection matchId={Number(match.id)} readOnly />
        </DialogContent>
        <DialogActions>
          <Button variant="secondary" onClick={() => setShowCommentsModal(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>
      {/* Modal de eventos pós-finalização */}
      <Dialog
        open={showEventsModal}
        onClose={() => setShowEventsModal(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Eventos da Partida (Gols e Cartões)</DialogTitle>
        <DialogContent dividers>
          <div className="events-section">
            <h4>Registrar Gol</h4>
            <div className="mb-3 d-flex gap-2 flex-wrap align-items-center">
              <select className="form-select" style={{maxWidth:200}} value={selectedTeamForEvents} onChange={e=>{setSelectedTeamForEvents(e.target.value); fetchMatchPlayers(e.target.value || undefined); setSelectedGoalPlayer(''); setSelectedCardPlayer('');}}>
                <option value="">-- Time (todos) --</option>
                {timeCadastrados.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              <span className="text-secondary small">Filtrar jogadores por time</span>
            </div>
            <div className="mb-3 d-flex gap-2 flex-wrap align-items-center">
              <Button onClick={()=>handleAddGoal()} variant="success">Gol (genérico)</Button>
              <select className="form-select" style={{maxWidth:200}} value={selectedGoalPlayer} onChange={e=>setSelectedGoalPlayer(e.target.value)}>
                <option value="">-- Selecionar Jogador --</option>
                {availablePlayers.map(p => (
                  <option key={p.playerId || p.userId} value={p.playerId || p.userId}>{p.nome} ({p.time || 'Sem time'})</option>
                ))}
              </select>
              <span className="text-secondary small">ou email:</span>
              <input style={{maxWidth:220}} className="form-control" value={goalEmail} onChange={e=>{setGoalEmail(e.target.value); setSelectedGoalPlayer('');}} placeholder="email@exemplo.com" />
              <Button onClick={()=>handleAddGoal()} variant="outline-success" disabled={!goalEmail.trim() && !selectedGoalPlayer}>Registrar Gol</Button>
            </div>
            <h4>Registrar Cartão</h4>
            <div className="mb-3 d-flex gap-2 flex-wrap align-items-center">
              <select className="form-select" style={{maxWidth:130}} value={cardType} onChange={e=>setCardType(e.target.value as any)}>
                <option value="yellow">Amarelo</option>
                <option value="red">Vermelho</option>
              </select>
              <input style={{maxWidth:90}} className="form-control" type="number" value={cardMinute} onChange={e=>setCardMinute(e.target.value === '' ? '' : Number(e.target.value))} placeholder="Min" />
              <select className="form-select" style={{maxWidth:200}} value={selectedCardPlayer} onChange={e=>setSelectedCardPlayer(e.target.value)}>
                <option value="">-- Jogador --</option>
                {availablePlayers.map(p => (
                  <option key={p.playerId || p.userId} value={p.playerId || p.userId}>{p.nome} ({p.time || 'Sem time'})</option>
                ))}
              </select>
              <span className="text-secondary small">ou email:</span>
              <input style={{maxWidth:200}} className="form-control" value={cardEmail} onChange={e=>{setCardEmail(e.target.value); setSelectedCardPlayer('');}} placeholder="email@exemplo.com" />
              <Button onClick={()=>handleAddCard()} variant={cardType==='yellow' ? 'warning':'danger'} disabled={!selectedCardPlayer && !cardEmail.trim()}>Registrar Cartão</Button>
            </div>
            <hr />
            <h4>Gols ({goals.length})</h4>
            <ul className="list-group mb-3">
              {goals.map(g => {
                const label = g.player?.nome ? g.player.nome : (g.user?.name ? g.user.name : (g.player_id ? `Player #${g.player_id}` : (g.user_id ? `Usuario #${g.user_id}` : 'Gol')));
                return (
                  <li key={g.id} className="list-group-item bg-transparent text-light d-flex justify-content-between align-items-center">
                    <span>{label}</span>
                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={()=>handleDeleteGoal(g.id)} title="Remover gol">🗑️</button>
                  </li>
                );
              })}
              {goals.length === 0 && <li className="list-group-item bg-transparent text-secondary">Nenhum gol registrado</li>}
            </ul>
            <h4>Cartões ({cards.length})</h4>
            <ul className="list-group">
              {cards.map(c => {
                const base = c.player?.nome ? c.player.nome : (c.user?.name ? c.user.name : (c.player_id ? `Player #${c.player_id}` : (c.user_id ? `Usuario #${c.user_id}` : 'Cartão')));
                return (
                  <li key={c.id} className="list-group-item bg-transparent text-light d-flex justify-content-between align-items-center">
                    <span>{c.card_type === 'yellow' ? '🟨' : '🟥'} {base}{typeof c.minute === 'number' ? ` (${c.minute}')` : ''}</span>
                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={()=>handleDeleteCard(c.id)} title="Remover cartão">🗑️</button>
                  </li>
                );
              })}
              {cards.length === 0 && <li className="list-group-item bg-transparent text-secondary">Nenhum cartão registrado</li>}
            </ul>
          </div>
        </DialogContent>
        <DialogActions>
          <Button variant="secondary" onClick={() => setShowEventsModal(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default MatchDetail;