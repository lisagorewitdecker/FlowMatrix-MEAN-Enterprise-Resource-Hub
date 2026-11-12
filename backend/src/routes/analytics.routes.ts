import { Router } from 'express';
import { getProjectAnalytics } from '../controllers/analytics.controller';
import { verifyToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

router.get('/', verifyToken, requireRole(['Admin', 'Manager', 'Contributor']), getProjectAnalytics);

export default router;
