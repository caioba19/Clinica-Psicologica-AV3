import 'dotenv/config';
import { app } from './expressApp';
import { checkDatabaseConnection } from './database/db';
import { encryptLegacyClinicalRecords } from './services/clinicalDataMigration';

const PORT = Number(process.env.PORT) || 3001;

async function startServer() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('Configure JWT_SECRET com pelo menos 32 caracteres antes de iniciar o servidor.');
  }
  if (!process.env.CLINICAL_DATA_KEY || !/^[0-9a-f]{64}$/i.test(process.env.CLINICAL_DATA_KEY)) {
    throw new Error('Configure CLINICAL_DATA_KEY com 64 caracteres hexadecimais (32 bytes).');
  }
  if (!(await checkDatabaseConnection())) {
    throw new Error('Não foi possível conectar ao MySQL. O servidor não será iniciado sem persistência.');
  }
  const migratedRecords = await encryptLegacyClinicalRecords();
  if (migratedRecords > 0) console.log(`[Segurança] ${migratedRecords} registros clínicos protegidos com AES-256-GCM.`);
  app.listen(PORT, () => console.log(`Servidor HTTP rodando na porta ${PORT}`));
}

startServer().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
