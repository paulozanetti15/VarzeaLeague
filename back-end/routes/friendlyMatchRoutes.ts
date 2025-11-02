import express from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  joinMatchByTeam,
  getMatchTeams,
  deleteTeamMatch,
  getTeamsAvailable,
  checkTeamsRuleCompliance
} from '../controllers/MatchTeamsController';
import {
  createMatch,
  listMatches,
  getMatch,
  deleteMatch,
  updateMatch,
  getMatchesByOrganizer,
  checkAndCancelMatchesWithInsufficientTeams
} from '../controllers/matchController';
import {
  listMatchEvaluations,
  upsertMatchEvaluation,
  getMatchEvaluationSummary
} from '../controllers/matchEvaluationController';
import {
  busarPunicaoPartidaAmistosa,
  alterarPunicaoPartidaAmistosa,
  deletarPunicaoPartidaAmistosa,
  inserirPunicaoPartidaAmistosa
} from '../controllers/PunicaoController';
import {
  finalizeMatch,
  addGoal,
  addCard,
  listEvents,
  deleteGoalEvent,
  deleteCardEvent,
  clearGoals,
  clearCards
} from '../controllers/matchEventsController';
import { getMatchPlayersForAdmin } from '../controllers/matchPlayersController';
import { getMatchRosterPlayers } from '../controllers/matchRosterController';

const router = express.Router();

router.post('/', authenticateToken, createMatch);
router.get('/', listMatches);
router.get('/organizer', authenticateToken, getMatchesByOrganizer);
router.post('/check-cancelled', authenticateToken, checkAndCancelMatchesWithInsufficientTeams);

router.get('/:id', getMatch);
router.put('/:id', authenticateToken, updateMatch);
router.delete('/:id', authenticateToken, deleteMatch);

router.post('/:id/teams', authenticateToken, joinMatchByTeam);
router.get('/:id/teams', authenticateToken, getMatchTeams);
router.delete('/:id/teams/:teamId', authenticateToken, deleteTeamMatch);
router.get('/:id/teams/available', authenticateToken, getTeamsAvailable);
router.get('/:id/teams/compliance', authenticateToken, checkTeamsRuleCompliance);

router.get('/:id/players', authenticateToken, getMatchPlayersForAdmin);
router.get('/:id/roster', authenticateToken, getMatchRosterPlayers);

router.post('/:id/finalize', authenticateToken, finalizeMatch);
router.get('/:id/events', authenticateToken, listEvents);

router.post('/:id/events/goals', authenticateToken, addGoal);
router.delete('/:id/events/goals/:eventId', authenticateToken, deleteGoalEvent);
router.delete('/:id/events/goals', authenticateToken, clearGoals);

router.post('/:id/events/cards', authenticateToken, addCard);
router.delete('/:id/events/cards/:eventId', authenticateToken, deleteCardEvent);
router.delete('/:id/events/cards', authenticateToken, clearCards);

router.get('/:id/evaluations', authenticateToken, listMatchEvaluations);
router.post('/:id/evaluations', authenticateToken, upsertMatchEvaluation);
router.get('/:id/evaluations/summary', authenticateToken, getMatchEvaluationSummary);

router.get('/:id/penalty', authenticateToken, busarPunicaoPartidaAmistosa);
router.post('/:id/penalty', authenticateToken, inserirPunicaoPartidaAmistosa);
router.put('/:id/penalty', authenticateToken, alterarPunicaoPartidaAmistosa);
router.delete('/:id/penalty', authenticateToken, deletarPunicaoPartidaAmistosa);

export default router;
