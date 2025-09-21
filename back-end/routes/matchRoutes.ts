import express, { Request, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import {joinMatchByTeam,getMatchTeams, deleteTeamMatch,getTeamsAvailable, checkTeamsRuleCompliance} from '../controllers/MatchTeamsController';
import { createMatch, listMatches, getMatch, deleteMatch, updateMatch,getMatchesByTeam} from '../controllers/matchController';
import { listMatchEvaluations, upsertMatchEvaluation, getMatchEvaluationSummary } from '../controllers/matchEvaluationController';
import {busarPunicaoPartidaAmistosa,alterarPunicaoPartidaAmistosa,deletarPunicaoPartidaAmistosa, inserirPunicaoPartidaAmistosa} from '../controllers/PunicaoController';
import { finalizeMatch, addGoal, addCard, listEvents, deleteGoalEvent, deleteCardEvent } from '../controllers/matchEventsController';
import { getPlayerRanking } from '../controllers/playerRankingController';
const router = express.Router();

router.get('/:id/available', authenticateToken, getTeamsAvailable);
router.post('/', authenticateToken, createMatch);
router.get('/', listMatches);
router.get('/:id', getMatch);
router.delete('/:id', authenticateToken, deleteMatch);
router.post('/:id/join-team', authenticateToken, joinMatchByTeam);
router.get('/:id/join-team', authenticateToken, getMatchTeams);
router.delete('/:id/join-team/:teamId', authenticateToken, deleteTeamMatch);
router.get('/:id/check-teams-rule-compliance', authenticateToken, checkTeamsRuleCompliance);
router.put('/:id', authenticateToken, updateMatch);
router.get('/teams/:id', authenticateToken, getMatchesByTeam);

router.get('/:id/evaluations', listMatchEvaluations); 
router.get('/:id/evaluations/summary', getMatchEvaluationSummary); 
router.post('/:id/evaluations', authenticateToken, upsertMatchEvaluation); 

router.post('/:id/finalize', authenticateToken, finalizeMatch);
router.post('/:id/goals', authenticateToken, addGoal);
router.post('/:id/cards', authenticateToken, addCard);
router.get('/:id/events', authenticateToken, listEvents);
router.delete('/:id/goals/:goalId', authenticateToken, deleteGoalEvent);
router.delete('/:id/cards/:cardId', authenticateToken, deleteCardEvent);
router.get('/ranking/jogadores', authenticateToken, getPlayerRanking);

router.get('/:idAmistosaPartida/punicao',authenticateToken,busarPunicaoPartidaAmistosa );
router.post('/:idAmistosaPartida/punicao',authenticateToken,inserirPunicaoPartidaAmistosa );
router.put('/:idAmistosaPartida/punicao',authenticateToken,alterarPunicaoPartidaAmistosa );
router.delete('/:idAmistosaPartida/punicao',authenticateToken, deletarPunicaoPartidaAmistosa );
 
export default router; 