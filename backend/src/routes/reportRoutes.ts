import { Router } from 'express';
import { authenticateToken, requireRole } from '../middlewares/authMiddleware';
import { ReportController } from '../controllers/reportController';
import { ReportRepository } from '../repositories/ReportRepository';
const routes = Router();
const controller = new ReportController(new ReportRepository());
routes.get('/reports/summary', authenticateToken, requireRole(['administrador', 'psicologo']), controller.summary);
export { routes as reportRoutes };
