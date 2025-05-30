import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, set } from 'date-fns';
import { ptBR, tr } from 'date-fns/locale';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import './MatchDetail.css';
import toast from 'react-hot-toast';
import RegrasFormInfoModal from '../../components/Modals/Regras/RegrasFormInfoModal';
import { Button } from 'react-bootstrap';
import axios from 'axios';
import { Card } from 'react-bootstrap';
import ModalTeams from '../../components/Modals/Teams/modelTeams';
const MatchDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeCadastrados, setTimeCadastrados] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [modal, setModal] = useState(false);
  const [DataLimite, setDataLimite] = useState<Date | null>(null);
  const getTimeInscrito = async (matchId: string) => {
    try {
      const response = await axios.get(`http://localhost:3001/api/matches/${matchId}/join-team`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setTimeCadastrados(response.data);
    } catch (error) {
      console.error('Erro ao buscar times cadastrados:', error);
    }
  };
  useEffect(() => {
    if (id) {
      getTimeInscrito(id);
    }
  }, [id]); 
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, []); // Add missing closing parenthesis for the first useEffect
  useEffect(() => {
    const fetchMatchDetailsInit = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:3001/api/matches/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })
        setMatch(response.data);
      }catch (err) {
        setError('Não foi possível carregar os detalhes da partida. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchMatchDetailsInit();
    }
  }, [id]);
  
  const handleLeaveMatch = async (id:number,teamid:number) => {
    id= Number(id);
    const response=await axios.delete(`http://localhost:3001/api/matches/${id}/join-team/${teamid}`, {
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
  const handleModalShow = () => {
    setModal(true);
  }  
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

  useEffect(() => {
    const fetchRegras = async () => {
      const regras = await axios.get(`http://localhost:3001/api/rules/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setDataLimite(regras.data.datalimiteinscricao.split(' ')[0]);   
    };
    fetchRegras();
    
  },[])

  if (loading) {
    return <div className="match-detail-container loading">Carregando detalhes da partida...</div>;
  }
  
  if (error) {
    return <div className="match-detail-container error">{error}</div>;
  }
  
  if (!match) {
    return <div className="match-detail-container error">Partida não encontrada.</div>;
  }
  const isLimitedDateExpired = (dateString: Date | null): boolean => {
    if (!dateString) return false; // or true, depending on your logic for null
    const diaAtual = new Date().getDate();
    const date = new Date(dateString).getDate();
    if (date < diaAtual) {
      return true;  
    }
    return false;
  }
  return (
    <div className="match-detail-container">
      <div className="top-navigation">
        <button 
          className="back-btn"
          onClick={() => navigate('/matches')} 
        >
          <ArrowBackIcon /> Voltar
        </button>
      </div>
      
      {error && (
        <div className="error-message">
          {error}
          <button className="dismiss-error" onClick={() => setError(null)}>×</button>
        </div>
      )}
      
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
          
          <div className="info-row">
            <div className="info-label">Local:</div>
            <div className="info-value">
              {match.location?.address || (typeof match.location === 'string' ? match.location : 'Endereço não informado')}
            </div>
          </div>
          <div className="info-row">
            <div className="info-label">Preço:</div>
            <div className="info-value">
              {formatPrice(match.price)}
            </div>
          </div>
          <div className="info-row">
            <div className="info-label">Vagas de times:</div>
            <div className="info-value">
              {match.countTeams}/{match.maxTeams}  
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
          <h3 >Times Participantes</h3>
          {timeCadastrados.length > 0 ? (
            <div className="teams-list d-flex flex-wrap justify-content-center" key={id}>
              {timeCadastrados.map((team: any) => (
                <Card className="team-card" key={team.id}> 
                  <Card.Body>
                    {team.banner &&
                      <Card.Img
                       src={`http://localhost:3001/uploads/teams/${team.banner}`} 
                       variant='top'
                       className="team-banner"
                      />
                    }
                    <div className='d-flex flex-column align-items-center text-center mt-3'>
                      <Card.Title className='team-name'>{team.name}</Card.Title>
                      <Button 
                        variant="outline-primary" 
                        onClick={() => handleLeaveMatch(Number(id), team.id)}
                        className="leave-match-btn"
                      >
                        Sair da Partida
                      </Button>
                    </div>  
                  </Card.Body>
                </Card>
              ))}
            </div>
          ) : (
            <div className="no-teams-message">
              <p>Nenhum time inscrito ainda.</p>
            </div>
          )}
          <div className="d-flex justify-content-center w-100">
            {(match.countTeams < match.maxTeams) && isLimitedDateExpired(DataLimite)==false &&
              <Button 
                variant="primary"
                className="mt-5"
                onClick={() =>handleModalShow()} // Exemplo: usar o primeiro time da lista
              >
                Cadastrar time
              </Button>
            }
            {modal && (
              <ModalTeams 
                show={modal} 
                onHide={handleModalClose} 
                matchid={match.id}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MatchDetail;