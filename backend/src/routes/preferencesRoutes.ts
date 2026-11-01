import { Router } from 'express';
import { authenticateToken, requireRole } from '../middlewares/authMiddleware';
import { PreferencesController } from '../controllers/preferencesController';
import { PreferencesRepository } from '../repositories/PreferencesRepository';

const routes = Router();
const controller = new PreferencesController(new PreferencesRepository());
routes.get('/preferences', authenticateToken, requireRole(['administrador', 'psicologo']), controller.get);
routes.put('/preferences', authenticateToken, requireRole(['administrador', 'psicologo']), controller.save);
export { routes as preferencesRoutes };
