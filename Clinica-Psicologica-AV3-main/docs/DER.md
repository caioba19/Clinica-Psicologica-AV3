# Diagrama entidade-relacionamento

O diagrama representa o schema atual em `database/schema.sql` e a migração `005_security_and_workflows.sql`.

```mermaid
erDiagram
  PERFIS ||--o{ USUARIOS : classifica
  USUARIOS ||--o| PSICOLOGOS : possui_dados_profissionais
  USUARIOS ||--o| CLIENTES_PACIENTES : possui_dados_do_paciente
  USUARIOS ||--o{ VINCULOS : psicologo
  USUARIOS ||--o{ VINCULOS : paciente
  VINCULOS ||--o{ AGENDAMENTOS : agenda
  VINCULOS ||--o{ REGISTROS_EVOLUCAO : acompanha
  USUARIOS ||--o{ REGISTROS_EVOLUCAO : registra
  USUARIOS ||--o{ LOGS_ACOES : autor
  USUARIOS ||--o{ TOKENS_REVOGADOS : invalida
  USUARIOS ||--o{ PASSWORD_RESET_TOKENS : recuperacao
  USUARIOS ||--o{ LANCAMENTOS_FINANCEIROS : registra
  VINCULOS ||--o{ TAREFAS_TERAPEUTICAS : recebe
  USUARIOS ||--o{ TAREFAS_TERAPEUTICAS : cria
  USUARIOS ||--o| CONFIGURACOES_USUARIO : configura

  PERFIS {
    tinyint id_perfil PK
    varchar nome_perfil UK
    varchar descricao
  }
  USUARIOS {
    int id_usuario PK
    varchar nome_completo
    varchar login UK
    varchar email UK
    varchar senha_hash
    tinyint id_perfil FK
    varchar status
  }
  PSICOLOGOS {
    int id_usuario PK_FK
    varchar crp UK
    text especialidades
    decimal valor_consulta
  }
  CLIENTES_PACIENTES {
    int id_usuario PK_FK
    varchar cpf UK
    date data_nascimento
    text motivo_consulta
    text historico_saude
  }
  VINCULOS {
    int id_vinculo PK
    int id_psicologo FK
    int id_paciente FK
    varchar status
    date data_inicio
    date data_fim
  }
  AGENDAMENTOS {
    int id_agendamento PK
    int id_vinculo FK
    datetime inicio
    smallint duracao_minutos
    varchar modalidade
    varchar status
  }
  REGISTROS_EVOLUCAO {
    int id_registro PK
    int id_vinculo FK
    date data_sessao
    tinyint nivel_humor
    tinyint nivel_ansiedade
    text anotacoes
    text plano
  }
  LOGS_ACOES {
    bigint id_log PK
    int id_usuario FK
    varchar acao
    varchar recurso
    json detalhes
    datetime data_hora
  }
  LANCAMENTOS_FINANCEIROS {
    int id_lancamento PK
    int criado_por FK
    varchar descricao
    date data_lancamento
    decimal valor
    varchar tipo
    varchar status
  }
  TAREFAS_TERAPEUTICAS {
    int id_tarefa PK
    int id_vinculo FK
    int criado_por FK
    varchar texto
    boolean concluida
  }
  CONFIGURACOES_USUARIO {
    int id_usuario PK_FK
    json preferencias
  }
  TOKENS_REVOGADOS {
    char jti PK
    int id_usuario FK
    datetime expira_em
  }
  PASSWORD_RESET_TOKENS {
    char token_hash PK
    int id_usuario FK
    datetime expires_at
    datetime used_at
  }
  LOGIN_RATE_LIMITS {
    char ip_hash PK
    datetime window_started_at
    smallint attempts
  }
```

`LOGIN_RATE_LIMITS` é uma tabela operacional sem relação direta com usuário; o endereço de origem é armazenado como hash. As anotações e planos de evolução são criptografados pela aplicação com AES-256-GCM.
