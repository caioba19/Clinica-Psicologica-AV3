import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../backend/src/expressApp';

process.env.JWT_SECRET = 'http-integration-test-secret-with-more-than-32-characters';

describe('API HTTP: autenticação e autorização', () => {
  it('protege rotas, cria sessão HttpOnly e aplica permissões por perfil', async () => {
    const server = app.listen(0);
    await new Promise<void>((resolve, reject) => {
      server.once('listening', resolve);
      server.once('error', reject);
    });

    const address = server.address();
    assert.ok(address && typeof address !== 'string');
    const baseUrl = `http://127.0.0.1:${address.port}`;

    try {
      const denied = await fetch(`${baseUrl}/api/patients`);
      assert.equal(denied.status, 401);

      const login = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'dra.sofia@psicomanager.com.br', senha: '123456' })
      });
      assert.equal(login.status, 200);
      const loginBody = await login.json() as { user: { nome: string }; token?: string };
      assert.equal(loginBody.user.nome, 'Dra. Sofia Mendes');
      assert.equal(loginBody.token, undefined);

      const setCookie = login.headers.get('set-cookie');
      assert.ok(setCookie?.includes('HttpOnly'));
      assert.ok(setCookie?.includes('SameSite=Strict'));
      const cookie = setCookie!.split(';', 1)[0];

      const me = await fetch(`${baseUrl}/api/auth/me`, { headers: { Cookie: cookie } });
      assert.equal(me.status, 200);

      const patients = await fetch(`${baseUrl}/api/patients`, { headers: { Cookie: cookie } });
      assert.equal(patients.status, 200);

      const adminOnly = await fetch(`${baseUrl}/api/users`, { headers: { Cookie: cookie } });
      assert.equal(adminOnly.status, 403);

      const adminLogin = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@clinica.com', senha: '123456' })
      });
      assert.equal(adminLogin.status, 200);
      const adminCookie = adminLogin.headers.get('set-cookie')!.split(';', 1)[0];
      const invalidStatus = await fetch(`${baseUrl}/api/users/2/situacao`, {
        method: 'PATCH',
        headers: { Cookie: adminCookie, 'Content-Type': 'application/json' },
        body: JSON.stringify({ situacao: 'qualquer' })
      });
      assert.equal(invalidStatus.status, 400);

      const logout = await fetch(`${baseUrl}/api/auth/logout`, {
        method: 'POST', headers: { Cookie: cookie }
      });
      assert.equal(logout.status, 200);

      const afterLogout = await fetch(`${baseUrl}/api/patients`, { headers: { Cookie: cookie } });
      assert.equal(afterLogout.status, 401);
    } finally {
      await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    }
  });

  it('limita CORS à origem configurada', async () => {
    const server = app.listen(0);
    await new Promise<void>((resolve, reject) => {
      server.once('listening', resolve);
      server.once('error', reject);
    });
    const address = server.address();
    assert.ok(address && typeof address !== 'string');
    const allowedOrigin = (process.env.CORS_ORIGINS || 'http://localhost:3000').split(',')[0].trim();

    try {
      const allowed = await fetch(`http://127.0.0.1:${address.port}/api/health`, {
        headers: { Origin: allowedOrigin }
      });
      assert.equal(allowed.headers.get('access-control-allow-origin'), allowedOrigin);

      const blocked = await fetch(`http://127.0.0.1:${address.port}/api/health`, {
        headers: { Origin: 'https://unexpected.example' }
      });
      assert.equal(blocked.headers.get('access-control-allow-origin'), null);
    } finally {
      await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    }
  });
});
