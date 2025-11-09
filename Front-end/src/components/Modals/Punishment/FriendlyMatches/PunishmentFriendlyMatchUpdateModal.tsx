
import React from 'react';
import { Button, Modal } from 'react-bootstrap';
import { usePunicaoUpdate } from '../../../../hooks/usePunicaoUpdate';

interface PunishmentFriendlyMatchModal {
  show: boolean;
  onHide: () => void;
  onClose: () => void;
  idmatch: number;
}

const PunishmentUpdateModal: React.FC<PunishmentFriendlyMatchModal> = ({ 
  show, 
  onHide, 
  onClose,
  idmatch 
}) => {
  const {
    formData,
    dataTeams,
    loading,
    error,
    success,
    permitirAlteracao,
    handleSelectChange,
    submitUpdate,
    resetMessages
  } = usePunicaoUpdate(show, idmatch, onClose);

  const handleClose = () => {
    resetMessages();
    onClose();
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      backdrop="static"
      keyboard={false}
      size="lg"
      centered
      className="punishment-modal"
    >
      <div className="punishment-modal-header">
        <h2 className="modal-title">
          <i className="fas fa-edit me-2"></i>
          Alterar Punição
        </h2>
        <button type="button" className="btn-close" aria-label="Fechar" onClick={handleClose} style={{position: 'absolute', top: 16, right: 20, zIndex: 2}} />
      </div>
      <div className="punishment-modal-body">
        <div className="alert alert-info mb-3" style={{border: '2px solid #3498db', borderRadius: 12}}>
          <i className="fas fa-info-circle me-2 text-primary"></i>
          <strong>Modificar Punição:</strong> Altere os dados da punição aplicada à partida.
        </div>
        {error && (
          <div className="alert alert-danger mb-3" style={{border: '2px solid #e74c3c', borderRadius: 12}}>
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error}
          </div>
        )}
        {success && (
          <div className="alert alert-success mb-3" style={{border: '2px solid #27ae60', borderRadius: 12}}>
            <i className="fas fa-check-circle me-2"></i>
            {success}
          </div>
        )}
        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-danger mb-3" role="status">
              <span className="visually-hidden">Carregando...</span>
            </div>
            <p className="text-muted">Carregando dados da punição...</p>
          </div>
        ) : (
          <div className="punishment-grid">
            <div className="punishment-card punishment-card-danger">
              <div className="punishment-card-header">
                <i className="fas fa-exclamation-triangle me-2"></i>
                Time Punido
              </div>
              <div className="punishment-card-body">
                <select
                  className="form-select mb-2"
                  id="idtime"
                  name="idtime"
                  onChange={handleSelectChange}
                  value={formData.idtime}
                  style={{height: '48px'}}
                >
                  <option value={formData.idtime}>
                    {formData.nomeTime || "Selecione um time"}
                  </option>
                  {Array.isArray(dataTeams) && dataTeams
                    .filter((dado: any) => dado.name !== formData.nomeTime)
                    .map((dado: any) => (
                      <option key={dado.id} value={dado.id}>
                        {dado.name}
                      </option>
                    ))
                  }
                </select>
              </div>
            </div>
            <div className="punishment-card punishment-card-primary">
              <div className="punishment-card-header">
                <i className="fas fa-clipboard-list me-2"></i>
                Motivo da Punição
              </div>
              <div className="punishment-card-body">
                <select
                  className="form-select mb-2"
                  id="motivo"
                  name="motivo"
                  value={formData.motivo}
                  onChange={handleSelectChange}
                  style={{height: '48px'}}
                >
                  <option value="">Selecione um motivo</option>
                  <option value="Desistencia">Desistência</option>
                  <option value="Atraso">Atraso</option>
                  <option value="Jogadores Insuficientes">Jogadores Insuficientes</option>
                  <option value="Falta de Comparecimento">Falta de Comparecimento</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="punishment-modal-footer">
        <Button
          variant="outline-warning"
          className="me-2"
          onClick={submitUpdate}
          disabled={!permitirAlteracao || loading || !formData.motivo || !formData.idtime}
        >
          <i className="fas fa-save me-2"></i>
          {loading ? "Alterando..." : "Alterar Punição"}
        </Button>
        <Button variant="outline-secondary" onClick={handleClose} disabled={loading}>
          <i className="fas fa-times me-2"></i>
          Cancelar
        </Button>
      </div>
    </Modal>
  );
};

export default PunishmentUpdateModal;