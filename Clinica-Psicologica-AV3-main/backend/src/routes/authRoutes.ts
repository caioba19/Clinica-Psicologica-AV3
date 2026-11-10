import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { NodeAuthService } from '../services/NodeAuthService';
import { UserRepository } from '../repositories/UserRepository';
import { authenticateToken, requireRole } from '../middlewares/authMiddleware';
import { AuditLogRepository } from '../repositories/AuditLogRepository';
import { NodeAuditLogService } from '../services/NodeAuditLogService';
import { loginRateLimit } from '../middlewares/loginRateLimit';
import { PasswordResetRepository } from '../repositories/PasswordResetRepository';
import { NodePasswordResetService } from '../services/NodePasswordResetService';
import { EmailDeliveryService } from '../services/EmailDeliveryService';

const authRoutes = Router();

const repository = new UserRepository();
const service = new NodeAuthService(repository);
const passwordResetService = new NodePasswordResetService(repository, new PasswordResetRepository(), new EmailDeliveryService());
const auditLogService = new NodeAuditLogService(new AuditLogRepository());
const controller = new AuthController(service, auditLogService, passwordResetService);

// Rota pública de login e logout
authRoutes.post('/auth/login', loginRateLimit, controller.login);
authRoutes.post('/auth/password/forgot', loginRateLimit, controller.requestPasswordReset);
authRoutes.post('/auth/password/reset', loginRateLimit, controller.resetPassword);
authRoutes.get('/auth/me', authenticateToken, controller.me);
authRoutes.post('/auth/logout', authenticateToken, controller.logout);
authRoutes.patch('/auth/password', authenticateToken, controller.updatePassword);
authRoutes.patch('/auth/profile', authenticateToken, controller.updateProfile);

// Rotas protegidas (Administrador)
authRoutes.get('/users', authenticateToken, requireRole(['administrador']), controller.getUsers);
authRoutes.post('/users', authenticateToken, requireRole(['administrador']), controller.createUser);
authRoutes.patch('/users/:id', authenticateToken, requireRole(['administrador']), controller.updateUser);
authRoutes.patch('/users/:id/situacao', authenticateToken, requireRole(['administrador']), controller.updateSituacao);

export { authRoutes };
