import { PsicologoProfissional } from '../types';

export class PsychologistRepository {
  private psychologists: PsicologoProfissional[] = [
    {
      id: 'p1',
      usuarioId: 'u2',
      nome: 'Dra. Sofia Mendes',
      email: 'dra.sofia@psicomanager.com.br',
      areaAtuacao: 'Psicologia Clínica (TCC)',
      registroCrp: 'CRP 06/123456',
      situacao: 'Ativo'
    },
    {
      id: 'p2',
      usuarioId: 'u3',
      nome: 'Dr. Roberto Alves',
      email: 'roberto.alves@clinica.com',
      areaAtuacao: 'Organizacional e do Trabalho',
      registroCrp: 'CRP 06/543210',
      situacao: 'Ativo'
    },
    {
      id: 'p3',
      usuarioId: 'u5',
      nome: 'Dr. Marcos Vinicius',
      email: 'marcos.v@clinica.com',
      areaAtuacao: 'Escolar e Educacional',
      registroCrp: 'CRP 06/987654',
      situacao: 'Bloqueado'
    }
  ];

  async findAll(): Promise<PsicologoProfissional[]> {
    return this.psychologists;
  }

  async findById(id: string): Promise<PsicologoProfissional | undefined> {
    return this.psychologists.find((p) => p.id === id);
  }

  async findByUsuarioId(usuarioId: string): Promise<PsicologoProfissional | undefined> {
    return this.psychologists.find((p) => p.usuarioId === usuarioId);
  }

  async create(data: Partial<PsicologoProfissional>): Promise<PsicologoProfissional> {
    const newPsi: PsicologoProfissional = {
      id: `p${Date.now()}`,
      usuarioId: data.usuarioId || `u${Date.now()}`,
      nome: data.nome || '',
      email: data.email || '',
      areaAtuacao: data.areaAtuacao || 'Psicologia Clínica (TCC)',
      registroCrp: data.registroCrp || 'CRP 06/000000',
      situacao: 'Ativo'
    };
    this.psychologists.unshift(newPsi);
    return newPsi;
  }
}
