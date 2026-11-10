import { PsicologoProfissional } from '../../../shared/src/types';
import { executeQuery, isDbConnected } from '../database/db';

export class PsychologistRepository {
  private psychologists: PsicologoProfissional[] = [
    {
      id: 'p1',
      usuarioId: '2',
      nome: 'Dra. Sofia Mendes',
      email: 'dra.sofia@psicomanager.com.br',
      areaAtuacao: 'Terapia Cognitivo-Comportamental',
      registroCrp: 'CRP 06/123456',
      situacao: 'Ativo'
    },
    {
      id: 'p2',
      usuarioId: '3',
      nome: 'Juliana Prado Lima',
      email: 'juliana.lima@psicomanager.com.br',
      areaAtuacao: 'Psicologia Infantil e Familiar',
      registroCrp: 'CRP 06/654321',
      situacao: 'Ativo'
    }
  ];

  async findAll(): Promise<PsicologoProfissional[]> {
    if (isDbConnected()) {
      try {
        const rows = await executeQuery<any[]>(
          `SELECT psi.id_usuario, u.nome_completo, u.email, u.status, psi.crp, psi.especialidades
           FROM psicologos psi
           JOIN usuarios u ON psi.id_usuario = u.id_usuario
           ORDER BY psi.id_usuario ASC`
        );
        return rows.map((r) => ({
            id: `p${r.id_usuario}`,
            usuarioId: String(r.id_usuario),
            nome: r.nome_completo,
            email: r.email,
            areaAtuacao: r.especialidades || 'Psicologia Geral',
            registroCrp: r.crp,
            situacao: r.status === 'ativo' ? 'Ativo' : r.status === 'suspenso' ? 'Bloqueado' : 'Inativo'
        }));
      } catch (err) { throw err; }
    }
    return this.psychologists;
  }

  async findById(id: string): Promise<PsicologoProfissional | undefined> {
    const list = await this.findAll();
    return list.find((p) => p.id === id || p.usuarioId === id);
  }

  async findByUsuarioId(usuarioId: string): Promise<PsicologoProfissional | undefined> {
    const list = await this.findAll();
    return list.find((p) => p.usuarioId === usuarioId);
  }

  async create(data: Partial<PsicologoProfissional>): Promise<PsicologoProfissional> {
    if (isDbConnected()) {
      const userId = Number(data.usuarioId);
      if (!userId) throw new Error('Crie a conta do usuário antes de cadastrar o perfil profissional.');
      await executeQuery(
        `INSERT INTO psicologos (id_usuario, crp, especialidades, valor_consulta) VALUES (?, ?, ?, 150.00)`,
        [userId, data.registroCrp || 'CRP 06/000000', data.areaAtuacao || 'Clínica Geral']
      );
      return {
        id: `p${userId}`, usuarioId: String(userId), nome: data.nome || '', email: data.email || '',
        areaAtuacao: data.areaAtuacao || 'Clínica Geral', registroCrp: data.registroCrp || 'CRP 06/000000', situacao: 'Ativo'
      };
    }
    const newPsi: PsicologoProfissional = {
      id: `p${Date.now()}`, usuarioId: data.usuarioId || `u${Date.now()}`, nome: data.nome || '', email: data.email || '',
      areaAtuacao: data.areaAtuacao || 'Psicologia Clínica', registroCrp: data.registroCrp || 'CRP 06/000000', situacao: 'Ativo'
    };
    this.psychologists.unshift(newPsi);
    return newPsi;
  }
}
