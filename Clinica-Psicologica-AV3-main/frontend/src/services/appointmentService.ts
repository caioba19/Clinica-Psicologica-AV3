import { api } from './api';
import { Agendamento } from '../../../shared/src/types';

export const appointmentService = {
  async getByDate(date: string): Promise<Agendamento[]> {
    return await api.get<Agendamento[]>(`/appointments?data=${encodeURIComponent(date)}`);
  },

  async getMine(): Promise<Agendamento[]> {
    return await api.get<Agendamento[]>('/appointments/my');
  },

  async create(data: {
    pacienteId: string;
    inicio: string;
    duracaoMinutos?: number;
    tipo?: string;
    modalidade: 'presencial' | 'online';
    sala?: string;
  }): Promise<Agendamento> {
    return await api.post<Agendamento>('/appointments', data);
  },

  async updateStatus(id: string, status: Agendamento['status']): Promise<Agendamento> {
    return await api.patch<Agendamento>(`/appointments/${id}/status`, { status });
  }
};
