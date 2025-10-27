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
    >
      <Modal.Header className="bg-danger text-white">
        <Modal.Title>
          <i className="fas fa-edit me-2"></i>
          <strong>Alterar Punição</strong>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="bg-light">
        <div className="container-fluid">
          {/* Alert de orientação */}
          <div className="alert alert-info border-0 mb-4">
            <i className="fas fa-info-circle me-2 text-primary"></i>
            <strong>Modificar Punição:</strong> Altere os dados da punição aplicada à partida.
          </div>

          {/* Mensagens de erro/sucesso */}
          {error && (
            <div className="alert alert-danger mb-3">
              <i className="fas fa-exclamation-triangle me-2"></i>
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success mb-3">
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
            <div className="row g-3">
              {/* Time Punido */}
              <div className="col-12">
                <div className="form-floating">
                  <select
                    className="form-select"
                    id="idtime"
                    name="idtime"
                    onChange={(e)=>handleSelectChange(e)}
                    value={formData.idtime}
                    style={{height: '58px'}}
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
                  <label htmlFor="idtime" className="text-danger fw-bold">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    Time Punido
                  </label>
                </div>
              </div>

              {/* Motivo da Punição */}
              <div className="col-12">
                <div className="form-floating">
                  <select
                    className="form-select"
                    id="motivo"
                    name="motivo"
                    value={formData.motivo}
                    onChange={(e)=>handleSelectChange(e)}
                    style={{height: '58px'}}
                  >
                    <option value="">Selecione um motivo</option>
                    <option value="Desistencia">Desistência</option>
                    <option value="Atraso">Atraso</option>
                    <option value="Jogadores Insuficientes">Jogadores Insuficientes</option>
                    <option value="Falta de Comparecimento">Falta de Comparecimento</option>
                  </select>
                  <label htmlFor="motivo" className="text-primary fw-bold">
                    <i className="fas fa-clipboard-list me-2"></i>
                    Motivo da Punição
                  </label>
                </div>
              </div>

              {/* Time da Casa */}
              <div className="col-md-6">
                <div className="form-floating">
                  <select
                    className="form-select"
                    id="team_home"
                    name="team_home"
                    value={formData.team_home}
                    onChange={(e)=>handleSelectChange(e)}
                    style={{height: '58px'}}
                  >
                    <option value="">Selecione o time da casa</option>
                    {Array.isArray(dataTeams) && dataTeams.map((team: any) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                  <label htmlFor="team_home" className="text-success fw-bold">
                    <i className="fas fa-home me-2"></i>
                    Time da Casa
                  </label>
                </div>
              </div>

              {/* Time Visitante */}
              <div className="col-md-6">
                <div className="form-floating">
                  <select
                    className="form-select"
                    id="team_away"
                    name="team_away"
                    value={formData.team_away}
                    onChange={(e)=>handleSelectChange(e)}
                    style={{height: '58px'}}
                  >
                    <option value="">Selecione o time visitante</option>
                    {Array.isArray(dataTeams) && dataTeams.map((team: any) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                  <label htmlFor="team_away" className="text-info fw-bold">
                    <i className="fas fa-plane-departure me-2"></i>
                    Time Visitante
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal.Body>

      <Modal.Footer className="bg-light border-top">
        <Button
          variant="outline-warning"
          className="me-2 px-4"
          onClick={submitUpdate}
          disabled={!permitirAlteracao || loading || !formData.motivo || !formData.team_home || !formData.team_away || formData.team_home === formData.team_away}
        >
          <i className="fas fa-save me-2"></i>
          {loading ? "Alterando..." : "Alterar Punição"}
        </Button>
        <Button variant="outline-secondary" className="px-4" onClick={handleClose} disabled={loading}>
          <i className="fas fa-times me-2"></i>
          Fechar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PunishmentUpdateModal;