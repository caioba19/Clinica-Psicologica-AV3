# PsicoManager — Relatório do Projeto Integrador AV3

## Capa

- **Instituição:** Centro Universitário Jorge Amado (Unijorge)
- **Disciplina:** `[preencher — ex: Projeto Integrador / Desenvolvimento de Sistemas]`
- **Turma:** `[preencher — ex: SI-2026.2]`
- **Projeto:** PsicoManager — Plataforma de Gestão para Profissionais de Psicologia
- **Integrantes:**
  - Caio Vinicius Santos da Costa Leite
  - Kauan Marinho
  - Maicon Diaz
  - Daniel Oliveira Silva
  - Gabriel Nascimento Luz
- **Docente:** `[preencher]`
- **Data:** `[preencher — ex: Novembro de 2026]`

---

> **Repositório:** https://github.com/caioba19/Clinica-Psicologica-AV3

## Resumo

O PsicoManager é uma aplicação web acadêmica para apoiar a gestão de profissionais de Psicologia. A solução reúne administração de usuários, cadastro e vínculo de pacientes, agenda, registros de evolução, atividades terapêuticas, finanças e indicadores. A interface React consome uma API REST desenvolvida em TypeScript, que aplica autenticação, autorização por perfil e persistência relacional em MySQL. A inovação apresentada combina registros periódicos de humor e ansiedade com atividades entre sessões. O sistema usa dados sintéticos para demonstração; não deve receber informações de pacientes reais.

## Contexto e situação-problema

Profissionais podem manter cadastros, agendas e registros em ferramentas distintas. Essa fragmentação dificulta localizar informações, controlar permissões e acompanhar alterações. O projeto responde à situação-problema proposta na AV3: desenvolver um produto integrado que centralize operações administrativas e profissionais, com acesso controlado e dados persistidos em banco relacional.

## Objetivos

### Objetivo geral

Construir uma aplicação web responsiva que centralize operações de uma clínica/consultório fictício e demonstre a integração entre interface, API TypeScript e MySQL.

### Objetivos específicos

- Implementar autenticação, logout e autorização por perfis.
- Permitir administração de usuários e situações de acesso.
- Cadastrar pacientes e relacioná-los a psicólogos.
- Registrar agendamentos com validação de conflito.
- Armazenar evoluções com escalas e proteção dos campos clínicos.
- Atribuir atividades entre sessões e permitir ao paciente atualizar a conclusão.
- Persistir lançamentos financeiros e preferências.
- Calcular indicadores a partir dos dados registrados e testar fluxos essenciais.

## Público-alvo e perfis

- **Administradora:** gerencia usuários, acompanha auditoria e acessa operações administrativas autorizadas.
- **Psicóloga:** consulta pacientes vinculados, usa agenda, registra evoluções e administra atividades e lançamentos próprios.
- **Paciente:** consulta os próprios agendamentos e atividades e atualiza a conclusão de atividades atribuídas.

As rotas e operações sensíveis validam perfil no backend. O vínculo ativo entre psicólogo e paciente limita acesso a dados clínicos.

## Requisitos funcionais

| ID | Requisito | Situação no projeto |
| --- | --- | --- |
| RF01 | Autenticar e encerrar sessão | Implementado com JWT em cookie HttpOnly e invalidação no logout. |
| RF02 | Administrar contas e situações | Implementado para o perfil administrador. |
| RF03 | Cadastrar, consultar, editar e inativar pacientes | Implementado com validações e persistência. |
| RF04 | Registrar evolução e escalas | Implementado; anotações e plano são cifrados com AES-256-GCM. |
| RF05 | Consultar e criar agendamentos | Implementado com regra de conflito de horário. |
| RF06 | Atribuir e concluir atividades terapêuticas | Implementado para profissional vinculado e paciente proprietário. |
| RF07 | Registrar receitas e despesas | Implementado com consulta, inclusão e exclusão. |
| RF08 | Consultar indicadores por período | Implementado para agenda, frequência, receita, modalidade e novos vínculos. |
| RF09 | Exportar relatórios | CSV e impressão do navegador para PDF. |
| RF10 | Recuperar senha por e-mail | Código disponível; depende de chave e remetente de provedor externo, não configurados para esta demonstração. |

## Requisitos não funcionais e regras de negócio

- Aplicação web com adaptação a celular, tablet e desktop; falta validação visual formal em aparelhos reais.
- Senhas ficam em hash bcrypt; o JWT é mantido em cookie HttpOnly.
- O servidor exige `JWT_SECRET` e `CLINICAL_DATA_KEY`; a chave clínica tem 32 bytes em hexadecimal.
- Campos clínicos de evolução são cifrados pela aplicação. A perda da chave impede decifrá-los.
- IDs e papéis recebidos do cliente não substituem a autorização feita no backend.
- Dados de seed são inteiramente fictícios; as credenciais de demonstração não são apropriadas para produção.
- E-mail de recuperação, notificações externas, MFA e backups automáticos não estão configurados.

## Arquitetura e tecnologias

O projeto é organizado em quatro áreas: `frontend/src` (React, TypeScript, Vite e Bootstrap), `backend/src` (Express, rotas, controladores, serviços, repositórios e MySQL), `shared/src` (tipos e validações compartilhados) e `database` (schema, seed e migrations). A aplicação cliente chama endpoints REST; os repositórios executam consultas SQL parametrizadas. A visão relacional está em [DER.md](DER.md), e os campos estão em [DICIONARIO_DADOS.md](DICIONARIO_DADOS.md).

## Rotas principais

| Método | Rota | Acesso | Função |
| --- | --- | --- | --- |
| POST | `/api/auth/login` | Público | Login e emissão de cookie de sessão. |
| POST | `/api/auth/logout` | Autenticado | Invalida sessão. |
| GET/POST/PATCH | `/api/users` e `/api/users/:id` | Administrador | Gestão de usuários e contas. |
| GET/POST/PATCH | `/api/patients` | Admin/Psicólogo | Cadastro e gestão de pacientes autorizados. |
| GET/POST | `/api/sessions` | Admin/Psicólogo | Consulta e registro de evolução clínica. |
| GET/POST/PATCH | `/api/appointments` | Conforme perfil | Agenda, criação e atualização de status. |
| GET/POST/DELETE | `/api/tasks` | Admin/Psicólogo | Consulta, atribuição e remoção autorizada de tarefas. |
| GET/PATCH | `/api/tasks/my` e `/api/tasks/:id/completion` | Paciente | Consulta e conclusão das próprias atividades. |
| GET/POST/DELETE | `/api/finance` | Admin/Psicólogo | Lançamentos financeiros. |
| GET/PUT | `/api/preferences` | Admin/Psicólogo | Preferências do usuário autenticado. |
| GET | `/api/reports/summary?period=mes\|trimestre\|ano` | Admin/Psicólogo | Indicadores agregados por período. |
| GET | `/api/audit-logs` | Administrador | Consulta da auditoria. |

## Banco de dados

O banco contém perfis, usuários, psicólogos, pacientes, vínculos, agendamentos, evoluções, auditoria, tokens revogados, limites de login, redefinição de senha, lançamentos financeiros, tarefas e preferências. `schema.sql` prepara uma base nova; `seed.sql` insere dados fictícios e limpa tabelas, portanto só deve ser executado em base descartável. Para base existente, aplicar migrations `001`–`005` em ordem.

## Instalação e execução

1. Instalar Node.js compatível com Vite, dependências npm e MySQL 8.
2. Criar a base com `database/schema.sql`; em base descartável, executar `database/seed.sql`.
3. Copiar `.env.example` para `.env`, configurar dados do banco, gerar um `JWT_SECRET` e `CLINICAL_DATA_KEY` próprios.
4. Executar `npm install` e `npm run dev`.
5. Abrir `http://localhost:3000`; a API inicia em `http://localhost:3001/api`.

O passo a passo e as credenciais fictícias estão no [README](../README.md). Recuperação por e-mail requer configuração posterior de provedor.

## Plano e resultados dos testes

Os testes cobrem validações, regras de serviço, autorização HTTP e integração MySQL. Na revisão atual, `npm test` com `RUN_MYSQL_INTEGRATION=1` executou 15 testes: 15 aprovados, zero falhas e zero ignorados. `npx tsc --noEmit` e `npm run build` também passaram. Reexecutar esses comandos na versão final e anexar captura/registro dos resultados à entrega.

## Inovação, limitações e próximos passos

A inovação demonstrável é o acompanhamento de evolução com escalas de humor/ansiedade e atividades atribuídas entre sessões. Ela organiza informação registrada, mas não gera diagnóstico ou recomendação clínica automática. O modelo não possui cadastro de diagnóstico; por isso não há estatística diagnóstica. E-mail/notificações externas, MFA e backup automático estão fora da configuração atual. A exportação PDF usa a impressão do navegador.

## Participação dos integrantes

A tabela abaixo registra a atuação comprovada de cada integrante, com base no histórico de commits do repositório GitHub e nas responsabilidades assumidas durante o desenvolvimento.

| Integrante | Período de contribuição ativa | Atuação e contribuição real durante o projeto |
| :--- | :--- | :--- |
| **Caio Vinicius Santos da Costa Leite** | Maio – Novembro/2026 | Criação e liderança do repositório; desenvolvimento completo da interface web responsiva (React + TypeScript + Vite + Bootstrap); prototipação e design de todas as telas públicas e autenticadas; identidade visual, logo e favicons do projeto; estruturação das rotas de navegação do frontend e integração das telas com a API. |
| **Kauan Marinho** | Agosto/2026 | Integração full-stack entre front-end e API Node.js; configuração de execução simultânea (`concurrently`); implementação de tipagem estrita TypeScript compartilhada entre interface e servidor; implementação das rotas de API de usuários e correções de autenticação. |
| **Maicon Diaz** | Agosto/2026 – Novembro/2026 | Modelagem relacional do banco de dados MySQL, elaboração dos scripts de criação de tabelas (schema DDL), restrições de integridade e povoamento de dados sintéticos (seed); implementação e testes do fluxo de recuperação e redefinição de senha por e-mail e notificações. |
| **Daniel Oliveira Silva** | Agosto/2026 | Implementação das camadas de segurança do back-end: controle de acesso por perfil (`authMiddleware`), hash de senhas com bcrypt, proteção e validação de rotas, serviços e repositórios de autenticação, auditoria e psicólogos; configuração do servidor Express com CORS e políticas de autorização. |
| **Gabriel Nascimento Luz** | Novembro/2026 | Consolidação da arquitetura modular do projeto (`backend/`, `frontend/`, `database/`, `shared/`, `docs/`); implementação dos fluxos completos da agenda, portal do paciente, tarefas terapêuticas, financeiro, relatórios com exportação CSV e criptografia AES-256-GCM em campos clínicos; elaboração do DER, dicionário de dados, migrations `001`–`005`, documentação técnica e suíte de testes automatizados. |

## Conclusão

O PsicoManager demonstra os fluxos centrais de uma aplicação integrada e a aplicação de controle de acesso, persistência relacional e inovação de acompanhamento. A entrega final deve apresentar a versão executável, a documentação revisada, evidências, a participação verdadeira dos integrantes e vídeo-pitch coerente com os limites funcionais descritos.

## Referências

- Unijorge. **AV3 — Projeto Integrador: Plataforma de Gestão para Profissionais de Psicologia.** Enunciado fornecido no arquivo `trabalho/AV3-UJ.docx`.
- Documentação do próprio projeto: [README](../README.md), [DER](DER.md), [dicionário de dados](DICIONARIO_DADOS.md), `database/schema.sql` e migrations.
