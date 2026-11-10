import { Agendamento } from '../../../shared/src/types';
import { AppointmentRepository } from '../repositories/AppointmentRepository';

const statusPermitidos: Agendamento['status'][] = ['agendado', 'confirmado', 'realizado', 'cancelado'];

function isCalendarDate(date: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const [year, month, day] = date.split('-').map(Number);
  const parsed = new Date(year, month - 1, day);
  return parsed.getFullYear() === year && parsed.getMonth() === month - 1 && parsed.getDate() === day;
}

function parseLocalDateTime(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null;
  const [date, time] = value.split('T');
  if (!isCalendarDate(date)) return null;
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  const parsed = new Date(year, month - 1, day, hour, minute);
  if (parsed.getHours() !== hour || parsed.getMinutes() !== minute) return null;
  return parsed;
}

export class NodeAppointmentService {
  constructor(private repository: AppointmentRepository) {}

  async getByDate(date: string, userId: string, perfil: string): Promise<Agendamento[]> {
    if (!isCalendarDate(date)) {
      throw new Error('Informe uma data válida no formato AAAA-MM-DD.');
    }
    return this.repository.findByDate(date, userId, perfil);
  }

  async getForPatient(userId: string): Promise<Agendamento[]> {
    return this.repository.findByPatient(userId);
  }

  async create(data: Partial<Agendamento>, userId: string, perfil: string): Promise<Agendamento> {
    if (!data.pacienteId || !data.inicio) {
      throw new Error('Paciente, data e horário são obrigatórios.');
    }
    const start = parseLocalDateTime(data.inicio);
    if (!start) throw new Error('Informe uma data e um horário válidos.');
    if (start.getTime() <= Date.now()) throw new Error('A consulta deve ser marcada para uma data futura válida.');
    const duracao = Number(data.duracaoMinutos ?? 50);
    if (!Number.isInteger(duracao) || duracao < 15 || duracao > 180) throw new Error('A duração deve ficar entre 15 e 180 minutos.');
    if (data.modalidade !== 'presencial' && data.modalidade !== 'online') throw new Error('Selecione uma modalidade válida.');
    const tipo = data.tipo?.trim() || 'Atendimento psicológico';
    const sala = data.sala?.trim() || '';
    return this.repository.create({ pacienteId: data.pacienteId, inicio: data.inicio, duracaoMinutos: duracao, tipo, modalidade: data.modalidade, sala }, userId, perfil);
  }

  async updateStatus(id: string, status: string, userId: string, perfil: string): Promise<Agendamento> {
    if (!statusPermitidos.includes(status as Agendamento['status'])) throw new Error('Situação de consulta inválida.');
    const updated = await this.repository.updateStatus(id, status as Agendamento['status'], userId, perfil);
    if (!updated) throw new Error('Agendamento não encontrado ou sem permissão.');
    return updated;
  }
}
