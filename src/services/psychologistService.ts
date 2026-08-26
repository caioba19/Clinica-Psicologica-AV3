import { api } from './api';
import { PsicologoProfissional } from '../types';

export const psychologistService = {
  async getAll(): Promise<PsicologoProfissional[]> {
    return await api.get<PsicologoProfissional[]>('/psychologists');
  },

  async getById(id: string): Promise<PsicologoProfissional> {
    return await api.get<PsicologoProfissional>(`/psychologists/${id}`);
  },

  async create(data: Partial<PsicologoProfissional>): Promise<PsicologoProfissional> {
    return await api.post<PsicologoProfissional>('/psychologists', data);
  }
};
