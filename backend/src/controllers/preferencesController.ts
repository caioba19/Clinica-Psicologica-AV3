import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { PreferencesRepository } from '../repositories/PreferencesRepository';

const allowed = ['nomeClinica', 'documentoClinica', 'enderecoClinica', 'cidadeClinica', 'duracaoSessao', 'intervaloSessao', 'lembreteHoras', 'valorSessaoPadrao', 'notifEmail', 'notifSms', 'notifLembrete'];

export class PreferencesController {
  constructor(private repository: PreferencesRepository) {}
  get = async (req: Request, res: Response): Promise<Response> => {
    try { return res.json(await this.repository.get((req as AuthRequest).user!.id)); }
    catch { return res.status(500).json({ error: 'Não foi possível carregar as preferências.' }); }
  };
  save = async (req: Request, res: Response): Promise<Response> => {
    const body = req.body || {};
    if (!body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).some((key) => !allowed.includes(key))) {
      return res.status(400).json({ error: 'Preferências inválidas.' });
    }
    try {
      const current = await this.repository.get((req as AuthRequest).user!.id);
      const next = { ...current, ...body };
      for (const key of ['duracaoSessao', 'intervaloSessao', 'lembreteHoras', 'valorSessaoPadrao'] as const) {
        if (!Number.isFinite(Number(next[key])) || Number(next[key]) < 0) return res.status(400).json({ error: 'Os valores numéricos devem ser válidos e positivos.' });
        next[key] = Number(next[key]);
      }
      for (const key of ['nomeClinica', 'documentoClinica', 'enderecoClinica', 'cidadeClinica'] as const) {
        if (typeof next[key] !== 'string' || next[key].length > 160) return res.status(400).json({ error: 'Os dados da clínica devem ter até 160 caracteres.' });
      }
      for (const key of ['notifEmail', 'notifSms', 'notifLembrete'] as const) {
        if (typeof next[key] !== 'boolean') return res.status(400).json({ error: 'As notificações devem ser marcadas como verdadeiro ou falso.' });
      }
      return res.json(await this.repository.save((req as AuthRequest).user!.id, next));
    } catch { return res.status(500).json({ error: 'Não foi possível salvar as preferências.' }); }
  };
}
