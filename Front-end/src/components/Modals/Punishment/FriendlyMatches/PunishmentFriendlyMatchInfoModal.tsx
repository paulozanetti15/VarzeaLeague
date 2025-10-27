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
      <Modal show={show} onHide={onHide} size="lg" centered className="punishment-modal">
        <Modal.Header className="punishment-modal-header">
          <Modal.Title className="d-flex align-items-center">
            <i className="fas fa-gavel me-2"></i>
            Punição por WO Aplicada
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center py-5">
          <div className="spinner-border text-danger mb-3" role="status" style={{width: '3rem', height: '3rem'}}>
            <span className="visually-hidden">Carregando...</span>
          </div>
          <p className="text-muted mb-0">Carregando dados da punição...</p>
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
        className="punishment-modal"
      >
        <Modal.Header className="punishment-modal-header" closeButton>
          <Modal.Title className="d-flex align-items-center">
            <i className="fas fa-gavel me-2"></i>
            Punição por WO Aplicada
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body className="punishment-modal-body">
          {punicao ? (
            <>
              {/* Alert de informação */}
              <div className="alert alert-warning d-flex align-items-start mb-4">
                <i className="fas fa-exclamation-triangle me-3 mt-1"></i>
                <div>
                  <h6 className="alert-heading mb-1 fw-bold">Partida encerrada por Walk Over (WO)</h6>
                  <p className="mb-0 small">Esta partida foi finalizada automaticamente. A súmula foi gerada.</p>
                </div>
              </div>

              {/* Grid de informações */}
              <div className="punishment-grid">
                {/* Card Time Punido */}
                <div className="punishment-card punishment-card-danger">
                  <div className="punishment-card-header">
                    <i className="fas fa-users me-2"></i>
                    Time Punido
                  </div>
                  <div className="punishment-card-body">
                    <div className="punishment-card-icon">
                      <i className="fas fa-shield-alt"></i>
                    </div>
                    <div className="punishment-card-value">
                      {punicao.team?.name || 'Nome não disponível'}
                    </div>
                  </div>
                </div>

                {/* Card Tipo de Punição */}
                <div className="punishment-card punishment-card-primary">
                  <div className="punishment-card-header">
                    <i className="fas fa-file-alt me-2"></i>
                    Tipo da Punição
                  </div>
                  <div className="punishment-card-body">
                    <div className="punishment-card-icon">
                      <i className="fas fa-gavel"></i>
                    </div>
                    <div className="punishment-card-value">
                      {punicao.motivo || 'Motivo não informado'}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-5">
              <i className="fas fa-inbox text-muted mb-3" style={{fontSize: '3rem'}}></i>
              <p className="text-muted mb-0">Nenhuma punição encontrada para esta partida</p>
            </div>
          )}
        </Modal.Body>

        <Modal.Footer className="punishment-modal-footer">
          <div className="d-flex gap-2">
            {punicao && (
              <>
                <Button 
                  variant="outline-warning" 
                  size="sm"
                  onClick={handleUpdateClick}
                  className="d-flex align-items-center"
                >
                  <i className="fas fa-edit me-2"></i>
                  Alterar
                </Button>
                
                <Button 
                  variant="outline-danger" 
                  size="sm"
                  onClick={handleDeleteClick}
                  className="d-flex align-items-center"
                >
                  <i className="fas fa-trash me-2"></i>
                  Deletar
                </Button>
              </>
            )}
          </div>
          
          <Button 
            variant="secondary" 
            size="sm"
            onClick={onClose}
            className="d-flex align-items-center"
          >
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