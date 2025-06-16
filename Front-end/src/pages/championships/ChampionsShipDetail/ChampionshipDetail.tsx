import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
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
  const [teams] = useState<any[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showTeamSelectModal, setShowTeamSelectModal] = useState(false);
  const [userTeams, setUserTeams] = useState<any[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [isJoining, setIsJoining] = useState(false);

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
        const isAdmin = user.userType === 1;
        
        if (isCreator || isAdmin) {
          setHasEditPermission(true);
        }
        
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
  }, [id, navigate]);

  const handleDeleteChampionship = async () => {
    try {
      await api.championships.delete(Number(id));
      toast.success('Campeonato excluído com sucesso!');
      navigate('/championships');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao excluir campeonato');
    }
  };

  const handleJoinAsIndividual = async () => {
    try {
      setIsJoining(true);
      await api.championships.join(Number(id));
      toast.success('Você entrou no campeonato com sucesso!');
      const updatedChampionship = await api.championships.getById(Number(id));
      setChampionship(updatedChampionship);
      setIsJoining(false);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao entrar no campeonato');
      setIsJoining(false);
    }
  };

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
      const updatedChampionship = await api.championships.getById(Number(id));
      setChampionship(updatedChampionship);
      setIsJoining(false);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao entrar no campeonato com o time');
      setIsJoining(false);
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
              <button
                className="join-team-button"
                onClick={() => setShowTeamSelectModal(true)}
                disabled={isJoining || userTeams.length === 0}
              >
                {isJoining ? 'Entrando...' : 'Entrar com Time'}
              </button>
            </>
          )}
        </div>

        <div className="championship-teams-section">
          <h3>Times Participantes</h3>
          {teams && teams.length > 0 ? (
            <div className="teams-list">
              {teams.map((team) => (
                <div key={team.id} className="team-item">
                  {team.name}
                </div>
              ))}
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
          {userTeams.length > 0 ? (
            <>
              <p>Selecione um dos seus times para entrar no campeonato:</p>
              <div className="team-selection-list">
                {userTeams.map((team) => (
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
            <p>Você não tem times cadastrados. Crie um time antes de entrar no campeonato.</p>
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
