import { api } from './api';
import { LogAuditoria } from '../types';

export const auditLogService = {
  async getAll(): Promise<LogAuditoria[]> {
    return await api.get<LogAuditoria[]>('/audit-logs');
  }
};
