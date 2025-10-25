import express from 'express';

import { authenticateToken } from '../middleware/auth';
import {busarPunicaoPartidaAmistosa,alterarPunicaoPartidaAmistosa,deletarPunicaoPartidaAmistosa, inserirPunicaoPartidaAmistosa} from '../controllers/PunicaoController';
const router = express.Router();

router.use(authenticateToken);
// Rotas para partidas amistosas


// Rotas para partidas de campeonato
//router.get('/:idCampeonato/punicao', CampeonatoController.getDadosPartida);
//router.post('/:idCampeonato/punicao', PunicaoController.inserirPunicaoCampeonato);
//router.put('/:idCampeonato/punicao', PunicaoController.alterarPunicaoCampeonato);
//router.delete('/:idCampeonato/punicao', PunicaoController.deletarPunicaoCampeonato);


export default router; 