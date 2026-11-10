# Roteiro de demonstração do PsicoManager

Use somente as contas e os dados fictícios do seed. Inicie o MySQL, execute `npm run dev` na raiz e acesse `http://localhost:3000`.

## Contas locais

Todas usam a senha de demonstração `123456`:

- Administradora: `admin@clinica.com`
- Psicóloga: `dra.sofia@psicomanager.com.br`
- Paciente: `marcos.andrade@email.com`

## Sequência sugerida (7 a 10 minutos)

1. **Administradora:** entre no painel, consulte usuários, perfis, situações e auditoria; mostre a criação e o bloqueio/desbloqueio de conta.
2. **Psicóloga:** consulte pacientes vinculados e cadastre um agendamento. Tente criar outro horário sobreposto para demonstrar a validação de conflito.
3. Registre uma evolução clínica de demonstração com escala de humor/ansiedade.
4. No dashboard, mostre agenda do dia, pacientes ativos, receita paga no mês e atividades pendentes, calculados pelos dados do banco.
5. Atribua uma atividade terapêutica a um paciente; mostre que ela aparece no portal.
6. **Paciente:** entre no portal, consulte os próprios agendamentos e marque a atividade como concluída. Retorne ao dashboard para mostrar o estado atualizado.
7. Abra o financeiro para criar/remover um lançamento; mostre o filtro de período e os indicadores. Demonstre CSV e a opção de imprimir/salvar como PDF.
8. Finalize com as tecnologias, as regras de autorização e a inovação de acompanhamento por escalas.

## Antes da apresentação

- Confirme MySQL, configuração `.env`, API e interface. Para uma base existente, aplique as migrations até a `005`.
- Use exclusivamente dados sintéticos. Não insira pacientes ou contatos reais.
- Não execute `database/seed.sql` sobre uma base que contenha dados a preservar: o arquivo limpa tabelas.
- A recuperação de senha por e-mail e as notificações externas não estão configuradas; não as demonstre como ativas.
- Confirme que os dois integrantes que participarão do pitch aparecem ou têm voz identificável e explicam partes distintas.
- Use o relatório acadêmico para manter a demonstração coerente com a documentação e com as limitações descritas.
