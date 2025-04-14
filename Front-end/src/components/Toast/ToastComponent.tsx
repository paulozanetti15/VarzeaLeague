import { useState, useEffect } from 'react';
import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';

interface ToastProps {
  message: string;
  bg?: string;
  onClose?: () => void;
  autoHide?: boolean;
}

function ToastComponent({ message, bg = 'success', onClose, autoHide = true }: ToastProps) {
  const [show, setShow] = useState(true);
  const handleClose = () => {
    setShow(false);
    if (onClose) {
      onClose();
    }
  };
  
  return (
    <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1070 }}>
      <Toast
        onClose={handleClose}
        show={show}
        delay={3000}
        autohide={autoHide}
        bg={bg as any}
      >
        <Toast.Header>
          <strong className="me-auto">Varzea League</strong>
        </Toast.Header>
        <Toast.Body className={bg === 'dark' ? 'text-white' : ''}>
          {message}
        </Toast.Body>
      </Toast>
    </ToastContainer>
  );
}

export default ToastComponent;