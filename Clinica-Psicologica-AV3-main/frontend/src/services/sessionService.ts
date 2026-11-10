import { api } from './api';
import { Sessao } from '../../../shared/src/types';

export interface SessaoEvolucao {
  id: string;
  pacienteId: string;
  num: number;
  data: string;
  tipo: string;
  resumo: string;
  plano: string;
  status: 'Realizada' | 'Agendada' | 'Cancelada';
  escalaHumor?: number;
}

function toView(session: Sessao): SessaoEvolucao {
  const date = session.data?.slice(0, 10) || '';
  const [year, month, day] = date.split('-');
  return {
    id: session.id,
    pacienteId: session.pacienteId,
    num: 0,
    data: year && month && day ? `${day}/${month}/${year}` : date,
    tipo: 'Sessão individual',
    resumo: session.evolucaoText,
    plano: session.plano || '',
    status: session.status === 'Agendada' ? 'Agendada' : session.status === 'Cancelada' ? 'Cancelada' : 'Realizada',
    escalaHumor: session.humorScale
  };
}

export const sessionService = {
  async getByPaciente(pacienteId: string): Promise<SessaoEvolucao[]> {
    const sessions = await api.get<Sessao[]>(`/sessions?pacienteId=${encodeURIComponent(pacienteId)}`);
    return sessions.map((session, index) => ({ ...toView(session), num: sessions.length - index }));
  },

  async addEvolucao(session: Omit<SessaoEvolucao, 'id'>): Promise<SessaoEvolucao> {
    const saved = await api.post<Sessao>('/sessions', {
      pacienteId: session.pacienteId,
      data: (() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      })(),
      evolucaoText: session.resumo,
      plano: session.plano,
      humorScale: session.escalaHumor ?? 7,
      adesaoScale: 7,
      status: 'Concluída'
    });
    return toView(saved);
  }
};
