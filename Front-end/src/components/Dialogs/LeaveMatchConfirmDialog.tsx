import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './LeaveMatchConfirmDialog.css';

interface Props {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  teamName?: string;
  title?: string;
}

const LeaveMatchConfirmDialog: React.FC<Props> = ({ show, onClose, onConfirm, teamName, title }) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="leave-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="leave-modal-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="delete-modal-header">
              <h3 className="delete-modal-title">{title || 'Confirmar Saída'}</h3>
              <button className="delete-modal-close" onClick={onClose} aria-label="Fechar">×</button>
            </div>

            <div className="delete-modal-body">
              <p className="delete-modal-message">
                Tem certeza que deseja remover {teamName ? `o time "${teamName}" ` : 'este time '}da partida?
              </p>
            </div>

            <div className="delete-modal-footer">
              <button className="delete-modal-btn delete-modal-btn-cancel" onClick={onClose}>Cancelar</button>
              <button className="delete-modal-btn leave-modal-btn-confirm" onClick={onConfirm}>Confirmar Saída</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LeaveMatchConfirmDialog;
