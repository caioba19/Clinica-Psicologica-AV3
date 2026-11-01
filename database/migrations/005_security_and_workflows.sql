CREATE TABLE IF NOT EXISTS password_reset_tokens (
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

CREATE TABLE IF NOT EXISTS login_rate_limits (
  ip_hash CHAR(64) NOT NULL,
  window_started_at DATETIME NOT NULL,
  attempts SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (ip_hash),
  INDEX idx_login_rate_window (window_started_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS lancamentos_financeiros (
  id_lancamento INT UNSIGNED NOT NULL AUTO_INCREMENT,
  criado_por INT UNSIGNED NOT NULL,
  descricao VARCHAR(180) NOT NULL,
  paciente_nome VARCHAR(150) NULL,
  categoria VARCHAR(80) NOT NULL,
  data_lancamento DATE NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  tipo ENUM('receita', 'despesa') NOT NULL,
  status ENUM('Pago', 'Pendente', 'Atrasado') NOT NULL DEFAULT 'Pago',
  metodo ENUM('PIX', 'Cartão', 'Dinheiro', 'Transferência') NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_lancamento),
  CONSTRAINT chk_financeiro_valor CHECK (valor > 0),
  CONSTRAINT fk_financeiro_usuario FOREIGN KEY (criado_por)
    REFERENCES usuarios (id_usuario) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_financeiro_owner_date (criado_por, data_lancamento),
  INDEX idx_financeiro_type_status (tipo, status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tarefas_terapeuticas (
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

CREATE TABLE IF NOT EXISTS configuracoes_usuario (
  id_usuario INT UNSIGNED NOT NULL,
  preferencias JSON NOT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_usuario),
  CONSTRAINT fk_configuracoes_usuario FOREIGN KEY (id_usuario)
    REFERENCES usuarios (id_usuario) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;
