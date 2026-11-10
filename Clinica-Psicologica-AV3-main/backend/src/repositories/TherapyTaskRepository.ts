import { executeQuery, isDbConnected, withTransaction } from '../database/db';
import { TarefaTerapeutica } from '../../../shared/src/types';

export class TherapyTaskRepository {
  async listForProfessional(userId: string, perfil: string): Promise<TarefaTerapeutica[]> {
    if (!isDbConnected()) throw new Error('Banco de dados indisponível.');
    const rows = await executeQuery<any[]>(
      `SELECT t.id_tarefa, v.id_paciente, t.texto, t.concluida, DATE_FORMAT(t.created_at, '%Y-%m-%dT%H:%i:%s') AS criada_em
       FROM tarefas_terapeuticas t JOIN vinculos v ON v.id_vinculo = t.id_vinculo
       WHERE (? = 'administrador' OR v.id_psicologo = ?) ORDER BY t.concluida, t.created_at DESC`, [perfil, userId]);
    return rows.map((row) => ({ id: String(row.id_tarefa), pacienteId: String(row.id_paciente), texto: row.texto, concluida: Boolean(row.concluida), criadaEm: row.criada_em }));
  }

  async createForPatient(userId: string, perfil: string, patientId: string, texto: string): Promise<TarefaTerapeutica> {
    if (!isDbConnected()) throw new Error('Banco de dados indisponível.');
    const result = await withTransaction(async (connection) => {
      const [links] = await connection.execute<any[]>(
        `SELECT id_vinculo FROM vinculos WHERE id_paciente = ? AND status = 'ativo'
         AND (? = 'administrador' OR id_psicologo = ?) LIMIT 1 FOR UPDATE`, [patientId, perfil, userId]);
      if (!links.length) throw new Error('Paciente sem vínculo ativo autorizado.');
      const [insert]: any = await connection.execute(
        'INSERT INTO tarefas_terapeuticas (id_vinculo, texto, criado_por) VALUES (?, ?, ?)',
        [links[0].id_vinculo, texto, userId]);
      return insert.insertId;
    });
    const rows = await executeQuery<any[]>(
      `SELECT t.id_tarefa, v.id_paciente, t.texto, t.concluida, DATE_FORMAT(t.created_at, '%Y-%m-%dT%H:%i:%s') AS criada_em
       FROM tarefas_terapeuticas t JOIN vinculos v USING (id_vinculo) WHERE t.id_tarefa = ?`, [result]);
    const row = rows[0];
    return { id: String(row.id_tarefa), pacienteId: String(row.id_paciente), texto: row.texto, concluida: Boolean(row.concluida), criadaEm: row.criada_em };
  }

  async listForPatient(userId: string): Promise<TarefaTerapeutica[]> {
    if (!isDbConnected()) throw new Error('Banco de dados indisponível.');
    const rows = await executeQuery<any[]>(
      `SELECT t.id_tarefa, v.id_paciente, t.texto, t.concluida, DATE_FORMAT(t.created_at, '%Y-%m-%dT%H:%i:%s') AS criada_em
       FROM tarefas_terapeuticas t JOIN vinculos v ON v.id_vinculo = t.id_vinculo
       WHERE v.id_paciente = ? AND v.status = 'ativo' ORDER BY t.created_at DESC`, [userId]);
    return rows.map((row) => ({ id: String(row.id_tarefa), pacienteId: String(row.id_paciente), texto: row.texto, concluida: Boolean(row.concluida), criadaEm: row.criada_em }));
  }

  async setCompleted(taskId: string, userId: string, completed: boolean): Promise<boolean> {
    if (!isDbConnected()) throw new Error('Banco de dados indisponível.');
    const result: any = await executeQuery(
      `UPDATE tarefas_terapeuticas t JOIN vinculos v ON v.id_vinculo = t.id_vinculo
       SET t.concluida = ? WHERE t.id_tarefa = ? AND v.id_paciente = ? AND v.status = 'ativo'`,
      [completed ? 1 : 0, taskId, userId]);
    return result.affectedRows > 0;
  }

  async deleteCreatedTask(taskId: string, userId: string, perfil: string): Promise<boolean> {
    if (!isDbConnected()) throw new Error('Banco de dados indisponível.');
    const result: any = await executeQuery(
      `DELETE t FROM tarefas_terapeuticas t JOIN vinculos v ON v.id_vinculo = t.id_vinculo
       WHERE t.id_tarefa = ? AND (? = 'administrador' OR (v.id_psicologo = ? AND t.criado_por = ?))`,
      [taskId, perfil, userId, userId]);
    return result.affectedRows > 0;
  }
}
