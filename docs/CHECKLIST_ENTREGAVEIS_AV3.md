# Checklist dos entregáveis da AV3

Conferência baseada no enunciado `trabalho/AV3-UJ.docx` e no estado do repositório. Os itens acadêmicos que dependem de informações ou ações do grupo estão identificados como pendentes.

## Produto e código

| Requisito | Estado verificado |
| --- | --- |
| Front-end, API TypeScript e MySQL | Implementados e integrados nos fluxos principais. `npm run build`, TypeScript e testes com MySQL foram executados durante a revisão. |
| Login, perfis e autorização no backend | Implementados para administradora, psicóloga e paciente; testes HTTP cobrem autenticação/permissões. |
| Gestão de pacientes e vínculos | CRUD e validação de acesso disponíveis via API e interface. |
| Inovação funcional | Evolução clínica com escalas de humor/ansiedade, agenda com conflito e atividades entre sessões. |
| Dashboard e indicadores | Consultam dados reais de agenda, pacientes, finanças e tarefas; valores fixos anteriores foram removidos. |
| Tarefas terapêuticas | Psicólogo/admin pode atribuir; paciente consulta e altera conclusão; backend verifica vínculo. |
| Financeiro | Consulta, inclusão e exclusão persistem no banco. |
| Relatórios | Indicadores dinâmicos por período; exporta CSV e imprime para PDF. Diagnósticos não são armazenados, então não há ranking diagnóstico. |
| E-mail/notificações | Conforme decisão do grupo, recuperação por e-mail e notificações ficam para uma etapa posterior; não estão configuradas nem devem ser apresentadas como funcionais nesta entrega. |
| Responsividade | Dashboard e login foram abertos em Chromium headless nas larguras 390×844 (celular), 768×1024 (tablet) e 1440×900 (desktop); as seis capturas estão em `docs/evidencias/`. A verificação encontrou ausência de rolagem horizontal. Isso valida tamanhos de viewport, não aparelhos físicos. |
| Histórico de commits | Há histórico Git, mas o estado atual contém muitas mudanças locais sem commit. O grupo deve revisar e fazer commits próprios antes da entrega. |

## Banco e documentação técnica

| Requisito | Estado verificado |
| --- | --- |
| Schema, relacionamentos e seed fictício | Presentes em `database/schema.sql` e `database/seed.sql`; o seed limpa a base e deve ser executado somente em base descartável. |
| Migrations | `001` a `005` disponíveis; migração `005` aplicada ao MySQL local `psicomanager`. Para outras bases existentes, executar em ordem. |
| DER | Criado em [DER.md](DER.md), em Mermaid, a partir do schema. |
| Dicionário de dados | Criado em [DICIONARIO_DADOS.md](DICIONARIO_DADOS.md). |
| Arquitetura, rotas e instalação | README e [ESTRUTURA_PROJETO.md](ESTRUTURA_PROJETO.md) atualizados; confirmar instruções em uma máquina limpa antes de entregar. |
| Relatório acadêmico | Há um rascunho inicial em [RELATORIO_ACADEMICO_BASE.md](RELATORIO_ACADEMICO_BASE.md). O grupo precisa revisar, completar capa, referências exigidas e todos os nomes/contribuições reais. |
| Testes | Testes automatizados executáveis por `npm test`; teste MySQL via `RUN_MYSQL_INTEGRATION=1`. Anexar capturas/registro dos resultados ao relatório final. |
| Capturas de evidência | Capturas de login e dashboard nos três tamanhos de viewport estão em `docs/evidencias/`. Ainda faltam capturas dos módulos e dos três perfis para compor o relatório. |

## Pitch e participação

| Requisito | Estado verificado |
| --- | --- |
| Roteiro de demonstração | Atualizado em [ROTEIRO_DEMONSTRACAO.md](ROTEIRO_DEMONSTRACAO.md). |
| Estrutura do pitch | Sugestão criada em [ROTEIRO_PITCH.md](ROTEIRO_PITCH.md). |
| Vídeo final | Não localizado; o grupo precisa gravar e entregar. |
| Dois integrantes identificáveis no vídeo | Precisa ser confirmado na gravação. |
| Função e atuação de cada integrante | README e relatório ainda têm campos genéricos. Substituir com os dados verdadeiros; não inventar autoria. |
| Coerência entre produto, relatório e vídeo | Fazer revisão final após preencher o relatório e gravar o pitch. |

## Ações finais do grupo

1. Revisar e completar o relatório acadêmico, inclusive capa, integrantes, contribuições, requisitos e referências.
2. Validar schema e instalação em uma máquina/base limpa seguindo o README.
3. Rodar testes novamente e capturar os resultados.
4. Completar as evidências com fluxos dos três perfis em desktop e celular; as capturas atuais cobrem login e dashboard em celular, tablet e desktop.
5. Gravar o pitch com pelo menos dois integrantes participando de forma identificável.
6. Revisar o estado do Git, criar commits e conferir que nenhuma chave `.env` foi incluída.
