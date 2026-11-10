import { LogAuditoria } from '../../../shared/src/types';
import { executeQuery, isDbConnected } from '../database/db';

export class AuditLogRepository {
  private logs: LogAuditoria[] = [
    {
      id: 'l1',
      autor: 'Renata Farias (Admin)',
      acao: 'Bloqueou o acesso de Marcos Vinicius por pendência cadastral',
      dataHora: '17/08/2026 às 10:22'
    },
    {
      id: 'l2',
      autor: 'Renata Farias (Admin)',
      acao: 'Cadastrou o psicólogo Roberto Alves no sistema',
      dataHora: '10/08/2026 às 16:05'
    },
    {
      id: 'l3',
      autor: 'Dra. Sofia Mendes (Psi)',
      acao: 'Atualizou prontuário de Lucas Ferreira Mendes',
      dataHora: '09/08/2026 às 08:41'
    },
    {
      id: 'l4',
      autor: 'Sistema (Autenticação)',
      acao: 'Tentativa de login efetuada no sistema',
      dataHora: '08/08/2026 às 14:12'
    }
  ];

  async findAll(): Promise<LogAuditoria[]> {
    if (isDbConnected()) {
      try {
        const rows = await executeQuery<any[]>(
          `SELECT la.id_log, COALESCE(u.nome_completo, 'Sistema') as autor, la.acao,
                  DATE_FORMAT(la.data_hora, '%d/%m/%Y às %H:%i') as dataHora
           FROM logs_acoes la
           LEFT JOIN usuarios u ON la.id_usuario = u.id_usuario
           ORDER BY la.data_hora DESC`
        );
        return rows.map((r) => ({
            id: `l${r.id_log}`,
            autor: r.autor,
            acao: r.acao,
            dataHora: r.dataHora
        }));
      } catch (err) { throw err; }
    }
    return [];
  }

  async create(userId: string, acao: string, recurso: string): Promise<LogAuditoria> {
    const dataHoraStr = new Date().toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(',', ' às');

    if (isDbConnected()) {
      try {
        const res = await executeQuery<any>(
          `INSERT INTO logs_acoes (id_usuario, acao, recurso, detalhes, data_hora)
           VALUES (?, ?, ?, JSON_OBJECT('origem', 'api'), NOW())`,
          [userId, acao, recurso]
        );
        return {
          id: `l${res.insertId}`,
          autor: userId,
          acao,
          dataHora: dataHoraStr
        };
      } catch (err) { throw err; }
    }

    return { id: `l${Date.now()}`, autor: userId, acao, dataHora: dataHoraStr };
  }
}
