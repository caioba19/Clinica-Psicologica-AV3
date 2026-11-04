import { NextFunction, Request, Response } from 'express';
import { createHmac } from 'node:crypto';
import { isDbConnected } from '../database/db';
import { LoginRateLimitRepository } from '../repositories/LoginRateLimitRepository';

const windowMs = 15 * 60 * 1000;
const maxAttempts = 100;
const attempts = new Map<string, { count: number; resetAt: number }>();
const repository = new LoginRateLimitRepository();

function respondLimited(res: Response, retryAfterSeconds: number) {
  res.setHeader('Retry-After', String(retryAfterSeconds));
  return res.status(429).json({ error: 'Muitas tentativas de login. Tente novamente mais tarde.' });
}

export async function loginRateLimit(req: Request, res: Response, next: NextFunction) {
  const now = Date.now();
  const key = req.ip || req.socket.remoteAddress || 'unknown';
  if (isDbConnected()) {
    try {
      const secret = process.env.JWT_SECRET;
      if (!secret) return res.status(503).json({ error: 'AutenticaÃ§Ã£o temporariamente indisponÃ­vel.' });
      const ipHash = createHmac('sha256', secret).update(key).digest('hex');
      const current = await repository.recordAttempt(ipHash);
      if (current.attempts > maxAttempts) return respondLimited(res, current.retryAfterSeconds);
      return next();
    } catch {
      return res.status(503).json({ error: 'AutenticaÃ§Ã£o temporariamente indisponÃ­vel.' });
    }
  }

  let current = attempts.get(key);

  if (!current || current.resetAt <= now) {
    current = { count: 0, resetAt: now + windowMs };
    attempts.set(key, current);
  }
  current.count += 1;

  if (attempts.size > 10000) {
    for (const [ip, entry] of attempts) if (entry.resetAt <= now) attempts.delete(ip);
  }
  if (current.count > maxAttempts) {
    return respondLimited(res, Math.ceil((current.resetAt - now) / 1000));
  }
  return next();
}
