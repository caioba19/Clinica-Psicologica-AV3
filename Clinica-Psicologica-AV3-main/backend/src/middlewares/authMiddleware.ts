import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/UserRepository';
import { RevokedTokenRepository } from '../repositories/RevokedTokenRepository';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    nome?: string;
    email: string;
    perfil: string;
  };
  authToken?: { jti: string; exp: number };
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const cookieHeader = req.headers.cookie || '';
  const cookieToken = cookieHeader.match(/(?:^|;\s*)psico_token=([^;]+)/)?.[1];
  const token = cookieToken;

  if (!token) {
    return res.status(401).json({ error: 'Acesso negado. Token de autenticação não fornecido.' });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) throw new Error('JWT_SECRET is not configured');
    const decoded = jwt.verify(token, jwtSecret) as jwt.JwtPayload & { id?: string; jti?: string };
    if (!decoded?.id || !decoded.jti || !decoded.exp) return res.status(401).json({ error: 'Token invÃ¡lido.' });
    if (await new RevokedTokenRepository().isRevoked(decoded.jti)) {
      return res.status(401).json({ error: 'SessÃ£o encerrada. Entre novamente.' });
    }
    const currentUser = await new UserRepository().findById(decoded.id);
    if (!currentUser || currentUser.situacao !== 'Ativo') {
      return res.status(401).json({ error: 'Conta inativa ou bloqueada.' });
    }
    req.authToken = { jti: decoded.jti, exp: decoded.exp };
    req.user = { id: currentUser.id, nome: currentUser.nome, email: currentUser.email, perfil: currentUser.perfil };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token de autenticação inválido ou expirado.' });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado.' });
    }

    const userRole = req.user.perfil.toLowerCase();
    const allowedRoles = roles.map((r) => r.toLowerCase());

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ error: 'Acesso negado. Você não possui permissão para realizar esta operação.' });
    }

    next();
  };
};
