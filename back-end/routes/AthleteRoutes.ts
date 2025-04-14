import { insertAthlete, getAthleteById, deleteAthlete,updateAthlete } from '../controllers/AthleteController';
import express from 'express';
const Router = express.Router();
import { authenticateToken } from '../middleware/auth';
Router.post('/',authenticateToken,insertAthlete)
Router.get('/:id',authenticateToken,getAthleteById)
Router.delete('/:id',authenticateToken,deleteAthlete)
Router.put('/:id',authenticateToken,updateAthlete)


export default Router;