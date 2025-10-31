import {getAllFriendlyMatchesHistory ,getAllChampionshipMatchesHistory,getMatchesByChampionshipHistory,adicionarSumulaPartidasAmistosas,buscarSumulaPartidaAmistosa,buscarSumulaPartidaCampeonato,deletarSumulaPartidaAmistosa,deletarSumulaPartidaCampeonato,atualizarSumulaPartidaAmistosa,atualizarSumulaPartidaCampeonato } from "../controllers/historyController";
import { authenticateToken } from '../middleware/auth';
import express from 'express';
const router=express.Router();
router.get("/:teamId/partidas-amistosas",authenticateToken,getAllFriendlyMatchesHistory)
router.get("/:teamId/partidas-campeonatos",authenticateToken,getAllChampionshipMatchesHistory)
router.get("/:teamId/partidas-campeonatos/:championshipId",authenticateToken,getMatchesByChampionshipHistory)
router.get("/sumula/:matchId",authenticateToken,buscarSumulaPartidaAmistosa)
router.get("/sumula-campeonato/:matchId",authenticateToken,buscarSumulaPartidaCampeonato)
router.post("/adicionar-sumula",authenticateToken,adicionarSumulaPartidasAmistosas)
router.put("/sumula/:matchId",authenticateToken,atualizarSumulaPartidaAmistosa)
router.put("/sumula-campeonato/:matchId",authenticateToken,atualizarSumulaPartidaCampeonato)
router.delete("/sumula/:matchId",authenticateToken,deletarSumulaPartidaAmistosa)
router.delete("/sumula-campeonato/:matchId",authenticateToken,deletarSumulaPartidaCampeonato)
export default router;