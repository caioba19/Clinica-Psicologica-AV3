CREATE TABLE IF NOT EXISTS agendamentos (
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

-- Massa demonstrativa aditiva para base já populada; pode ser executada novamente.
INSERT INTO agendamentos (id_vinculo, inicio, duracao_minutos, tipo, modalidade, sala, status, criado_por)
SELECT 1, '2026-11-04 14:00:00', 50, 'Acompanhamento psicológico', 'presencial', 'Sala 01', 'confirmado', 2
WHERE EXISTS (SELECT 1 FROM vinculos WHERE id_vinculo = 1 AND status = 'ativo')
  AND NOT EXISTS (SELECT 1 FROM agendamentos WHERE id_vinculo = 1 AND inicio = '2026-11-04 14:00:00');

INSERT INTO agendamentos (id_vinculo, inicio, duracao_minutos, tipo, modalidade, sala, status, criado_por)
SELECT 2, '2026-11-06 10:30:00', 50, 'Acompanhamento psicológico', 'online', NULL, 'confirmado', 2
WHERE EXISTS (SELECT 1 FROM vinculos WHERE id_vinculo = 2 AND status = 'ativo')
  AND NOT EXISTS (SELECT 1 FROM agendamentos WHERE id_vinculo = 2 AND inicio = '2026-11-06 10:30:00');
