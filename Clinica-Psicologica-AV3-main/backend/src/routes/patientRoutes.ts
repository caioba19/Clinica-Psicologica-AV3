import { Router } from 'express';
import { PatientController } from '../controllers/patientController';
import { NodePatientService } from '../services/NodePatientService';
import { PatientRepository } from '../repositories/PatientRepository';
import { authenticateToken, requireRole } from '../middlewares/authMiddleware';
import { AuditLogRepository } from '../repositories/AuditLogRepository';
import { NodeAuditLogService } from '../services/NodeAuditLogService';

const patientRoutes = Router();

const repository = new PatientRepository();
const service = new NodePatientService(repository);
const auditLogService = new NodeAuditLogService(new AuditLogRepository());
const controller = new PatientController(service, auditLogService);

patientRoutes.get('/patients', authenticateToken, requireRole(['administrador', 'psicologo']), controller.getAll);
patientRoutes.get('/patients/:id', authenticateToken, requireRole(['administrador', 'psicologo']), controller.getById);
patientRoutes.post('/patients', authenticateToken, requireRole(['administrador', 'psicologo']), controller.create);
patientRoutes.patch('/patients/:id', authenticateToken, requireRole(['administrador', 'psicologo']), controller.update);

export { patientRoutes };
