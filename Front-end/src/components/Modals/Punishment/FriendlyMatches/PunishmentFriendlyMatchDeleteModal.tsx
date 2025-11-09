import React from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { deletePunicao } from '../../../../services/matchesFriendlyServices';
import toast from 'react-hot-toast';
import './PunishmentFriendlyMatchDeleteModal.css';

interface PunishmentFriendlyMatchModalProps {
  show: boolean;
  onHide: () => void;
  onClose: () => void;
  idmatch: number;
}

const PunishmentFriendlyMatchDeleteModal: React.FC<PunishmentFriendlyMatchModalProps> = ({
  show,
  onHide,
  onClose,
  idmatch
}) => {


  const deletarPunicao = async (id: number) => {
    try {
      const loadingToast = toast.loading('Deletando punição...');
      const resp = await deletePunicao(id);
      toast.dismiss(loadingToast);
      
      if (resp.status === 200) {
        toast.success('Punição deletada com sucesso! Partida retornou para status confirmada.');
        onClose();
      }
    } catch (error: any) {
      console.error('Erro ao deletar punição:', error);
      toast.error(error.response?.data?.message || 'Erro ao deletar punição');
    }
  };



  const handleCancel = () => {
    onHide();
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      backdrop="static"
      keyboard={false}
      centered
      className="punishment-delete-modal"
    >
      <Modal.Header className="punishment-delete-header">
        <Modal.Title className="punishment-delete-title">
          <i className="fas fa-exclamation-triangle me-2"></i>
          Confirmar Exclusão
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="punishment-delete-body">
        <div className="punishment-delete-content">
          <div className="punishment-delete-icon">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <div className="punishment-delete-message">
            <h5 className="punishment-delete-question">Tem certeza?</h5>
            <p className="punishment-delete-text">
              Esta ação irá remover permanentemente a punição aplicada a esta partida.
              A partida voltará ao status de confirmada.
            </p>
            <div className="punishment-delete-warning">
              <i className="fas fa-exclamation-circle"></i>
              <span>Esta ação não pode ser desfeita.</span>
            </div>
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer className="punishment-delete-footer">
        <Button variant="outline-secondary" onClick={handleCancel} className="punishment-delete-btn-cancel">
          <i className="fas fa-times me-2"></i>
          Cancelar
        </Button>
        <Button variant="danger" onClick={()=>deletarPunicao(idmatch)} className="punishment-delete-btn-confirm">
          <i className="fas fa-trash me-2"></i>
          Confirmar Exclusão
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PunishmentFriendlyMatchDeleteModal;