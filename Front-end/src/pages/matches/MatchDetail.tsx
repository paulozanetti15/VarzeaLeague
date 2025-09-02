import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import DeleteIcon from '@mui/icons-material/Delete';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import './MatchDetail.css';
import toast from 'react-hot-toast';
import RegrasFormInfoModal from '../../components/Modals/Regras/RegrasFormInfoModal';
import { Button } from 'react-bootstrap';
import MatchFinalizeModal from '../../components/Modals/MatchFinalizeModal';
import axios from 'axios';
import { Card } from 'react-bootstrap';
import ModalTeams from '../../components/Modals/Teams/modelTeams'; // legacy (pode ser removido futuramente)
import SelectTeamPlayersModal from '../../components/Modals/Teams/SelectTeamPlayersModal';
import { useAuth } from '../../hooks/useAuth';

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
  // Edit match modal state (moved to top)
  const [editMode, setEditMode] = useState(false);
  const [editFields, setEditFields] = useState<any>({});
  const [editLoading, setEditLoading] = useState(false);
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const { user } = useAuth();

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
    console.log('Response:', response);
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
  const canEditMatch = isOrganizer || isAdmin;

  // (removido: duplicado, já está no topo do componente)

  const handleEditClick = () => {
    setEditFields({
      title: match.title,
      date: match.date,
      time: match.time,
      duration: match.duration,
      location: match.location,
      price: match.price,
      description: match.description,
      status: match.status,
    });
    setEditMode(true);
  };

  const handleEditFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setEditFields({ ...editFields, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:3001/api/matches/${id}`, editFields, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Partida atualizada com sucesso!');
      setEditMode(false);
      window.location.reload();
    } catch (err: any) {
      toast.error('Erro ao atualizar partida.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleFinalizeMatch = () => {
    setShowFinalizeModal(true);
  };

  const handleFinalizeSubmit = async (data: { goals: number; yellowCards: number; redCards: number }) => {
    setEditLoading(true);
    try {
      const token = localStorage.getItem('token');
      // Finaliza partida
      await axios.put(`http://localhost:3001/api/matches/${id}`, { status: 'completed' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Salva relatório de gols/cartões (ajuste endpoint conforme backend)
      await axios.post(`http://localhost:3001/api/matches/${id}/finalize-report`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Partida finalizada e relatório salvo!');
      setShowFinalizeModal(false);
      setEditMode(false);
      window.location.reload();
    } catch (err: any) {
      toast.error('Erro ao finalizar partida ou salvar relatório.');
    } finally {
      setEditLoading(false);
    }
  };

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
            <div className="info-label">Local:</div>
            <div className="info-value">
              {match.location?.address || (typeof match.location === 'string' ? match.location : 'Endereço não informado')}
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
          {/* Edit and finalize buttons */}
          {canEditMatch && (
            <div className="d-flex justify-content-center mt-4 gap-2">
              <Button variant="primary" onClick={handleEditClick} disabled={editLoading} className="edit-match-button">
                Editar Partida
              </Button>
              <Button variant="success" onClick={handleFinalizeMatch} disabled={editLoading || match.status === 'completed'} className="finalize-match-button">
                Marcar como Finalizada
              </Button>
              <MatchFinalizeModal
                open={showFinalizeModal}
                onClose={() => setShowFinalizeModal(false)}
                onSubmit={handleFinalizeSubmit}
              />
            </div>
          )}
          {canDeleteMatch && (
            <div className="d-flex justify-content-center mt-4">
              <Button
                variant="danger"
                onClick={handleOpenDeleteConfirm}
                className="delete-match-button"
              >
                <DeleteIcon /> Excluir Partida
              </Button>
            </div>
          )}
          {/* Edit match modal */}
          {editMode && (
            <Dialog open={editMode} onClose={() => setEditMode(false)}>
              <DialogTitle>Editar Partida</DialogTitle>
              <form onSubmit={handleEditSubmit}>
                <DialogContent>
                  <input name="title" value={editFields.title} onChange={handleEditFieldChange} className="form-control mb-2" placeholder="Título" />
                  <input name="date" type="date" value={editFields.date?.slice(0,10)} onChange={handleEditFieldChange} className="form-control mb-2" placeholder="Data" />
                  <input name="time" type="time" value={editFields.time || ''} onChange={handleEditFieldChange} className="form-control mb-2" placeholder="Horário" />
                  <input name="duration" value={editFields.duration || ''} onChange={handleEditFieldChange} className="form-control mb-2" placeholder="Duração (HH:MM)" />
                  <input name="location" value={editFields.location} onChange={handleEditFieldChange} className="form-control mb-2" placeholder="Local" />
                  <input name="price" type="number" value={editFields.price || ''} onChange={handleEditFieldChange} className="form-control mb-2" placeholder="Valor" />
                  <textarea name="description" value={editFields.description || ''} onChange={handleEditFieldChange} className="form-control mb-2" placeholder="Descrição" />
                  <select name="status" value={editFields.status} onChange={handleEditFieldChange} className="form-control mb-2">
                    <option value="open">Aberta</option>
                    <option value="pending">Pendente</option>
                    <option value="confirmed">Confirmada</option>
                    <option value="cancelled">Cancelada</option>
                    <option value="completed">Finalizada</option>
                  </select>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setEditMode(false)} color="primary">Cancelar</Button>
                  <Button type="submit" color="primary" disabled={editLoading}>Salvar</Button>
                </DialogActions>
              </form>
            </Dialog>
          )}
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
    </div>
  );
}

export default MatchDetail;