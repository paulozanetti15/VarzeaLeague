import { buscarPartidasAmistosas,buscarPartidasCampeonato,adicionarSumulaPartidasAmistosas } from "../controllers/historicoController";
import { authenticateToken } from '../middleware/auth';
import express from 'express';
const router=express.Router();
router.get("/:id/buscarpartidaamistosa",authenticateToken,buscarPartidasAmistosas)
router.get("/:id/buscarpartidacampeonato",authenticateToken,buscarPartidasCampeonato)
router.post("/adicionar-sumula",authenticateToken,adicionarSumulaPartidasAmistosas)
export default router;