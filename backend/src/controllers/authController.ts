import { Request, Response } from 'express';
import { NodeAuthService } from '../services/NodeAuthService';
import { AuthRequest } from '../middlewares/authMiddleware';
import { NodeAuditLogService } from '../services/NodeAuditLogService';
import jwt from 'jsonwebtoken';
import { publicErrorMessage } from '../utils/publicError';
import { NodePasswordResetService } from '../services/NodePasswordResetService';

const authCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/api'
};

export class AuthController {
  constructor(
    private authService: NodeAuthService,
    private auditLogService: NodeAuditLogService,
    private passwordResetService: NodePasswordResetService
  ) {}

  requestPasswordReset = async (req: Request, res: Response): Promise<Response> => {
    const email = req.body?.email;
    if (typeof email !== 'string' || !email.trim()) return res.status(400).json({ error: 'Informe um e-mail válido.' });
    try {
      await this.passwordResetService.request(email);
      return res.status(202).json({ message: 'Se a conta estiver cadastrada, enviaremos as instruções de redefinição.' });
    } catch {
      return res.status(503).json({ error: 'A recuperação por e-mail está indisponível no momento.' });
    }
  };

  resetPassword = async (req: Request, res: Response): Promise<Response> => {
    const { email, token, novaSenha } = req.body || {};
    if (typeof email !== 'string' || typeof token !== 'string' || typeof novaSenha !== 'string') {
      return res.status(400).json({ error: 'Link de redefinição inválido ou expirado.' });
    }
    try {
      await this.passwordResetService.reset(email, token, novaSenha);
      return res.status(200).json({ message: 'Senha redefinida. Entre com a nova senha.' });
    } catch (error) {
      return res.status(400).json({ error: publicErrorMessage(error, 'Link de redefinição inválido ou expirado.') });
    }
  };

  me = async (req: Request, res: Response): Promise<Response> => {
    try {
      const auth = req as AuthRequest;
      return res.status(200).json(await this.authService.getCurrentUser(auth.user!.id));
    } catch {
      return res.status(401).json({ error: 'Sessão inválida. Entre novamente.' });
    }
  };

  logout = async (req: Request, res: Response): Promise<Response> => {
    try {
      const auth = req as AuthRequest;
      if (!auth.user || !auth.authToken) return res.status(401).json({ error: 'Sessão inválida.' });
      res.clearCookie('psico_token', authCookieOptions);
      await this.authService.logout(auth.user.id, auth.authToken.jti, new Date(auth.authToken.exp * 1000));
      return res.status(200).json({ success: true, message: 'Sessão encerrada.' });
    } catch {
      return res.status(500).json({ error: 'Não foi possível encerrar a sessão no servidor.' });
    }
  };

  updatePassword = async (req: Request, res: Response): Promise<Response> => {
    try {
      const auth = req as AuthRequest;
      const { senhaAtual, novaSenha } = req.body;
      if (typeof senhaAtual !== 'string' || typeof novaSenha !== 'string') {
        return res.status(400).json({ error: 'Informe a senha atual e a nova senha.' });
      }
      await this.authService.changePassword(auth.user!.id, senhaAtual, novaSenha);
      return res.status(200).json({ success: true, message: 'Senha atualizada.' });
    } catch (error: any) {
      return res.status(400).json({ error: publicErrorMessage(error, 'Não foi possível atualizar a senha.') });
    }
  };

  updateProfile = async (req: Request, res: Response): Promise<Response> => {
    try {
      const auth = req as AuthRequest;
      const updated = await this.authService.updateProfile(auth.user!.id, req.body);
      await this.auditLogService.log(auth.user!.id, 'Atualizou o próprio perfil', 'perfil');
      return res.status(200).json(updated);
    } catch (error: any) {
      return res.status(400).json({ error: publicErrorMessage(error, 'Não foi possível atualizar o perfil.') });
    }
  };

  login = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { email, password, senha } = req.body;
      const senhaParaValidador = senha || password;

      if (typeof email !== 'string' || typeof senhaParaValidador !== 'string' || !email.trim()) {
        return res.status(400).json({ error: 'O e-mail é obrigatório.' });
      }

      const result = await this.authService.login(email, senhaParaValidador);
      const claims = jwt.decode(result.token) as jwt.JwtPayload | null;
      const maxAge = claims?.exp ? Math.max(0, claims.exp * 1000 - Date.now()) : 24 * 60 * 60 * 1000;
      res.cookie('psico_token', result.token, { ...authCookieOptions, maxAge });
      return res.status(200).json({ user: result.user });
    } catch {
      return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
    }
  };

  getUsers = async (req: Request, res: Response): Promise<Response> => {
    try {
      const users = await this.authService.getAllUsers();
      return res.status(200).json(users);
    } catch (error: any) {
      return res.status(500).json({ error: 'Não foi possível carregar os usuários.' });
    }
  };

  createUser = async (req: Request, res: Response): Promise<Response> => {
    try {
      const newUser = await this.authService.createUser(req.body);
      const auth = req as AuthRequest;
      await this.auditLogService.log(auth.user!.id, `Cadastrou usuário ${newUser.nome} (${newUser.perfil})`, 'usuario');
      return res.status(201).json(newUser);
    } catch (error: any) {
      return res.status(400).json({ error: publicErrorMessage(error, 'Não foi possível cadastrar o usuário.') });
    }
  };

  updateSituacao = async (req: Request, res: Response): Promise<Response> => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const situacaoEntrada = req.body.situacao || req.body.status;

      if (typeof situacaoEntrada !== 'string' || !situacaoEntrada.trim()) {
        return res.status(400).json({ error: 'A situação/status é obrigatória.' });
      }

      let novaSituacao: 'Ativo' | 'Inativo' | 'Bloqueado';
      const statusLower = situacaoEntrada.toString().toLowerCase();

      if (statusLower === 'bloqueado' || statusLower === 'suspenso') {
        novaSituacao = 'Bloqueado';
      } else if (statusLower === 'inativo') {
        novaSituacao = 'Inativo';
      } else if (statusLower === 'ativo') {
        novaSituacao = 'Ativo';
      } else {
        return res.status(400).json({ error: 'Situação do usuário inválida.' });
      }

      const auth = req as AuthRequest;
      const updatedUser = await this.authService.updateSituacao(id, novaSituacao, auth.user!.id);
      await this.auditLogService.log(auth.user!.id, `Alterou situação de ${updatedUser.nome} para ${novaSituacao}`, 'usuario');
      return res.status(200).json(updatedUser);
    } catch (error: any) {
      return res.status(400).json({ error: publicErrorMessage(error, 'Não foi possível atualizar a situação do usuário.') });
    }
  };

  updateUser = async (req: Request, res: Response): Promise<Response> => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const auth = req as AuthRequest;
      const updated = await this.authService.updateUser(id, req.body, auth.user!.id);
      await this.auditLogService.log(auth.user!.id, `Editou dados do usuário ${updated.id}`, 'usuario');
      return res.status(200).json(updated);
    } catch (error: any) {
      return res.status(400).json({ error: publicErrorMessage(error, 'Não foi possível atualizar o usuário.') });
    }
  };
}
