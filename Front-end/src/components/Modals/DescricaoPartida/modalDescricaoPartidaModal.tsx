import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
interface PartidaForm {
  show: boolean;
  onHide: () => void;
  local: String;
  timeAdversario : String
  Data : Date|string
  horario:Date|string
}
function converterData(Data: string): string {
  return Data.split("-").reverse().join("-");
}
function converterHora(Hora: string){
    return Hora.split(":").slice(0,2).join(":")
}
 
function PartidaEditForm({show,onHide,local,Data,horario,timeAdversario}:PartidaForm) {
    return (
        <Modal
            show={show}
            onHide={onHide}
            centered
            dialogClassName="custom-modal-width"
            contentClassName="small-modal-content"
        >
            <Modal.Header closeButton>
                <Modal.Title>Descrição da Partida</Modal.Title>
            </Modal.Header>
           <Modal.Body>
                <div className="rules-info">
                    <div className="rules-grid">
                        <div className="rule-item">
                            <h6 className="rule-title">Local</h6>
                            <p className="rule-value">{local}</p>
                        </div>
                        <div className="rule-item">
                            <h6 className="rule-title">Time Adversário</h6>
                            <p className="rule-value">{timeAdversario}</p>
                        </div>
                        <div className="rule-item">
                            <h6 className="rule-title">Data</h6>
                            <p className="rule-value">{converterData(Data)}</p>
                        </div>
                        <div className="rule-item">
                            <h6 className="rule-title">Horário</h6>
                            <p className="rule-value">{converterHora(horario.toLocaleString())}</p>
                        </div>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={onHide}>
                    Fechar
                </Button>
            </Modal.Footer>
        </Modal>
    ) 
}    
export default PartidaEditForm;