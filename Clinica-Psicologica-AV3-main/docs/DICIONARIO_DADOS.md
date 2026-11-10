# Dicionário de dados

Referência das tabelas do schema atual. Tipos exatos, índices e restrições estão nos arquivos SQL; campos marcados como sensíveis não devem conter dados reais na demonstração.

| Tabela | Finalidade | Campos relevantes e regras |
| --- | --- | --- |
| `perfis` | Papéis de autorização | `id_perfil` chave primária; `nome_perfil` único (`Admin`, `Psicologo`, `Paciente`). |
| `usuarios` | Identidade, autenticação e estado de acesso | `id_usuario` PK; `login` e `email` únicos; `senha_hash` contém hash bcrypt; `id_perfil` FK; `status` ativo/inativo/suspenso. |
| `psicologos` | Informações profissionais | `id_usuario` PK/FK; `crp` único; especialidades, bio, valor de consulta e experiência. |
| `clientes_pacientes` | Dados administrativos e clínicos iniciais | `id_usuario` PK/FK; CPF único e validado; nascimento; motivo/histórico de saúde; endereço e contato de emergência. Dados pessoais/sensíveis: usar apenas massa fictícia. |
| `vinculos` | Relação entre profissional e paciente | `id_vinculo` PK; `id_psicologo` e `id_paciente` FKs; estado e datas do vínculo. Base de autorização para leituras clínicas. |
| `agendamentos` | Consultas agendadas | `id_agendamento` PK; vínculo e criador FKs; início, duração de 15 a 180 minutos, modalidade presencial/online e status controlado. |
| `registros_evolucao` | Evolução clínica | vínculo e autor FKs; data, humor e ansiedade em escala 0–10; `anotacoes` e `plano` são cifrados pela aplicação. |
| `logs_acoes` | Trilha de auditoria | Autor pode ficar nulo para preservar histórico; ação, recurso, JSON de detalhes, IP e data/hora. Não deve ser removida por operações comuns. |
| `tokens_revogados` | Logout e invalidação de JWT | `jti` PK; usuário FK; data de expiração. |
| `password_reset_tokens` | Tokens de recuperação de senha | Hash SHA-256 do token como PK, usuário FK, expiração e data de uso. O token em texto não é armazenado. |
| `login_rate_limits` | Limite de tentativas de login | Hash do IP como PK, início da janela e contador. Não guarda o IP original. |
| `lancamentos_financeiros` | Receitas e despesas | Autor FK; descrição, categoria, data, valor positivo, tipo, status e método de pagamento. |
| `tarefas_terapeuticas` | Atividades atribuídas a pacientes | Vínculo e autor FKs; texto, conclusão e timestamps. O paciente só acessa tarefas dos próprios vínculos. |
| `configuracoes_usuario` | Preferências por conta | Usuário PK/FK; documento JSON de preferências e timestamp de atualização. |

## Integridade e autorização

- Chaves estrangeiras conectam contas, perfis, vínculos e registros relacionados.
- CPF, e-mail, login e CRP têm unicidade conforme o modelo.
- A autorização de psicólogos e pacientes usa o vínculo ativo, além da validação do papel no backend.
- O schema pode ser recriado em uma base descartável; para bancos existentes, aplicar as migrations em ordem.
