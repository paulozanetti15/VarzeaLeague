import React from 'react';
import { Button } from 'react-bootstrap';

interface SumulaActionsProps {
  isSaved: boolean;
  canSave: boolean;
  loading: boolean;
  isFormValid: boolean;
  onSave: () => void;
  onExportPDF: () => void;
  onClose: () => void;
}

export const SumulaActions: React.FC<SumulaActionsProps> = ({
  isSaved,
  canSave,
  loading,
  isFormValid,
  onSave,
  onExportPDF,
  onClose
}) => {
  return (
    <div className="d-flex gap-2 justify-content-end" style={{ marginBlock: "1rem" }}>
      {canSave && !isSaved && (
        <Button 
          variant="primary" 
          onClick={onSave}
          disabled={loading || !isFormValid}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
              Salvando...
            </>
          ) : (
            'Salvar Súmula'
          )}
        </Button>
      )}
      
      {isSaved && (
        <Button 
          variant="success" 
          onClick={onExportPDF}
        >
          <i className="fas fa-file-pdf me-2"></i>
          Exportar PDF
        </Button>
      )}
      
      <Button 
        variant="outline-secondary" 
        onClick={onClose} 
        disabled={loading}
      >
        Fechar
      </Button>
    </div>
  );
};
