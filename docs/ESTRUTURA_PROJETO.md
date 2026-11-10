# Estrutura do projeto PsicoManager

```text
.
├── backend/src/        API Express, autenticação, regras, repositórios e MySQL
├── frontend/src/       Aplicação React, páginas, componentes e clientes da API
├── shared/src/         Tipos e validações usados pelo front-end e back-end
├── database/           schema.sql, seed.sql e migrations ordenadas
├── docs/               Guias técnicos e entregáveis acadêmicos
├── public/             Arquivos estáticos
├── test/               Testes automatizados
├── trabalho/           Enunciado e material original da atividade
├── .env.example        Modelo de configuração local
└── package.json        Dependências e comandos do projeto
```

## Como as partes se relacionam

- O Vite carrega o front-end a partir de `frontend/src/main.tsx`, referenciado pelo `index.html` na raiz.
- A API inicia em `backend/src/server.ts`; rotas, controladores, serviços e repositórios ficam em `backend/src`.
- `shared/src` contém tipos e validações sem dependência de React, Express ou MySQL.
- `.env` e `package.json` permanecem na raiz para manter uma única configuração e instalação de dependências.
- `database/schema.sql` cria as tabelas e `database/seed.sql` insere dados fictícios. Em bancos existentes, aplique as migrations de `database/migrations` em ordem.

## Comandos

- `npm run dev`: inicia a API e a interface.
- `npm run dev:server`: inicia apenas a API.
- `npm run dev:front`: inicia apenas o Vite.
- `npm test`: executa a suíte automatizada.
- `npm run build`: gera a interface de produção em `dist/`.

## Estado dos módulos

- Autenticação, perfis, pacientes, evoluções e agenda usam a API e o MySQL.
- Dashboard, tarefas atribuídas, financeiro, preferências e indicadores consultam e persistem dados na API.
- Relatórios oferecem CSV e impressão do navegador para PDF. Não há gráficos de diagnóstico, porque o modelo não armazena diagnósticos.
- Recuperação de senha por e-mail exige credenciais de um provedor externo. Notificações externas, MFA e backups automáticos não estão configurados.
- O dashboard e os módulos integrados dependem de aplicar o schema/seeds ou as migrations corretas.
- Para referência acadêmica, consulte [DER.md](DER.md), [DICIONARIO_DADOS.md](DICIONARIO_DADOS.md), [RELATORIO_ACADEMICO_BASE.md](RELATORIO_ACADEMICO_BASE.md) e [ROTEIRO_PITCH.md](ROTEIRO_PITCH.md).
