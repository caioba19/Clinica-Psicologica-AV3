import { Request, Response } from 'express';
import { NodePatientService } from '../services/NodePatientService';
import { AuthRequest } from '../middlewares/authMiddleware';
import { NodeAuditLogService } from '../services/NodeAuditLogService';
import { publicErrorMessage } from '../utils/publicError';

export class PatientController {
  constructor(private patientService: NodePatientService, private auditLogService: NodeAuditLogService) {}

  getAll = async (req: Request, res: Response): Promise<Response> => {
    try {
      const auth = req as AuthRequest;
      const patients = await this.patientService.getAllPatients(auth.user!.id, auth.user!.perfil);
      return res.status(200).json(patients);
    } catch (error: any) {
      return res.status(500).json({ error: 'Não foi possível carregar os pacientes.' });
    }
  };

  getById = async (req: Request, res: Response): Promise<Response> => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const auth = req as AuthRequest;
      const patient = await this.patientService.getPatientById(id, auth.user!.id, auth.user!.perfil);

      if (!patient) {
        return res.status(404).json({ error: 'Paciente não encontrado.' });
      }

      return res.status(200).json(patient);
    } catch (error: any) {
      return res.status(500).json({ error: 'Não foi possível carregar o paciente.' });
    }
  };

  create = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { nome, cpf, email } = req.body;

      if (!nome || !cpf || !email) {
        return res.status(400).json({ error: 'Nome, CPF e e-mail são obrigatórios.' });
      }

      const auth = req as AuthRequest;
      const newPatient = await this.patientService.createPatient(req.body, auth.user!.id, auth.user!.perfil);
      await this.auditLogService.log(auth.user!.id, `Cadastrou paciente ${newPatient.id}`, 'paciente');
      return res.status(201).json(newPatient);
    } catch (error: any) {
      return res.status(400).json({ error: publicErrorMessage(error, 'Não foi possível cadastrar o paciente.') });
    }
  };

  update = async (req: Request, res: Response): Promise<Response> => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const auth = req as AuthRequest;
      const updatedPatient = await this.patientService.updatePatient(id, req.body, auth.user!.id, auth.user!.perfil);
      await this.auditLogService.log(auth.user!.id, `Atualizou paciente ${updatedPatient.id}`, 'paciente');
      return res.status(200).json(updatedPatient);
    } catch (error: any) {
      return res.status(400).json({ error: publicErrorMessage(error, 'Não foi possível atualizar o paciente.') });
    }
  };
}
