import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import GavelIcon from '@mui/icons-material/Gavel';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { Button, Card } from 'react-bootstrap';
import toast from 'react-hot-toast';
import axios from 'axios';

import './MatchDetail.css';
import { useAuth } from '../../hooks/useAuth';
import EditRulesModal from '../../components/Modals/Regras/RegrasFormEditModal';
import RegrasFormInfoModal from '../../components/Modals/Regras/RegrasFormInfoModal';
import PunicaoRegisterModal from '../../components/Modals/Punicao/PartidasAmistosas/PunicaoPartidaAmistosoRegisterModal';
import PunicaoInfoModal from '../../components/Modals/Punicao/PartidasAmistosas/PunicaoPartidaAmistosaModalInfo';
import SelectTeamPlayersModal from '../../components/Modals/Teams/SelectTeamPlayersModal';
import ModalTeams from '../../components/Modals/Teams/modelTeams';

const MatchDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeCadastrados, setTimeCadastrados] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // ✅ Estado para controlar se existe punição (sem abrir modal)
  const [hasPunicao, setHasPunicao] = useState(false);

  const [showRulesModal, setShowRulesModal] = useState(false);
  const [modalTeams, setModalTeams] = useState(false);
  const [showSelectTeamPlayers, setShowSelectTeamPlayers] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [editRules, setEditRules] = useState(false);
  const [punicaoRegisterModal, setPunicaoRegisterModal] = useState(false);
  const [punicaoInfoModal, setPunicaoInfoModal] = useState(false);

  const token = localStorage.getItem('token');

  const getTimeInscrito = async (matchId: string) => {
    if (!token) return;
    try {
      const response = await axios.get(`http://localhost:3001/api/matches/${matchId}/join-team`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTimeCadastrados(response.data);
    } catch (err) {
      console.error('Erro ao buscar times cadastrados:', err);
    }
  };

  // ✅ Função corrigida - apenas verifica se existe punição
  const checkPunicao = async (matchId: string) => {
    try {
      const punicao = await axios.get(`http://localhost:3001/api/matches/${matchId}/punicao`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Punição encontrada:", punicao.data);
      // ✅ Apenas define se existe punição, NÃO abre o modal
      setHasPunicao(punicao.data.length > 0);
    } catch (err) {
      console.error('Erro ao buscar punição:', err);
      setHasPunicao(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchMatchDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:3001/api/matches/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMatch(response.data);
        await getTimeInscrito(id!);
        
        // ✅ Verificar se existe punição (sem abrir modal)
        await checkPunicao(id!);
        
      } catch (err: any) {
        console.error('Erro ao carregar detalhes:', err);
        if (err.response?.status === 401) navigate('/login');
        else setError('Não foi possível carregar os detalhes da partida. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchMatchDetails();
  }, [id, navigate, token]);

  
  const handlePunicaoClick = () => {
    if (hasPunicao) {
      
      setPunicaoInfoModal(true);
    } else {
      
      setPunicaoRegisterModal(true);
    }
  };

  const handleLeaveMatch = async (teamId: number) => {
    if (!id || !token) return;
    try {
      const response = await axios.delete(`http://localhost:3001/api/matches/${id}/join-team/${teamId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.status === 200) {
        toast.success('Time removido da partida com sucesso!');
        await getTimeInscrito(id);
      } else {
        toast.error('Erro ao sair da partida. Tente novamente.');
      }
    } catch (err) {
      console.error('Erro ao sair da partida:', err);
      toast.error('Erro ao sair da partida. Tente novamente.');
    }
  };
  // utils duplicados foram removidos abaixo; versões finais estão mais adiante
  // legacy modal handlers removidos (não utilizados atualmente)
  const handleDeleteMatch = async () => {
    if (!id) return;
    // Regra adicional: não permitir exclusão se houver times vinculados
    if (timeCadastrados.length > 0) {
      toast.error('Existem times vinculados. Desvincule todos antes de excluir a partida.');
      setOpenDeleteConfirm(false);
      return;
    }
    setLoading(true);
    try {
      const response = await axios.delete(`http://localhost:3001/api/matches/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.status === 200) {
        toast.success('Partida excluída com sucesso!');
        navigate('/matches', { state: { filter: 'my' } });
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Data não informada';
    try {
      return format(new Date(dateString), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return 'Data inválida';
    }
  };

  const formatTime = (timeString?: string) => {
    if (!timeString && match?.date?.includes(' ')) {
      return match.date.split(' ')[1].slice(0, 5);
    }
    return timeString?.slice(0, 5) || 'Horário não informado';
  };

  const formatPrice = (price?: number | string | null) => {
    return price ? `R$ ${Number(price).toFixed(2).replace('.', ',')}` : 'Gratuito';
  };

  if (loading) return <div className="match-detail-container loading">Carregando detalhes da partida...</div>;
  if (error) return <div className="match-detail-container error">{error}</div>;
  if (!match) return <div className="match-detail-container error">Partida não encontrada.</div>;

  const isOrganizer = user?.id === match.organizerId;
  const isAdmin = user?.userTypeId === 1;
  const canDeleteMatch = isOrganizer || isAdmin;
  const hasTeams = timeCadastrados.length > 0;

  return (
    <div className="match-detail-container">
      <div className="detail-content">
        {/* Header */}
        <div className="match-header">
          <h1>{match.title}</h1>
          <div className="match-organizer">
            <SportsSoccerIcon /> Organizado por: {match.organizer?.name || 'Desconhecido'}
          </div>
        </div>

        {/* Info */}
        <div className="match-info">
          <div className="info-row"><div className="info-label">Data:</div><div className="info-value">{formatDate(match.date)}</div></div>
          <div className="info-row"><div className="info-label">Horário:</div><div className="info-value">{formatTime(match.time)}</div></div>
          {match.duration && <div className="info-row"><div className="info-label">Duração:</div><div className="info-value">{match.duration}</div></div>}
          <div className="info-row"><div className="info-label">Nome Quadra:</div><div className="info-value">{match.nomequadra || 'Nome da quadra não informado'}</div></div>
          <div className="info-row"><div className="info-label">Local:</div><div className="info-value">{match.location?.address || (typeof match.location === 'string' ? match.location : 'Endereço não informado')}</div></div>
          <div className="info-row"><div className="info-label">Modalidade:</div><div className="info-value">{match.modalidade || 'Modalidade não informada'}</div></div>
          <div className="info-row"><div className="info-label">Valor da quadra:</div><div className="info-value">{formatPrice(match.price)}</div></div>
        </div>

        {/* Descrição */}
        {match.description && (
          <div className="match-description">
            <h3>Descrição</h3>
            <p>{match.description}</p>
          </div>
        )}

        {/* Regras */}
        <div className="match-description">
          <h3>Regras</h3>
          <Button variant="primary" onClick={() => setShowRulesModal(true)}>Visualizar regras</Button>
        </div>
        <RegrasFormInfoModal idpartida={match.id} show={showRulesModal} onHide={() => setShowRulesModal(false)} />

        {/* Times */}
        <div className="match-description">
          <h3>Times Participantes</h3>
          <div className="teams-list">
            {timeCadastrados.length > 0 ? (
              timeCadastrados.map((team: any) => (
                <Card className="team-card" key={team.id}>
                  {team.banner && <Card.Img src={`http://localhost:3001/uploads/teams/${team.banner}`} variant='top' />}
                  <Card.Body className="text-center">
                    <Card.Title>{team.name}</Card.Title>
                    {user?.userTypeId ==3 && (
                      <Button variant="danger" onClick={() => handleLeaveMatch(team.id)}>Sair da Partida</Button>
                  
                    )}
                    {user?.userTypeId ==2 && (
                      <Button variant="danger" onClick={() => handleLeaveMatch(team.id)}>Remover time da partida</Button>
                    )}
                     
                  </Card.Body>
                </Card>
              ))
            ) : (
              <div className="no-teams-wrapper">
                <div className="no-teams-text">Nenhum time inscrito ainda.</div>
                {match.status === 'open' && user?.userTypeId === 3 && (!match.maxTeams || match.countTeams < match.maxTeams) && (
                  <Button variant="success" onClick={() => setShowSelectTeamPlayers(true)}>Vincular meu Time</Button>
                )}
              </div>
            )}
          </div>
            <div className='d-flex gap-2 container justify-content-center'>
              {canDeleteMatch && (
                <Button
                  variant="danger"
                  onClick={() => {
                    if (hasTeams) {
                      toast.error('Remova os times vinculados antes de excluir.');
                      return;
                    }
                    setOpenDeleteConfirm(true);
                  }}
                  disabled={hasTeams}
                >
                  <DeleteIcon /> Excluir Partida
                </Button>
              )}     
                <Button
                  style={{
                    background: '#1976d2',
                    border: 'none',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: '0 3px 10px rgba(25,118,210,0.35)'
                  }}
                  onClick={() => navigate(`/matches/edit/${id}`)}
                >
                  <EditIcon/> Editar Partida 
                </Button>

                <Button
                  style={{
                    background: 'transparent',
                    border: '2px solid #1976d2',
                    color: '#1976d2',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                  onClick={() => setEditRules(true)}
                >
                  <EditIcon/> Editar Regras   
                </Button>
              
            </div>
        </div>

        {user?.userTypeId==2 ?
          <div className='d-flex gap-2 justify-content-center my-3'>
            <Button variant="secondary" onClick={() => navigate(`/matches/edit/${id}`)}><EditIcon /> Editar Partida</Button>
            <Button variant="info" onClick={() => setEditRules(true)}><EditIcon /> Editar Regras</Button>
            {/* ✅ Botão corrigido com função específica */}
            <Button variant="warning" onClick={handlePunicaoClick}>
              <GavelIcon /> {hasPunicao ? 'Visualizar punição' : 'Aplicar punição'}
            </Button>
            {canDeleteMatch && <Button variant="danger" onClick={() => setOpenDeleteConfirm(true)}><DeleteIcon /> Excluir Partida</Button>}
          </div>
          :
          null
        }
        {/* Modals */}
        <ModalTeams show={modalTeams} onHide={() => setModalTeams(false)} matchid={Number(id)} />
        <SelectTeamPlayersModal show={showSelectTeamPlayers} onHide={() => setShowSelectTeamPlayers(false)} matchId={Number(id)} onSuccess={() => getTimeInscrito(id!)} />
        <EditRulesModal show={editRules} onHide={() => setEditRules(false)} onClose={() => setEditRules(false)} userId={Number(user?.id)} partidaDados={match} />
        
        
        <PunicaoRegisterModal 
          show={punicaoRegisterModal} 
          onHide={() => setPunicaoRegisterModal(false)} 
          onClose={() => {
            setPunicaoRegisterModal(false);
            
            checkPunicao(id!);
          }} 
          team={match} 
        />
        <PunicaoInfoModal 
          show={punicaoInfoModal} 
          onHide={() => setPunicaoInfoModal(false)} 
          onClose={() => setPunicaoInfoModal(false)} 
          team={match} 
          idMatch={match.id}
        />

        {/* Delete Confirm */}
        <Dialog open={openDeleteConfirm} onClose={() => setOpenDeleteConfirm(false)}>
          <DialogTitle>Confirmar Exclusão</DialogTitle>
          <DialogContent>
            <DialogContentText>Tem certeza de que deseja excluir esta partida? Esta ação é irreversível.</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDeleteConfirm(false)}>Cancelar</Button>
            <Button onClick={handleDeleteMatch} autoFocus>Excluir</Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};

export default MatchDetail;