import { api } from './api';
import { LogAuditoria } from '../../../shared/src/types';

export const auditLogService = {
  async getAll(): Promise<LogAuditoria[]> {
    return await api.get<LogAuditoria[]>('/audit-logs');
  }
};
