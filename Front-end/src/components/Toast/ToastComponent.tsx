import { useState, useEffect } from 'react';
import { Toast } from 'react-bootstrap';
import "./Toast.css";

interface Props {
  message: string;
  bg: string;
  onClose: () => void;
  show: boolean;
}

const ToastComponent: React.FC<Props> = ({ message, bg, onClose, show }) => {
  const [showToast, setShowToast] = useState(true);

  useEffect(() => {
    setShowToast(true);
  }, [message]);

  const handleClose = () => {
    const toast = document.querySelector('.toast');
    if (toast) {
      toast.classList.add('toast-exit');
      setTimeout(() => {
        setShowToast(false);
        onClose();
      }, 300);
    } else {
      setShowToast(false);
      onClose();
    }
  };

  const toastClass = `toast-${bg}`;

  return (
    <div className={`toast-container ${show ? 'show' : ''}`}>
      <Toast 
        show={showToast} 
        onClose={handleClose} 
        delay={3000} 
        autohide={true}
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