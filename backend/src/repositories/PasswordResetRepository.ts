import { executeQuery, isDbConnected, withTransaction } from '../database/db';

interface InMemoryReset {
  userId: string;
  email: string;
  expiresAt: number;
  used: boolean;
}

const inMemoryTokens = new Map<string, InMemoryReset>();

export class PasswordResetRepository {
  async create(userId: string, email: string, tokenHash: string, expiresAt: Date): Promise<void> {
    if (isDbConnected()) {
      await withTransaction(async (connection) => {
        await connection.execute(
          'UPDATE password_reset_tokens SET used_at = UTC_TIMESTAMP() WHERE id_usuario = ? AND used_at IS NULL',
          [userId]
        );
        await connection.execute(
          'INSERT INTO password_reset_tokens (token_hash, id_usuario, expires_at) VALUES (?, ?, ?)',
          [tokenHash, userId, expiresAt]
        );
      });
      return;
    }
    inMemoryTokens.set(tokenHash, { userId, email: email.toLowerCase(), expiresAt: expiresAt.getTime(), used: false });
  }

  async complete(email: string, tokenHash: string, passwordHash: string): Promise<string | null> {
    if (isDbConnected()) {
      return withTransaction(async (connection) => {
        const [rows] = await connection.execute<any[]>(
          `SELECT pr.id_usuario FROM password_reset_tokens pr
           JOIN usuarios u ON u.id_usuario = pr.id_usuario
           WHERE pr.token_hash = ? AND LOWER(u.email) = LOWER(?)
             AND pr.used_at IS NULL AND pr.expires_at > UTC_TIMESTAMP()
           FOR UPDATE`,
          [tokenHash, email]
        );
        if (!rows.length) return null;
        const userId = String(rows[0].id_usuario);
        await connection.execute('UPDATE usuarios SET senha_hash = ? WHERE id_usuario = ?', [passwordHash, userId]);
        await connection.execute(
          'UPDATE password_reset_tokens SET used_at = UTC_TIMESTAMP() WHERE id_usuario = ? AND used_at IS NULL',
          [userId]
        );
        await connection.execute('UPDATE tokens_revogados SET expira_em = UTC_TIMESTAMP() WHERE id_usuario = ?', [userId]);
        return userId;
      });
    }
    const reset = inMemoryTokens.get(tokenHash);
    if (!reset || reset.used || reset.email !== email.toLowerCase() || reset.expiresAt <= Date.now()) return null;
    reset.used = true;
    return reset.userId;
  }

  async invalidate(tokenHash: string): Promise<void> {
    if (isDbConnected()) {
      await executeQuery('UPDATE password_reset_tokens SET used_at = UTC_TIMESTAMP() WHERE token_hash = ?', [tokenHash]);
      return;
    }
    const reset = inMemoryTokens.get(tokenHash);
    if (reset) reset.used = true;
  }
}
