import { executeQuery, isDbConnected } from '../database/db';

export interface ReportSummary {
  sessoes: number;
  realizadas: number;
  taxaFrequencia: number;
  novosPacientes: number;
  receitaPaga: number;
  ticketMedio: number;
  presencial: number;
  online: number;
}

export class ReportRepository {
  async summary(userId: string, perfil: string, period: 'mes' | 'trimestre' | 'ano'): Promise<ReportSummary> {
    if (!isDbConnected()) throw new Error('Banco de dados indisponível.');
    const now = new Date();
    const start = new Date(now.getFullYear(), period === 'ano' ? 0 : now.getMonth() - (period === 'trimestre' ? 2 : 0), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const startSql = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-01`;
    const endSql = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-01`;
    const scopeSql = "(? = 'administrador' OR v.id_psicologo = ?)";
    const [appointmentRows, patientRows, financeRows] = await Promise.all([
      executeQuery<any[]>(
        `SELECT COUNT(*) AS sessoes,
           SUM(a.status = 'realizado') AS realizadas,
           SUM(a.status = 'cancelado') AS canceladas,
           SUM(a.modalidade = 'presencial') AS presencial,
           SUM(a.modalidade = 'online') AS online
         FROM agendamentos a JOIN vinculos v ON v.id_vinculo = a.id_vinculo
         WHERE a.inicio >= ? AND a.inicio < ? AND ${scopeSql}`,
        [startSql, endSql, perfil, userId]),
      executeQuery<any[]>(
        `SELECT COUNT(*) AS total FROM vinculos v WHERE v.created_at >= ? AND v.created_at < ? AND ${scopeSql}`,
        [startSql, endSql, perfil, userId]),
      executeQuery<any[]>(
        `SELECT COALESCE(SUM(f.valor), 0) AS receita FROM lancamentos_financeiros f
         WHERE f.data_lancamento >= ? AND f.data_lancamento < ? AND f.status = 'Pago'
           AND (? = 'administrador' OR f.criado_por = ?)`,
        [startSql, endSql, perfil, userId])
    ]);
    const a = appointmentRows[0] || {};
    const f = financeRows[0] || {};
    const sessoes = Number(a.sessoes || 0);
    const realizadas = Number(a.realizadas || 0);
    const canceladas = Number(a.canceladas || 0);
    const receitaPaga = Number(f.receita || 0);
    return {
      sessoes, realizadas,
      taxaFrequencia: sessoes - canceladas > 0 ? Math.round((realizadas / (sessoes - canceladas)) * 1000) / 10 : 0,
      novosPacientes: Number(patientRows[0]?.total || 0), receitaPaga,
      ticketMedio: realizadas ? Math.round((receitaPaga / realizadas) * 100) / 100 : 0,
      presencial: Number(a.presencial || 0), online: Number(a.online || 0)
    };
  }
}
