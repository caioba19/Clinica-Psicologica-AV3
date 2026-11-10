import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { TherapyTaskRepository } from '../repositories/TherapyTaskRepository';

export class TherapyTaskController {
  constructor(private repository: TherapyTaskRepository) {}
  list = async (req: Request, res: Response): Promise<Response> => {
    try { return res.json(await this.repository.listForPatient((req as AuthRequest).user!.id)); }
    catch { return res.status(500).json({ error: 'Não foi possível carregar suas atividades.' }); }
  };
  listForProfessional = async (req: Request, res: Response): Promise<Response> => {
    const auth = req as AuthRequest;
    try { return res.json(await this.repository.listForProfessional(auth.user!.id, auth.user!.perfil)); }
    catch { return res.status(500).json({ error: 'Não foi possível carregar as atividades.' }); }
  };
  create = async (req: Request, res: Response): Promise<Response> => {
    const auth = req as AuthRequest;
    const { pacienteId, texto } = req.body || {};
    if (typeof pacienteId !== 'string' || !/^\d+$/.test(pacienteId) || typeof texto !== 'string' || !texto.trim() || texto.trim().length > 240) {
      return res.status(400).json({ error: 'Informe um paciente válido e uma atividade de até 240 caracteres.' });
    }
    try {
      const task = await this.repository.createForPatient(auth.user!.id, auth.user!.perfil, pacienteId, texto.trim());
      return res.status(201).json(task);
    } catch (error: any) {
      return res.status(400).json({ error: error.message || 'Não foi possível criar a atividade.' });
    }
  };
  update = async (req: Request, res: Response): Promise<Response> => {
    if (typeof req.body?.concluida !== 'boolean') return res.status(400).json({ error: 'Informe se a atividade foi concluída.' });
    const auth = req as AuthRequest;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    try {
      const changed = await this.repository.setCompleted(id, auth.user!.id, req.body.concluida);
      return changed ? res.json({ success: true }) : res.status(404).json({ error: 'Atividade não encontrada.' });
    } catch { return res.status(500).json({ error: 'Não foi possível atualizar a atividade.' }); }
  };
  delete = async (req: Request, res: Response): Promise<Response> => {
    const auth = req as AuthRequest;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    try {
      const removed = await this.repository.deleteCreatedTask(id, auth.user!.id, auth.user!.perfil);
      return removed ? res.json({ success: true }) : res.status(404).json({ error: 'Atividade não encontrada ou sem autorização.' });
    } catch { return res.status(500).json({ error: 'Não foi possível remover a atividade.' }); }
  };
}
