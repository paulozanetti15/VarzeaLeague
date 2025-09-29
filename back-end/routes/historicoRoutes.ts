import { buscarPartidasAmistosas,buscarPartidasCampeonato,adicionarSumulaPartidasAmistosas,buscarPartidasAmistosasByMatch } from "../controllers/historicoPartidasController";
import { authenticateToken } from '../middleware/auth';
import express from 'express';
const router=express.Router();
router.get("/:id/buscarpartidaamistosa",authenticateToken,buscarPartidasAmistosas)
router.get("/:id/buscarpartidacampeonato",authenticateToken,buscarPartidasCampeonato)
router.post("/adicionar-sumula",authenticateToken,adicionarSumulaPartidasAmistosas)
router.get("/:idMatch/verificar-existencia-sumula",authenticateToken,buscarPartidasAmistosasByMatch)
export default router;