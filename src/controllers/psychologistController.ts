import { Request, Response } from 'express';
import { NodePsychologistService } from '../services/NodePsychologistService';

export class PsychologistController {
  constructor(private psychologistService: NodePsychologistService) {}

  getAll = async (req: Request, res: Response): Promise<Response> => {
    try {
      const psychologists = await this.psychologistService.getAll();
      return res.status(200).json(psychologists);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  };

  getById = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const psychologist = await this.psychologistService.getById(id);
      return res.status(200).json(psychologist);
    } catch (error: any) {
      return res.status(404).json({ error: error.message });
    }
  };

  create = async (req: Request, res: Response): Promise<Response> => {
    try {
      const newPsychologist = await this.psychologistService.create(req.body);
      return res.status(201).json(newPsychologist);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };
}
