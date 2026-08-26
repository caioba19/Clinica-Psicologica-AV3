import { PsychologistRepository } from '../repositories/PsychologistRepository';
import { PsicologoProfissional } from '../types';

export class NodePsychologistService {
  constructor(private psychologistRepository: PsychologistRepository) {}

  async getAll(): Promise<PsicologoProfissional[]> {
    return await this.psychologistRepository.findAll();
  }

  async getById(id: string): Promise<PsicologoProfissional> {
    const psi = await this.psychologistRepository.findById(id);
    if (!psi) {
      throw new Error('Psicólogo não encontrado.');
    }
    return psi;
  }

  async create(data: Partial<PsicologoProfissional>): Promise<PsicologoProfissional> {
    if (!data.nome || !data.email) {
      throw new Error('Nome e e-mail são obrigatórios para o cadastro de psicólogo.');
    }
    return await this.psychologistRepository.create(data);
  }
}
