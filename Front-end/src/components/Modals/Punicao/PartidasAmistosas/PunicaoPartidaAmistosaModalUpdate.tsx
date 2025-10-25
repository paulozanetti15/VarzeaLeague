import React from 'react';
import { Button, Modal } from 'react-bootstrap';
import { usePunicaoUpdate } from '../../../../hooks/usePunicaoUpdate';
import '../PunicaoModal.css';

interface PunicaoPartidaAmistosaModal {
  show: boolean;
  onHide: () => void;
  onClose: () => void;
  idmatch: number;
}

const PunicaoUpdateModal: React.FC<PunicaoPartidaAmistosaModal> = ({ 
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
      className="regras-modal"
      backdrop="static"
      keyboard={false}
      size="xl"
    > 
      <Modal.Body>
        <div className="modal-content-wrapper">
          <h2 className="modal-title">Alterar punição</h2>
          
          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}
          
          {success && (
            <div className="success-message">
              <p style={{ justifyContent: 'center', display: 'flex' }}>{success}</p>
            </div>
          )}
          
          <br/>
          
          {loading ? (
            <div style={{ textAlign: 'center', color: 'white' }}>
              Carregando...
            </div>
          ) : (
            <>
              <div className="form-group">
                <label style={{color:"white"}}>
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  Time Punido:
                </label>
                <select 
                  className="form-select" 
                  name="idtime" 
                  onChange={(e)=>handleSelectChange(e)}
                  value={formData.idtime} 
                  aria-label="Selecione o time"
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

              <div className="form-group">
                <label style={{color:"white"}}>
                  <i className="fas fa-home me-2"></i>
                  Time da Casa:
                </label>
                <select 
                  className="form-select" 
                  name="team_home" 
                  value={formData.team_home} 
                  onChange={(e)=>handleSelectChange(e)} 
                  aria-label="Selecione o time da casa"
                >
                  <option value="">Selecione o time da casa</option>
                  {Array.isArray(dataTeams) && dataTeams.map((team: any) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label style={{color:"white"}}>
                  <i className="fas fa-plane-departure me-2"></i>
                  Time Visitante:
                </label>
                <select 
                  className="form-select" 
                  name="team_away" 
                  value={formData.team_away} 
                  onChange={(e)=>handleSelectChange(e)} 
                  aria-label="Selecione o time visitante"
                >
                  <option value="">Selecione o time visitante</option>
                  {Array.isArray(dataTeams) && dataTeams.map((team: any) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label style={{color:"white"}}>
                    <i className="fas fa-clipboard-list me-2"></i>
                    Motivo:
                  </label>
                  <select 
                    className="form-select" 
                    name="motivo" 
                    value={formData.motivo} 
                    onChange={(e)=>handleSelectChange(e)} 
                    aria-label="Selecione o motivo"
                  >
                    <option value="">Selecione um motivo</option>
                    <option value="Desistencia">Desistência</option> 
                    <option value="Atraso">Atraso</option>
                    <option value="Jogadores Insuficientes">Jogadores Insuficientes</option>
                    <option value="Falta de Comparecimento">Falta de Comparecimento</option>
                  </select>
                </div>
              </div>
            </>
          )}
          
          <div className="modal-buttons">
            <button
              type="button"
              className="btn btn-warning"
              onClick={submitUpdate}   
              disabled={!permitirAlteracao || loading || !formData.motivo || !formData.team_home || !formData.team_away || formData.team_home === formData.team_away}
            >
              {loading ? "Alterando..." : "Alterar punição"}
            </button>
            <Button variant="secondary" onClick={handleClose} disabled={loading}>
              Fechar
            </Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default PunicaoUpdateModal;