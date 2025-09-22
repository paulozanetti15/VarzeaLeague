import { buscarPartidasAmistosas,buscarPartidasCampeonato } from "../controllers/historicoController";
import { authenticateToken } from '../middleware/auth';
import express from 'express';
const router=express.Router();
router.get("/:id/buscarpartidaamistosa",authenticateToken,buscarPartidasAmistosas)
router.get("/:id/buscarpartidacampeonato",authenticateToken,buscarPartidasCampeonato)
export default router;