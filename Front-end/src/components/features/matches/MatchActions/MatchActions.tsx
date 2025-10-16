import React from 'react';
import { Button } from 'react-bootstrap';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import './MatchActions.css';

interface MatchActionsProps {
  canDelete: boolean;
  canEdit: boolean;
  isCompleted: boolean;
  canApplyPunishment: boolean;
  onDelete: () => void;
  onEdit: () => void;
  onEditRules: () => void;
  onPunishment: () => void;
  onEvaluate: () => void;
  onViewComments: () => void;
  onFinalize?: () => void;
  onViewEvents?: () => void;
}

export const MatchActions: React.FC<MatchActionsProps> = ({
  canDelete,
  canEdit,
  isCompleted,
  canApplyPunishment,
  onDelete,
  onEdit,
  onEditRules,
  onPunishment,
  onEvaluate,
  onViewComments,
  onFinalize,
  onViewEvents
}) => {
  return (
    <div className="match-actions d-flex flex-wrap justify-content-center gap-2 my-3">
      {/* Grupo de botões administrativos */}
      {(canDelete || canEdit) && (
        <div className="action-group d-flex flex-wrap gap-2">
          {canDelete && (
            <Button className="btn-delete" onClick={onDelete}>
              <DeleteIcon /> Excluir Partida
            </Button>
          )}
          
          {canEdit && (
            <>
              {canApplyPunishment && (
                <Button className="btn-edit" onClick={onPunishment}>
                  Aplicar/Ver Punição
                </Button>
              )}
              
              <Button className="btn-edit" onClick={onEdit}>
                <EditIcon /> Editar Partida
              </Button>
              
              <Button className="btn-edit" onClick={onEditRules}>
                <EditIcon /> Editar Regras
              </Button>
            </>
          )}
        </div>
      )}

      {/* Grupo de ações do usuário */}
      <div className="action-group d-flex flex-wrap gap-2">
        <Button className="btn-primary-custom" onClick={onEvaluate}>
          Avaliar / Comentar
        </Button>
        
        <Button className="btn-secondary-custom" onClick={onViewComments}>
          Ver Comentários
        </Button>
        
        {onFinalize && !isCompleted && (
          <Button className="btn-finalize" onClick={onFinalize}>
            Finalizar Partida
          </Button>
        )}
        
        {onViewEvents && isCompleted && (
          <Button className="btn-events" onClick={onViewEvents}>
            Eventos da Partida
          </Button>
        )}
      </div>
    </div>
  );
};
