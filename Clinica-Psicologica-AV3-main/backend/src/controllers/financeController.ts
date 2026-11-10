import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { FinanceRepository } from '../repositories/FinanceRepository';

const methods = ['PIX', 'Cartão', 'Dinheiro', 'Transferência'];
export class FinanceController {
  constructor(private repository: FinanceRepository) {}
  list = async (req: Request, res: Response): Promise<Response> => {
    const auth = req as AuthRequest;
    try { return res.json(await this.repository.list(auth.user!.id, auth.user!.perfil)); }
    catch { return res.status(500).json({ error: 'Não foi possível carregar os lançamentos financeiros.' }); }
  };
  create = async (req: Request, res: Response): Promise<Response> => {
    const auth = req as AuthRequest;
    const b = req.body || {};
    if (typeof b.descricao !== 'string' || !b.descricao.trim() || b.descricao.length > 180 || typeof b.categoria !== 'string' || !b.categoria.trim() || b.categoria.length > 80 || !/^\d{4}-\d{2}-\d{2}$/.test(b.data) || !Number.isFinite(Number(b.valor)) || Number(b.valor) <= 0 || !['receita', 'despesa'].includes(b.tipo) || !['Pago', 'Pendente', 'Atrasado'].includes(b.status) || !methods.includes(b.metodo)) {
      return res.status(400).json({ error: 'Revise descrição, categoria, data, valor, tipo, situação e método de pagamento.' });
    }
    try { return res.status(201).json(await this.repository.create({ ...b, descricao: b.descricao.trim(), categoria: b.categoria.trim(), valor: Number(b.valor) }, auth.user!.id)); }
    catch { return res.status(500).json({ error: 'Não foi possível salvar o lançamento.' }); }
  };
  delete = async (req: Request, res: Response): Promise<Response> => {
    const auth = req as AuthRequest;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    try {
      const removed = await this.repository.delete(id, auth.user!.id, auth.user!.perfil);
      return removed ? res.json({ success: true }) : res.status(404).json({ error: 'Lançamento não encontrado.' });
    } catch { return res.status(500).json({ error: 'Não foi possível excluir o lançamento.' }); }
  };
}
