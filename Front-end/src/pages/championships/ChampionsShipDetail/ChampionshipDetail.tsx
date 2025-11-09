import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getChampionshipTeams, getChampionshipById, deleteChampionship, leaveChampionshipWithTeam } from '../../../services/championshipsServices';
import { getUserTeams } from '../../../services/teamsServices';
import trophy from '../../../assets/championship-trophy.svg';
import './ChampionshipDetail.css';
import toast from 'react-hot-toast';
import { Button, Modal } from 'react-bootstrap';
import axios from 'axios';
import PunicaoCampeonatoRegisterModal from '../../../components/Modals/Punishment/Championships/PunishmentChampionshipRegisterModal';
import PunicaoCampeonatoModalInfo from '../../../components/Modals/Punishment/Championships/PunishmentChampionshipInfoModal';
import SelectTeamPlayersChampionshipModal from '../../../components/Modals/Teams/SelectTeamPlayersChampionshipModal';

interface Championship {
  id: number;
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  created_by: number;
  modalidade?: string;
  nomequadra?: string;
  logo?: string | null;
}

const ChampionshipDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [championship, setChampionship] = useState<Championship | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasEditPermission, setHasEditPermission] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [teams, setTeams] = useState<any[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showTeamSelectModal, setShowTeamSelectModal] = useState(false);
  const [userTeams, setUserTeams] = useState<any[]>([]);
  const [isLeavingTeamId, setIsLeavingTeamId] = useState<number | null>(null);
  const [showPunicaoRegister, setShowPunicaoRegister] = useState(false);
  const [showPunicaoInfo, setShowPunicaoInfo] = useState(false);

  const getChampionshipLogoUrl = (logo?: string | null) => {
    if (!logo) return null;
    if (logo.startsWith('/uploads')) {
      return `http://localhost:3001${logo}`;
    }
    return `http://localhost:3001/uploads/championships/${logo}`;
  };

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
    if (!id) return;
    try {
      console.log('Carregando times do campeonato:', id);
      const teamsData = await getChampionshipTeams(Number(id));
      console.log('Times carregados:', teamsData);
      setTeams(teamsData || []);
    } catch (err) {
      console.error('Erro ao carregar times:', err);
      setTeams([]);
    }
  }, [id]);

  const loadUserTeams = useCallback(async () => {
    try {
      const userTeamsData = await getUserTeams();
      setUserTeams(userTeamsData || []);
    } catch (err) {
      console.error('Erro ao carregar times do usuário:', err);
    }
  }, []);

  useEffect(() => {
    const fetchChampionship = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await getChampionshipById(Number(id));
        setChampionship(data);

        // Verificar permissões
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = Number(user.id);
        const userType = Number(user.userTypeId);
        
        setHasEditPermission(data.created_by === userId || userType === 1);
        setIsAdmin(userType === 1);

      } catch (err: any) {
        setError(err.message || 'Erro ao carregar campeonato');
        toast.error('Erro ao carregar dados do campeonato');
      } finally {
        setLoading(false);
      }
    };

    fetchChampionship();
    loadChampionshipTeams();
    loadUserTeams();
  }, [id, loadChampionshipTeams, loadUserTeams]);

  const handleDeleteChampionship = async () => {
    if (!id) return;
    
    try {
      await deleteChampionship(Number(id));
      toast.success('Campeonato excluído com sucesso!');
      navigate('/championships');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao excluir campeonato');
    }
  };

  const handleOpenPunicao = () => {
    setShowPunicaoRegister(true);
  };

  const handleOpenRankingClassificacao = () => {
    navigate(`/championships/${id}/ranking-times`);
  };

  const handleJoinChampionship = () => {
    if (availableUserTeams.length === 0) {
      toast.error('Você não possui times disponíveis para este campeonato');
      return;
    }
    setShowTeamSelectModal(true);
  };

  const handleLeaveChampionship = async (teamId: number) => {
    try {
      setIsLeavingTeamId(teamId);
      await leaveChampionshipWithTeam(Number(id), teamId);
      toast.success('Time removido do campeonato com sucesso!');
      await loadChampionshipTeams();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao remover time do campeonato');
    } finally {
      setIsLeavingTeamId(null);
    }
  };

  if (loading) {
    return (
      <div className="championship-detail-bg">
        <div className="championship-detail-container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Carregando campeonato...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !championship) {
    return (
      <div className="championship-detail-bg">
        <div className="championship-detail-container">
          <div className="error-container">
            <h2>Erro ao carregar campeonato</h2>
            <p>{error || 'Campeonato não encontrado'}</p>
            <button 
              className="back-button"
              onClick={() => navigate('/championships')}
            >
              Voltar para Campeonatos
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="championship-detail-bg">
      <div className="championship-detail-container">
        <motion.div
          className="championship-detail-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <img src={trophy} alt="Troféu" className="championship-detail-trophy" />
          <h1 className="championship-detail-title">{championship.name}</h1>
          <p className="championship-detail-subtitle">Detalhes do campeonato</p>
        </motion.div>

        <motion.div
          className="championship-detail-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="championship-info-section">
            <div className="championship-info-hero">
              {getChampionshipLogoUrl(championship.logo) && (
                <div className="championship-logo-hero">
                  <img 
                    src={getChampionshipLogoUrl(championship.logo)!} 
                    alt={championship.name}
                    className="championship-hero-image"
                  />
                </div>
              )}
              
              <div className="championship-info-content">
                <div className="info-grid-modern">
                  {championship.modalidade && (
                    <div className="info-card-modern">
                      <div className="info-icon">⚽</div>
                      <div className="info-content-modern">
                        <span className="info-label-modern">Modalidade</span>
                        <span className="info-value-modern">{championship.modalidade}</span>
                      </div>
                    </div>
                  )}
                  
                  {championship.nomequadra && (
                    <div className="info-card-modern">
                      <div className="info-icon">🏟️</div>
                      <div className="info-content-modern">
                        <span className="info-label-modern">Quadra</span>
                        <span className="info-value-modern">{championship.nomequadra}</span>
                      </div>
                    </div>
                  )}
                  
                  {championship.start_date && (
                    <div className="info-card-modern">
                      <div className="info-icon">📅</div>
                      <div className="info-content-modern">
                        <span className="info-label-modern">Data de Início</span>
                        <span className="info-value-modern">
                          {new Date(championship.start_date).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {championship.end_date && (
                    <div className="info-card-modern">
                      <div className="info-icon">🏁</div>
                      <div className="info-content-modern">
                        <span className="info-label-modern">Data de Fim</span>
                        <span className="info-value-modern">
                          {new Date(championship.end_date).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                
                {championship.description && (
                  <div className="championship-description-modern">
                    <h4 className="description-title-modern">Sobre o Campeonato</h4>
                    <p className="description-text-modern">{championship.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="championship-actions-section">
            <h3 className="section-title">Ações</h3>
            
            <div className="actions-grid">
              {hasEditPermission ? (
                <>
                  <button
                    className="action-btn edit-btn"
                    onClick={() => navigate(`/championships/${id}/edit`)}
                  >
                    <span className="btn-icon">✏️</span>
                    Editar Campeonato
                  </button>
                  
                  <button
                    className="action-btn delete-btn"
                    onClick={() => setShowDeleteModal(true)}
                  >
                    <span className="btn-icon">🗑️</span>
                    Excluir Campeonato
                  </button>
                  
                  <button
                    className="action-btn warning-btn"
                    onClick={handleOpenPunicao}
                  >
                    <span className="btn-icon">⚠️</span>
                    Aplicar/Ver Punição
                  </button>
                  
                  <button
                    className="action-btn ranking-btn"
                    onClick={handleOpenRankingClassificacao}
                  >
                    <span className="btn-icon">🏆</span>
                    Ranking de Classificação
                  </button>
                </>
              ) : (
                <>
                  {availableUserTeams.length > 0 && (
                    <button
                      className="action-btn join-btn"
                      onClick={handleJoinChampionship}
                    >
                      <span className="btn-icon">➕</span>
                      Inscrever Time
                    </button>
                  )}
                  
                  {hasUserTeamInChampionship && (
                    <button
                      className="action-btn ranking-btn"
                      onClick={handleOpenRankingClassificacao}
                    >
                      <span className="btn-icon">🏆</span>
                      Ver Ranking
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="teams-section">
            <h3 className="section-title">Times Participantes</h3>
            
            {teams.length === 0 ? (
              <div className="no-teams-message">
                <p>Nenhum time inscrito neste campeonato ainda.</p>
              </div>
            ) : (
              <div className="teams-grid">
                {teams.map((team) => (
                  <div key={team.id} className="team-card">
                    <div className="team-logo">
                      {team.banner ? (
                        <img 
                          src={`http://localhost:3001/uploads/teams/${team.banner}`} 
                          alt={`Logo do ${team.name}`}
                          className="team-logo-img"
                        />
                      ) : (
                        <div className="team-logo-placeholder">
                          <span className="logo-text">FC</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="team-info">
                      <h4 className="team-name">{team.name}</h4>
                      
                      {team.description && (
                        <p className="team-description">{team.description}</p>
                      )}
                      
                      {team.estado && team.cidade && (
                        <div className="team-location">
                          <span className="location-icon">📍</span>
                          <span className="location-text">{team.cidade}, {team.estado}</span>
                        </div>
                      )}
                    </div>
                    
                    {hasEditPermission && (
                      <button
                        className="remove-team-btn"
                        onClick={() => handleLeaveChampionship(team.id)}
                        disabled={isLeavingTeamId === team.id}
                      >
                        {isLeavingTeamId === team.id ? 'Removendo...' : 'Remover'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Modal de Confirmação de Exclusão */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Confirmar Exclusão</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Tem certeza que deseja excluir o campeonato "{championship.name}"? 
            Esta ação não pode ser desfeita.
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
      </div>

      {/* Modal de Seleção de Time */}
      <SelectTeamPlayersChampionshipModal
        show={showTeamSelectModal}
        onHide={() => setShowTeamSelectModal(false)}
        championshipId={Number(id)}
        modalidade={championship.modalidade}
        onSuccess={async () => {
          await loadChampionshipTeams();
          try {
            const updated = await getChampionshipById(Number(id));
            setChampionship(updated);
          } catch {}
        }}
      />

      {/* Modais de Punição */}
      {(hasEditPermission || isAdmin) && (
        <>
          <PunicaoCampeonatoRegisterModal
            show={showPunicaoRegister}
            onHide={() => setShowPunicaoRegister(false)}
            onClose={() => setShowPunicaoRegister(false)}
            championshipId={Number(id)}
          />
          <PunicaoCampeonatoModalInfo
            show={showPunicaoInfo}
            onHide={() => setShowPunicaoInfo(false)}
            onClose={() => setShowPunicaoInfo(false)}
            championshipId={Number(id)}
          />
        </>
      )}
    </div>
  );
};

export default ChampionshipDetail;