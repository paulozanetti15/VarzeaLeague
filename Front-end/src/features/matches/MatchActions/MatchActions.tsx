import React from 'react';
import { Button } from 'react-bootstrap';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

import GavelIcon from '@mui/icons-material/Gavel';
import DescriptionIcon from '@mui/icons-material/Description';
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
  isWo?: boolean;
  hasPunishment?: boolean;
  disableComments?: boolean;
  hasSumula?: boolean;
  hasUserEvaluation?: boolean;
  onDelete: () => void;
  onEdit: () => void;
  onEditRules: () => void;
  onPunishment: () => void;
  onEvaluate: () => void;
  onViewComments: () => void;
  onViewEvents?: () => void;
  onCreateSumula?: () => void;
}

export const MatchActions: React.FC<MatchActionsProps> = ({
  canDelete,
  canEdit,
  isCompleted,
  canApplyPunishment,
  isWo,
  hasPunishment,
  disableComments,
  userTypeId,
  teamsCount,
  registrationDeadline,
  matchStatus,
  hasUserEvaluation,
  onDelete,
  onEdit,
  onEditRules,
  onPunishment,
  onEvaluate,
  onViewComments,
  onViewEvents,
  hasSumula,
  onCreateSumula
}) => {
  const canEditMatchAndRules = userTypeId === 1 || userTypeId === 2;
  const isCancelled = matchStatus === 'cancelada';
  
  const hasMinimumTeams = teamsCount >= 2;
  const isPastDeadline = registrationDeadline 
    ? new Date() > new Date(registrationDeadline) 
    : false;
  const canShowPunishment = canApplyPunishment && hasMinimumTeams && isPastDeadline;
  const showApplyPunishmentButton = canEdit && canShowPunishment && matchStatus === 'confirmada' && !hasPunishment;
  const showViewPunishmentButton = canEdit && hasPunishment && (matchStatus === 'confirmada' || matchStatus === 'finalizada');
  const canCreateSumula = userTypeId === 2
  const canViewEvents =userTypeId === 1 || userTypeId === 3 ;

  return (
    <div className="match-actions d-flex flex-wrap justify-content-center gap-2 my-3">
      {(canDelete || canEdit) && (
        <div className="action-group d-flex flex-wrap gap-2">
          {(canEdit && canEditMatchAndRules) && (
            <Button className="btn-delete" onClick={onDelete}>
              <DeleteIcon /> Excluir Partida
            </Button>
          )}
          
          {showApplyPunishmentButton && (
            <Button className="btn-edit btn-punishment" onClick={onPunishment}>
              <GavelIcon style={{ marginRight: 4 }} />
              Aplicar Punição
            </Button>
          )}

          {showViewPunishmentButton && (
            <Button className="btn-edit btn-punishment" onClick={onPunishment}>
              <GavelIcon style={{ marginRight: 4 }} />
              Ver Punição
            </Button>
          )}
          
          {canEdit && canEditMatchAndRules && (
            <>
              <Button className="btn-edit" onClick={onEdit}>
                <EditIcon /> Editar Partida
              </Button>
              
              <Button className="btn-edit btn-edit-rules" onClick={onEditRules}>
                <EditIcon /> Editar Regras
              </Button>
            </>
          )}
        </div>
      )}

      <div className="action-group d-flex flex-wrap gap-2">
        {(() => {
            if (disableComments !== undefined) return isCompleted && !disableComments;
            return isCompleted && !isWo && !hasPunishment;
          })() && (
          <>
            <Button className="btn-primary-custom" onClick={onEvaluate}>
              {hasUserEvaluation ? 'Ver meu comentário' : 'Avaliar / Comentar'}
            </Button>
            
            <Button className="btn-secondary-custom" onClick={onViewComments}>
              Ver Comentários
            </Button>
          </>
        )}
        
        {(() => {
          const statusLower = String(matchStatus || '').toLowerCase();
          const allowedStatuses = [ 'finalizada'];
          const canShowFinalize = allowedStatuses.includes(statusLower) && isCompleted && !isCancelled && canCreateSumula;
          const buttonText = (hasPunishment || isWo || hasSumula) ? 'Ver súmula' : 'Registrar súmula';
          
          return canShowFinalize ? (
            <Button className="btn-finalize btn-sumula" onClick={onCreateSumula}>
              <DescriptionIcon style={{ marginRight: 4 }} />
              {buttonText}
            </Button>
          ) : null;
        })()}

        {canViewEvents && isCompleted && hasSumula &&  (
          <Button className="btn-events" onClick={onViewEvents}>
            Sumula da Partida
          </Button>
        )}
      </div>
    </div>
  );
};
