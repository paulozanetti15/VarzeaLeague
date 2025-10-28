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
      <Modal show={show} onHide={onHide} className="punishment-modal" size="lg" centered>
        <div className="punishment-modal-header">
          <h2 className="modal-title">
            <i className="fas fa-gavel me-2"></i>
            Punição por WO Aplicada
          </h2>
          <button type="button" className="btn-close" aria-label="Fechar" onClick={onClose} style={{position: 'absolute', top: 16, right: 20, zIndex: 2}} />
        </div>
        <div className="punishment-modal-body text-center">
          <div className="spinner-border text-danger mb-4" role="status" style={{width: '3rem', height: '3rem'}}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <h5 className="text-muted">Carregando dados da punição...</h5>
        </div>
      </Modal>
    );
  }

  return (
    <>
      <Modal
        show={show}
        onHide={onHide}
        className="punishment-modal"
        size="lg"
        centered
      >
        <div className="punishment-modal-header">
          <h2 className="modal-title">
            <i className="fas fa-gavel me-2"></i>
            Punição por WO Aplicada
          </h2>
          <button type="button" className="btn-close" aria-label="Fechar" onClick={onClose} style={{position: 'absolute', top: 16, right: 20, zIndex: 2}} />
        </div>
        <div className="punishment-modal-body">
          {punicao ? (
            <>
              <div className="alert alert-warning mb-4">
                <i className="fas fa-exclamation-triangle me-2"></i>
                Partida encerrada por Walk Over (WO). Esta partida foi finalizada automaticamente. A súmula foi gerada.
              </div>
              <div className="punishment-grid">
                <div className="punishment-card punishment-card-danger">
                  <div className="punishment-card-header">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    Time Punido
                  </div>
                  <div className="punishment-card-body">
                    <div className="punishment-card-icon">
                      <i className="fas fa-users"></i>
                    </div>
                    <div className="punishment-card-value">{punicao.team?.name || 'Nome não disponível'}</div>
                  </div>
                </div>
                <div className="punishment-card punishment-card-primary">
                  <div className="punishment-card-header">
                    <i className="fas fa-file-alt me-2"></i>
                    Tipo da Punição
                  </div>
                  <div className="punishment-card-body">
                    <div className="punishment-card-icon">
                      <i className="fas fa-gavel"></i>
                    </div>
                    <div className="punishment-card-value">{punicao.motivo || 'Motivo não informado'}</div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-5">
              <i className="fas fa-exclamation-circle text-muted mb-4" style={{fontSize: '4rem'}}></i>
              <h5 className="text-muted">Nenhuma punição encontrada para esta partida</h5>
            </div>
          )}
        </div>
        <div className="punishment-modal-footer">
          {punicao && (
            <>
              <Button variant="outline-warning" className="me-2" onClick={handleUpdateClick}>
                <i className="fas fa-edit me-2"></i>
                Alterar Punição
              </Button>
              <Button variant="outline-danger" className="me-2" onClick={handleDeleteClick}>
                <i className="fas fa-trash me-2"></i>
                Deletar Punição
              </Button>
            </>
          )}
        </div>
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
