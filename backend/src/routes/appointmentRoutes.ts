import { Router } from 'express';
import { AppointmentController } from '../controllers/appointmentController';
import { authenticateToken, requireRole } from '../middlewares/authMiddleware';
import { AppointmentRepository } from '../repositories/AppointmentRepository';
import { AuditLogRepository } from '../repositories/AuditLogRepository';
import { NodeAppointmentService } from '../services/NodeAppointmentService';
import { NodeAuditLogService } from '../services/NodeAuditLogService';

const appointmentRoutes = Router();
const audit = new NodeAuditLogService(new AuditLogRepository());
const controller = new AppointmentController(new NodeAppointmentService(new AppointmentRepository()), audit);

appointmentRoutes.get('/appointments/my', authenticateToken, requireRole(['paciente']), controller.getMine);
appointmentRoutes.get('/appointments', authenticateToken, requireRole(['administrador', 'psicologo']), controller.getByDate);
appointmentRoutes.post('/appointments', authenticateToken, requireRole(['administrador', 'psicologo']), controller.create);
appointmentRoutes.patch('/appointments/:id/status', authenticateToken, requireRole(['administrador', 'psicologo']), controller.updateStatus);

export { appointmentRoutes };
