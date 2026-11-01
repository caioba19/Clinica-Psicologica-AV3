-- Safe migration for databases created before JWT revocation was added.
CREATE TABLE IF NOT EXISTS tokens_revogados (
  jti         CHAR(36)      NOT NULL,
  id_usuario  INT UNSIGNED  NOT NULL,
  expira_em   DATETIME      NOT NULL,
  criado_em   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (jti),
  INDEX idx_tokens_revogados_expira (expira_em),
  CONSTRAINT fk_tokens_revogados_usuario FOREIGN KEY (id_usuario)
    REFERENCES usuarios (id_usuario) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB COMMENT='JWT invalidados no logout, retidos até o vencimento';
