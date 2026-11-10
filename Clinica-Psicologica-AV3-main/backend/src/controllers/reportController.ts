import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { ReportRepository } from '../repositories/ReportRepository';

export class ReportController {
  constructor(private repository: ReportRepository) {}
  summary = async (req: Request, res: Response): Promise<Response> => {
    const period = req.query.period;
    if (period !== 'mes' && period !== 'trimestre' && period !== 'ano') return res.status(400).json({ error: 'Período inválido.' });
    const auth = req as AuthRequest;
    try { return res.json(await this.repository.summary(auth.user!.id, auth.user!.perfil, period)); }
    catch { return res.status(500).json({ error: 'Não foi possível carregar os indicadores.' }); }
  };
}
