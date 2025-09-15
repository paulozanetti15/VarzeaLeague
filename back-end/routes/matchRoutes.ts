import express, { Request, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import {joinMatchByTeam,getMatchTeams, deleteTeamMatch,getTeamsAvailable, checkTeamsRuleCompliance} from '../controllers/MatchTeamsController';
import { createMatch, listMatches, getMatch, deleteMatch, updateMatch,getMatchesByTeam} from '../controllers/matchController';
import { listMatchEvaluations, upsertMatchEvaluation, getMatchEvaluationSummary } from '../controllers/matchEvaluationController';
import {busarPunicaoPartidaAmistosa,alterarPunicaoPartidaAmistosa,deletarPunicaoPartidaAmistosa, inserirPunicaoPartidaAmistosa} from '../controllers/PunicaoController';
const router = express.Router();

// Aplicando middleware de autenticação antes dos controllers
router.get('/:id/available', authenticateToken, getTeamsAvailable);
router.post('/', authenticateToken, createMatch);
// Public read routes so listings and details are accessible to anonymous users
router.get('/', listMatches);
router.get('/:id', getMatch);
router.delete('/:id', authenticateToken, deleteMatch);
router.post('/:id/join-team', authenticateToken, joinMatchByTeam);
router.get('/:id/join-team', authenticateToken, getMatchTeams);
router.delete('/:id/join-team/:teamId', authenticateToken, deleteTeamMatch);
router.get('/:id/check-teams-rule-compliance', authenticateToken, checkTeamsRuleCompliance);
router.put('/:id', authenticateToken, updateMatch);
router.get('/teams/:id', authenticateToken, getMatchesByTeam);

// Avaliações da partida
router.get('/:id/evaluations', listMatchEvaluations); // pública
router.get('/:id/evaluations/summary', getMatchEvaluationSummary); // pública
router.post('/:id/evaluations', authenticateToken, upsertMatchEvaluation); // exige auth

router.get('/:idAmistosaPartida/punicao',authenticateToken,busarPunicaoPartidaAmistosa );
router.post('/:idAmistosaPartida/punicao',authenticateToken,inserirPunicaoPartidaAmistosa );
router.put('/:idAmistosaPartida/punicao',authenticateToken,alterarPunicaoPartidaAmistosa );
router.delete('/:idAmistosaPartida/punicao',authenticateToken, deletarPunicaoPartidaAmistosa );
 
export default router; 