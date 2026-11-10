import { AuditLogRepository } from '../repositories/AuditLogRepository';
import { LogAuditoria } from '../../../shared/src/types';

export class NodeAuditLogService {
  constructor(private auditLogRepository: AuditLogRepository) {}

  async getAll(): Promise<LogAuditoria[]> {
    return await this.auditLogRepository.findAll();
  }

  async log(userId: string, acao: string, recurso: string): Promise<LogAuditoria> {
    return await this.auditLogRepository.create(userId, acao, recurso);
  }
}
