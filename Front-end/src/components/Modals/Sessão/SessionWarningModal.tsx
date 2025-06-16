 import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import './modalSessao.css';

interface SessionWarningModalProps {
  show: boolean;
  onExtend: () => void;
  onLogout: () => void;
  remainingTime: number; // in seconds
}

export const SessionWarningModal: React.FC<SessionWarningModalProps> = ({
  show,
  onExtend,
  onLogout,
  remainingTime
}) => {
  const [timeLeft, setTimeLeft] = useState(remainingTime);

  useEffect(() => {
    if (show) {
      setTimeLeft(remainingTime);
      
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            onLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [show, remainingTime, onLogout]);

  // Reset timer when modal is hidden
  useEffect(() => {
    if (!show) {
      setTimeLeft(remainingTime);
    }
  }, [show, remainingTime]);

  return (
    <Modal
      show={show}
      backdrop="static"
      keyboard={false}
      centered
      className="session-warning-modal"
    >
      <Modal.Header className="session-warning-header">
        <Modal.Title>⚠️ Sua sessão está expirando</Modal.Title>
      </Modal.Header>
      <Modal.Body className="session-warning-body">
        <p>Sua sessão será encerrada em:</p>
        <div className="countdown-timer">{timeLeft}s</div>
        <p>Deseja continuar usando o sistema?</p>
      </Modal.Body>
      <Modal.Footer className="session-warning-footer">
        <button type="button" className="btn btn-secondary" onClick={onLogout}>
          Fazer Logout
        </button>
        <button type="button" className="btn btn-primary" onClick={onExtend}>
          Continuar Sessão
        </button>
      </Modal.Footer>
    </Modal>
  );
};