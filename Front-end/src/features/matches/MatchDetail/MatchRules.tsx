import React from 'react';
import { Button } from 'react-bootstrap';
import RegrasFormInfoModal from '../../../components/Modals/Rules/RegrasFormInfoModal';

interface MatchRulesProps {
  match: any;
  showRulesModal: boolean;
  onShowRulesModal: (show: boolean) => void;
}

const MatchRules: React.FC<MatchRulesProps> = ({ match, showRulesModal, onShowRulesModal }) => {
  return (
    <div className="match-description">
      <h3>Regras</h3>
      <Button
        className="view-rules-btn"
        variant="primary"
        onClick={() => onShowRulesModal(true)}
      >
        <i className="fas fa-clipboard-list me-2"></i>
        Visualizar regras
      </Button>
      {match && (
        <RegrasFormInfoModal
          idpartida={match.id}
          show={showRulesModal}
          onHide={() => onShowRulesModal(false)}
        />
      )}
    </div>
  );
};

export default MatchRules;
