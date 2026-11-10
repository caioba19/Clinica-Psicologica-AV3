import { executeQuery } from '../database/db';

export class LoginRateLimitRepository {
  async recordAttempt(ipHash: string): Promise<{ attempts: number; retryAfterSeconds: number }> {
    await executeQuery(
      `INSERT INTO login_rate_limits (ip_hash, window_started_at, attempts)
       VALUES (?, UTC_TIMESTAMP(), 1)
       ON DUPLICATE KEY UPDATE
         attempts = IF(window_started_at <= DATE_SUB(UTC_TIMESTAMP(), INTERVAL 15 MINUTE), 1, attempts + 1),
         window_started_at = IF(window_started_at <= DATE_SUB(UTC_TIMESTAMP(), INTERVAL 15 MINUTE), UTC_TIMESTAMP(), window_started_at)`,
      [ipHash]
    );
    const rows = await executeQuery<any[]>(
      `SELECT attempts,
              GREATEST(1, 900 - TIMESTAMPDIFF(SECOND, window_started_at, UTC_TIMESTAMP())) AS retry_after
       FROM login_rate_limits WHERE ip_hash = ? LIMIT 1`,
      [ipHash]
    );
    if (Number(rows[0]?.attempts) === 1) {
      await executeQuery('DELETE FROM login_rate_limits WHERE window_started_at < DATE_SUB(UTC_TIMESTAMP(), INTERVAL 1 DAY)');
    }
    return {
      attempts: Number(rows[0]?.attempts || 1),
      retryAfterSeconds: Number(rows[0]?.retry_after || 900)
    };
  }
}
