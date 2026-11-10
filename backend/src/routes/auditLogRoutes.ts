import { Router } from 'express';
import { AuditLogController } from '../controllers/auditLogController';
import { NodeAuditLogService } from '../services/NodeAuditLogService';
import { AuditLogRepository } from '../repositories/AuditLogRepository';
import { authenticateToken, requireRole } from '../middlewares/authMiddleware';

const auditLogRoutes = Router();

const repository = new AuditLogRepository();
const service = new NodeAuditLogService(repository);
const controller = new AuditLogController(service);

auditLogRoutes.get('/audit-logs', authenticateToken, requireRole(['administrador']), controller.getAll);

export { auditLogRoutes };
