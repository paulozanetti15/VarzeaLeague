import { Router } from 'express';
import { getFeed, getMatchResults } from '../controllers/feedController';

const router = Router();

router.get('/', getFeed);
router.get('/results', getMatchResults);

export default router;
