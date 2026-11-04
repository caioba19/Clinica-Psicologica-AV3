CREATE TABLE IF NOT EXISTS email_lembretes_enviados (
  id_agendamento INT UNSIGNED NOT NULL,
  enviado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_agendamento),
  CONSTRAINT fk_email_lembrete_agendamento FOREIGN KEY (id_agendamento)
    REFERENCES agendamentos (id_agendamento) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB COMMENT='Evita reenvio de lembrete de e-mail por agendamento';
