import { executeQuery, isDbConnected } from '../database/db';
import { encryptClinicalText } from './clinicalDataCrypto';

export async function encryptLegacyClinicalRecords(): Promise<number> {
  if (!isDbConnected()) throw new Error('MySQL precisa estar conectado antes da migração clínica.');
  const rows = await executeQuery<any[]>(
    `SELECT id_registro, anotacoes, plano FROM registros_evolucao
     WHERE (anotacoes IS NOT NULL AND anotacoes NOT LIKE 'enc:v1:%')
        OR (plano IS NOT NULL AND plano NOT LIKE 'enc:v1:%')`
  );
  for (const row of rows) {
    await executeQuery(
      'UPDATE registros_evolucao SET anotacoes = ?, plano = ? WHERE id_registro = ?',
      [encryptClinicalText(row.anotacoes), encryptClinicalText(row.plano), row.id_registro]
    );
  }
  return rows.length;
}
