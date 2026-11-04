import { createHash, randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { UserRepository } from '../repositories/UserRepository';
import { PasswordResetRepository } from '../repositories/PasswordResetRepository';
import { EmailDeliveryService } from './EmailDeliveryService';
import { isDbConnected } from '../database/db';

const resetLifetimeMs = 30 * 60 * 1000;

export class NodePasswordResetService {
  constructor(
    private users: UserRepository,
    private resets: PasswordResetRepository,
    private email: EmailDeliveryService
  ) {}

  async request(email: string): Promise<void> {
    if (!this.email.isConfigured()) throw new Error('A recuperação por e-mail não está configurada.');
    const account = await this.users.findByEmail(email.trim().toLowerCase());
    if (!account) return;

    const token = randomBytes(32).toString('base64url');
    const tokenHash = createHash('sha256').update(token).digest('hex');
    await this.resets.create(account.id, account.email, tokenHash, new Date(Date.now() + resetLifetimeMs));

    const baseUrl = (process.env.APP_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
    const resetUrl = new URL('/recuperar-senha', baseUrl);
    resetUrl.searchParams.set('email', account.email);
    resetUrl.searchParams.set('token', token);
    try {
      await this.email.sendPasswordReset(account.email, resetUrl.toString());
    } catch (error) {
      await this.resets.invalidate(tokenHash);
      throw error;
    }
  }

  async reset(email: string, token: string, password: string): Promise<void> {
    if (password.length < 8) throw new Error('A nova senha deve ter pelo menos 8 caracteres.');
    if (token.length < 40 || token.length > 100) throw new Error('Link de redefinição inválido ou expirado.');
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const passwordHash = await bcrypt.hash(password, 12);
    const userId = await this.resets.complete(email.trim().toLowerCase(), tokenHash, passwordHash);
    if (!userId) throw new Error('Link de redefinição inválido ou expirado.');
    if (!(await this.users.findById(userId))) throw new Error('Link de redefinição inválido ou expirado.');
    // The repository updates the hash atomically when connected; keep test/offline storage in sync too.
    if (!isDbConnected()) await this.users.updatePassword(userId, passwordHash);
  }
}
