import { Request, Response } from 'express';
import { NodeSessionService } from '../services/NodeSessionService';
import { AuthRequest } from '../middlewares/authMiddleware';
import { NodeAuditLogService } from '../services/NodeAuditLogService';
import { publicErrorMessage } from '../utils/publicError';

export class SessionController {
  constructor(private sessionService: NodeSessionService, private auditLogService: NodeAuditLogService) {}

  getByPatient = async (req: Request, res: Response): Promise<Response> => {
    try {
      const paramId = Array.isArray(req.params.pacienteId)
        ? req.params.pacienteId[0]
        : req.params.pacienteId;

      const queryId = Array.isArray(req.query.pacienteId)
        ? (req.query.pacienteId[0] as string)
        : (req.query.pacienteId as string);

      const pacienteId = paramId || queryId || '';

      const auth = req as AuthRequest;
      const sessions = await this.sessionService.getSessionsByPatient(pacienteId, auth.user!.id, auth.user!.perfil);
      return res.status(200).json(sessions);
    } catch (error: any) {
      return res.status(500).json({ error: 'Não foi possível carregar as evoluções clínicas.' });
    }
  };

  create = async (req: Request, res: Response): Promise<Response> => {
    try {
      const auth = req as AuthRequest;
      const newSession = await this.sessionService.createSession(req.body, auth.user!.id, auth.user!.perfil);
      await this.auditLogService.log(auth.user!.id, `Registrou evolução do paciente ${newSession.pacienteId}`, 'evolucao');
      return res.status(201).json(newSession);
    } catch (error: any) {
      return res.status(400).json({ error: publicErrorMessage(error, 'Não foi possível registrar a evolução clínica.') });
    }
  };
}
