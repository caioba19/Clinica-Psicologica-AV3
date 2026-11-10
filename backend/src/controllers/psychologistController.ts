import { Request, Response } from 'express';
import { NodePsychologistService } from '../services/NodePsychologistService';

export class PsychologistController {
  constructor(private psychologistService: NodePsychologistService) {}

  getAll = async (req: Request, res: Response): Promise<Response> => {
    try {
      const psychologists = await this.psychologistService.getAll();
      return res.status(200).json(psychologists);
    } catch {
      return res.status(500).json({ error: 'Não foi possível carregar os profissionais.' });
    }
  };

  getById = async (req: Request, res: Response): Promise<Response> => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const psychologist = await this.psychologistService.getById(id);
      return res.status(200).json(psychologist);
    } catch {
      return res.status(404).json({ error: 'Profissional não encontrado.' });
    }
  };

  create = async (req: Request, res: Response): Promise<Response> => {
    try {
      const newPsychologist = await this.psychologistService.create(req.body);
      return res.status(201).json(newPsychologist);
    } catch {
      return res.status(400).json({ error: 'Não foi possível cadastrar o profissional.' });
    }
  };
}
