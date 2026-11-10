import mysql from 'mysql2/promise';

let pool: mysql.Pool | null = null;
let isConnected = false;

export const getDbPool = (): mysql.Pool => {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'psicomanager',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  }
  return pool;
};

export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    const p = getDbPool();
    const connection = await p.getConnection();
    await connection.ping();
    await connection.query('SELECT 1 FROM tokens_revogados LIMIT 0');
    connection.release();
    isConnected = true;
    console.log('✅ [MySQL] Conexão com o banco de dados "psicomanager" realizada com sucesso!');
    return true;
  } catch (error: any) {
    isConnected = false;
    console.error(`[MySQL] Falha ao conectar: ${error.message}`);
    return false;
  }
};

export const isDbConnected = (): boolean => isConnected;

export const executeQuery = async <T = any>(sql: string, params: any[] = []): Promise<T> => {
  const p = getDbPool();
  const [results] = await p.execute(sql, params);
  return results as T;
};

export const withTransaction = async <T>(work: (connection: mysql.PoolConnection) => Promise<T>): Promise<T> => {
  const connection = await getDbPool().getConnection();
  try {
    await connection.beginTransaction();
    const result = await work(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
