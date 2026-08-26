import { Request, Response } from 'express';
import { NodeAuditLogService } from '../services/NodeAuditLogService';

export class AuditLogController {
  constructor(private auditLogService: NodeAuditLogService) {}

  getAll = async (req: Request, res: Response): Promise<Response> => {
    try {
      const logs = await this.auditLogService.getAll();
      return res.status(200).json(logs);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  };
}
