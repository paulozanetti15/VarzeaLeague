import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import './SessionWarningModal.css';

interface SessionWarningModalProps {
  show: boolean;
  onExtend: () => void;
  onLogout: () => void;
  remainingTime: number; // em segundos
}

export const SessionWarningModal: React.FC<SessionWarningModalProps> = ({
  show,
  onExtend,
  onLogout,
  remainingTime: initialTime
}) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    if (!show) return;

    setTimeLeft(initialTime);
    
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          onLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [show, initialTime, onLogout]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Modal 
      show={show} 
      centered 
      backdrop="static" 
      keyboard={false}
      className="session-warning-modal"
    >
      <Modal.Header className="session-warning-header">
        <Modal.Title>⚠️ Sessão Expirando</Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="session-warning-body">
        <p>Sua sessão expirará em:</p>
        <div className="countdown-timer">
          {formatTime(timeLeft)}
        </div>
        <p>Deseja continuar usando o sistema?</p>
      </Modal.Body>
      
      <Modal.Footer className="session-warning-footer">
        <Button variant="outline-secondary" onClick={onLogout}>
          Sair
        </Button>
        <Button variant="primary" onClick={onExtend}>
          Continuar Sessão
        </Button>
      </Modal.Footer>
    </Modal>
  );
};