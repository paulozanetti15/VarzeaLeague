import {insertRules,getAllRules,getRuleById,deleteRules,updateRules} from '../controllers/RulesController';
import express from 'express';
const Router = express.Router();
import { authenticateToken } from '../middleware/auth';
Router.post('/',authenticateToken,insertRules)
Router.get('/:id',authenticateToken,getRuleById)
Router.delete('/:id',authenticateToken,deleteRules)
Router.put('/:id',authenticateToken,updateRules)
Router.get('/ultimapartida',authenticateToken,getAllRules)


export default Router;