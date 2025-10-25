import { buscarPartidasAmistosas,buscarPartidasCampeonato,adicionarSumulaPartidasAmistosas,buscarSumulaPartidaAmistosa,buscarSumulaPartidaCampeonato,deletarSumulaPartidaAmistosa,deletarSumulaPartidaCampeonato,atualizarSumulaPartidaAmistosa,atualizarSumulaPartidaCampeonato } from "../controllers/historicoController";
import { authenticateToken } from '../middleware/auth';
import express from 'express';
const router=express.Router();
router.get("/:id/buscarpartidaamistosa",authenticateToken,buscarPartidasAmistosas)
router.get("/:id/buscarpartidacampeonato",authenticateToken,buscarPartidasCampeonato)
router.get("/sumula/:matchId",authenticateToken,buscarSumulaPartidaAmistosa)
router.get("/sumula-campeonato/:matchId",authenticateToken,buscarSumulaPartidaCampeonato)
router.post("/adicionar-sumula",authenticateToken,adicionarSumulaPartidasAmistosas)
router.put("/sumula/:matchId",authenticateToken,atualizarSumulaPartidaAmistosa)
router.put("/sumula-campeonato/:matchId",authenticateToken,atualizarSumulaPartidaCampeonato)
router.delete("/sumula/:matchId",authenticateToken,deletarSumulaPartidaAmistosa)
router.delete("/sumula-campeonato/:matchId",authenticateToken,deletarSumulaPartidaCampeonato)
export default router;