import { api } from './api';
import { Paciente } from '../../../shared/src/types';

export const patientService = {
  async getAll(): Promise<Paciente[]> {
    try {
      return await api.get<Paciente[]>('/patients');
    } catch {
      return [];
    }
  },

  async getById(id: string): Promise<Paciente | null> {
    try {
      return await api.get<Paciente>(`/patients/${id}`);
    } catch {
      return null;
    }
  },

  async create(data: Partial<Paciente>): Promise<Paciente> {
    return await api.post<Paciente>('/patients', data);
  },

  async update(id: string, data: Partial<Paciente>): Promise<Paciente> {
    return await api.patch<Paciente>(`/patients/${id}`, data);
  },

  async inactivate(id: string): Promise<Paciente> {
    return await api.patch<Paciente>(`/patients/${id}`, { status: 'Inativo' });
  }
};
