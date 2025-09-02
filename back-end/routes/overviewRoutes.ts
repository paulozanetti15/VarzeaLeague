import { Router } from 'express';
import { getOverview, searchOverviewEntities } from '../controllers/overviewController';

const router = Router();

router.get('/', getOverview);
router.get('/search', searchOverviewEntities);

export default router;
