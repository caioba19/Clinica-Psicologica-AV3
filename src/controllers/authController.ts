import { Request, Response } from 'express';
import { NodeAuthService } from '../services/NodeAuthService';

export class AuthController {
  constructor(private authService: NodeAuthService) {}

  login = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { email, password, senha } = req.body;
      const senhaParaValidador = senha || password;

      if (!email) {
        return res.status(400).json({ error: 'O e-mail é obrigatório.' });
      }

      const result = await this.authService.login(email, senhaParaValidador);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(401).json({ error: error.message });
    }
  };

  getUsers = async (req: Request, res: Response): Promise<Response> => {
    try {
      const users = await this.authService.getAllUsers();
      return res.status(200).json(users);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  };

  createUser = async (req: Request, res: Response): Promise<Response> => {
    try {
      const newUser = await this.authService.createUser(req.body);
      return res.status(201).json(newUser);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  updateSituacao = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const situacaoEntrada = req.body.situacao || req.body.status;

      if (!situacaoEntrada) {
        return res.status(400).json({ error: 'A situação/status é obrigatória.' });
      }

      let novaSituacao: 'Ativo' | 'Inativo' | 'Bloqueado' = 'Ativo';
      const statusLower = situacaoEntrada.toString().toLowerCase();

      if (statusLower === 'bloqueado' || statusLower === 'suspenso') {
        novaSituacao = 'Bloqueado';
      } else if (statusLower === 'inativo') {
        novaSituacao = 'Inativo';
      } else {
        novaSituacao = 'Ativo';
      }

      const updatedUser = await this.authService.updateSituacao(id, novaSituacao);
      return res.status(200).json(updatedUser);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };
}