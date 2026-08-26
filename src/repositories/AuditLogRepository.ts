import { LogAuditoria } from '../types';

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
    return this.logs;
  }

  async create(autor: string, acao: string): Promise<LogAuditoria> {
    const dataHoraStr = new Date().toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(',', ' às');

    const newLog: LogAuditoria = {
      id: `l${Date.now()}`,
      autor,
      acao,
      dataHora: dataHoraStr
    };

    this.logs.unshift(newLog);
    return newLog;
  }
}
