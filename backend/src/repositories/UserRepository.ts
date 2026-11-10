import { UsuarioSistema, PerfilUsuario } from '../../../shared/src/types';
import { executeQuery, isDbConnected, withTransaction } from '../database/db';

export interface UsuarioSistemaComSenha extends UsuarioSistema {
  senhaHash?: string;
  telefone?: string;
  crp?: string;
  areaAtuacao?: string;
  bio?: string;
}

export class UserRepository {
  private users: UsuarioSistemaComSenha[] = [
    {
      id: '1',
      nome: 'Renata Farias',
      email: 'admin@clinica.com',
      perfil: 'administrador',
      situacao: 'Ativo',
      criadoEm: '15/01/2026',
      senhaHash: '$2b$10$0ihO6hAfEVEf9fdhIJTNuOk5kkuXz3VVCWwq6TwfX057HCkjjwfv2'
    },
    {
      id: '2',
      nome: 'Dra. Sofia Mendes',
      email: 'dra.sofia@psicomanager.com.br',
      perfil: 'psicologo',
      situacao: 'Ativo',
      criadoEm: '01/02/2026',
      senhaHash: '$2b$10$0ihO6hAfEVEf9fdhIJTNuOk5kkuXz3VVCWwq6TwfX057HCkjjwfv2'
    },
    {
      id: '3',
      nome: 'Caio Vinicius',
      email: 'caiov19.2015@gmail.com',
      perfil: 'psicologo',
      situacao: 'Ativo',
      criadoEm: '01/02/2026',
      senhaHash: '$2b$10$0ihO6hAfEVEf9fdhIJTNuOk5kkuXz3VVCWwq6TwfX057HCkjjwfv2'
    },
    {
      id: '4',
      nome: 'Maicon Dias',
      email: 'maicons4nto@gmail.com',
      perfil: 'administrador',
      situacao: 'Ativo',
      criadoEm: '15/01/2026',
      senhaHash: '$2b$10$0ihO6hAfEVEf9fdhIJTNuOk5kkuXz3VVCWwq6TwfX057HCkjjwfv2'
    },
    {
      id: '5',
      nome: 'Daniel Oliveira',
      email: 'danieloliveirasilva1905@gmail.com',
      perfil: 'psicologo',
      situacao: 'Ativo',
      criadoEm: '10/03/2026',
      senhaHash: '$2b$10$0ihO6hAfEVEf9fdhIJTNuOk5kkuXz3VVCWwq6TwfX057HCkjjwfv2'
    },
    {
      id: '6',
      nome: 'Kauan Marinho',
      email: 'kauanmarinhodeposito178@gmail.com',
      perfil: 'paciente',
      situacao: 'Ativo',
      criadoEm: '12/03/2026',
      senhaHash: '$2b$10$0ihO6hAfEVEf9fdhIJTNuOk5kkuXz3VVCWwq6TwfX057HCkjjwfv2'
    },
    {
      id: '7',
      nome: 'Gabriel Nascimento',
      email: 'nascimentoluzg@gmail.com',
      perfil: 'paciente',
      situacao: 'Ativo',
      criadoEm: '15/03/2026',
      senhaHash: '$2b$10$0ihO6hAfEVEf9fdhIJTNuOk5kkuXz3VVCWwq6TwfX057HCkjjwfv2'
    },
    {
      id: '8',
      nome: 'Lucas Ferreira Mendes',
      email: 'lucas.mendes@email.com',
      perfil: 'paciente',
      situacao: 'Ativo',
      criadoEm: '10/03/2026',
      senhaHash: '$2b$10$0ihO6hAfEVEf9fdhIJTNuOk5kkuXz3VVCWwq6TwfX057HCkjjwfv2'
    }
  ];

  async findByEmail(email: string): Promise<UsuarioSistemaComSenha | undefined> {
    if (isDbConnected()) {
      try {
        const rows = await executeQuery<any[]>(
          `SELECT u.id_usuario, u.nome_completo, u.email, u.telefone, u.senha_hash, u.status, p.nome_perfil,
                  psi.crp, psi.especialidades, psi.bio
           FROM usuarios u
           LEFT JOIN perfis p ON u.id_perfil = p.id_perfil
           LEFT JOIN psicologos psi ON psi.id_usuario = u.id_usuario
           WHERE TRIM(LOWER(u.email)) = TRIM(LOWER(?))`,
          [email]
        );
        if (rows.length > 0) {
          const row = rows[0];
          const perfilNome = (row.nome_perfil || 'psicologo').toLowerCase();
          const perfil: PerfilUsuario = perfilNome.includes('admin')
            ? 'administrador'
            : perfilNome.includes('paciente')
            ? 'paciente'
            : 'psicologo';

          const situacao: 'Ativo' | 'Inativo' | 'Bloqueado' =
            row.status === 'ativo' ? 'Ativo' : row.status === 'suspenso' ? 'Bloqueado' : 'Inativo';

          return {
            id: String(row.id_usuario),
            nome: row.nome_completo,
            email: row.email,
            perfil,
            situacao,
            criadoEm: 'Recente',
            senhaHash: row.senha_hash,
            telefone: row.telefone || '',
            crp: row.crp || '',
            areaAtuacao: row.especialidades || '',
            bio: row.bio || ''
          };
        }
        return undefined;
      } catch (err) { throw err; }
    }
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  async findById(id: string): Promise<UsuarioSistemaComSenha | undefined> {
    if (isDbConnected()) {
      try {
        const rows = await executeQuery<any[]>(
          `SELECT u.id_usuario, u.nome_completo, u.email, u.telefone, u.senha_hash, u.status, p.nome_perfil,
                  psi.crp, psi.especialidades, psi.bio
           FROM usuarios u
           LEFT JOIN perfis p ON u.id_perfil = p.id_perfil
           LEFT JOIN psicologos psi ON psi.id_usuario = u.id_usuario
           WHERE u.id_usuario = ?`,
          [id]
        );
        if (rows.length > 0) {
          const row = rows[0];
          const perfilNome = (row.nome_perfil || 'psicologo').toLowerCase();
          const perfil: PerfilUsuario = perfilNome.includes('admin')
            ? 'administrador'
            : perfilNome.includes('paciente')
            ? 'paciente'
            : 'psicologo';

          const situacao: 'Ativo' | 'Inativo' | 'Bloqueado' =
            row.status === 'ativo' ? 'Ativo' : row.status === 'suspenso' ? 'Bloqueado' : 'Inativo';

          return {
            id: String(row.id_usuario),
            nome: row.nome_completo,
            email: row.email,
            perfil,
            situacao,
            criadoEm: 'Recente',
            senhaHash: row.senha_hash,
            telefone: row.telefone || '',
            crp: row.crp || '',
            areaAtuacao: row.especialidades || '',
            bio: row.bio || ''
          };
        }
        return undefined;
      } catch (err) { throw err; }
    }
    return this.users.find((u) => u.id === id);
  }

  async findAll(): Promise<UsuarioSistema[]> {
    if (isDbConnected()) {
      try {
        const rows = await executeQuery<any[]>(
          `SELECT u.id_usuario, u.nome_completo, u.email, u.status, p.nome_perfil, u.created_at,
                  psi.crp, psi.especialidades
           FROM usuarios u
           LEFT JOIN perfis p ON u.id_perfil = p.id_perfil
           LEFT JOIN psicologos psi ON psi.id_usuario = u.id_usuario
           ORDER BY u.id_usuario ASC`
        );
        return rows.map((row) => {
          const perfilNome = (row.nome_perfil || 'psicologo').toLowerCase();
          const perfil: PerfilUsuario = perfilNome.includes('admin')
            ? 'administrador'
            : perfilNome.includes('paciente')
            ? 'paciente'
            : 'psicologo';

          const situacao: 'Ativo' | 'Inativo' | 'Bloqueado' =
            row.status === 'ativo' ? 'Ativo' : row.status === 'suspenso' ? 'Bloqueado' : 'Inativo';

          return {
            id: String(row.id_usuario),
            nome: row.nome_completo,
            email: row.email,
            perfil,
            situacao,
            criadoEm: row.created_at ? new Date(row.created_at).toLocaleDateString('pt-BR') : 'Recente',
            crp: row.crp || undefined,
            areaAtuacao: row.especialidades || undefined
          };
        });
      } catch (err) { throw err; }
    }
    return this.users.map(({ senhaHash, ...u }) => u);
  }

  async create(user: Omit<UsuarioSistemaComSenha, 'id' | 'criadoEm'>): Promise<UsuarioSistema> {
    if (isDbConnected()) {
      return withTransaction(async (connection) => {
        const [perfilRows] = await connection.execute<any[]>(
          'SELECT id_perfil FROM perfis WHERE LOWER(nome_perfil) = LOWER(?)',
          [user.perfil]
        );
        const idPerfil = perfilRows[0]?.id_perfil || (user.perfil === 'administrador' ? 1 : user.perfil === 'paciente' ? 3 : 2);

        const statusMap = { Ativo: 'ativo', Inativo: 'inativo', Bloqueado: 'suspenso' } as const;
        const status = statusMap[user.situacao] || 'ativo';

        const login = user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9._-]/g, '') || 'usuario';

        const [result] = await connection.execute<any>(
          `INSERT INTO usuarios (nome_completo, login, email, senha_hash, telefone, id_perfil, status)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [user.nome, login, user.email, user.senhaHash, user.telefone || null, idPerfil, status]
        );

        const newId = String(result.insertId);

        if (user.perfil === 'psicologo' && user.crp) {
          await connection.execute(
            `INSERT INTO psicologos (id_usuario, crp, especialidades, bio)
             VALUES (?, ?, ?, ?)`,
            [newId, user.crp, user.areaAtuacao || null, user.bio || null]
          );
        }

        return {
          id: newId,
          nome: user.nome,
          email: user.email,
          perfil: user.perfil,
          situacao: user.situacao,
          criadoEm: new Date().toLocaleDateString('pt-BR'),
          crp: user.crp,
          areaAtuacao: user.areaAtuacao
        };
      });
    }

    const newUser: UsuarioSistemaComSenha = {
      ...user,
      id: String(this.users.length + 1),
      criadoEm: new Date().toLocaleDateString('pt-BR')
    };
    this.users.push(newUser);
    const { senhaHash, ...created } = newUser;
    return created;
  }

  async update(id: string, updates: Partial<UsuarioSistemaComSenha>): Promise<UsuarioSistema | null> {
    if (isDbConnected()) {
      return withTransaction(async (connection) => {
        const currentUser = await this.findById(id);
        if (!currentUser) return null;

        const nome = updates.nome ?? currentUser.nome;
        const email = updates.email ?? currentUser.email;
        const telefone = updates.telefone !== undefined ? updates.telefone : currentUser.telefone;

        let idPerfil: number | undefined;
        if (updates.perfil && updates.perfil !== currentUser.perfil) {
          const [rows] = await connection.execute<any[]>(
            'SELECT id_perfil FROM perfis WHERE LOWER(nome_perfil) = LOWER(?)',
            [updates.perfil]
          );
          idPerfil = rows[0]?.id_perfil;
        }

        if (idPerfil !== undefined) {
          await connection.execute(
            'UPDATE usuarios SET nome_completo = ?, email = ?, telefone = ?, id_perfil = ? WHERE id_usuario = ?',
            [nome, email, telefone || null, idPerfil, id]
          );
        } else {
          await connection.execute(
            'UPDATE usuarios SET nome_completo = ?, email = ?, telefone = ? WHERE id_usuario = ?',
            [nome, email, telefone || null, id]
          );
        }

        const perfilFinal = updates.perfil ?? currentUser.perfil;
        if (perfilFinal === 'psicologo') {
          const crp = updates.crp !== undefined ? updates.crp : currentUser.crp;
          const area = updates.areaAtuacao !== undefined ? updates.areaAtuacao : currentUser.areaAtuacao;
          const bio = updates.bio !== undefined ? updates.bio : currentUser.bio;

          await connection.execute(
            `INSERT INTO psicologos (id_usuario, crp, especialidades, bio)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE crp = VALUES(crp), especialidades = VALUES(especialidades), bio = VALUES(bio)`,
            [id, crp || '', area || null, bio || null]
          );
        }

        return (await this.findById(id)) as UsuarioSistema;
      });
    }

    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) return null;
    this.users[index] = { ...this.users[index], ...updates };
    const { senhaHash, ...updated } = this.users[index];
    return updated;
  }

  async updateUser(id: string, updates: { nome?: string; email?: string; perfil?: PerfilUsuario; registroCrp?: string; areaAtuacao?: string }): Promise<UsuarioSistema | null> {
    return this.update(id, {
      nome: updates.nome,
      email: updates.email,
      perfil: updates.perfil,
      crp: updates.registroCrp,
      areaAtuacao: updates.areaAtuacao
    });
  }

  async updateProfile(id: string, updates: { nome?: string; email?: string; telefone?: string; crp?: string; areaAtuacao?: string; bio?: string }): Promise<UsuarioSistemaComSenha> {
    const result = await this.update(id, updates);
    if (!result) throw new Error('Usuário não encontrado.');
    const user = await this.findById(id);
    if (!user) throw new Error('Usuário não encontrado.');
    return user;
  }

  async updatePassword(id: string, senhaHash: string): Promise<boolean> {
    if (isDbConnected()) {
      const result = await executeQuery<any>(
        'UPDATE usuarios SET senha_hash = ? WHERE id_usuario = ?',
        [senhaHash, id]
      );
      return result.affectedRows > 0;
    }
    const user = this.users.find((u) => u.id === id);
    if (!user) return false;
    user.senhaHash = senhaHash;
    return true;
  }

  async updateSituacao(id: string, situacao: 'Ativo' | 'Inativo' | 'Bloqueado'): Promise<UsuarioSistema | null> {
    if (isDbConnected()) {
      const statusMap = { Ativo: 'ativo', Inativo: 'inativo', Bloqueado: 'suspenso' } as const;
      const status = statusMap[situacao] || 'ativo';
      await executeQuery('UPDATE usuarios SET status = ? WHERE id_usuario = ?', [status, id]);
      return this.findById(id) as Promise<UsuarioSistema | null>;
    }
    return this.update(id, { situacao });
  }
}
