import { Agendamento } from '../../../shared/src/types';
import { executeQuery, isDbConnected, withTransaction } from '../database/db';

const appointmentSelect = `SELECT a.id_agendamento, DATE_FORMAT(a.inicio, '%Y-%m-%dT%H:%i:%s') AS inicio, a.duracao_minutos, a.tipo, a.modalidade, a.sala, a.status,
                                  v.id_paciente, up.nome_completo AS paciente_nome,
                                  v.id_psicologo, us.nome_completo AS psicologo_nome
                           FROM agendamentos a
                           JOIN vinculos v ON v.id_vinculo = a.id_vinculo
                           JOIN usuarios up ON up.id_usuario = v.id_paciente
                           JOIN usuarios us ON us.id_usuario = v.id_psicologo`;

function mapAppointment(row: any): Agendamento {
  return {
    id: String(row.id_agendamento),
    pacienteId: String(row.id_paciente),
    pacienteNome: row.paciente_nome,
    psicologoId: String(row.id_psicologo),
    psicologoNome: row.psicologo_nome,
    inicio: row.inicio,
    duracaoMinutos: Number(row.duracao_minutos),
    tipo: row.tipo,
    modalidade: row.modalidade,
    sala: row.sala || '',
    status: row.status
  };
}

export class AppointmentRepository {
  async findByDate(date: string, userId: string, perfil: string): Promise<Agendamento[]> {
    if (!isDbConnected()) throw new Error('Banco de dados indisponível. Não foi possível carregar a agenda.');
    const rows = await executeQuery<any[]>(
      `${appointmentSelect}
       WHERE DATE(a.inicio) = ? AND (? = 'administrador' OR v.id_psicologo = ?)
       ORDER BY a.inicio ASC`,
      [date, perfil, userId]
    );
    return rows.map(mapAppointment);
  }

  async findByPatient(userId: string): Promise<Agendamento[]> {
    if (!isDbConnected()) throw new Error('Banco de dados indisponível. Não foi possível carregar suas consultas.');
    const rows = await executeQuery<any[]>(
      `${appointmentSelect}
       WHERE v.id_paciente = ? AND a.status <> 'cancelado'
       ORDER BY a.inicio ASC`,
      [userId]
    );
    return rows.map(mapAppointment);
  }

  async create(
    data: { pacienteId: string; inicio: string; duracaoMinutos: number; tipo: string; modalidade: 'presencial' | 'online'; sala?: string },
    userId: string,
    perfil: string
  ): Promise<Agendamento> {
    if (!isDbConnected()) throw new Error('Banco de dados indisponível. O agendamento não foi salvo.');
    {
        const start = data.inicio.replace('T', ' ') + ':00';
        const endDate = new Date(`${data.inicio}:00`);
        endDate.setMinutes(endDate.getMinutes() + data.duracaoMinutos);
        const pad = (value: number) => String(value).padStart(2, '0');
        const end = `${endDate.getFullYear()}-${pad(endDate.getMonth() + 1)}-${pad(endDate.getDate())} ${pad(endDate.getHours())}:${pad(endDate.getMinutes())}:${pad(endDate.getSeconds())}`;
        const newId = await withTransaction(async (connection) => {
          const [links] = await connection.execute<any[]>(
            `SELECT id_vinculo, id_paciente, id_psicologo FROM vinculos
             WHERE id_paciente = ? AND status = 'ativo' AND (? = 'administrador' OR id_psicologo = ?)
             FOR UPDATE`,
            [data.pacienteId, perfil, userId]
          );
          if (!links.length) throw new Error('Paciente sem vínculo ativo autorizado para este agendamento.');
          const link = links[0];
          const [conflicts] = await connection.execute<any[]>(
            `SELECT a.id_agendamento FROM agendamentos a
             JOIN vinculos v ON v.id_vinculo = a.id_vinculo
             WHERE a.status IN ('agendado', 'confirmado')
               AND a.inicio < ? AND DATE_ADD(a.inicio, INTERVAL a.duracao_minutos MINUTE) > ?
               AND (v.id_paciente = ? OR v.id_psicologo = ?)
             LIMIT 1 FOR UPDATE`,
            [end, start, data.pacienteId, link.id_psicologo]
          );
          if (conflicts.length) throw new Error('O paciente ou psicólogo já possui uma consulta nesse horário.');
          const [result] = await connection.execute<any>(
            `INSERT INTO agendamentos (id_vinculo, inicio, duracao_minutos, tipo, modalidade, sala, status, criado_por)
             VALUES (?, ?, ?, ?, ?, ?, 'confirmado', ?)`,
            [link.id_vinculo, start, data.duracaoMinutos, data.tipo, data.modalidade, data.sala || null, userId]
          );
          return result.insertId;
        });
        const saved = await this.findById(String(newId));
        if (!saved) throw new Error('O agendamento foi inserido, mas não pôde ser carregado.');
        return saved;
    }
  }

  async updateStatus(id: string, status: Agendamento['status'], userId: string, perfil: string): Promise<Agendamento | null> {
    if (!isDbConnected()) throw new Error('Banco de dados indisponível. A situação não foi atualizada.');
    const result = await executeQuery<any>(
      `UPDATE agendamentos a
       JOIN vinculos v ON v.id_vinculo = a.id_vinculo
       SET a.status = ?
       WHERE a.id_agendamento = ? AND (? = 'administrador' OR v.id_psicologo = ?)`,
      [status, id, perfil, userId]
    );
    return result.affectedRows ? this.findById(id) : null;
  }

  private async findById(id: string): Promise<Agendamento | null> {
    const rows = await executeQuery<any[]>(`${appointmentSelect} WHERE a.id_agendamento = ? LIMIT 1`, [id]);
    return rows.length ? mapAppointment(rows[0]) : null;
  }
}
