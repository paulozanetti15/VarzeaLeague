import React, { useEffect, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { getPunicao } from '../../../../services/matchesFriendlyServices';
import toast from 'react-hot-toast';
import PunishmentUpdateModal from './PunishmentFriendlyMatchUpdateModal';
import PunishmentDeleteModal from './PunishmentFriendlyMatchDeleteModal';
import './PunishmentFriendlyMatchViewModal.css';
interface PunishmentViewModalProps {
  show: boolean;
  onHide: () => void;
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

const PunishmentFriendlyMatchViewModal: React.FC<PunishmentViewModalProps> = ({
  show,
  onHide,
  onClose,
  idMatch,
}) => {
  const [loading, setLoading] = useState(false);
  const [punicao, setPunicao] = useState<PunicaoData | null>(null);
  const [modalDeletePunicao, setModalDeletePunicao] = useState(false);
  const [modalUpdatePunicao, setModalUpdatePunicao] = useState(false);

  const token = localStorage.getItem('token');

  const fetchPunicao = async (idMatch: number) => {
    if (!token || !idMatch) return;
    
    try {
      setLoading(true);
      const resp = await getPunicao(idMatch);
      if (resp.data && resp.data.length > 0) {
        const punicaoData = resp.data[0];
        setPunicao(punicaoData);
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
        <Modal.Header className="bg-danger text-white">
          <Modal.Title>
            <i className="fas fa-gavel me-2"></i>
            <strong>Punição por WO Aplicada</strong>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-light text-center py-5">
          <div className="spinner-border text-danger mb-4" role="status" style={{width: '3rem', height: '3rem'}}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <h5 className="text-muted">Carregando dados da punição...</h5>
        </Modal.Body>
      </Modal>
    );
  }


  return (
    <>
      <Modal
        show={show}
        onHide={onHide}
        size="lg"
        centered
      >
        <Modal.Header className="bg-danger text-white">
          <Modal.Title>
            <i className="fas fa-gavel me-2"></i>
            <strong>Punição por WO Aplicada</strong>
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body className="bg-light">
          {punicao ? (
            <div className="container-fluid pfm-wrapper">
              <div className="alert alert-warning mb-4">
                <div className="d-flex align-items-center">
                  <i className="fas fa-exclamation-triangle text-warning me-3 fa-lg"></i>
                  <div>
                    <h6 className="alert-heading mb-1 fw-bold">Partida encerrada por Walk Over (WO)</h6>
                    <p className="mb-0">Esta partida foi finalizada automaticamente. A súmula foi gerada.</p>
                  </div>
                </div>
              </div>

              <div className="pfm-row">
                <div className="pfm-card card shadow-sm border-danger">
                  <div className="card-header bg-danger text-white text-center py-3">
                    <span className="pfm-title"><i className="fas fa-exclamation-triangle me-2"></i>Time Punido</span>
                  </div>
                  <div className="card-body text-center">
                    <div className="pfm-icon text-danger">
                      <i className="fas fa-users fa-2x"></i>
                    </div>
                    <p className="pfm-value mb-0">{punicao.team?.name || 'Nome não disponível'}</p>
                  </div>
                </div>

                <div className="pfm-card card shadow-sm border-primary">
                  <div className="card-header bg-primary text-white text-center py-3">
                    <span className="pfm-title"><i className="fas fa-file-alt me-2"></i>Tipo da Punição</span>
                  </div>
                  <div className="card-body text-center">
                    <div className="pfm-icon text-primary">
                      <i className="fas fa-gavel fa-2x"></i>
                    </div>
                    <p className="pfm-value mb-0">{punicao.motivo || 'Motivo não informado'}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-5">
              <i className="fas fa-exclamation-circle text-muted mb-4" style={{fontSize: '4rem'}}></i>
              <h5 className="text-muted">Nenhuma punição encontrada para esta partida</h5>
            </div>
          )}
        </Modal.Body>

        <Modal.Footer className="bg-light border-top d-flex justify-content-between">
          <div>
            {punicao && (
              <>
                <Button variant="outline-warning" className="me-2" onClick={handleUpdateClick}>
                  <i className="fas fa-edit me-2"></i>
                  Alterar Punição
                </Button>
                
                <Button variant="outline-danger" onClick={handleDeleteClick}>
                  <i className="fas fa-trash me-2"></i>
                  Deletar Punição
                </Button>
              </>
            )}
          </div>
          
          <Button variant="outline-secondary" onClick={onClose}>
            <i className="fas fa-times me-2"></i>
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Deletar */}
      <PunishmentDeleteModal 
        show={modalDeletePunicao}
        onHide={() => setModalDeletePunicao(false)}
        onClose={handleDeleteSuccess}
        idmatch={idMatch}
      />

      {/* Modal de Atualizar */}
      <PunishmentUpdateModal 
        show={modalUpdatePunicao}
        onHide={() => setModalUpdatePunicao(false)}
        onClose={handleUpdateSuccess}
        idmatch={idMatch}
      />
    </>
  );
};

export default PunishmentFriendlyMatchViewModal;
