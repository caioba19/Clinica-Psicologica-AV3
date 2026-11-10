# Pendências do projeto PsicoManager

Este documento separa o que ainda precisa ser feito no código do que falta para concluir a entrega acadêmica da AV3. Foi elaborado com base no estado atual do repositório e no enunciado em `trabalho/AV3-UJ.docx`.

## Código e funcionamento

### Correções da revisão atual

As correções solicitadas nesta revisão estão implementadas:

- Dashboard com dados carregados da API: agenda do dia, pacientes ativos, receita recebida no mês e tarefas pendentes.
- Atribuição de tarefas por psicólogo/administrador e consulta/conclusão pelo paciente, respeitando o vínculo profissional.
- Exportação de relatórios em CSV e impressão do navegador para salvar como PDF.
- Instalação documentada com `CLINICAL_DATA_KEY` e migrations `001` a `005`.
- Telas de login e dashboard verificadas em viewports de celular, tablet e desktop; capturas em [`evidencias/`](evidencias/).

Na última verificação, TypeScript, build de produção e testes passaram. O conjunto de testes MySQL também passou (15 testes, sem falhas). Isso registra o resultado daquela execução; rode os comandos novamente após novas alterações.

### Item de código delegado

- **Recuperação de senha por e-mail e notificações:** outra pessoa ficará responsável por essa etapa. Até que seja implementada e testada, considere esses recursos pendentes e não os apresente como funcionais. Configure as credenciais de envio somente no `.env` local; não publique chaves ou senhas.

### Melhorias técnicas opcionais antes da entrega

- Testar instalação e migrations em uma máquina/base limpa, seguindo o README.
- Testar os fluxos completos dos três perfis após qualquer mudança recente.
- Fazer uma validação visual adicional em aparelhos físicos, se houver disponibilidade. A verificação feita até agora foi por simulação de tamanhos de viewport.

Não há outra correção obrigatória de código identificada na lista revisada, além do item de e-mail/notificações que foi delegado. Isso não equivale a uma garantia de ausência de qualquer defeito não coberto pelos testes.

## Entrega acadêmica

- [ ] Revisar e finalizar [`RELATORIO_ACADEMICO_BASE.md`](RELATORIO_ACADEMICO_BASE.md): preencher disciplina, turma, docente, data, integrantes, objetivos/requisitos conforme o enunciado e referências solicitadas. O arquivo atual é um rascunho, não o relatório final.
- [ ] Registrar os nomes completos e as contribuições reais de cada integrante no relatório e no README principal. Não manter marcadores genéricos nem atribuir funções sem confirmação do grupo.
- [ ] Acrescentar ao relatório capturas das telas e dos fluxos dos três perfis. Já existem capturas de login e dashboard em três tamanhos de tela; ainda faltam evidências dos módulos e dos perfis autenticados.
- [ ] Anexar evidência dos testes executados (por exemplo, captura do resultado no terminal).
- [ ] Gravar e entregar o vídeo-pitch, com ao menos dois integrantes identificáveis, conforme o enunciado. [`ROTEIRO_PITCH.md`](ROTEIRO_PITCH.md) é apenas uma sugestão de roteiro; o vídeo não está no repositório.
- [ ] Fazer uma demonstração final coerente com o produto implementado e mencionar suas limitações, sem afirmar que diagnósticos são armazenados ou que e-mail/notificações estão ativos.
- [ ] Revisar o Git antes de entregar: conferir as mudanças locais, criar commits do grupo e garantir que `.env` e credenciais não sejam incluídos.

## Documentos de apoio existentes

- [`CHECKLIST_ENTREGAVEIS_AV3.md`](CHECKLIST_ENTREGAVEIS_AV3.md): conferência dos requisitos acadêmicos e do produto.
- [`DER.md`](DER.md) e [`DICIONARIO_DADOS.md`](DICIONARIO_DADOS.md): documentação do banco.
- [`ROTEIRO_DEMONSTRACAO.md`](ROTEIRO_DEMONSTRACAO.md): roteiro para demonstrar os fluxos atuais.
- [`ROTEIRO_PITCH.md`](ROTEIRO_PITCH.md): estrutura sugerida para o pitch.
- [`evidencias/`](evidencias/): capturas existentes de login e dashboard em celular, tablet e desktop.
