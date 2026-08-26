import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { NodeAuthService } from '../services/NodeAuthService';
import { UserRepository } from '../repositories/UserRepository';
import { authenticateToken, requireRole } from '../middlewares/authMiddleware';

const authRoutes = Router();

const repository = new UserRepository();
const service = new NodeAuthService(repository);
const controller = new AuthController(service);

// Rota pública de login
authRoutes.post('/auth/login', controller.login);

// Rotas protegidas (Administrador)
authRoutes.get('/users', authenticateToken, requireRole(['administrador']), controller.getUsers);
authRoutes.post('/users', authenticateToken, requireRole(['administrador']), controller.createUser);
authRoutes.patch('/users/:id', authenticateToken, requireRole(['administrador']), controller.updateSituacao);
authRoutes.patch('/users/:id/situacao', authenticateToken, requireRole(['administrador']), controller.updateSituacao);

export { authRoutes };
