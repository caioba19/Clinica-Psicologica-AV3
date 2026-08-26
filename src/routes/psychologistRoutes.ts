import { Router } from 'express';
import { PsychologistController } from '../controllers/psychologistController';
import { NodePsychologistService } from '../services/NodePsychologistService';
import { PsychologistRepository } from '../repositories/PsychologistRepository';
import { authenticateToken, requireRole } from '../middlewares/authMiddleware';

const psychologistRoutes = Router();

const repository = new PsychologistRepository();
const service = new NodePsychologistService(repository);
const controller = new PsychologistController(service);

psychologistRoutes.get('/psychologists', authenticateToken, controller.getAll);
psychologistRoutes.get('/psychologists/:id', authenticateToken, controller.getById);
psychologistRoutes.post('/psychologists', authenticateToken, requireRole(['administrador']), controller.create);

export { psychologistRoutes };
