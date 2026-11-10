import { SessionRepository } from '../repositories/SessionRepository';
import { Sessao } from '../../../shared/src/types';

function validSessionDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

export class NodeSessionService {
  constructor(private sessionRepository: SessionRepository) {}

  async getSessionsByPatient(pacienteId: string, userId: string, perfil: string): Promise<Sessao[]> {
    return await this.sessionRepository.findByPatientId(pacienteId, userId, perfil);
  }

  async createSession(data: Partial<Sessao>, userId: string, perfil: string): Promise<Sessao> {
    if (perfil !== 'administrador' && perfil !== 'psicologo') throw new Error('Acesso negado.');
    if (typeof data.pacienteId !== 'string' || !data.pacienteId.trim() || typeof data.evolucaoText !== 'string' || !data.evolucaoText.trim()) {
      throw new Error('ID do paciente e relato de evolução são obrigatórios.');
    }
    if (data.evolucaoText.length > 20000 || (data.plano && data.plano.length > 10000)) {
      throw new Error('O relato ou plano excede o tamanho permitido.');
    }
    for (const [label, value] of [['humor', data.humorScale], ['adesao', data.adesaoScale]] as const) {
      if (value !== undefined && (!Number.isInteger(value) || value < 0 || value > 10)) {
        throw new Error(`A escala de ${label} deve ser um número inteiro de 0 a 10.`);
      }
    }
    if (data.data && !validSessionDate(data.data)) throw new Error('Informe uma data de sessão válida no formato AAAA-MM-DD.');
    return await this.sessionRepository.create(data, userId, perfil);
  }
}
