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

const MatchEvaluationsSection: React.FC<{ matchId: number }> = ({ matchId }) => {
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
  const { user } = useAuth();
  const [showEvalModal, setShowEvalModal] = useState(false);

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
        navigate('/matches', { state: { filter: 'my' } }); // Redirect to my matches after deletion
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
                {isOrganizer && (
                  <>
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
                <Button
                  variant='primary'
                  title='Avaliar / comentar partida'
                  onClick={() => setShowEvalModal(true)}
                >
                  Avaliar / Comentar
                </Button>
              
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
    </div>
  );
}

export default MatchDetail;