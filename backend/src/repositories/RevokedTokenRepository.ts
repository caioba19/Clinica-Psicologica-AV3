import { executeQuery, isDbConnected } from '../database/db';

const revokedTokens = new Map<string, { userId: string; expiresAt: Date }>();

export class RevokedTokenRepository {
  async isRevoked(jti: string): Promise<boolean> {
    if (!isDbConnected()) {
      const token = revokedTokens.get(jti);
      if (!token) return false;
      if (token.expiresAt <= new Date()) {
        revokedTokens.delete(jti);
        return false;
      }
      return true;
    }
    const rows = await executeQuery<any[]>(
      'SELECT 1 FROM tokens_revogados WHERE jti = ? AND expira_em > NOW() LIMIT 1',
      [jti]
    );
    return rows.length > 0;
  }

  async revoke(jti: string, userId: string, expiresAt: Date): Promise<void> {
    if (!isDbConnected()) {
      revokedTokens.set(jti, { userId, expiresAt });
      return;
    }
    await executeQuery('DELETE FROM tokens_revogados WHERE expira_em <= NOW()');
    await executeQuery(
      'INSERT INTO tokens_revogados (jti, id_usuario, expira_em) VALUES (?, ?, ?)',
      [jti, userId, expiresAt]
    );
  }
}
