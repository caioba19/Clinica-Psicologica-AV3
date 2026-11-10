# Evidências visuais responsivas

As capturas `login-*.png` e `dashboard-*.png` registram a aplicação em Chromium headless nestas dimensões de viewport:

| Sufixo | Dimensão | Uso aproximado |
| --- | ---: | --- |
| `mobile` | 390 × 844 | Celular |
| `tablet` | 768 × 1024 | Tablet |
| `desktop` | 1440 × 900 | Desktop |

O script `scripts/capture-responsive.mjs` abre as telas, autentica com a conta fictícia do seed e verifica se a largura do documento excede a janela. As seis capturas estão incluídas neste diretório. Essa simulação não substitui uma validação em aparelhos físicos. Para a entrega acadêmica, acrescentem evidências dos fluxos e dos três perfis.
