import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/UserRepository';
import { UsuarioSistema } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_psicomanager_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

export class NodeAuthService {
  constructor(private userRepository: UserRepository) {}

  async login(email: string, senha?: string): Promise<{ user: UsuarioSistema; token: string }> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new Error('Usuário não encontrado.');
    }

    if (user.situacao !== 'Ativo') {
      throw new Error('Usuário inativo ou bloqueado no sistema.');
    }

    if (senha && user.senhaHash) {
      const passwordMatch = bcrypt.compareSync(senha, user.senhaHash);
      if (!passwordMatch) {
        throw new Error('Senha incorreta.');
      }
    }

    const payload = {
      id: user.id,
      nome: user.nome,
      email: user.email,
      perfil: user.perfil
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });

    const { senhaHash, ...userWithoutPassword } = user;

    return { user: userWithoutPassword as UsuarioSistema, token };
  }

  async getAllUsers(): Promise<UsuarioSistema[]> {
    return await this.userRepository.findAll();
  }

  async updateSituacao(id: string, novaSituacao: 'Ativo' | 'Inativo' | 'Bloqueado'): Promise<UsuarioSistema> {
    const updatedUser = await this.userRepository.updateSituacao(id, novaSituacao);
    if (!updatedUser) {
      throw new Error('Usuário não encontrado.');
    }
    return updatedUser;
  }

  async createUser(data: Partial<UsuarioSistema> & { senha?: string }): Promise<UsuarioSistema> {
    const senhaHash = data.senha
      ? bcrypt.hashSync(data.senha, 10)
      : bcrypt.hashSync('123456', 10);

    return await this.userRepository.create({
      ...data,
      senhaHash
    });
  }
}