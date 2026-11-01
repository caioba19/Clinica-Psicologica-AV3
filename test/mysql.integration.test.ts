import { it } from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../backend/src/expressApp';
import { checkDatabaseConnection, getDbPool } from '../backend/src/database/db';

it('integra login, pacientes e agenda com o MySQL configurado', {
  skip: process.env.RUN_MYSQL_INTEGRATION !== '1'
}, async () => {
  assert.ok(process.env.DB_NAME, 'Configure DB_NAME para a base que já contém o schema e o seed de demonstração.');
  process.env.JWT_SECRET ||= 'mysql-integration-test-secret-with-more-than-32-characters';
  assert.equal(await checkDatabaseConnection(), true, 'A base precisa ter schema e seed aplicados.');

  const server = app.listen(0);
  await new Promise<void>((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    const login = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'dra.sofia@psicomanager.com.br', senha: '123456' })
    });
    assert.equal(login.status, 200);
    const loginBody = await login.json() as { user: { nome: string } };
    assert.equal(loginBody.user.nome, 'Dra. Sofia Mendes');
    const cookie = login.headers.get('set-cookie')?.split(';', 1)[0];
    assert.ok(cookie, 'O login deve criar o cookie de sessão.');

    const patientsResponse = await fetch(`${baseUrl}/api/patients`, { headers: { Cookie: cookie } });
    assert.equal(patientsResponse.status, 200);
    const patients = await patientsResponse.json() as Array<{ email: string }>;
    assert.ok(patients.some((patient) => patient.email === 'marcos.andrade@email.com'));

    const appointmentsResponse = await fetch(`${baseUrl}/api/appointments?data=2026-11-04`, { headers: { Cookie: cookie } });
    assert.equal(appointmentsResponse.status, 200);
    const appointments = await appointmentsResponse.json() as Array<{ pacienteId: string }>;
    assert.ok(appointments.some((appointment) => appointment.pacienteId === '4'));

    const financeResponse = await fetch(`${baseUrl}/api/finance`, { headers: { Cookie: cookie } });
    assert.equal(financeResponse.status, 200);
    const financeCreate = await fetch(`${baseUrl}/api/finance`, {
      method: 'POST', headers: { Cookie: cookie, 'Content-Type': 'application/json' },
      body: JSON.stringify({ descricao: 'Teste automatizado', categoria: 'Teste', data: new Date().toISOString().slice(0, 10), valor: 1.25, tipo: 'receita', status: 'Pago', metodo: 'PIX' })
    });
    assert.equal(financeCreate.status, 201);
    const createdFinance = await financeCreate.json() as { id: string };
    const financeDelete = await fetch(`${baseUrl}/api/finance/${createdFinance.id}`, { method: 'DELETE', headers: { Cookie: cookie } });
    assert.equal(financeDelete.status, 200);

    const preferencesResponse = await fetch(`${baseUrl}/api/preferences`, { headers: { Cookie: cookie } });
    assert.equal(preferencesResponse.status, 200);
    const currentPreferences = await preferencesResponse.json() as Record<string, unknown>;
    const preferencesUpdate = await fetch(`${baseUrl}/api/preferences`, {
      method: 'PUT', headers: { Cookie: cookie, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...currentPreferences, nomeClinica: 'Teste de integração' })
    });
    assert.equal(preferencesUpdate.status, 200);
    const preferencesRestore = await fetch(`${baseUrl}/api/preferences`, {
      method: 'PUT', headers: { Cookie: cookie, 'Content-Type': 'application/json' },
      body: JSON.stringify(currentPreferences)
    });
    assert.equal(preferencesRestore.status, 200);
    const reportResponse = await fetch(`${baseUrl}/api/reports/summary?period=mes`, { headers: { Cookie: cookie } });
    assert.equal(reportResponse.status, 200);

    const patientLogin = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'marcos.andrade@email.com', senha: '123456' })
    });
    assert.equal(patientLogin.status, 200);
    const patientCookie = patientLogin.headers.get('set-cookie')?.split(';', 1)[0];
    assert.ok(patientCookie);
    const tasksResponse = await fetch(`${baseUrl}/api/tasks/my`, { headers: { Cookie: patientCookie! } });
    assert.equal(tasksResponse.status, 200);
    const tasksForPsychologist = await fetch(`${baseUrl}/api/tasks`, { headers: { Cookie: cookie } });
    assert.equal(tasksForPsychologist.status, 200);
    const taskCreate = await fetch(`${baseUrl}/api/tasks`, {
      method: 'POST', headers: { Cookie: cookie, 'Content-Type': 'application/json' },
      body: JSON.stringify({ pacienteId: '4', texto: 'Atividade do teste de integração' })
    });
    assert.equal(taskCreate.status, 201, await taskCreate.clone().text());
    const createdTask = await taskCreate.json() as { id: string; concluida: boolean };
    const taskUpdate = await fetch(`${baseUrl}/api/tasks/${createdTask.id}/completion`, {
      method: 'PATCH', headers: { Cookie: patientCookie!, 'Content-Type': 'application/json' },
      body: JSON.stringify({ concluida: true })
    });
    assert.equal(taskUpdate.status, 200);
    const taskDelete = await fetch(`${baseUrl}/api/tasks/${createdTask.id}`, { method: 'DELETE', headers: { Cookie: cookie } });
    assert.equal(taskDelete.status, 200);
  } finally {
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    await getDbPool().end();
  }
});
