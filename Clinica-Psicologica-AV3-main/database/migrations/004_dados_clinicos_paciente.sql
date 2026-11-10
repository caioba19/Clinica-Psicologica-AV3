ALTER TABLE clientes_pacientes
  ADD COLUMN motivo_consulta TEXT NULL AFTER data_nascimento,
  ADD COLUMN historico_saude TEXT NULL AFTER motivo_consulta;
