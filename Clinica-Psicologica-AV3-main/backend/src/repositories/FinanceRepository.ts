import { executeQuery, isDbConnected } from '../database/db';
import { LancamentoFinanceiro } from '../../../shared/src/types';

export class FinanceRepository {
  private map(row: any): LancamentoFinanceiro {
    return { id: String(row.id_lancamento), descricao: row.descricao, pacienteNome: row.paciente_nome || undefined,
      categoria: row.categoria, data: row.data_lancamento, valor: Number(row.valor), tipo: row.tipo,
      status: row.status, metodo: row.metodo };
  }

  async list(userId: string, perfil: string): Promise<LancamentoFinanceiro[]> {
    if (!isDbConnected()) throw new Error('Banco de dados indisponível.');
    const rows = await executeQuery<any[]>(
      `SELECT id_lancamento, descricao, paciente_nome, categoria, DATE_FORMAT(data_lancamento, '%Y-%m-%d') AS data_lancamento,
       valor, tipo, status, metodo FROM lancamentos_financeiros
       WHERE (? = 'administrador' OR criado_por = ?) ORDER BY data_lancamento DESC, id_lancamento DESC`, [perfil, userId]);
    return rows.map((row) => this.map(row));
  }

  async create(input: Omit<LancamentoFinanceiro, 'id'>, userId: string): Promise<LancamentoFinanceiro> {
    if (!isDbConnected()) throw new Error('Banco de dados indisponível.');
    const result: any = await executeQuery(
      `INSERT INTO lancamentos_financeiros (criado_por, descricao, paciente_nome, categoria, data_lancamento, valor, tipo, status, metodo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, input.descricao, input.pacienteNome || null, input.categoria, input.data, input.valor, input.tipo, input.status, input.metodo]);
    const rows = await executeQuery<any[]>(
      `SELECT id_lancamento, descricao, paciente_nome, categoria, DATE_FORMAT(data_lancamento, '%Y-%m-%d') AS data_lancamento,
       valor, tipo, status, metodo FROM lancamentos_financeiros WHERE id_lancamento = ?`, [result.insertId]);
    return this.map(rows[0]);
  }

  async delete(id: string, userId: string, perfil: string): Promise<boolean> {
    if (!isDbConnected()) throw new Error('Banco de dados indisponível.');
    const result: any = await executeQuery('DELETE FROM lancamentos_financeiros WHERE id_lancamento = ? AND (? = \'administrador\' OR criado_por = ?)', [id, perfil, userId]);
    return result.affectedRows > 0;
  }
}
