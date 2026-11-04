-- =============================================================================
-- PsicoManager — Gestão Psicológica
-- schema.sql — Modelagem relacional e DDL (MySQL 8.0+)

CREATE DATABASE IF NOT EXISTS psicomanager
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE psicomanager;


-- -----------------------------------------------------------------------------
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS password_reset_tokens;
DROP TABLE IF EXISTS email_lembretes_enviados;
DROP TABLE IF EXISTS tarefas_terapeuticas;
DROP TABLE IF EXISTS lancamentos_financeiros;
DROP TABLE IF EXISTS configuracoes_usuario;
DROP TABLE IF EXISTS login_rate_limits;
DROP TABLE IF EXISTS registros_evolucao;
DROP TABLE IF EXISTS logs_acoes;
DROP TABLE IF EXISTS vinculos;
DROP TABLE IF EXISTS clientes_pacientes;
DROP TABLE IF EXISTS psicologos;
DROP TABLE IF EXISTS tokens_revogados;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS perfis;
SET FOREIGN_KEY_CHECKS = 1;

-- -----------------------------------------------------------------------------
-- 1. PERFIS — papéis de acesso (RBAC simples: Admin / Psicologo / Paciente)
-- -----------------------------------------------------------------------------
CREATE TABLE perfis (
  id_perfil     TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome_perfil   VARCHAR(30)      NOT NULL,
  descricao     VARCHAR(150)     NULL,
  created_at    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_perfil),
  CONSTRAINT uq_perfis_nome UNIQUE (nome_perfil),
  CONSTRAINT chk_perfis_nome CHECK (nome_perfil IN ('Admin', 'Psicologo', 'Paciente'))
) ENGINE=InnoDB COMMENT='Papéis/perfis de acesso do sistema';

-- -----------------------------------------------------------------------------
-- 2. USUARIOS — conta de acesso (autenticação), base para todos os perfis
-- -----------------------------------------------------------------------------
CREATE TABLE usuarios (
  id_usuario      INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome_completo   VARCHAR(150) NOT NULL,
  login           VARCHAR(50)  NOT NULL,
  email           VARCHAR(150) NOT NULL,
  senha_hash      VARCHAR(255) NOT NULL COMMENT 'Hash bcrypt da senha, nunca texto puro',
  telefone        VARCHAR(20)  NULL,
  id_perfil       TINYINT UNSIGNED NOT NULL,
  status          VARCHAR(20)  NOT NULL DEFAULT 'ativo',
  ultimo_login_em DATETIME     NULL,
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_usuario),
  CONSTRAINT uq_usuarios_login UNIQUE (login),
  CONSTRAINT uq_usuarios_email UNIQUE (email),
  CONSTRAINT chk_usuarios_status CHECK (status IN ('ativo', 'inativo', 'suspenso')),
  CONSTRAINT chk_usuarios_email_formato CHECK (email LIKE '%_@_%.__%'),
  CONSTRAINT fk_usuarios_perfil FOREIGN KEY (id_perfil)
    REFERENCES perfis (id_perfil)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_usuarios_id_perfil (id_perfil),
  INDEX idx_usuarios_status (status)
) ENGINE=InnoDB COMMENT='Contas de acesso, comuns a Admin/Psicólogo/Paciente';

-- -----------------------------------------------------------------------------
CREATE TABLE tokens_revogados (
  jti         CHAR(36)      NOT NULL,
  id_usuario  INT UNSIGNED  NOT NULL,
  expira_em   DATETIME      NOT NULL,
  criado_em   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (jti),
  INDEX idx_tokens_revogados_expira (expira_em),
  CONSTRAINT fk_tokens_revogados_usuario FOREIGN KEY (id_usuario)
    REFERENCES usuarios (id_usuario) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB COMMENT='JWT invalidados no logout, retidos até o vencimento';

-- 3. PSICOLOGOS — dados profissionais, relação 1:1 com usuarios
--    PK = id_usuario (mesmo ID da conta), conforme pedido no seed.
-- -----------------------------------------------------------------------------
CREATE TABLE psicologos (
  id_usuario       INT UNSIGNED  NOT NULL,
  crp              VARCHAR(20)   NOT NULL COMMENT 'Registro no Conselho Regional de Psicologia',
  especialidades   VARCHAR(255)  NULL,
  bio              TEXT          NULL,
  valor_consulta   DECIMAL(10,2) NULL,
  anos_experiencia SMALLINT UNSIGNED NULL,
  created_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_usuario),
  CONSTRAINT uq_psicologos_crp UNIQUE (crp),
  CONSTRAINT chk_psicologos_valor CHECK (valor_consulta IS NULL OR valor_consulta >= 0),
  CONSTRAINT fk_psicologos_usuario FOREIGN KEY (id_usuario)
    REFERENCES usuarios (id_usuario)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB COMMENT='Dados específicos do profissional psicólogo';

-- -----------------------------------------------------------------------------
-- 4. CLIENTES_PACIENTES — dados do paciente, relação 1:1 com usuarios
-- -----------------------------------------------------------------------------
CREATE TABLE clientes_pacientes (
  id_usuario              INT UNSIGNED NOT NULL,
  cpf                     VARCHAR(11)  NOT NULL,
  data_nascimento         DATE         NOT NULL,
  motivo_consulta         TEXT         NULL,
  historico_saude         TEXT         NULL,
  genero                  VARCHAR(30)  NULL,
  endereco                VARCHAR(255) NULL,
  contato_emergencia_nome VARCHAR(150) NULL,
  contato_emergencia_tel  VARCHAR(20)  NULL,
  created_at              DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at              DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_usuario),
  CONSTRAINT uq_pacientes_cpf UNIQUE (cpf),
  CONSTRAINT chk_pacientes_cpf_formato CHECK (cpf REGEXP '^[0-9]{11}$'),
  CONSTRAINT chk_pacientes_nascimento CHECK (data_nascimento BETWEEN '1900-01-01' AND '2030-01-01'),
  CONSTRAINT fk_pacientes_usuario FOREIGN KEY (id_usuario)
    REFERENCES usuarios (id_usuario)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB COMMENT='Dados específicos do paciente/cliente';

-- -----------------------------------------------------------------------------
-- 5. VINCULOS — relacionamento entre psicólogo e paciente
-- -----------------------------------------------------------------------------
CREATE TABLE vinculos (
  id_vinculo     INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_psicologo   INT UNSIGNED NOT NULL,
  id_paciente    INT UNSIGNED NOT NULL,
  status         VARCHAR(20)  NOT NULL DEFAULT 'ativo',
  data_inicio    DATE         NOT NULL,
  data_fim       DATE         NULL,
  observacoes    VARCHAR(255) NULL,
  created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_vinculo),
  CONSTRAINT chk_vinculos_status CHECK (status IN ('ativo', 'inativo', 'encerrado')),
  CONSTRAINT chk_vinculos_datas CHECK (data_fim IS NULL OR data_fim >= data_inicio),
  CONSTRAINT fk_vinculos_psicologo FOREIGN KEY (id_psicologo)
    REFERENCES psicologos (id_usuario)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_vinculos_paciente FOREIGN KEY (id_paciente)
    REFERENCES clientes_pacientes (id_usuario)
    ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_vinculos_psicologo (id_psicologo),
  INDEX idx_vinculos_paciente (id_paciente),
  INDEX idx_vinculos_status (status)
) ENGINE=InnoDB COMMENT='Vínculo ativo/histórico entre psicólogo e paciente';

-- -----------------------------------------------------------------------------
-- 6. AGENDAMENTOS — consultas vinculadas a pacientes e psicólogos
-- -----------------------------------------------------------------------------
CREATE TABLE agendamentos (
  id_agendamento INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_vinculo INT UNSIGNED NOT NULL,
  inicio DATETIME NOT NULL,
  duracao_minutos SMALLINT UNSIGNED NOT NULL DEFAULT 50,
  tipo VARCHAR(100) NOT NULL DEFAULT 'Atendimento psicológico',
  modalidade VARCHAR(20) NOT NULL DEFAULT 'presencial',
  sala VARCHAR(100) NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'confirmado',
  criado_por INT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_agendamento),
  CONSTRAINT chk_agendamento_duracao CHECK (duracao_minutos BETWEEN 15 AND 180),
  CONSTRAINT chk_agendamento_modalidade CHECK (modalidade IN ('presencial', 'online')),
  CONSTRAINT chk_agendamento_status CHECK (status IN ('agendado', 'confirmado', 'realizado', 'cancelado')),
  CONSTRAINT fk_agendamento_vinculo FOREIGN KEY (id_vinculo)
    REFERENCES vinculos (id_vinculo) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_agendamento_criador FOREIGN KEY (criado_por)
    REFERENCES usuarios (id_usuario) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_agendamentos_inicio (inicio),
  INDEX idx_agendamentos_vinculo_inicio (id_vinculo, inicio),
  INDEX idx_agendamentos_status (status)
) ENGINE=InnoDB COMMENT='Consultas agendadas por vínculo profissional e paciente';

-- -----------------------------------------------------------------------------
-- 7. LOGS_ACOES — auditoria de ações do sistema
--    id_usuario aceita NULL + ON DELETE SET NULL: o log de auditoria deve
--    sobreviver à exclusão de uma conta, então nunca é removido em cascata.
-- -----------------------------------------------------------------------------
CREATE TABLE logs_acoes (
  id_log       BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_usuario   INT UNSIGNED    NULL,
  acao         VARCHAR(100)    NOT NULL,
  recurso      VARCHAR(100)    NOT NULL,
  recurso_id   INT UNSIGNED    NULL,
  detalhes     JSON            NULL,
  endereco_ip  VARCHAR(45)     NULL COMMENT 'Suporta IPv4 e IPv6',
  data_hora    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_log),
  CONSTRAINT fk_logs_usuario FOREIGN KEY (id_usuario)
    REFERENCES usuarios (id_usuario)
    ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX idx_logs_usuario (id_usuario),
  INDEX idx_logs_data_hora (data_hora),
  INDEX idx_logs_acao (acao)
) ENGINE=InnoDB COMMENT='Trilha de auditoria de ações realizadas no sistema';

-- -----------------------------------------------------------------------------
-- 7. REGISTROS_EVOLUCAO — registro de evolução clínica por sessão
-- -----------------------------------------------------------------------------
CREATE TABLE password_reset_tokens (
  token_hash CHAR(64) NOT NULL,
  id_usuario INT UNSIGNED NOT NULL,
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (token_hash),
  INDEX idx_password_reset_user (id_usuario, created_at),
  INDEX idx_password_reset_expiry (expires_at),
  CONSTRAINT fk_password_reset_user FOREIGN KEY (id_usuario)
    REFERENCES usuarios (id_usuario) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE login_rate_limits (
  ip_hash CHAR(64) NOT NULL,
  window_started_at DATETIME NOT NULL,
  attempts SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (ip_hash),
  INDEX idx_login_rate_window (window_started_at)
) ENGINE=InnoDB;

CREATE TABLE lancamentos_financeiros (
  id_lancamento INT UNSIGNED NOT NULL AUTO_INCREMENT,
  criado_por INT UNSIGNED NOT NULL,
  descricao VARCHAR(180) NOT NULL,
  paciente_nome VARCHAR(150) NULL,
  categoria VARCHAR(80) NOT NULL,
  data_lancamento DATE NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  tipo ENUM('receita', 'despesa') NOT NULL,
  status ENUM('Pago', 'Pendente', 'Atrasado') NOT NULL DEFAULT 'Pago',
  metodo ENUM('PIX', 'CartÃ£o', 'Dinheiro', 'TransferÃªncia') NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_lancamento),
  CONSTRAINT chk_financeiro_valor CHECK (valor > 0),
  CONSTRAINT fk_financeiro_usuario FOREIGN KEY (criado_por)
    REFERENCES usuarios (id_usuario) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_financeiro_owner_date (criado_por, data_lancamento),
  INDEX idx_financeiro_type_status (tipo, status)
) ENGINE=InnoDB;

CREATE TABLE tarefas_terapeuticas (
  id_tarefa INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_vinculo INT UNSIGNED NOT NULL,
  texto VARCHAR(240) NOT NULL,
  concluida TINYINT(1) NOT NULL DEFAULT 0,
  criado_por INT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_tarefa),
  CONSTRAINT fk_tarefa_vinculo FOREIGN KEY (id_vinculo)
    REFERENCES vinculos (id_vinculo) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_tarefa_autor FOREIGN KEY (criado_por)
    REFERENCES usuarios (id_usuario) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_tarefas_vinculo (id_vinculo, concluida, created_at)
) ENGINE=InnoDB;

CREATE TABLE email_lembretes_enviados (
  id_agendamento INT UNSIGNED NOT NULL,
  enviado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_agendamento),
  CONSTRAINT fk_email_lembrete_agendamento FOREIGN KEY (id_agendamento)
    REFERENCES agendamentos (id_agendamento) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB COMMENT='Evita reenvio de lembrete de e-mail por agendamento';

CREATE TABLE configuracoes_usuario (
  id_usuario INT UNSIGNED NOT NULL,
  preferencias JSON NOT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_usuario),
  CONSTRAINT fk_configuracoes_usuario FOREIGN KEY (id_usuario)
    REFERENCES usuarios (id_usuario) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE registros_evolucao (
  id_registro     INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_vinculo      INT UNSIGNED NOT NULL,
  data_sessao     DATE         NOT NULL,
  nivel_humor     TINYINT UNSIGNED NULL COMMENT 'Escala 0-10',
  nivel_ansiedade TINYINT UNSIGNED NULL COMMENT 'Escala 0-10',
  anotacoes       TEXT         NULL,
  plano           TEXT         NULL,
  registrado_por  INT UNSIGNED NOT NULL,
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_registro),
  CONSTRAINT chk_evolucao_humor CHECK (nivel_humor IS NULL OR nivel_humor BETWEEN 0 AND 10),
  CONSTRAINT chk_evolucao_ansiedade CHECK (nivel_ansiedade IS NULL OR nivel_ansiedade BETWEEN 0 AND 10),
  CONSTRAINT fk_evolucao_vinculo FOREIGN KEY (id_vinculo)
    REFERENCES vinculos (id_vinculo)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_evolucao_autor FOREIGN KEY (registrado_por)
    REFERENCES usuarios (id_usuario)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_evolucao_vinculo (id_vinculo),
  INDEX idx_evolucao_data (data_sessao)
) ENGINE=InnoDB COMMENT='Registros de evolução do paciente por sessão';
