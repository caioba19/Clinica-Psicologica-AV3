import { Router } from 'express';
import { SessionController } from '../controllers/sessionController';
import { NodeSessionService } from '../services/NodeSessionService';
import { SessionRepository } from '../repositories/SessionRepository';
import { authenticateToken, requireRole } from '../middlewares/authMiddleware';
import { AuditLogRepository } from '../repositories/AuditLogRepository';
import { NodeAuditLogService } from '../services/NodeAuditLogService';

const sessionRoutes = Router();

const repository = new SessionRepository();
const service = new NodeSessionService(repository);
const auditLogService = new NodeAuditLogService(new AuditLogRepository());
const controller = new SessionController(service, auditLogService);

sessionRoutes.get('/sessions', authenticateToken, requireRole(['administrador', 'psicologo']), controller.getByPatient);
sessionRoutes.get('/sessions/patient/:pacienteId', authenticateToken, requireRole(['administrador', 'psicologo']), controller.getByPatient);
sessionRoutes.post('/sessions', authenticateToken, requireRole(['administrador', 'psicologo']), controller.create);

export { sessionRoutes };
