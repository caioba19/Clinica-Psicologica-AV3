import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { NodePasswordResetService } from '../backend/src/services/NodePasswordResetService';
import { PasswordResetRepository } from '../backend/src/repositories/PasswordResetRepository';
import { UserRepository } from '../backend/src/repositories/UserRepository';
import { NodeAuthService } from '../backend/src/services/NodeAuthService';
import { EmailReminderService } from '../backend/src/services/EmailReminderService';

process.env.JWT_SECRET ||= 'test-only-secret-for-password-reset-tests-32-chars';

const configuredMailer = (onSend: (to: string, url: string) => void) => ({
  isConfigured: () => true,
  sendPasswordReset: async (to: string, url: string) => onSend(to, url)
}) as any;

describe('Recuperação de senha por e-mail', () => {
  it('solicita para conta existente, endereça ao dono da conta, redefine a senha e invalida o link após o primeiro uso', async () => {
    const users = new UserRepository();
    const resets = new PasswordResetRepository();
    let recipient = '';
    let resetUrl = '';
    const service = new NodePasswordResetService(users, resets, configuredMailer((to, url) => {
      recipient = to;
      resetUrl = url;
    }));

    await service.request('ADMIN@CLINICA.COM');
    assert.equal(recipient, 'admin@clinica.com');
    const link = new URL(resetUrl);
    assert.equal(link.pathname, '/recuperar-senha');
    assert.equal(link.searchParams.get('email'), recipient);
    const token = link.searchParams.get('token')!;
    assert.ok(token.length >= 40);

    await service.reset(recipient, token, 'SenhaNova123');
    assert.ok((await new NodeAuthService(users).login(recipient, 'SenhaNova123')).token);
    await assert.rejects(() => service.reset(recipient, token, 'OutraSenha123'), /inválido ou expirado/);
  });

  it('responde sem enviar e-mail quando o endereço não está cadastrado', async () => {
    const users = new UserRepository();
    let sends = 0;
    const service = new NodePasswordResetService(users, new PasswordResetRepository(), configuredMailer(() => { sends += 1; }));
    await service.request('nao-existe@example.test');
    assert.equal(sends, 0);
  });

  it('rejeita token inválido, expirado e senha abaixo do mínimo', async () => {
    const users = new UserRepository();
    const resets = new PasswordResetRepository();
    const service = new NodePasswordResetService(users, resets, configuredMailer(() => {}));
    const token = 'token-de-teste-com-tamanho-superior-a-quarenta-caracteres';
    const tokenHash = createHash('sha256').update(token).digest('hex');
    await resets.create('1', 'admin@clinica.com', tokenHash, new Date(Date.now() - 1000));
    await assert.rejects(() => service.reset('admin@clinica.com', token, 'SenhaNova123'), /inválido ou expirado/);
    await assert.rejects(() => service.reset('admin@clinica.com', 'token-invalido-com-tamanho-superior-a-quarenta-caracteres', 'SenhaNova123'), /inválido ou expirado/);
    await assert.rejects(() => service.reset('admin@clinica.com', token, 'curta'), /pelo menos 8 caracteres/);
  });

  it('invalida o token se o provedor recusar o envio e rejeita e-mail divergente', async () => {
    const users = new UserRepository();
    const resets = new PasswordResetRepository();
    let resetUrl = '';
    const mailer = {
      isConfigured: () => true,
      sendPasswordReset: async (_to: string, url: string) => {
        resetUrl = url;
        throw new Error('SMTP indisponível');
      }
    } as any;
    const service = new NodePasswordResetService(users, resets, mailer);
    await assert.rejects(() => service.request('admin@clinica.com'));
    const token = new URL(resetUrl).searchParams.get('token')!;
    await assert.rejects(() => service.reset('outro@clinica.com', token, 'SenhaNova123'), /inválido ou expirado/);
    await assert.rejects(() => service.reset('admin@clinica.com', token, 'SenhaNova123'), /inválido ou expirado/);
  });
});

describe('Lembretes de sessão por e-mail', () => {
  it('entrega ao e-mail do paciente e marca o lembrete para evitar reenvio', async () => {
    const sent: string[] = [];
    const marked: string[] = [];
    const repository = {
      findDueEmailReminders: async () => [{ id: 'session-1', email: 'paciente@example.test', inicio: '2026-12-01T10:00:00' }],
      markEmailReminderSent: async (id: string) => { marked.push(id); }
    } as any;
    const mailer = {
      isConfigured: () => true,
      sendSessionReminder: async (to: string) => { sent.push(to); }
    } as any;
    assert.equal(await new EmailReminderService(repository, mailer).sendDueReminders(), 1);
    assert.deepEqual(sent, ['paciente@example.test']);
    assert.deepEqual(marked, ['session-1']);
  });
});
