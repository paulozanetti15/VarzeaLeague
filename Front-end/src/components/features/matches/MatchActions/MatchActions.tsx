import React from 'react';
import { Button } from 'react-bootstrap';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import './MatchActions.css';

interface MatchActionsProps {
  canDelete: boolean;
  matchId: number;
  canEdit: boolean;
  isCompleted: boolean;
  canApplyPunishment: boolean;
  canDeleteMatch?: boolean;
  userTypeId?: number;
  teamsCount: number;
  registrationDeadline?: string | Date;
  matchStatus?: string;
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
  userTypeId,
  teamsCount,
  registrationDeadline,
  matchStatus,
  onDelete,
  onEdit,
  onEditRules,
  onPunishment,
  onEvaluate,
  onViewComments,
  onFinalize,
  onViewEvents
}) => {
  const canFinalizeMatch = userTypeId === 1 || userTypeId === 2;
  const canEditMatchAndRules = userTypeId === 1 || userTypeId === 2;
  const isCancelled = matchStatus === 'cancelada';
  
  const hasMinimumTeams = teamsCount >= 2;
  const isPastDeadline = registrationDeadline 
    ? new Date() > new Date(registrationDeadline) 
    : false;
  const canShowPunishment = canApplyPunishment && hasMinimumTeams && isPastDeadline;

  return (
    <div className="match-actions d-flex flex-wrap justify-content-center gap-2 my-3">
      {(canDelete || canEdit) && (
        <div className="action-group d-flex flex-wrap gap-2">
          {canDelete && (
            <Button className="btn-delete" onClick={onDelete}>
              <DeleteIcon /> Excluir Partida
            </Button>
          )}
          
          {canEdit && canShowPunishment && (
            <Button className="btn-edit" onClick={onPunishment}>
              Aplicar/Ver Punição
            </Button>
          )}
          
          {canEdit && canEditMatchAndRules && (
            <>
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

      <div className="action-group d-flex flex-wrap gap-2">
        {isCompleted && (
          <>
            <Button className="btn-primary-custom" onClick={onEvaluate}>
              Avaliar / Comentar
            </Button>
            
            <Button className="btn-secondary-custom" onClick={onViewComments}>
              Ver Comentários
            </Button>
          </>
        )}
        
        {onFinalize && !isCompleted && !isCancelled && canFinalizeMatch && (
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
