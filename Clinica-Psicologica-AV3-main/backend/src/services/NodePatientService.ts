import { PatientRepository } from '../repositories/PatientRepository';
import { Paciente } from '../../../shared/src/types';
import bcrypt from 'bcryptjs';
import { isValidCPF, isValidEmail, isValidPhone } from '../../../shared/src/utils/validators';

function validBirthDate(value?: string): boolean {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day && year >= 1900 && date <= today;
}

export class NodePatientService {
  constructor(private patientRepository: PatientRepository) {}

  async getAllPatients(userId: string, perfil: string): Promise<Paciente[]> {
    return await this.patientRepository.findAll(userId, perfil);
  }

  async getPatientById(id: string, userId: string, perfil: string): Promise<Paciente | null> {
    return await this.patientRepository.findById(id, userId, perfil);
  }

  async createPatient(data: Partial<Paciente> & { senhaInicial?: string }, userId: string, perfil: string): Promise<Paciente> {
    if (perfil === 'paciente') throw new Error('Pacientes não podem cadastrar outros pacientes.');
    if (perfil === 'psicologo') data = { ...data, psicologoId: userId };
    if (!data.nome?.trim() || !data.email?.trim() || !isValidEmail(data.email)) throw new Error('Informe nome e e-mail válidos.');
    if (!data.cpf || !isValidCPF(data.cpf)) throw new Error('Informe um CPF válido.');
    if (!data.telefone || !isValidPhone(data.telefone)) throw new Error('Informe um telefone válido com DDD.');
    if (!validBirthDate(data.dataNasc)) throw new Error('Informe uma data de nascimento válida, não futura.');
    const existing = await this.patientRepository.findByCpf(data.cpf);
    if (existing) {
      throw new Error('Já existe um paciente cadastrado com este CPF.');
    }
    if (!data.senhaInicial || data.senhaInicial.length < 8) {
      throw new Error('Informe uma senha inicial com pelo menos 8 caracteres para o portal do paciente.');
    }
    const senhaHash = await bcrypt.hash(data.senhaInicial, 12);
    const { senhaInicial, ...patientData } = data;
    return await this.patientRepository.create({ ...patientData, senhaHash });
  }

  async updatePatient(id: string, data: Partial<Paciente>, userId: string, perfil: string): Promise<Paciente> {
    if (perfil === 'paciente') throw new Error('Pacientes não podem alterar cadastros.');
    if (data.cpf && !isValidCPF(data.cpf)) throw new Error('Informe um CPF válido.');
    if (data.email && !isValidEmail(data.email)) throw new Error('Informe um e-mail válido.');
    if (data.telefone && !isValidPhone(data.telefone)) throw new Error('Informe um telefone válido com DDD.');
    if (data.dataNasc && !validBirthDate(data.dataNasc)) throw new Error('Informe uma data de nascimento válida, não futura.');
    if (data.status && !['Ativo', 'Inativo', 'Em Espera'].includes(data.status)) throw new Error('Situação do paciente inválida.');
    const updated = await this.patientRepository.update(id, data, userId, perfil);
    if (!updated) {
      throw new Error('Paciente não encontrado');
    }
    return updated;
  }
}
