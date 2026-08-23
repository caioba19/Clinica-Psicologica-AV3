# 📖 Guia de Arquitetura e Estrutura de Pastas — PsicoManager

Este documento detalha o propósito, a responsabilidade e o funcionamento de **cada pasta e módulo** da aplicação (**Front-End, Back-End em Node.js com TypeScript e Banco de Dados MySQL**). Ele serve como documentação técnica para a equipe de desenvolvimento e atende integralmente aos requisitos de documentação arquitetural da **AV3 — Projeto Integrador**.

---

## 🗺️ Visão Geral da Estrutura do Projeto

```text
clinica-psicologica/
├── public/                     # Arquivos estáticos servidos diretamente (favicon, logos)
├── src/                        # Código-fonte principal da aplicação
│   │
│   ├── [ FRONT-END (React 19 + TypeScript) ]
│   │   ├── components/         # Componentes visuais reutilizáveis
│   │   │   ├── common/         # Blocos genéricos (StatCard, EmptyState, Logo, PrintModal)
│   │   │   └── layout/         # Estrutura mestra (AppLayout, Sidebar, Topbar, Modais)
│   │   ├── context/            # Gerenciamento de estado global (Auth, Toast, Theme, Acessibilidade)
│   │   ├── pages/              # Telas e rotas da aplicação
│   │   │   ├── admin/          # Painel e telas do Administrador Geral
│   │   │   ├── agenda/         # Grade de horários e agendamento de consultas
│   │   │   ├── auth/           # Login e recuperação de senha
│   │   │   ├── configuracoes/  # Preferências do sistema e notificações
│   │   │   ├── dashboard/      # Painel principal do Psicólogo com métricas clínicas
│   │   │   ├── financeiro/     # Fluxo de caixa, recibos e receitas/despesas
│   │   │   ├── paciente/       # Portal exclusivo de autoatendimento do Paciente
│   │   │   ├── pacientes/      # Listagem, busca e cadastro (CRUD) de pacientes
│   │   │   ├── perfil/         # Visualização e edição dos dados profissionais
│   │   │   ├── public/         # Landing Page e páginas institucionais
│   │   │   ├── relatorios/     # Estatísticas clínicas e gráficos analíticos (Chart.js)
│   │   │   └── sessoes/        # Prontuário eletrônico e evolução clínica (Inovação / CFP / LGPD)
│   │   ├── services/           # Camada de comunicação do front-end com a API REST
│   │   ├── styles/             # Folhas de estilo globais, temas (Dark/Light) e acessibilidade
│   │   ├── utils/              # Validadores de CPF real, formato de e-mail e máscaras de input
│   │   ├── App.tsx             # Componente raiz do React e definição das rotas
│   │   └── main.tsx            # Ponto de entrada do React no DOM
│   │
│   ├── [ BACK-END (Node.js + Express + TypeScript) ]
│   │   ├── server.ts           # Ponto de inicialização do servidor HTTP (Porta 3001)
│   │   ├── app.ts              # Configuração do Express, CORS, JSON parser e registro de rotas
│   │   ├── routes/             # Definição das rotas e endpoints REST da API
│   │   │   ├── authRoutes.JS   # Endpoints de autenticação (/api/auth/login) e usuários
│   │   │   ├── patientRoutes.ts# Endpoints de pacientes (/api/patients)
│   │   │   └── sessionRoutes.ts# Endpoints de sessões e prontuários (/api/sessions)
│   │   ├── controllers/        # Controladores que tratam requisições HTTP (req, res)
│   │   │   ├── authController.ts
│   │   │   ├── patientController.ts
│   │   │   └── sessionController.ts
│   │   ├── services/           # Regras de negócio e lógica de aplicação do back-end
│   │   │   ├── NodeAuthService.ts
│   │   │   ├── NodePatientService.ts
│   │   │   └── NodeSessionService.ts
│   │   └── repositories/       # Camada de acesso a dados (Data Access Layer)
│   │       ├── UserRepository.ts
│   │       ├── PatientRepository.ts
│   │       └── SessionRepository.ts
│   │
│   └── [ TIPAGEM E CONFIGURAÇÕES COMPARTILHADAS ]
│       ├── types/              # Interfaces e tipagens TypeScript centralizadas
│       └── vite-env.d.ts       # Declarações de ambiente do Vite
│
├── trabalho/                   # Documentos oficiais da disciplina e edital da AV3
│   ├── AV3-UJ.docx             # Documento Word oficial com diretrizes e critérios
│   └── conteudo.txt            # Transcrição integral das regras e requisitos
│
├── index.html                  # Template HTML base com tipografia e viewport
├── package.json                # Manifesto de dependências e scripts (dev, build, preview)
├── tsconfig.json               # Configurações do compilador TypeScript
└── vite.config.ts              # Configurações do Vite e plugins do React
```

---

## 🏗️ Arquitetura em Camadas do Back-End (Node.js + TypeScript)

O back-end segue o padrão de arquitetura em camadas para isolar responsabilidades e facilitar testes e manutenção:

```
[ Cliente / Front-end React ]
             │ (Requisição HTTP JSON)
             ▼
[ Routes (src/routes/) ] ──────────► Valida a rota e encaminha para o Controller
             │
             ▼
[ Controllers (src/controllers/) ] ─► Extrai parâmetros (body, params, query) e valida HTTP
             │
             ▼
[ Services (src/services/) ] ──────► Executa regras de negócio, validações e hashes de segurança
             │
             ▼
[ Repositories (src/repositories/) ]► Executa consultas e persistência (MySQL)
             │
             ▼
[ Banco de Dados MySQL ]
```

### 1. `src/server.ts` e `src/app.ts`
- **`server.ts`**: Ponto de entrada do servidor Node.js. Inicializa o serviço na porta configurada (padrão `3001`) via `app.listen()`.
- **`app.ts`**: Cria a instância da aplicação Express, aplica middlewares globais (`cors()`, `express.json()`), registra o healthcheck (`/api/health`) e anexa os roteadores da API.

### 2. `src/routes/` (Roteamento REST)
Define as URLs e métodos HTTP (`GET`, `POST`, `PATCH`, `DELETE`) de cada recurso:
- **`authRoutes.JS`**: Rotas de autenticação (`/api/auth/login`, `/api/auth/logout`) e usuários administrativos (`/api/users`).
- **`patientRoutes.ts`**: Rotas do CRUD de pacientes (`/api/patients`, `/api/patients/:id`).
- **`sessionRoutes.ts`**: Rotas para prontuários, agendamentos e notas de evolução clínica (`/api/sessions`).

### 3. `src/controllers/` (Controladores HTTP)
Responsáveis por receber a requisição (`Request`), invocar a camada de serviço correspondente e retornar a resposta HTTP formatada (`Response` com status `200`, `201`, `400`, `401`, `500`):
- **`authController.ts`**: Processa requisições de login e listagem de usuários.
- **`patientController.ts`**: Processa criação, consulta, busca por CPF e atualização de pacientes.
- **`sessionController.ts`**: Processa agendamentos e registros de prontuário eletrônico.

### 4. `src/services/` (Regras de Negócio do Back-End)
Contém a lógica de negócio independente de framework web:
- **`NodeAuthService.ts`**: Valida credenciais de login, verifica se a conta está com status ativo e emite o token de autorização.
- **`NodePatientService.ts`**: Valida duplicidade de CPF, formata campos obrigatórios e aplica regras de associação de pacientes.
- **`NodeSessionService.ts`**: Controla horários de atendimento e histórico de sessões.

### 5. `src/repositories/` (Acesso a Dados)
Abstrai as operações de persistência:
- **`UserRepository.ts`**: Métodos `findByEmail`, `findAll`, `create`, `updateSituacao`.
- **`PatientRepository.ts`**: Métodos `findAll`, `findById`, `findByCpf`, `create`, `update`.
- **`SessionRepository.ts`**: Métodos `findAll`, `findByPatientId`, `create`.

---

## 🎨 Detalhamento do Front-End (React + TypeScript)

### 1. `src/components/` (Componentes Visuais)
- **`common/EmptyState.tsx`**: Ilustração e mensagem amigável para listas vazias ou buscas sem resultados.
- **`common/Logo.tsx`**: Marca visual vetorizada do *PsicoManager*.
- **`common/PrintModal.tsx`**: Layout otimizado para impressão A4 e exportação em PDF (`@media print`) de laudos, recibos e declarações de comparecimento.
- **`common/StatCard.tsx`**: Cards com indicadores visuais, variação percentual e ícones personalizáveis.
- **`layout/AppLayout.tsx`**: Casca mestra das telas autenticadas com `Sidebar`, `Topbar` e `<Outlet />`.
- **`layout/Sidebar.tsx`**: Menu lateral dinâmico que adapta as opções conforme o perfil logado (*Psicólogo*, *Administrador* ou *Paciente*).
- **`layout/Topbar.tsx`**: Barra superior com dados do usuário, botão de alternância de tema (*Light/Dark*) e atalho de acessibilidade.
- **`layout/AccessibilityModal.tsx`**: Modal com controle de tamanho de fonte, alto contraste e modo leitura.
- **`layout/QuickActionModal.tsx`**: Menu rápido para novas ações no sistema (novo agendamento, novo paciente, etc.).

### 2. `src/context/` (Estado Global da Aplicação)
- **`AuthContext.tsx`**: Mantém a sessão do usuário logado, permissões e função de simulação rápida de perfil (`loginAs`).
- **`ToastContext.tsx`**: Notificações flutuantes (*sucesso, erro, alerta, info*) e modal de confirmação para ações críticas.
- **`ThemeContext.tsx`**: Alternância persistente entre modo Claro e modo Escuro.
- **`AccessibilityContext.tsx`**: Controle de acessibilidade conforme diretrizes WCAG 2.1 AA.

### 3. `src/pages/` (Telas e Rotas)
- **`admin/AdminUsuariosPage.tsx`**: Painel do Administrador com contadores, listagem de usuários por situação (*ativo, inativo, bloqueado*), alteração de perfil e logs de auditoria.
- **`agenda/AgendaPage.tsx`**: Grade de horários e salas de atendimento com distinção entre consultas presenciais e teleconsultas.
- **`auth/LoginPage.tsx`**: Formulário de autenticação com e-mail e senha.
- **`auth/ForgotPasswordPage.tsx`**: Fluxo de recuperação de senha.
- **`dashboard/DashboardPage.tsx`**: Dashboard clínico com métricas de pacientes, próximas consultas e tarefas do dia.
- **`financeiro/FinanceiroPage.tsx`**: Gestão financeira, controle de fluxo de caixa e emissão de recibos.
- **`paciente/PacientePortalPage.tsx`**: Portal de autoatendimento exclusivo do paciente.
- **`pacientes/PacientesListPage.tsx`**: Listagem com busca em tempo real, filtros por status, visualização em tabela/cards e **exportação em CSV**.
- **`pacientes/PacienteFormPage.tsx`**: Cadastro/edição de paciente com validação real de CPF (dígitos verificadores) e máscaras dinâmicas.
- **`perfil/PerfilPage.tsx`**: Edição dos dados profissionais do psicólogo (CRP, especialidade, abordagem).
- **`public/`**: Telas institucionais (`LandingPage.tsx`, `ComoFuncionaPage.tsx`, `ParaPsicologosPage.tsx`, `ParaEmpresasPage.tsx`, `BlogPage.tsx`).
- **`relatorios/RelatoriosPage.tsx`**: Gráficos estatísticos clínicos via *Chart.js*.
- **`sessoes/SessoesPage.tsx`**: Módulo de inovação com prontuário eletrônico, histórico de anamnese, evolução de atendimentos e escala de humor (1 a 10).

### 4. `src/services/` (Consumo de API no Front-End)
- **`api.ts`**: Cliente HTTP (`fetch`) padronizado com tratamento de erros e injeção automática de token JWT (`Authorization: Bearer <token>`).
- **`patientService.ts`**: Consome os endpoints `/api/patients`.
- **`userService.ts`**: Consome os endpoints `/api/users`.
- **`sessionService.ts`**: Consome os endpoints `/api/sessions`.

### 5. `src/utils/` (Utilitários e Validações)
- **`validators.ts`**: Algoritmo matemático para cálculo dos dois dígitos verificadores do CPF (`isValidCPF`), validação estrita de e-mail e telefone.
- **`masks.ts`**: Máscaras automáticas em tempo real para CPF, Telefone, CEP, Moeda e CRP.

---

## 🗄️ Modelo de Dados Relacional (MySQL)

Em conformidade com a seção 8 do edital da AV3, o banco de dados é estruturado nas seguintes tabelas relacionais:

| Tabela | Finalidade | Campos Principais |
| :--- | :--- | :--- |
| **`perfis`** | Cadastro dos perfis de acesso do sistema | `id`, `nome` (*administrador, psicologo, paciente*), `descricao` |
| **`usuarios`** | Credenciais e dados de acesso | `id`, `nome`, `email`, `senha_hash`, `perfil_id` (FK), `situacao` (*Ativo, Inativo, Bloqueado*), `criado_em` |
| **`psicologos`** | Dados profissionais do psicólogo | `id`, `usuario_id` (FK), `crp`, `especialidade`, `area_atuacao`, `bio` |
| **`clientes_pacientes`**| Dados cadastrais e clínicos do paciente | `id`, `nome`, `email`, `telefone`, `cpf`, `data_nasc`, `genero`, `status`, `convenio` |
| **`vinculos`** | Associação entre psicólogo e paciente | `id`, `psicologo_id` (FK), `paciente_id` (FK), `data_vinculo`, `ativo` |
| **`logs_acoes`** | Registro de auditoria administrativa | `id`, `usuario_id` (FK), `acao`, `entidade`, `detalhes`, `data_hora` |
| **`sessoes_prontuario`**| Prontuário, evolução e módulo inovador | `id`, `paciente_id` (FK), `psicologo_id` (FK), `data_hora`, `tipo`, `escala_humor`, `relato_evolucao` |

---

## 🚀 Ciclo Completo de Execução da Aplicação

```text
[ Usuário ] 
     │
     ▼
[ Front-End React 19 / TypeScript (Vite) ]
     │ (Valida formulários, CPF, máscaras e temas)
     │ (Dispara requisição HTTP REST)
     ▼
[ Back-End Node.js / TypeScript (Express - Porta 3001) ]
     │ (Roteia em src/routes/ e valida em src/controllers/)
     │ (Aplica regras de negócio e hash de segurança em src/services/)
     │ (Executa operações SQL em src/repositories/)
     ▼
[ Banco de Dados Relacional MySQL ]
     (Armazena dados com integridade referencial, PKs e FKs)
```

---

## 📋 Checklist de Conformidade Técnica — AV3

- [x] **Front-End Responsivo em TypeScript e React 19**;
- [x] **Back-End estruturado em Node.js com TypeScript** (Rotas, Controllers, Services, Repositories);
- [x] **API REST documentada** com suporte a autenticação, usuários, pacientes e prontuários;
- [x] **Funcionalidade de Inovação implementada** (Prontuário com Escala de Humor e Emissão de Documentos);
- [x] **Acessibilidade e Usabilidade WCAG 2.1 AA** (Tema Dark/Light, alto contraste e ajuste de fontes);
- [x] **Validações estritas de segurança no front-end** (Dígitos verificadores do CPF, máscaras e higienização de inputs);
- [x] **Documentação arquitetural completa e atualizada**.
