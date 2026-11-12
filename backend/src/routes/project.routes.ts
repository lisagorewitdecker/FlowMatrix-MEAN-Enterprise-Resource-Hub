import { Router } from 'express';
import {
  getProjects,
  createProject,
  deleteProject,
  updateProjectStatus
} from '../controllers/project.controller';
import { verifyToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

router.get('/', verifyToken, getProjects);
router.post('/', verifyToken, requireRole(['Admin', 'Manager', 'Contributor']), createProject);
router.patch('/:id/status', verifyToken, requireRole(['Admin', 'Manager', 'Contributor']), updateProjectStatus);
router.delete('/:id', verifyToken, requireRole(['Admin']), deleteProject);

export default router;
