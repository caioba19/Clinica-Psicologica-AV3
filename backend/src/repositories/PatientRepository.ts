import { Paciente } from '../../../shared/src/types';
import { executeQuery, isDbConnected, withTransaction } from '../database/db';

export class PatientRepository {
  private patients: Paciente[] = [
    {
      id: '4',
      nome: 'Lucas Ferreira Mendes',
      email: 'lucas.mendes@email.com',
      telefone: '(11) 98765-4321',
      cpf: '314.159.265-90',
      dataNasc: '1992-04-15',
      genero: 'Masculino',
      status: 'Ativo',
      convenio: 'Particular',
      psicologoId: '2',
      psicologoNome: 'Dra. Sofia Mendes',
      totalSessoes: 12,
      ultimaSessao: '18/08/2026',
      proximaSessao: '25/08/2026 às 14:00',
      avatarColor: '#2b6cb0',
      motivoConsulta: 'Ansiedade generalizada e estresse ocupacional.',
      historico: 'Início do tratamento focado em técnicas cognitivo-comportamentais para regulação de humor.'
    },
    {
      id: '5',
      nome: 'Mariana Costa Ribeiro',
      email: 'mariana.costa@email.com',
      telefone: '(11) 97654-3210',
      cpf: '271.828.182-05',
      dataNasc: '1988-11-20',
      genero: 'Feminino',
      status: 'Ativo',
      convenio: 'SulAmérica',
      psicologoId: '2',
      psicologoNome: 'Dra. Sofia Mendes',
      totalSessoes: 8,
      ultimaSessao: '16/08/2026',
      proximaSessao: '23/08/2026 às 10:00',
      avatarColor: '#2f855a',
      motivoConsulta: 'Acompanhamento de transição de carreira e luto recente.',
      historico: 'Evolução favorável na elaboração de metas pessoais.'
    },
    {
      id: '6',
      nome: 'Gabriel Santos Almeida',
      email: 'gabriel.santos@email.com',
      telefone: '(21) 96543-2109',
      cpf: '161.803.398-05',
      dataNasc: '2001-07-03',
      genero: 'Masculino',
      status: 'Em Espera',
      convenio: 'Unimed',
      psicologoId: '2',
      psicologoNome: 'Dra. Sofia Mendes',
      totalSessoes: 2,
      ultimaSessao: '10/08/2026',
      proximaSessao: 'Aguardando agendamento',
      avatarColor: '#c05621',
      motivoConsulta: 'Fobia social e dificuldades interpessoais.',
      historico: 'Avaliação inicial concluída.'
    },
    {
      id: '7',
      nome: 'Beatriz Lima Rocha',
      email: 'beatriz.rocha@email.com',
      telefone: '(31) 95432-1098',
      cpf: '142.857.361-52',
      dataNasc: '1995-02-12',
      genero: 'Feminino',
      status: 'Inativo',
      convenio: 'Bradesco Saúde',
      psicologoId: '2',
      psicologoNome: 'Dra. Sofia Mendes',
      totalSessoes: 24,
      ultimaSessao: '05/06/2026',
      avatarColor: '#718096',
      motivoConsulta: 'Tratamento de síndrome do pânico.',
      historico: 'Alta clínica concedida após remissão dos sintomas.'
    }
  ];

  private mapRowToPatient(row: any): Paciente {
    return {
      id: String(row.id_usuario),
      nome: row.nome_completo || 'Paciente',
      email: row.email || '',
      telefone: row.telefone || '',
      cpf: row.cpf || '',
      dataNasc: row.data_nascimento ? String(row.data_nascimento).split('T')[0] : '',
      genero: row.genero || 'Não informado',
      status: row.status === 'ativo' ? 'Ativo' : row.status === 'suspenso' ? 'Em Espera' : 'Inativo',
      convenio: 'Particular',
      psicologoId: row.id_psicologo ? String(row.id_psicologo) : '',
      psicologoNome: row.psicologo_nome || '',
      totalSessoes: Number(row.total_sessoes || 0),
      ultimaSessao: row.ultima_sessao || 'Sem atendimentos',
      avatarColor: '#2b6cb0',
      motivoConsulta: row.motivo_consulta || row.observacoes || '',
      historico: row.historico_saude || ''
    };
  }

  async findAll(userId?: string, perfil?: string): Promise<Paciente[]> {
    if (isDbConnected()) {
      try {
        const rows = await executeQuery<any[]>(
          `SELECT cp.id_usuario, u.nome_completo, u.email, u.telefone, u.status,
                  cp.cpf, cp.data_nascimento, cp.motivo_consulta, cp.historico_saude, cp.genero,
                  v.id_psicologo, up.nome_completo as psicologo_nome, v.observacoes,
                  (SELECT COUNT(*) FROM registros_evolucao re WHERE re.id_vinculo = v.id_vinculo) as total_sessoes,
                  (SELECT DATE_FORMAT(MAX(re.data_sessao), '%d/%m/%Y') FROM registros_evolucao re WHERE re.id_vinculo = v.id_vinculo) as ultima_sessao
           FROM clientes_pacientes cp
           JOIN usuarios u ON cp.id_usuario = u.id_usuario
           LEFT JOIN vinculos v ON cp.id_usuario = v.id_paciente AND v.status = 'ativo'
           LEFT JOIN usuarios up ON v.id_psicologo = up.id_usuario
           WHERE (? = 'administrador' OR (? = 'psicologo' AND v.id_psicologo = ?) OR (? = 'paciente' AND cp.id_usuario = ?))
           ORDER BY u.id_usuario ASC`,
          [perfil || '', perfil || '', userId || '', perfil || '', userId || '']
        );
        return rows.map((r) => this.mapRowToPatient(r));
      } catch (err) { throw err; }
    }
    if (perfil === 'administrador') return this.patients;
    if (perfil === 'psicologo') return this.patients.filter((patient) => patient.psicologoId === userId);
    if (perfil === 'paciente') return this.patients.filter((patient) => patient.id === userId);
    return [];
  }

  async findById(id: string, userId?: string, perfil?: string): Promise<Paciente | null> {
    if (isDbConnected()) {
      try {
        const rows = await executeQuery<any[]>(
          `SELECT cp.id_usuario, u.nome_completo, u.email, u.telefone, u.status,
                  cp.cpf, cp.data_nascimento, cp.motivo_consulta, cp.historico_saude, cp.genero,
                  v.id_psicologo, up.nome_completo as psicologo_nome, v.observacoes,
                  (SELECT COUNT(*) FROM registros_evolucao re WHERE re.id_vinculo = v.id_vinculo) as total_sessoes,
                  (SELECT DATE_FORMAT(MAX(re.data_sessao), '%d/%m/%Y') FROM registros_evolucao re WHERE re.id_vinculo = v.id_vinculo) as ultima_sessao
           FROM clientes_pacientes cp
           JOIN usuarios u ON cp.id_usuario = u.id_usuario
           LEFT JOIN vinculos v ON cp.id_usuario = v.id_paciente AND v.status = 'ativo'
           LEFT JOIN usuarios up ON v.id_psicologo = up.id_usuario
           WHERE cp.id_usuario = ?
             AND (? = 'administrador' OR (? = 'psicologo' AND v.id_psicologo = ?) OR (? = 'paciente' AND cp.id_usuario = ?))`,
          [id, perfil || '', perfil || '', userId || '', perfil || '', userId || '']
        );
        return rows.length > 0 ? this.mapRowToPatient(rows[0]) : null;
      } catch (err) { throw err; }
    }
    const patient = this.patients.find((item) => item.id === id);
    if (!patient) return null;
    if (perfil === 'administrador' || (perfil === 'psicologo' && patient.psicologoId === userId) || (perfil === 'paciente' && patient.id === userId)) {
      return patient;
    }
    return null;
  }

  async findByCpf(cpf: string): Promise<Paciente | null> {
    if (isDbConnected()) {
      try {
        const cleanCpf = cpf.replace(/\D/g, '');
        const rows = await executeQuery<any[]>(
          `SELECT cp.id_usuario, u.nome_completo, u.email, u.telefone, u.status,
                  cp.cpf, cp.data_nascimento, cp.genero
           FROM clientes_pacientes cp
           JOIN usuarios u ON cp.id_usuario = u.id_usuario
           WHERE cp.cpf = ? OR cp.cpf = ?`,
          [cpf, cleanCpf]
        );
        return rows.length > 0 ? this.mapRowToPatient(rows[0]) : null;
      } catch (err) { throw err; }
    }
    return this.patients.find((p) => p.cpf === cpf || p.cpf.replace(/\D/g, '') === cpf.replace(/\D/g, '')) || null;
  }

  async create(data: Partial<Paciente> & { senhaHash?: string }): Promise<Paciente> {
    if (isDbConnected()) {
      const cleanCpf = (data.cpf || '').replace(/\D/g, '');
      const cleanPhone = (data.telefone || '').replace(/\D/g, '');
      const login = `${(data.email || `pac_${Date.now()}`).split('@')[0]}_${Date.now()}`;
      const status = data.status === 'Inativo' ? 'inativo' : data.status === 'Em Espera' ? 'suspenso' : 'ativo';
      const psiId = Number(data.psicologoId);
      if (!psiId) throw new Error('É necessário vincular o paciente a um psicólogo.');
      if (!/^\d{11}$/.test(cleanCpf)) throw new Error('CPF inválido. Informe os 11 dígitos.');
      if (!data.dataNasc) throw new Error('Data de nascimento é obrigatória.');
      if (!data.senhaHash) throw new Error('Senha inicial do paciente ausente.');
      const newUserId = await withTransaction(async (connection) => {
        const [psychologists] = await connection.execute<any[]>(
          `SELECT psi.id_usuario FROM psicologos psi JOIN usuarios u ON u.id_usuario = psi.id_usuario
           WHERE psi.id_usuario = ? AND u.status = 'ativo' LIMIT 1`,
          [psiId]
        );
        if (!psychologists.length) throw new Error('O psicólogo responsável não existe ou está inativo.');
        const [userRes] = await connection.execute<any>(
          `INSERT INTO usuarios (nome_completo, login, email, senha_hash, telefone, id_perfil, status) VALUES (?, ?, ?, ?, ?, 3, ?)`,
          [data.nome, login, data.email, data.senhaHash, cleanPhone || null, status]
        );
        const id = userRes.insertId;
        await connection.execute(
          `INSERT INTO clientes_pacientes (id_usuario, cpf, data_nascimento, motivo_consulta, historico_saude, genero, endereco) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [id, cleanCpf, data.dataNasc, data.motivoConsulta || null, data.historico || null, data.genero || null, null]
        );
        await connection.execute(
          `INSERT INTO vinculos (id_psicologo, id_paciente, status, data_inicio, observacoes) VALUES (?, ?, 'ativo', CURDATE(), ?)`,
          [psiId, id, data.motivoConsulta || null]
        );
        return id;
      });
      return {
        id: String(newUserId), nome: data.nome || '', email: data.email || '', telefone: data.telefone || '',
        cpf: data.cpf || '', dataNasc: data.dataNasc || '', genero: data.genero || '', status: data.status || 'Ativo',
        convenio: data.convenio || 'Particular', psicologoId: String(psiId), psicologoNome: data.psicologoNome || '',
        totalSessoes: 0, ultimaSessao: 'Sem atendimentos', avatarColor: '#2b6cb0',
        motivoConsulta: data.motivoConsulta || '', historico: data.historico || ''
      };
    }
    const newPatient: Paciente = {
      id: `pac_${Date.now()}`, nome: data.nome || '', email: data.email || '', telefone: data.telefone || '', cpf: data.cpf || '',
      dataNasc: data.dataNasc || '', genero: data.genero || '', status: data.status || 'Ativo', convenio: data.convenio || 'Particular',
      psicologoId: data.psicologoId || '', psicologoNome: data.psicologoNome || '', totalSessoes: 0, ultimaSessao: 'Sem atendimentos',
      avatarColor: '#2b6cb0', motivoConsulta: data.motivoConsulta || '', historico: ''
    };
    this.patients.unshift(newPatient);
    return newPatient;
  }
  async update(id: string, data: Partial<Paciente>, userId?: string, perfil?: string): Promise<Paciente | null> {
    const authorizedPatient = await this.findById(id, userId, perfil);
    if (!authorizedPatient) return null;
    if (isDbConnected()) {
      try {
        if (perfil === 'administrador' && data.psicologoId) {
          const novoPsicologoId = Number(data.psicologoId);
          if (!novoPsicologoId) throw new Error('Selecione um psicólogo válido.');
          await withTransaction(async (connection) => {
            const [psychologists] = await connection.execute<any[]>(
              `SELECT psi.id_usuario FROM psicologos psi JOIN usuarios u ON u.id_usuario = psi.id_usuario
               WHERE psi.id_usuario = ? AND u.status = 'ativo' LIMIT 1`,
              [novoPsicologoId]
            );
            if (!psychologists.length) throw new Error('O psicólogo selecionado não existe.');
            const [vinculos] = await connection.execute<any[]>(
              `SELECT id_vinculo, id_psicologo FROM vinculos WHERE id_paciente = ? AND status = 'ativo'`,
              [id]
            );
            if (vinculos.some((v) => Number(v.id_psicologo) === novoPsicologoId)) return;
            await connection.execute(
              `UPDATE vinculos SET status = 'encerrado', data_fim = GREATEST(CURDATE(), data_inicio) WHERE id_paciente = ? AND status = 'ativo'`,
              [id]
            );
            await connection.execute(
              `INSERT INTO vinculos (id_psicologo, id_paciente, status, data_inicio) VALUES (?, ?, 'ativo', CURDATE())`,
              [novoPsicologoId, id]
            );
          });
        }
        const status = data.status === 'Inativo' ? 'inativo' : data.status === 'Em Espera' ? 'suspenso' : 'ativo';
        if (data.nome || data.email || data.telefone || data.status) {
          await executeQuery(
            `UPDATE usuarios
             SET nome_completo = COALESCE(?, nome_completo),
                 email = COALESCE(?, email),
                 telefone = COALESCE(?, telefone),
                 status = COALESCE(?, status)
             WHERE id_usuario = ?`,
            [data.nome || null, data.email || null, data.telefone || null, data.status ? status : null, id]
          );
        }
        if (data.cpf || data.dataNasc || data.genero || data.motivoConsulta !== undefined || data.historico !== undefined) {
          const cleanCpf = data.cpf ? data.cpf.replace(/\D/g, '') : null;
          await executeQuery(
            `UPDATE clientes_pacientes
             SET cpf = COALESCE(?, cpf),
                 data_nascimento = COALESCE(?, data_nascimento),
                 genero = COALESCE(?, genero),
                 motivo_consulta = COALESCE(?, motivo_consulta),
                 historico_saude = COALESCE(?, historico_saude)
             WHERE id_usuario = ?`,
            [cleanCpf, data.dataNasc || null, data.genero || null, data.motivoConsulta ?? null, data.historico ?? null, id]
          );
        }
        return await this.findById(id, userId, perfil);
      } catch (err) { throw err; }
    }

    const index = this.patients.findIndex((p) => p.id === id);
    if (index === -1) return null;

    this.patients[index] = { ...this.patients[index], ...data };
    return this.patients[index];
  }
}
