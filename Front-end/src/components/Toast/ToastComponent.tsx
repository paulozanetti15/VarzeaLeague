import { useState, useEffect } from 'react';
import { Toast } from 'react-bootstrap';
import "./Toast.css";

interface Props {
  message: string;
  bg: string;
  onClose: () => void;
  autoHide?: boolean;
}

const ToastComponent = ({ message, bg, onClose, autoHide = true }: Props) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    setShow(true);
  }, [message]);

  const handleClose = () => {
    const toast = document.querySelector('.toast');
    if (toast) {
      toast.classList.add('toast-exit');
      setTimeout(() => {
        setShow(false);
        onClose();
      }, 300);
    } else {
      setShow(false);
      onClose();
    }
  };

  const toastClass = `toast-${bg}`;

  return (
    <div className="toast-container">
      <Toast 
        show={show} 
        onClose={handleClose} 
        delay={3000} 
        autohide={autoHide}
        className={toastClass}
        style={{ zIndex: 9999 }}
      >
        <Toast.Header>
          <strong className="me-auto">Notification</strong>
        </Toast.Header>
        <Toast.Body>{message}</Toast.Body>
      </Toast>
    </div>
  );
};

export default ToastComponent;