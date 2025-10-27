import React from 'react';
import { Modal, Button } from 'react-bootstrap';

interface ModalShellProps {
  show: boolean;
  onHide: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  centered?: boolean;
  size?: 'sm' | 'lg' | 'xl' | undefined;
  className?: string;
  closeButton?: boolean;
}

const ModalShell: React.FC<ModalShellProps> = ({
  show,
  onHide,
  title,
  children,
  footer,
  centered = true,
  size,
  className,
  closeButton = true
}) => {
  return (
    <Modal
      show={show}
      onHide={onHide}
      centered={centered}
      size={size}
      className={className}
      backdrop="static"
    >
      {title && (
        <Modal.Header closeButton={closeButton}>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
      )}

      <Modal.Body>{children}</Modal.Body>

      {footer && (
        <Modal.Footer>
          {footer}
        </Modal.Footer>
      )}
    </Modal>
  );
};

export default ModalShell;
