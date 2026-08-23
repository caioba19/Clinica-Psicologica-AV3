-- =============================================================================
-- PsicoManager — Gestão Psicológica
-- seed.sql — Massa de dados fictícios para demonstração e testes da API
-- =============================================================================
-- Todos os nomes, e-mails, CPFs e CRPs abaixo são 100% fictícios.
-- Senha em texto puro para TODOS os usuários de teste: "123456"
-- Hash bcrypt (custo 10) gerado e validado de fato neste ambiente (bcrypt.checkpw
-- confirmou a correspondência) — não é uma string de exemplo inventada:
--   $2b$10$Xs468oUNd.riYkdJAn/Y.OK0Dyw3ZsxbfAdtuisK756qPmeAy4RW6
-- =============================================================================

USE psicomanager;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE registros_evolucao;
TRUNCATE TABLE logs_acoes;
TRUNCATE TABLE vinculos;
TRUNCATE TABLE clientes_pacientes;
TRUNCATE TABLE psicologos;
TRUNCATE TABLE usuarios;
TRUNCATE TABLE perfis;
SET FOREIGN_KEY_CHECKS = 1;

-- -----------------------------------------------------------------------------
-- 1. PERFIS
-- -----------------------------------------------------------------------------
INSERT INTO perfis (id_perfil, nome_perfil, descricao) VALUES
  (1, 'Admin',     'Administrador do sistema, acesso completo'),
  (2, 'Psicologo', 'Profissional de psicologia vinculado à clínica'),
  (3, 'Paciente',  'Paciente/cliente atendido pela clínica');

-- -----------------------------------------------------------------------------
-- 2. USUARIOS — 1 Admin, 2 Psicólogos, 4 Pacientes (3 pedidos + 1 inativo extra
--    para demonstrar o CHECK de status e um vínculo encerrado)
-- -----------------------------------------------------------------------------
INSERT INTO usuarios
  (id_usuario, nome_completo, login, email, senha_hash, telefone, id_perfil, status, ultimo_login_em)
VALUES
  (1, 'Ana Beatriz Souza',        'admin.ana',        'ana.souza@psicomanager.com.br',
      '$2b$10$Xs468oUNd.riYkdJAn/Y.OK0Dyw3ZsxbfAdtuisK756qPmeAy4RW6', '71988887777', 1, 'ativo',   '2026-08-18 09:12:00'),
  (2, 'Rafael Menezes Costa',     'rafael.costa',     'rafael.costa@psicomanager.com.br',
      '$2b$10$Xs468oUNd.riYkdJAn/Y.OK0Dyw3ZsxbfAdtuisK756qPmeAy4RW6', '71988886611', 2, 'ativo',   '2026-08-18 08:47:00'),
  (3, 'Juliana Prado Lima',       'juliana.lima',     'juliana.lima@psicomanager.com.br',
      '$2b$10$Xs468oUNd.riYkdJAn/Y.OK0Dyw3ZsxbfAdtuisK756qPmeAy4RW6', '71988885522', 2, 'ativo',   '2026-08-17 15:30:00'),
  (4, 'Marcos Vinícius Andrade',  'marcos.andrade',   'marcos.andrade@email.com',
      '$2b$10$Xs468oUNd.riYkdJAn/Y.OK0Dyw3ZsxbfAdtuisK756qPmeAy4RW6', '71999991111', 3, 'ativo',   '2026-08-16 19:05:00'),
  (5, 'Fernanda Cristina Ribeiro','fernanda.ribeiro', 'fernanda.ribeiro@email.com',
      '$2b$10$Xs468oUNd.riYkdJAn/Y.OK0Dyw3ZsxbfAdtuisK756qPmeAy4RW6', '71999992222', 3, 'ativo',   '2026-08-15 11:22:00'),
  (6, 'Bruno Henrique Tavares',   'bruno.tavares',    'bruno.tavares@email.com',
      '$2b$10$Xs468oUNd.riYkdJAn/Y.OK0Dyw3ZsxbfAdtuisK756qPmeAy4RW6', '71999993333', 3, 'ativo',   NULL),
  (7, 'Camila Rocha Pires',       'camila.pires',     'camila.pires@email.com',
      '$2b$10$Xs468oUNd.riYkdJAn/Y.OK0Dyw3ZsxbfAdtuisK756qPmeAy4RW6', '71999994444', 3, 'inativo', '2025-01-15 10:00:00');

-- -----------------------------------------------------------------------------
-- 3. PSICOLOGOS — IDs correspondem exatamente aos usuarios (2 e 3)
-- -----------------------------------------------------------------------------
INSERT INTO psicologos
  (id_usuario, crp, especialidades, bio, valor_consulta, anos_experiencia)
VALUES
  (2, 'CRP 06/123456', 'Terapia Cognitivo-Comportamental, Ansiedade e Estresse',
      'Psicólogo clínico com foco em TCC para transtornos de ansiedade.', 180.00, 8),
  (3, 'CRP 06/654321', 'Psicologia Infantil, Terapia Familiar Sistêmica',
      'Especialista em atendimento infantil e orientação familiar.', 150.00, 5);

-- -----------------------------------------------------------------------------
-- 4. CLIENTES_PACIENTES — IDs correspondem exatamente aos usuarios (4, 5, 6, 7)
-- -----------------------------------------------------------------------------
INSERT INTO clientes_pacientes
  (id_usuario, cpf, data_nascimento, genero, endereco, contato_emergencia_nome, contato_emergencia_tel)
VALUES
  (4, '11122233344', '1990-05-14', 'Masculino', 'Rua das Flores, 123 - Salvador/BA',       'Patrícia Andrade', '71999991100'),
  (5, '22233344455', '1985-11-02', 'Feminino',  'Av. Sete de Setembro, 456 - Salvador/BA', 'Carlos Ribeiro',   '71999992200'),
  (6, '33344455566', '2001-07-23', 'Masculino', 'Rua da Paz, 789 - Salvador/BA',           'Marta Tavares',    '71999993300'),
  (7, '44455566677', '1978-03-09', 'Feminino',  'Rua do Sol, 321 - Salvador/BA',           'José Pires',       '71999994400');

-- -----------------------------------------------------------------------------
-- 5. VINCULOS — 3 ativos (mínimo pedido) + 1 encerrado, para mostrar o histórico
-- -----------------------------------------------------------------------------
INSERT INTO vinculos
  (id_vinculo, id_psicologo, id_paciente, status, data_inicio, data_fim, observacoes)
VALUES
  (1, 2, 4, 'ativo',     '2025-02-10', NULL,         'Sessões semanais, quinta-feira 14h'),
  (2, 2, 5, 'ativo',     '2025-03-01', NULL,         'Sessões quinzenais'),
  (3, 3, 6, 'ativo',     '2025-01-20', NULL,         'Acompanhamento contínuo'),
  (4, 3, 7, 'encerrado', '2024-06-01', '2025-01-15', 'Tratamento concluído com alta');

-- -----------------------------------------------------------------------------
-- 6. LOGS_ACOES — amostra de auditoria, incluindo uma tentativa de login sem
--    usuário identificado (id_usuario NULL é intencional, ver schema.sql)
-- -----------------------------------------------------------------------------
INSERT INTO logs_acoes
  (id_usuario, acao, recurso, recurso_id, detalhes, endereco_ip, data_hora)
VALUES
  (1, 'LOGIN',                       'usuarios',           1, JSON_OBJECT('metodo', 'senha'),                         '187.72.10.55',  '2026-08-18 09:12:00'),
  (2, 'LOGIN',                       'usuarios',           2, JSON_OBJECT('metodo', 'senha'),                         '201.45.33.12',  '2026-08-18 08:47:00'),
  (1, 'CRIACAO_VINCULO',             'vinculos',           1, JSON_OBJECT('id_psicologo', 2, 'id_paciente', 4),       '187.72.10.55',  '2025-02-10 10:20:00'),
  (2, 'ATUALIZACAO_PACIENTE',        'clientes_pacientes', 4, JSON_OBJECT('campo_alterado', 'endereco'),              '201.45.33.12',  '2026-08-16 19:10:00'),
  (1, 'ATUALIZACAO_STATUS_USUARIO',  'usuarios',           7, JSON_OBJECT('de', 'ativo', 'para', 'inativo'),          '187.72.10.55',  '2025-01-15 10:05:00'),
  (NULL, 'TENTATIVA_LOGIN_FALHA',    'usuarios',           NULL, JSON_OBJECT('login_tentado', 'admin.desconhecido'), '203.0.113.77',  '2026-08-17 22:41:00');

-- -----------------------------------------------------------------------------
-- 7. REGISTROS_EVOLUCAO — módulo de inovação (hipótese, ver aviso no schema.sql)
--    Série de sessões por vínculo para alimentar o gráfico de evolução
--    (chart.js / react-chartjs-2 no package.json do front-end).
-- -----------------------------------------------------------------------------
INSERT INTO registros_evolucao
  (id_vinculo, data_sessao, nivel_humor, nivel_ansiedade, anotacoes, registrado_por)
VALUES
  (1, '2025-02-10', 4, 8, 'Primeira sessão; relato de ansiedade elevada no trabalho.',        2),
  (1, '2025-02-24', 5, 7, 'Leve melhora após início de técnicas de respiração.',               2),
  (1, '2025-03-10', 6, 5, 'Progresso consistente; paciente relata mais controle emocional.',   2),
  (3, '2025-01-20', 5, 6, 'Avaliação inicial do acompanhamento.',                              3),
  (3, '2025-02-03', 6, 5, 'Boa adesão ao acompanhamento proposto.',                            3);
