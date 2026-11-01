import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/UserRepository';
import { UsuarioSistema } from '../../../shared/src/types';
import { randomUUID } from 'node:crypto';
import { RevokedTokenRepository } from '../repositories/RevokedTokenRepository';

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

export class NodeAuthService {
  constructor(private userRepository: UserRepository) {}

  async login(email: string, senha?: string): Promise<{ user: UsuarioSistema; token: string }> {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) throw new Error('JWT_SECRET não foi configurado.');
    if (typeof senha !== 'string' || senha.length === 0) throw new Error('E-mail e senha são obrigatórios.');
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new Error('Usuário não encontrado.');
    }

    if (user.situacao !== 'Ativo') {
      throw new Error('Usuário inativo ou bloqueado no sistema.');
    }

    if (!user.senhaHash || !(await bcrypt.compare(senha, user.senhaHash))) {
      throw new Error('Credenciais inválidas.');
    }

    const payload = {
      id: user.id,
      nome: user.nome,
      email: user.email,
      perfil: user.perfil
    };

    const token = jwt.sign(payload, jwtSecret!, { expiresIn: JWT_EXPIRES_IN as any, jwtid: randomUUID() });

    const { senhaHash, ...userWithoutPassword } = user;

    return { user: userWithoutPassword as UsuarioSistema, token };
  }

  async getAllUsers(): Promise<UsuarioSistema[]> {
    return await this.userRepository.findAll();
  }

  async getCurrentUser(userId: string): Promise<UsuarioSistema & { telefone?: string; crp?: string; areaAtuacao?: string; bio?: string }> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error('Usuário não encontrado.');
    const { senhaHash, ...safeUser } = user;
    return safeUser;
  }

  async updateSituacao(id: string, novaSituacao: 'Ativo' | 'Inativo' | 'Bloqueado', actorId: string): Promise<UsuarioSistema> {
    if (actorId === id && novaSituacao !== 'Ativo') throw new Error('Você não pode bloquear ou inativar a própria conta.');
    const updatedUser = await this.userRepository.updateSituacao(id, novaSituacao);
    if (!updatedUser) {
      throw new Error('Usuário não encontrado.');
    }
    return updatedUser;
  }

  async updateUser(id: string, data: { nome?: string; email?: string; perfil?: UsuarioSistema['perfil']; registroCrp?: string; areaAtuacao?: string }, actorId: string): Promise<UsuarioSistema> {
    const nome = data.nome?.trim();
    const email = data.email?.trim().toLowerCase();
    if (!nome || !email) throw new Error('Nome e e-mail são obrigatórios.');
    const current = await this.userRepository.findById(id);
    if (!current) throw new Error('Usuário não encontrado.');
    if (actorId === id && data.perfil && data.perfil !== current.perfil) throw new Error('Você não pode alterar o próprio perfil de acesso.');
    if (data.perfil && !['administrador', 'psicologo', 'paciente'].includes(data.perfil)) throw new Error('Perfil de acesso inválido.');
    if (data.perfil && data.perfil !== current.perfil && (current.perfil === 'paciente' || data.perfil === 'paciente')) {
      throw new Error('Não é possível converter uma conta de paciente, pois ela está ligada a dados clínicos próprios.');
    }
    if (data.perfil === 'psicologo' && !/^CRP\s\d{2}\/\d{4,8}$/i.test(data.registroCrp?.trim() || (current.perfil === 'psicologo' ? current.crp || '' : ''))) {
      throw new Error('Informe um registro CRP válido (ex.: CRP 06/123456).');
    }
    const existing = await this.userRepository.findByEmail(email);
    if (existing && existing.id !== id) throw new Error('Este e-mail já está cadastrado.');
    const updated = await this.userRepository.updateUser(id, { nome, email, perfil: data.perfil, registroCrp: data.registroCrp, areaAtuacao: data.areaAtuacao });
    if (!updated) throw new Error('Usuário não encontrado.');
    return updated;
  }

  async updateProfile(userId: string, data: { nome?: string; email?: string; telefone?: string; crp?: string; areaAtuacao?: string; bio?: string }): Promise<UsuarioSistema & { telefone?: string; crp?: string; areaAtuacao?: string; bio?: string }> {
    const current = await this.userRepository.findById(userId);
    if (!current) throw new Error('Usuário não encontrado.');

    const nome = data.nome?.trim();
    const email = data.email?.trim().toLowerCase();
    if (!nome || !email) throw new Error('Nome e e-mail são obrigatórios.');
    if (current.perfil === 'psicologo' && !/^CRP\s\d{2}\/\d{4,8}$/i.test(data.crp?.trim() || '')) throw new Error('Informe um registro CRP válido (ex.: CRP 06/123456).');
    const existing = await this.userRepository.findByEmail(email);
    if (existing && existing.id !== userId) throw new Error('Este e-mail já está cadastrado.');
    if (current.perfil === 'psicologo' && !data.crp?.trim()) throw new Error('O CRP é obrigatório para o perfil de psicólogo.');

    const updated = await this.userRepository.updateProfile(userId, {
      nome,
      email,
      telefone: data.telefone?.trim() || '',
      crp: current.perfil === 'psicologo' ? data.crp?.trim() : undefined,
      areaAtuacao: current.perfil === 'psicologo' ? data.areaAtuacao?.trim() : undefined,
      bio: current.perfil === 'psicologo' ? data.bio?.trim() : undefined
    });
    const { senhaHash, ...userWithoutPassword } = updated;
    return userWithoutPassword;
  }

  async createUser(data: Partial<UsuarioSistema> & { senha?: string; registroCrp?: string; areaAtuacao?: string }): Promise<UsuarioSistema> {
    if (!data.senha || data.senha.length < 8) {
      throw new Error('A senha é obrigatória e deve ter pelo menos 8 caracteres.');
    }
    if (data.email) {
      const existing = await this.userRepository.findByEmail(data.email);
      if (existing) {
        throw new Error('Já existe um usuário cadastrado com este e-mail.');
      }
    }
    if (!data.nome?.trim() || !data.email?.trim() || !['administrador', 'psicologo', 'paciente'].includes(data.perfil || '')) {
      throw new Error('Nome, e-mail e perfil de acesso válido são obrigatórios.');
    }
    if (data.perfil === 'paciente') {
      throw new Error('Cadastre pacientes pelo formulário de Pacientes para registrar CPF, data de nascimento e vínculo clínico.');
    }
    if (data.perfil === 'psicologo' && !/^CRP\s\d{2}\/\d{4,8}$/i.test(data.registroCrp?.trim() || '')) {
      throw new Error('Informe um registro CRP válido (ex.: CRP 06/123456).');
    }

    const senhaHash = await bcrypt.hash(data.senha, 12);

    return await this.userRepository.create({
      ...data,
      senhaHash
    });
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    if (newPassword.length < 8) throw new Error('A nova senha deve ter pelo menos 8 caracteres.');
    const user = await this.userRepository.findById(userId);
    if (!user?.senhaHash || !(await bcrypt.compare(currentPassword, user.senhaHash))) {
      throw new Error('Senha atual incorreta.');
    }
    const senhaHash = await bcrypt.hash(newPassword, 12);
    await this.userRepository.updatePassword(userId, senhaHash);
  }

  async logout(userId: string, jti: string, expiresAt: Date): Promise<void> {
    await new RevokedTokenRepository().revoke(jti, userId, expiresAt);
  }
}
