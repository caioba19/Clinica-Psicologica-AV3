import { Sessao } from '../../../shared/src/types';
import { executeQuery, isDbConnected } from '../database/db';
import { decryptClinicalText, encryptClinicalText } from '../services/clinicalDataCrypto';

export class SessionRepository {
  private sessions: Sessao[] = [
    {
      id: 'sess_1',
      pacienteId: '4',
      psicologoId: '2',
      data: '2026-08-18',
      queixaPrincipal: 'Estresse leve durante prazos de entregas no trabalho.',
      evolucaoText: 'Paciente relata redução nos episódios de ansiedade no ambiente de trabalho após aplicação das técnicas recomendadas.',
      humorScale: 8,
      adesaoScale: 9,
      status: 'Concluída'
    }
  ];

  async findByPatientId(pacienteId: string, userId: string, perfil: string): Promise<Sessao[]> {
    if (isDbConnected()) {
      try {
        const rows = await executeQuery<any[]>(
          `SELECT re.id_registro, v.id_paciente, re.registrado_por as psicologo_id,
                  DATE_FORMAT(re.data_sessao, '%Y-%m-%d') as data,
                  re.nivel_humor, re.nivel_ansiedade, re.anotacoes, re.plano
           FROM registros_evolucao re
           JOIN vinculos v ON re.id_vinculo = v.id_vinculo
           WHERE (? = '' OR v.id_paciente = ?)
             AND (? = 'administrador' OR v.id_psicologo = ?)
           ORDER BY re.data_sessao DESC`,
          [pacienteId, pacienteId, perfil, userId]
        );
        return rows.map((r) => ({
            id: String(r.id_registro),
            pacienteId: String(r.id_paciente),
            psicologoId: String(r.psicologo_id),
            data: r.data,
            queixaPrincipal: 'Acompanhamento de rotina',
            evolucaoText: decryptClinicalText(r.anotacoes) || '',
            plano: decryptClinicalText(r.plano) || '',
            humorScale: r.nivel_humor ?? 7,
            adesaoScale: 10 - (r.nivel_ansiedade ?? 5),
            status: 'Concluída'
        }));
      } catch (err) { throw err; }
    }
    return this.sessions.filter((s) => (!pacienteId || s.pacienteId === pacienteId) && (perfil === 'administrador' || s.psicologoId === userId));
  }

  async create(data: Partial<Sessao>, userId: string, perfil: string): Promise<Sessao> {
    if (isDbConnected()) {
      try {
        // Encontrar o vínculo ativo
        const vinculos = await executeQuery<any[]>(
          `SELECT id_vinculo, id_psicologo FROM vinculos
           WHERE id_paciente = ? AND status = 'ativo'
             AND (? = 'administrador' OR id_psicologo = ?)
           LIMIT 1`,
          [data.pacienteId, perfil, userId]
        );
        if (!vinculos?.length) throw new Error('Paciente não vinculado ao profissional autenticado.');
        const vinculoId = vinculos[0].id_vinculo;
        const psiId = vinculos[0].id_psicologo;

        const res = await executeQuery<any>(
          `INSERT INTO registros_evolucao (id_vinculo, data_sessao, nivel_humor, nivel_ansiedade, anotacoes, plano, registrado_por)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            vinculoId,
            data.data || new Date().toISOString().split('T')[0],
            data.humorScale || 7,
            10 - (data.adesaoScale || 7),
            encryptClinicalText(data.evolucaoText || data.queixaPrincipal || ''),
            encryptClinicalText(data.plano || null),
            userId
          ]
        );

        return {
          id: String(res.insertId),
          pacienteId: data.pacienteId || '',
          psicologoId: String(psiId),
          data: data.data || new Date().toISOString().split('T')[0],
          queixaPrincipal: data.queixaPrincipal || '',
          evolucaoText: data.evolucaoText || '',
          plano: data.plano || '',
          humorScale: data.humorScale || 7,
          adesaoScale: data.adesaoScale || 8,
          status: 'Concluída'
        };
      } catch (err) { throw err; }
    }

    const newSession: Sessao = {
      id: `sess_${Date.now()}`,
      pacienteId: data.pacienteId || '',
      psicologoId: data.psicologoId || '2',
      data: data.data || new Date().toISOString().split('T')[0],
      queixaPrincipal: data.queixaPrincipal || '',
      evolucaoText: data.evolucaoText || '',
      humorScale: data.humorScale || 5,
      adesaoScale: data.adesaoScale || 5,
      status: data.status || 'Concluída'
    };

    this.sessions.unshift(newSession);
    return newSession;
  }
}
