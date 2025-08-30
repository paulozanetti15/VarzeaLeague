import { Router } from 'express';
import { getOverview, searchOverviewEntities } from '../controllers/overviewController';

const router = Router();

// Public overview endpoint
router.get('/', getOverview);
router.get('/search', searchOverviewEntities);

export default router;
