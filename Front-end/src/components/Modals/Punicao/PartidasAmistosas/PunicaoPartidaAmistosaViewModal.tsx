import React, { useEffect, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import axios from 'axios';
import toast from 'react-hot-toast';
import './PunicaoViewModal.css';
import PunicaoUpdateModal from './PunicaoPartidaAmistosaModalUpdate';
import PunicaoDeleteModal from './PunicaoPartidaAmistosaModalDelete';

interface PunicaoViewModalProps {
  show: boolean;
  onHide: () => void;
  team: any;
  onClose: () => void;
  idMatch: number;
}

interface TeamInfo {
  id: number;
  name: string;
}

interface PunicaoData {
  id: number;
  idtime: number;
  motivo: string;
  team: TeamInfo;
  idMatch: number;
  team_home?: number;
  team_away?: number;
}

const PunicaoPartidaAmistosaViewModal: React.FC<PunicaoViewModalProps> = ({
  show,
  onHide,
  team,
  onClose,
  idMatch,
}) => {
  const [loading, setLoading] = useState(false);
  const [punicao, setPunicao] = useState<PunicaoData | null>(null);
  const [homeTeamName, setHomeTeamName] = useState<string>('');
  const [awayTeamName, setAwayTeamName] = useState<string>('');
  const [modalDeletePunicao, setModalDeletePunicao] = useState(false);
  const [modalUpdatePunicao, setModalUpdatePunicao] = useState(false);
  const [allTeams, setAllTeams] = useState<TeamInfo[]>([]);

  const token = localStorage.getItem('token');

  const fetchPunicao = async (idMatch: number) => {
    if (!token || !idMatch) return;
    
    try {
      setLoading(true);
      
      // Buscar punição
      const punicaoResponse = await axios.get(`http://localhost:3001/api/matches/${idMatch}/punicao`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (punicaoResponse.data && punicaoResponse.data.length > 0) {
        const punicaoData = punicaoResponse.data[0];
        setPunicao(punicaoData);
        
        // Buscar todos os times da partida
        const teamsResponse = await axios.get(`http://localhost:3001/api/matches/${idMatch}/join-team`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (teamsResponse.data) {
          setAllTeams(teamsResponse.data);
          
          // Identificar nomes dos times da casa e visitante
          const homeTeam = teamsResponse.data.find((t: TeamInfo) => t.id === punicaoData.team_home);
          const awayTeam = teamsResponse.data.find((t: TeamInfo) => t.id === punicaoData.team_away);
          
          setHomeTeamName(homeTeam?.name || 'Time da Casa');
          setAwayTeamName(awayTeam?.name || 'Time Visitante');
        }
      } else {
        toast.error('Nenhuma punição encontrada para esta partida');
        onClose();
      }
    } catch (error: any) {
      console.error('Erro ao buscar punição:', error);
      toast.error('Erro ao carregar dados da punição');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (show && idMatch) {
      fetchPunicao(idMatch);
    }
  }, [show, idMatch]);

  const handleUpdateClick = () => {
    setModalUpdatePunicao(true);
  };

  const handleDeleteClick = () => {
    setModalDeletePunicao(true);
  };

  const handleUpdateSuccess = () => {
    setModalUpdatePunicao(false);
    fetchPunicao(idMatch);
  };

  const handleDeleteSuccess = () => {
    setModalDeletePunicao(false);
    toast.success('Punição deletada com sucesso!');
    onClose();
    window.location.reload(); 
  };

  if (loading) {
    return (
      <Modal show={show} onHide={onHide} size="xl" centered>
        <Modal.Body className="text-center p-5">
          <div className="spinner-border text-danger mb-3" role="status" style={{width: '3rem', height: '3rem'}}>
            <span className="visually-hidden">Carregando...</span>
          </div>
          <p className="text-white">Carregando dados da punição...</p>
        </Modal.Body>
      </Modal>
    );
  }


  return (
    <>
      <Modal
        show={show}
        onHide={onHide}
        size="xl"
        centered
        className="punishment-view-modal"
      >
        <Modal.Header className="punishment-modal-header" style={{ background: 'transparent', border: 'none' }}>
          <div className="d-flex align-items-center w-100 justify-content-between">
            <div className="d-flex align-items-center">
              <i className="fas fa-gavel me-3 punishment-icon"></i>
              <div>
                <Modal.Title className="mb-0 text-white">
                  Punição por WO Aplicada
                </Modal.Title>
                <small className="text-white-50">Walk Over - Partida Finalizada</small>
              </div>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onHide}
            ></button>
          </div>
        </Modal.Header>
        
    <Modal.Body className="punishment-modal-body" style={{ background: 'transparent', minHeight: 400 }}>
        {punicao ? (
          <>
            <div style={{ background: 'linear-gradient(90deg, #a18cd1 0%, #fbc2eb 100%)', borderRadius: 12, padding: '20px 28px', color: '#2d2d2d', display: 'flex', alignItems: 'center', marginBottom: 24, boxShadow: '0 2px 12px rgba(161,140,209,0.10)' }}>
              <i className="fas fa-info-circle me-3 fs-4" style={{ color: '#6a11cb', fontSize: 28 }}></i>
              <div>
                <strong style={{ color: '#6a11cb', fontWeight: 700, fontSize: 18 }}>Partida encerrada por Walk Over (WO)</strong>
                <p className="mb-0 mt-1" style={{ color: '#2d2d2d', fontWeight: 500, fontSize: 16 }}>
                  Esta partida foi finalizada automaticamente. A súmula foi gerada.
                </p>
              </div>
            </div>
            <div className="punishment-details">
              <h5 className="section-title mb-3" style={{ color: '#fff', fontWeight: 700, fontSize: 24, letterSpacing: 0.5 }}>
                <i className="fas fa-clipboard-list me-2"></i>
                Detalhes da Punição
              </h5>
              <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 16 }}>
                <div style={{ minWidth: 200, background: 'linear-gradient(135deg, #2196f3 0%, #57b8ff 100%)', borderRadius: 14, boxShadow: '0 2px 12px rgba(33,118,174,0.10)', padding: '18px 16px', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginRight: 24 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, letterSpacing: 0.5, marginBottom: 6, textTransform: 'uppercase', color: '#222', display: 'flex', alignItems: 'center' }}>
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    Time punido
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 18, color: '#ffd6d6', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <span style={{ color: '#222' }}>{punicao.team?.name || 'Nome não disponível'}</span>
                  </div>
                </div>
                <div style={{ minWidth: 200, background: 'linear-gradient(135deg, #2196f3 0%, #57b8ff 100%)', borderRadius: 14, boxShadow: '0 2px 12px rgba(33,118,174,0.10)', padding: '18px 16px', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <div style={{ fontWeight: 700, fontSize: 14, letterSpacing: 0.5, marginBottom: 6, textTransform: 'uppercase', color: '#222', display: 'flex', alignItems: 'center' }}>
                    <i className="fas fa-file-alt me-2"></i>
                    Tipo da punição
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 18, color: '#ffd6d6', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <span style={{ color: '#222' }}>{punicao.motivo || 'Motivo não informado'}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center text-white py-5">
            <i className="fas fa-exclamation-circle mb-3" style={{fontSize: '3rem'}}></i>
            <p>Nenhuma punição encontrada para esta partida.</p>
          </div>
        )}
    </Modal.Body>

        <Modal.Footer className="punishment-modal-footer">
          {punicao && (
            <>
              <Button
                variant="warning"
                onClick={handleUpdateClick}
                className="d-flex align-items-center"
              >
                <i className="fas fa-edit me-2"></i>
                Alterar Punição
              </Button>
              
              <Button
                variant="danger"
                onClick={handleDeleteClick}
                className="d-flex align-items-center"
              >
                <i className="fas fa-trash me-2"></i>
                Deletar Punição
              </Button>
            </>
          )}
          
          <Button variant="secondary" onClick={onClose} className="d-flex align-items-center">
            <i className="fas fa-times me-2"></i>
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Deletar */}
      <PunicaoDeleteModal 
        show={modalDeletePunicao}
        onHide={() => setModalDeletePunicao(false)}
        onClose={handleDeleteSuccess}
        idmatch={idMatch}
      />

      {/* Modal de Atualizar */}
      <PunicaoUpdateModal 
        show={modalUpdatePunicao}
        onHide={() => setModalUpdatePunicao(false)}
        onClose={handleUpdateSuccess}
        team={team}
        idmatch={idMatch}
      />
    </>
  );
};

export default PunicaoPartidaAmistosaViewModal;
