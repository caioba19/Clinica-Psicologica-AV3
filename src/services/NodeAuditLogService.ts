import { AuditLogRepository } from '../repositories/AuditLogRepository';
import { LogAuditoria } from '../types';

export class NodeAuditLogService {
  constructor(private auditLogRepository: AuditLogRepository) {}

  async getAll(): Promise<LogAuditoria[]> {
    return await this.auditLogRepository.findAll();
  }

  async log(autor: string, acao: string): Promise<LogAuditoria> {
    return await this.auditLogRepository.create(autor, acao);
  }
}
