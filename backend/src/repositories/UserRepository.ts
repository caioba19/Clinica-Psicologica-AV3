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
      senhaHash: '$2b$10$Xs468oUNd.riYkdJAn/Y.OK0Dyw3ZsxbfAdtuisK756qPmeAy4RW6'
    },
    {
      id: '2',
      nome: 'Dra. Sofia Mendes',
      email: 'dra.sofia@psicomanager.com.br',
      perfil: 'psicologo',
      situacao: 'Ativo',
      criadoEm: '01/02/2026',
      senhaHash: '$2b$10$Xs468oUNd.riYkdJAn/Y.OK0Dyw3ZsxbfAdtuisK756qPmeAy4RW6'
    },
    {
      id: '3',
      nome: 'Lucas Ferreira Mendes',
      email: 'lucas.mendes@email.com',
      perfil: 'paciente',
      situacao: 'Ativo',
      criadoEm: '10/03/2026',
      senhaHash: '$2b$10$Xs468oUNd.riYkdJAn/Y.OK0Dyw3ZsxbfAdtuisK756qPmeAy4RW6'
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
           WHERE LOWER(u.email) = LOWER(?)`,
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
          `SELECT u.id_usuario, u.nome_completo, u.email, u.status,
                  DATE_FORMAT(u.created_at, '%d/%m/%Y') as criadoEm, p.nome_perfil
           FROM usuarios u
           LEFT JOIN perfis p ON u.id_perfil = p.id_perfil
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
              criadoEm: row.criadoEm || 'Recente'
            };
        });
      } catch (err) { throw err; }
    }
    return this.users.map(({ senhaHash, ...user }) => user);
  }

  async create(data: Partial<UsuarioSistemaComSenha> & { registroCrp?: string; areaAtuacao?: string }): Promise<UsuarioSistema> {
    if (isDbConnected()) {
      const perfilId = data.perfil === 'administrador' ? 1 : data.perfil === 'paciente' ? 3 : 2;
      const status = data.situacao === 'Inativo' ? 'inativo' : data.situacao === 'Bloqueado' ? 'suspenso' : 'ativo';
      const login = `${(data.email || `user_${Date.now()}`).split('@')[0]}_${Date.now()}`;
      const userId = await withTransaction(async (connection) => {
        const [result] = await connection.execute<any>(
          `INSERT INTO usuarios (nome_completo, login, email, senha_hash, id_perfil, status) VALUES (?, ?, ?, ?, ?, ?)`,
          [data.nome, login, data.email, data.senhaHash, perfilId, status]
        );
        if (data.perfil === 'psicologo') {
          await connection.execute(
            `INSERT INTO psicologos (id_usuario, crp, especialidades, valor_consulta) VALUES (?, ?, ?, 150.00)`,
            [result.insertId, data.registroCrp, data.areaAtuacao || 'Clínica Geral']
          );
        }
        return result.insertId;
      });
      return {
        id: String(userId), nome: data.nome || '', email: data.email || '', perfil: data.perfil || 'psicologo',
        situacao: data.situacao || 'Ativo', criadoEm: new Date().toLocaleDateString('pt-BR')
      };
    }
    const newUser: UsuarioSistemaComSenha = {
      id: `u${Date.now()}`, nome: data.nome || '', email: data.email || '', perfil: data.perfil || 'psicologo',
      situacao: 'Ativo', criadoEm: new Date().toLocaleDateString('pt-BR'), senhaHash: data.senhaHash
    };
    this.users.unshift(newUser);
    const { senhaHash, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }
  async updateSituacao(id: string, novaSituacao: 'Ativo' | 'Inativo' | 'Bloqueado'): Promise<UsuarioSistema | null> {
    if (isDbConnected()) {
      try {
        const status = novaSituacao === 'Inativo' ? 'inativo' : novaSituacao === 'Bloqueado' ? 'suspenso' : 'ativo';
        await executeQuery(
          `UPDATE usuarios SET status = ? WHERE id_usuario = ?`,
          [status, id]
        );
        const user = await this.findById(id);
        if (user) {
          const { senhaHash, ...userWithoutPassword } = user;
          return userWithoutPassword;
        }
        return null;
      } catch (err) { throw err; }
    }

    const user = this.users.find((u) => u.id === id);
    if (!user) return null;
    user.situacao = novaSituacao;
    const { senhaHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateProfile(id: string, data: Partial<UsuarioSistemaComSenha>): Promise<UsuarioSistemaComSenha> {
    if (isDbConnected()) {
      await withTransaction(async (connection) => {
        await connection.execute(
          `UPDATE usuarios SET nome_completo = ?, email = ?, telefone = ? WHERE id_usuario = ?`,
          [data.nome, data.email, data.telefone || null, id]
        );
        if (data.crp !== undefined || data.areaAtuacao !== undefined || data.bio !== undefined) {
          await connection.execute(
            `UPDATE psicologos SET crp = COALESCE(?, crp), especialidades = COALESCE(?, especialidades), bio = COALESCE(?, bio) WHERE id_usuario = ?`,
            [data.crp || null, data.areaAtuacao || null, data.bio || null, id]
          );
        }
      });
      const updated = await this.findById(id);
      if (!updated) throw new Error('Usuário não encontrado.');
      return updated;
    }

    const user = this.users.find((item) => item.id === id);
    if (!user) throw new Error('Usuário não encontrado.');
    Object.assign(user, data);
    return user;
  }

  async updateUser(id: string, data: Pick<UsuarioSistema, 'nome' | 'email'> & { perfil?: PerfilUsuario; registroCrp?: string; areaAtuacao?: string }): Promise<UsuarioSistema | null> {
    if (isDbConnected()) {
      const current = await this.findById(id);
      if (!current) return null;
      await withTransaction(async (connection) => {
        if (data.perfil && data.perfil !== current.perfil) {
          if (current.perfil === 'paciente' || data.perfil === 'paciente') {
            throw new Error('Não é possível converter uma conta de paciente, pois ela está ligada a dados clínicos próprios.');
          }
          if (current.perfil === 'administrador' && data.perfil === 'psicologo') {
            if (!data.registroCrp?.trim()) throw new Error('Informe o CRP para alterar o perfil para psicólogo.');
            const [duplicates] = await connection.execute<any[]>(
              `SELECT id_usuario FROM psicologos WHERE crp = ? AND id_usuario <> ? LIMIT 1`,
              [data.registroCrp.trim(), id]
            );
            if (duplicates.length) throw new Error('Este CRP já está cadastrado.');
            await connection.execute(
              `INSERT INTO psicologos (id_usuario, crp, especialidades, valor_consulta) VALUES (?, ?, ?, 150.00)`,
              [id, data.registroCrp.trim(), data.areaAtuacao?.trim() || 'Psicologia Clínica']
            );
          } else if (current.perfil === 'psicologo' && data.perfil === 'administrador') {
            const [links] = await connection.execute<any[]>(
              `SELECT id_vinculo FROM vinculos WHERE id_psicologo = ? LIMIT 1`,
              [id]
            );
            if (links.length) throw new Error('Não é possível remover o perfil de psicólogo enquanto houver vínculos clínicos associados.');
            await connection.execute(`DELETE FROM psicologos WHERE id_usuario = ?`, [id]);
          }
          const perfilId = data.perfil === 'administrador' ? 1 : 2;
          await connection.execute(`UPDATE usuarios SET id_perfil = ? WHERE id_usuario = ?`, [perfilId, id]);
        } else if (current.perfil === 'psicologo' && (data.registroCrp || data.areaAtuacao)) {
          if (data.registroCrp?.trim()) {
            const [duplicates] = await connection.execute<any[]>(
              `SELECT id_usuario FROM psicologos WHERE crp = ? AND id_usuario <> ? LIMIT 1`,
              [data.registroCrp.trim(), id]
            );
            if (duplicates.length) throw new Error('Este CRP já está cadastrado.');
          }
          await connection.execute(
            `UPDATE psicologos SET crp = COALESCE(?, crp), especialidades = COALESCE(?, especialidades) WHERE id_usuario = ?`,
            [data.registroCrp?.trim() || null, data.areaAtuacao?.trim() || null, id]
          );
        }
        await connection.execute(`UPDATE usuarios SET nome_completo = ?, email = ? WHERE id_usuario = ?`, [data.nome, data.email, id]);
      });
      const user = await this.findById(id);
      if (!user) return null;
      const { senhaHash, ...safeUser } = user;
      return safeUser;
    }
    const user = this.users.find((item) => item.id === id);
    if (!user) return null;
    user.nome = data.nome;
    user.email = data.email;
    if (data.perfil) user.perfil = data.perfil;
    const { senhaHash, ...safeUser } = user;
    return safeUser;
  }

  async updatePassword(id: string, senhaHash: string): Promise<void> {
    if (isDbConnected()) {
      await executeQuery('UPDATE usuarios SET senha_hash = ? WHERE id_usuario = ?', [senhaHash, id]);
      return;
    }
    const user = this.users.find((item) => item.id === id);
    if (!user) throw new Error('Usuário não encontrado.');
    user.senhaHash = senhaHash;
  }
}
