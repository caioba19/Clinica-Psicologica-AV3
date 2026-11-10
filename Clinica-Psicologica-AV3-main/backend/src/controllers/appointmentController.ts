import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { NodeAppointmentService } from '../services/NodeAppointmentService';
import { NodeAuditLogService } from '../services/NodeAuditLogService';
import { publicErrorMessage } from '../utils/publicError';

export class AppointmentController {
  constructor(private service: NodeAppointmentService, private audit: NodeAuditLogService) {}

  getByDate = async (req: Request, res: Response): Promise<Response> => {
    try {
      const auth = req as AuthRequest;
      const date = typeof req.query.data === 'string' ? req.query.data : '';
      return res.status(200).json(await this.service.getByDate(date, auth.user!.id, auth.user!.perfil));
    } catch (error: any) {
      return res.status(400).json({ error: publicErrorMessage(error, 'Não foi possível carregar os agendamentos.') });
    }
  };

  getMine = async (req: Request, res: Response): Promise<Response> => {
    try {
      const auth = req as AuthRequest;
      return res.status(200).json(await this.service.getForPatient(auth.user!.id));
    } catch {
      return res.status(500).json({ error: 'Não foi possível carregar seus agendamentos.' });
    }
  };

  create = async (req: Request, res: Response): Promise<Response> => {
    try {
      const auth = req as AuthRequest;
      const appointment = await this.service.create(req.body, auth.user!.id, auth.user!.perfil);
      await this.audit.log(auth.user!.id, `Agendou consulta para paciente ${appointment.pacienteId}`, 'agendamento');
      return res.status(201).json(appointment);
    } catch (error: any) {
      return res.status(400).json({ error: publicErrorMessage(error, 'Não foi possível criar o agendamento.') });
    }
  };

  updateStatus = async (req: Request, res: Response): Promise<Response> => {
    try {
      const auth = req as AuthRequest;
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const appointment = await this.service.updateStatus(id, req.body.status, auth.user!.id, auth.user!.perfil);
      await this.audit.log(auth.user!.id, `Alterou situação do agendamento ${appointment.id} para ${appointment.status}`, 'agendamento');
      return res.status(200).json(appointment);
    } catch (error: any) {
      return res.status(400).json({ error: publicErrorMessage(error, 'Não foi possível atualizar o agendamento.') });
    }
  };
}
