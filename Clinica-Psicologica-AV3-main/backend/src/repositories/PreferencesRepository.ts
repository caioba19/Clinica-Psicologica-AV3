import { executeQuery, isDbConnected } from '../database/db';
import { PreferenciasUsuario } from '../../../shared/src/types';

const defaults: PreferenciasUsuario = {
  nomeClinica: '', documentoClinica: '', enderecoClinica: '', cidadeClinica: '',
  duracaoSessao: 50, intervaloSessao: 10, lembreteHoras: 24, valorSessaoPadrao: 220,
  notifEmail: false, notifSms: false, notifLembrete: true
};

export class PreferencesRepository {
  async get(userId: string): Promise<PreferenciasUsuario> {
    if (!isDbConnected()) throw new Error('Banco de dados indisponível.');
    const rows = await executeQuery<any[]>(
      'SELECT preferencias FROM configuracoes_usuario WHERE id_usuario = ? LIMIT 1', [userId]
    );
    if (!rows.length) return defaults;
    const raw = rows[0].preferencias;
    const saved = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return { ...defaults, ...saved };
  }

  async save(userId: string, preferences: PreferenciasUsuario): Promise<PreferenciasUsuario> {
    if (!isDbConnected()) throw new Error('Banco de dados indisponível.');
    await executeQuery(
      `INSERT INTO configuracoes_usuario (id_usuario, preferencias) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE preferencias = VALUES(preferencias)`,
      [userId, JSON.stringify(preferences)]
    );
    return preferences;
  }
}
