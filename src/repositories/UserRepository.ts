import { UsuarioSistema } from '../types';

export interface UsuarioSistemaComSenha extends UsuarioSistema {
  senhaHash?: string;
}

export class UserRepository {
  private users: UsuarioSistemaComSenha[] = [
    {
      id: 'u1',
      nome: 'Renata Farias',
      email: 'admin@clinica.com',
      perfil: 'administrador',
      situacao: 'Ativo',
      criadoEm: '15/01/2026',
      senhaHash: '$2b$10$Xs468oUNd.riYkdJAn/Y.OK0Dyw3ZsxbfAdtuisK756qPmeAy4RW6'
    },
    {
      id: 'u2',
      nome: 'Dra. Sofia Mendes',
      email: 'dra.sofia@psicomanager.com.br',
      perfil: 'psicologo',
      situacao: 'Ativo',
      criadoEm: '01/02/2026',
      senhaHash: '$2b$10$Xs468oUNd.riYkdJAn/Y.OK0Dyw3ZsxbfAdtuisK756qPmeAy4RW6'
    },
    {
      id: 'u3',
      nome: 'Lucas Ferreira Mendes',
      email: 'lucas.mendes@email.com',
      perfil: 'paciente',
      situacao: 'Ativo',
      criadoEm: '10/03/2026',
      senhaHash: '$2b$10$Xs468oUNd.riYkdJAn/Y.OK0Dyw3ZsxbfAdtuisK756qPmeAy4RW6'
    }
  ];

  async findByEmail(email: string): Promise<UsuarioSistemaComSenha | undefined> {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  async findById(id: string): Promise<UsuarioSistemaComSenha | undefined> {
    return this.users.find((u) => u.id === id);
  }

  async findAll(): Promise<UsuarioSistema[]> {
    return this.users.map(({ senhaHash, ...user }) => user);
  }

  async create(data: Partial<UsuarioSistemaComSenha>): Promise<UsuarioSistema> {
    const newUser: UsuarioSistemaComSenha = {
      id: `u${Date.now()}`,
      nome: data.nome || '',
      email: data.email || '',
      perfil: data.perfil || 'psicologo',
      situacao: 'Ativo',
      criadoEm: new Date().toLocaleDateString('pt-BR'),
      senhaHash: data.senhaHash || '$2b$10$Xs468oUNd.riYkdJAn/Y.OK0Dyw3ZsxbfAdtuisK756qPmeAy4RW6'
    };
    this.users.unshift(newUser);
    const { senhaHash, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  async updateSituacao(id: string, novaSituacao: 'Ativo' | 'Inativo' | 'Bloqueado'): Promise<UsuarioSistema | null> {
    const user = this.users.find((u) => u.id === id);
    if (!user) return null;
    user.situacao = novaSituacao;
    const { senhaHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}