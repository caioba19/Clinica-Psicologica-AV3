import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { isValidCPF, isValidEmail, isValidPhone } from '../shared/src/utils/validators';
import { NodeAuthService } from '../backend/src/services/NodeAuthService';
import { UserRepository } from '../backend/src/repositories/UserRepository';
import { PatientRepository } from '../backend/src/repositories/PatientRepository';
import { NodePatientService } from '../backend/src/services/NodePatientService';
import { NodeAppointmentService } from '../backend/src/services/NodeAppointmentService';
import { NodeSessionService } from '../backend/src/services/NodeSessionService';

process.env.JWT_SECRET ||= 'test-secret-only-not-for-production-32-chars-minimum';

describe('Validação de evoluções clínicas', () => {
  it('rejeita escalas fora do intervalo de 0 a 10', async () => {
    const sessionService = new NodeSessionService({} as any);
    await assert.rejects(
      () => sessionService.createSession({ pacienteId: '4', evolucaoText: 'Nota clinica', humorScale: 11 }, '2', 'psicologo'),
      (error: any) => error.message.includes('escala de humor') && error.message.includes('0 a 10')
    );
  });
});

describe('1. Validações e Regras de Negócio (Front e Back)', () => {
  it('Deve validar CPF real com dígitos verificadores matemáticos', () => {
    // CPFs com formato e dígitos verificadores válidos
    assert.equal(isValidCPF('123.456.789-00'), false); // Dígito inválido
    assert.equal(isValidCPF('111.111.111-11'), false); // Dígitos repetidos inválidos
    assert.equal(isValidCPF('529.982.247-25'), true); // CPF matematicamente válido
  });

  it('Deve validar formato de e-mail estrito', () => {
    assert.equal(isValidEmail('usuario@clinica.com'), true);
    assert.equal(isValidEmail('email_invalido.com'), false);
    assert.equal(isValidEmail(''), false);
  });

  it('Deve validar formato de telefone com DDD', () => {
    assert.equal(isValidPhone('(71) 98888-7777'), true);
    assert.equal(isValidPhone('12345'), false);
  });
});

describe('2. Segurança: Criptografia e JWT (Requisitos AV3)', () => {
  const secret = 'super_secret_jwt_key_psicomanager_2026';

  it('Senhas devem ser geradas com hash seguro via bcrypt e nunca texto puro', () => {
    const senhaPlana = '123456';
    const hash = bcrypt.hashSync(senhaPlana, 10);

    assert.notEqual(hash, senhaPlana);
    assert.equal(bcrypt.compareSync(senhaPlana, hash), true);
    assert.equal(bcrypt.compareSync('senha_errada', hash), false);
  });

  it('Deve assinar e verificar token JWT com perfil de acesso', () => {
    const payload = {
      id: 'u1',
      nome: 'Renata Farias',
      email: 'admin@clinica.com',
      perfil: 'administrador'
    };

    const token = jwt.sign(payload, secret, { expiresIn: '1h' });
    assert.ok(token);

    const decoded = jwt.verify(token, secret) as any;
    assert.equal(decoded.email, 'admin@clinica.com');
    assert.equal(decoded.perfil, 'administrador');
  });
});

describe('3. Serviços e Repositórios (CRUD e Regras)', () => {
  it('NodeAuthService deve autenticar usuário com senha correta e gerar token', async () => {
    const userRepo = new UserRepository();
    const authService = new NodeAuthService(userRepo);

    const result = await authService.login('admin@clinica.com', '123456');
    assert.ok(result.token);
    assert.equal(result.user.perfil, 'administrador');
    const decoded = jwt.verify(result.token, process.env.JWT_SECRET!) as jwt.JwtPayload;
    assert.ok(decoded.jti);
  });

  it('NodeAuthService deve rejeitar senha incorreta', async () => {
    const userRepo = new UserRepository();
    const authService = new NodeAuthService(userRepo);

    await assert.rejects(
      async () => {
        await authService.login('admin@clinica.com', 'senha_errada');
      },
      { message: 'Credenciais inválidas.' }
    );
  });

  it('Administrador não pode alterar o próprio perfil nem criar usuário-paciente sem dados clínicos', async () => {
    const authService = new NodeAuthService(new UserRepository());
    await assert.rejects(
      () => authService.updateUser('1', { nome: 'Admin', email: 'admin@clinica.com', perfil: 'psicologo', registroCrp: 'CRP 99/99999' }, '1'),
      { message: 'Você não pode alterar o próprio perfil de acesso.' }
    );
    await assert.rejects(
      () => authService.createUser({ nome: 'Paciente Teste', email: 'paciente@teste.com', perfil: 'paciente', senha: 'SenhaForte123' }),
      { message: 'Cadastre pacientes pelo formulário de Pacientes para registrar CPF, data de nascimento e vínculo clínico.' }
    );
  });

  it('Agenda rejeita datas e horários inválidos antes de acessar o repositório', async () => {
    const appointmentService = new NodeAppointmentService({} as any);
    await assert.rejects(() => appointmentService.getByDate('2026-02-31', '2', 'psicologo'), /data válida/);
    await assert.rejects(() => appointmentService.create({
      pacienteId: '4', inicio: '2026-11-04 14:00', duracaoMinutos: 50, modalidade: 'presencial', tipo: 'Consulta'
    }, '2', 'psicologo'), /data e um horário válidos/);
  });

  it('Usuário deve conseguir trocar a senha confirmando a senha atual', async () => {
    const userRepo = new UserRepository();
    const authService = new NodeAuthService(userRepo);

    await authService.changePassword('1', '123456', 'SenhaNova123');
    await assert.rejects(() => authService.login('admin@clinica.com', '123456'));
    const result = await authService.login('admin@clinica.com', 'SenhaNova123');
    assert.ok(result.token);
  });

  it('NodePatientService deve listar pacientes e validar duplicidade de CPF', async () => {
    const patientRepo = new PatientRepository();
    const patientService = new NodePatientService(patientRepo);

    const patients = await patientService.getAllPatients('1', 'administrador');
    assert.ok(patients.length > 0);

    // Tentativa de duplicar CPF existente
    const existingCpf = patients[0].cpf;
    await assert.rejects(
      async () => {
        await patientService.createPatient({
          nome: 'Teste Duplicado',
          email: 'teste.duplicado@example.test',
          cpf: existingCpf,
          telefone: '(71) 98888-0000',
          dataNasc: '1990-05-14',
          senhaInicial: 'SenhaForte123'
        });
      },
      { message: 'Já existe um paciente cadastrado com este CPF.' }
    );
  });
});
