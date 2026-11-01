# 🧠 PsicoManager — Plataforma de Gestão para Profissionais de Psicologia

[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Status](https://img.shields.io/badge/Status-Em%20desenvolvimento-yellow)](#)

> **AV3 — PROJETO INTEGRADOR**  
> **Produto:** Aplicação Web Responsiva para Clínicas e Consultórios de Psicologia  
> **Instituição:** Centro Universitário Jorge Amado (Unijorge)

---

## 📌 Sobre o Projeto

O **PsicoManager** é uma plataforma web desenvolvida para centralizar a gestão clínica, administrativa e financeira de profissionais de Psicologia em diversas áreas de atuação (Clínica, TCC, Psicanálise, Organizacional, Escolar e Hospitalar).

O sistema reúne ferramentas de gestão clínica em desenvolvimento. A conformidade com as diretrizes do **Conselho Federal de Psicologia (CFP)** e da **LGPD (Lei Geral de Proteção de Dados)** ainda requer implementação e revisão formal.

---

## ✨ Funcionalidades do Sistema

> Financeiro, tarefas terapêuticas, preferências e indicadores possuem persistência. Recuperação de senha por e-mail depende de credenciais externas; exportações de relatórios usam CSV e impressão para PDF.

### 🔐 1. Autenticação e Perfis de Acesso (RBAC)
- **Telas Públicas:** Landing Page institucional, Como Funciona, Para Psicólogos, Para Empresas e Blog;
- **Login Real com Token JWT e Criptografia Bcrypt:**
  - 👑 **Administrador Geral:** Gestão de usuários, psicólogos, ativação/bloqueio de contas e auditoria do sistema;
  - 🩺 **Psicólogo:** Painel clínico, agenda, prontuários, financeiro e relatórios;
  - **Paciente:** consulta os próprios agendamentos e atividades terapêuticas atribuídas; pode atualizar os dados básicos da conta;
- O acesso é definido pela conta autenticada; a interface não oferece alternância simulada de perfil.

### 👥 2. Gestão de Pacientes (CRUD Completo com MySQL)
- Listagem em modo **Tabela** e **Cards** com busca em tempo real (nome, CPF, e-mail) e filtros por situação (*Ativo, Em Espera, Inativo*);
- Formulário cadastral completo com **validação real de CPF (dígitos verificadores matemáticos)**, máscaras automáticas (Telefone, CEP, CPF) e validação de e-mail;
- Modal de **Prontuário Rápido** com histórico do paciente;
- **Inativação de Pacientes** e **Exportação de Relatório em CSV**.

### 📝 3. Prontuários Eletrônicos & Evolução Clínica (Módulo de Inovação)
- Registro de evolução por atendimento com carimbo de data/hora;
- **Escala de Humor e Nível de Ansiedade (1 a 10)** para acompanhamento do progresso terapêutico;
- Histórico de queixas clínicas e anamnese estruturada;
- Emissão e impressão de **Declarações de Comparecimento** e **Laudos Iniciais** formatados para impressão/PDF.

### 📅 4. Agenda e Consultas
- Agenda e portal do paciente consomem endpoints persistidos no MySQL. O psicólogo pode atribuir tarefas terapêuticas, e o paciente atualiza sua conclusão.


### 💰 5. Módulo Financeiro & Relatórios
- Controle de fluxo de caixa (receitas de consultas vs. despesas operacionais);
- Emissão de recibos de pagamento com layout de impressão A4;
- Indicadores de agenda, receita e modalidade são calculados a partir do banco. Diagnósticos não são registrados e não há gráfico desse indicador.

### ♿ 6. Acessibilidade & Usabilidade (WCAG 2.1 AA)
- Suporte a **Tema Claro (Light)** e **Tema Escuro (Dark)**;
- Modal de Acessibilidade: ajuste de tamanho de fonte, alto contraste e navegação por teclado.

---

## 🛠️ Tecnologias e Bibliotecas

- **Front-end:** [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/), [Bootstrap 5.3](https://getbootstrap.com/), [Bootstrap Icons](https://icons.getbootstrap.com/), [Chart.js](https://www.chartjs.org/)
- **Back-end:** [Node.js](https://nodejs.org/), [Express](https://expressjs.com/), [TypeScript](https://www.typescriptlang.org/), [tsx](https://github.com/privatenumber/tsx)
- **Banco de Dados:** [MySQL 8.0+](https://www.mysql.com/), driver `mysql2`
- **Segurança:** [bcryptjs](https://www.npmjs.com/package/bcryptjs) (hash de senhas), [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) (autenticação JWT)
- **Testes Automatizados:** Test runner nativo do Node.js com asserções estritas

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) (versão 20.19 ou superior, exigida pelo Vite 8)
- [MySQL](https://dev.mysql.com/downloads/) (versão 8.0 ou superior / XAMPP / Docker)
- Gerenciador de pacotes `npm`

### 1. Configurar o Banco de Dados MySQL:

Em uma base nova, execute `database/schema.sql`. Para preencher a base descartável de demonstração, execute também `database/seed.sql`; esse arquivo limpa as tabelas antes de inserir os dados fictícios.

Em um banco existente, aplique as migrations `database/migrations/001` a `005` em ordem. Não execute o seed em uma base que contenha dados a preservar.

### 2. Configurar o arquivo `.env`:

Copie `.env.example` para `.env` e configure o MySQL. Gere um `JWT_SECRET` aleatório (mínimo 32 caracteres) e uma `CLINICAL_DATA_KEY` com 64 dígitos hexadecimais. Use chaves próprias para cada ambiente e guarde a chave clínica: sem ela, registros clínicos cifrados não podem ser lidos. `EMAIL_API_KEY` e `EMAIL_FROM` são opcionais até habilitar recuperação de senha por e-mail.

```env
PORT=3001
CORS_ORIGINS=http://localhost:3000
JWT_SECRET=<segredo aleatório com pelo menos 32 caracteres>
CLINICAL_DATA_KEY=<chave aleatória hexadecimal de 64 caracteres>
JWT_EXPIRES_IN=1d
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=psicomanager
APP_BASE_URL=http://localhost:3000
# EMAIL_API_KEY= (opcional)
# EMAIL_FROM= (opcional)
```
### 3. Instalar Dependências e Executar:
```bash
# Instalar os pacotes
npm install

# Iniciar Servidor Back-End e Front-End simultaneamente
npm run dev
```

- **Front-End:** `http://localhost:3000`
- **Back-End API:** `http://localhost:3001/api`

---

## 🔑 Credenciais de Acesso por Perfil (Senha Padrão: `123456`)

Para testar, navegar e demonstrar os diferentes fluxos e permissões do sistema, utilize as contas fictícias pré-configuradas:

| Perfil | E-mail de Acesso | Senha | Nome na Aplicação | O que demonstrar neste perfil |
| :--- | :--- | :---: | :--- | :--- |
| 👑 **Administrador Geral** | `admin@clinica.com` | `123456` | Renata Farias | **Painel de Usuários:** Cadastro de novos acessos, edição de nome/e-mail/perfil, bloqueio/desbloqueio imediato, listagem de psicólogos cadastrados e consulta da trilha de auditoria (`/admin/usuarios`). |
| 🩺 **Psicóloga Clínica** | `dra.sofia@psicomanager.com.br` | `123456` | Dra. Sofia Mendes | **Atendimento & Inovação:** Agenda clínica com agendamento integrado à API (`/agenda`), lista de pacientes vinculados (`/pacientes`), prontuário eletrônico com escala de humor e evolução (`/sessoes`) e emissão de laudos/declarações. *(Tentativa de acessar `/admin/usuarios` é bloqueada).* |
| 👤 **Paciente / Cliente** | `marcos.andrade@email.com` | `123456` | Marcos Vinícius Andrade | **Portal do Paciente:** consulta seus agendamentos persistidos e atualiza a conclusão das atividades atribuídas. *(O acesso aos módulos de gestão é bloqueado).*

> 💡 **Dica para Apresentação:** use o botão de demonstração no login para preencher a conta da psicóloga (`dra.sofia@psicomanager.com.br`, senha `123456`). Essa conta vem do seed local.

---

## 🧪 Como Executar os Testes Automatizados

Para rodar a suíte de testes unitários e de integração de regras:
```bash
npm test
```

Para executar tambÃ©m o teste de integraÃ§Ã£o com o MySQL configurado, use o PowerShell apÃ³s preparar o banco e aplicar o seed:
```powershell
$env:RUN_MYSQL_INTEGRATION = '1'
npm test
```

---

## 🔌 Principais Endpoints da API REST

| Método | Rota | Autenticação | Descrição |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Pública | Login, validação de hash bcrypt e emissão de JWT |
| `POST` | `/api/auth/logout` | Autenticado | Invalida o token da sessão |
| `PATCH` | `/api/auth/profile` | Autenticado | Atualiza os próprios dados de perfil |
| `PATCH` | `/api/auth/password` | Autenticado | Altera a senha após validar a senha atual |
| `GET` | `/api/users` | Admin (JWT) | Listagem de todos os usuários |
| `POST` | `/api/users` | Admin (JWT) | Cadastro de usuário com hash de senha |
| `PATCH` | `/api/users/:id` | Admin (JWT) | Edita nome/e-mail e permite mudança segura entre administrador e psicólogo |
| `PATCH` | `/api/users/:id/situacao` | Admin (JWT) | Ativa, inativa ou bloqueia o acesso |
| `GET` | `/api/psychologists` | Autenticado | Listagem de psicólogos |
| `POST` | `/api/psychologists` | Admin (JWT) | Cadastro de psicólogo com CRP |
| `GET` | `/api/patients` | Admin/Psicologo (JWT) | Lista pacientes autorizados pelo vinculo |
| `POST` | `/api/patients` | Admin/Psicologo (JWT) | Cadastro de paciente com vinculo profissional |
| `PATCH` | `/api/patients/:id` | Admin/Psicologo (JWT) | Atualizacao de cadastro autorizado |
| `GET` | `/api/sessions` | Admin/Psicólogo (JWT) | Consulta evoluções autorizadas por paciente |
| `POST` | `/api/sessions` | Admin/Psicologo (JWT) | Registro de evolucao clinica e plano terapeutico |
| `GET` | `/api/appointments?data=AAAA-MM-DD` | Admin/Psicólogo (JWT) | Lista consultas do dia conforme as permissões |
| `GET` | `/api/appointments/my` | Paciente (JWT) | Lista os próprios agendamentos |
| `POST` | `/api/appointments` | Admin/Psicólogo (JWT) | Cria consulta e impede sobreposição de horário |
| `PATCH` | `/api/appointments/:id/status` | Admin/Psicólogo (JWT) | Atualiza situação da consulta |
| GET | /api/tasks | Admin/Psicólogo (JWT) | Lista atividades dos pacientes vinculados |
| POST | /api/tasks | Admin/Psicólogo (JWT) | Atribui atividade a paciente vinculado |
| GET | /api/tasks/my | Paciente (JWT) | Lista as próprias atividades |
| PATCH | /api/tasks/:id/completion | Paciente (JWT) | Atualiza conclusão de atividade própria |
| GET/POST/DELETE | /api/finance | Admin/Psicólogo (JWT) | Consulta, cria e remove lançamentos financeiros |
| GET/PUT | /api/preferences | Admin/Psicólogo (JWT) | Consulta e persiste preferências por usuário |
| GET | /api/reports/summary?period=mes\|trimestre\|ano | Admin/Psicólogo (JWT) | Retorna indicadores calculados do banco |
| `GET` | `/api/audit-logs` | Admin (JWT) | Trilha de auditoria das ações do sistema |

---

## Roteiro de demonstracao

Consulte [docs/ROTEIRO_DEMONSTRACAO.md](docs/ROTEIRO_DEMONSTRACAO.md) para apresentar os fluxos com as contas ficticias deste seed.

Pendências de código e da entrega acadêmica estão organizadas em [docs/README_PENDENCIAS.md](docs/README_PENDENCIAS.md).

> O dashboard e os relatórios consultam a API. Exportação de relatórios gera CSV ou abre a impressão do navegador para salvar em PDF. O agrupamento de diagnósticos ainda não existe porque o modelo não armazena diagnósticos.

## 👥 Equipe de Desenvolvimento

| Integrante | Atuação Principal |
| :--- | :--- |
| **Caio** | Desenvolvimento Front-end, UI/UX, Componentes React, Integração com API REST e Validações |
| *(Outros integrantes)* | Back-end Node.js, Modelagem e Implementação do Banco MySQL, Documentação e Vídeo Pitch |

---

## 📄 Licença
Este projeto foi desenvolvido para fins acadêmicos no âmbito da avaliação AV3 da Unijorge.
