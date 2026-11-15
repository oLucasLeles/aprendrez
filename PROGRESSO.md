# Diário de bordo do Aprendrez

Cada turno de trabalho acrescenta uma entrada no **fim** deste arquivo.
O formato está em `scripts/prompt-turno.md`, passo 6.

---

## Turno 2026-11-15 · [F01] Estrutura base do projeto (montagem do harness)
**Status:** concluída (turno supervisionado, feito junto com o dono do projeto)
**O que fiz:** Criei o projeto com Vite, React e TypeScript, e configurei dois
tipos de teste: os de unidade (Vitest), que testam pedaços de lógica isolados, e
os de ponta a ponta (Playwright), que abrem o app num navegador de verdade em
1440 px e 375 px. Também montei o harness: `CLAUDE.md`, `features.json`, este
diário, a rotina do turno e o motor de turnos.
**Decisões:**
- Base de aberturas do Lichess copiada para `data/lichess-openings/` (domínio
  público/CC0, conforme o README do repositório lichess-org/chess-openings).
- Dependências: `chess.js` (BSD-2-Clause), `react-chessboard` (MIT). A licença
  das imagens de peças do `react-chessboard` ainda precisa ser conferida (F10).
- O lint usa o oxlint, que já veio no modelo do Vite.
**Problemas e pendências:** nenhum.
**Próximo turno:** F02 · Tokens de design.

## Turno 2026-11-15 20:41 · [F02] Tokens de design
**Status:** concluída
**O que fiz:** Criei `src/styles/tokens.css`, o único lugar com as cores, a
fonte, os tamanhos de texto, os espaçamentos (sempre múltiplos de 8 px) e o grid
(4 colunas no celular, 12 a partir de 768 px). Os estilos globais
(`src/index.css`) passaram a usar só essas variáveis. A fonte Inter agora vem de
arquivos do próprio app. Um teste novo varre `src/` e falha se achar uma cor
escrita direto fora de `tokens.css`, e outro calcula o contraste das cores
(o teste falhou de propósito quando plantei uma cor de teste, então ele funciona).
**Decisões:**
- Nova dependência: `@fontsource-variable/inter` (v5.3.0). O pacote traz os
  arquivos da fonte Inter para dentro do build. **Licença da fonte: SIL Open Font
  License 1.1 (OFL-1.1)**, uma licença aberta para fontes que permite uso,
  inclusive comercial, e não exige atribuição na interface.
- Cores em duas camadas: uma paleta (`--palette-*`, o nome diz a cor) e os papéis
  (`--color-*`, o nome diz para que serve). Os componentes devem usar só os papéis.
- Destaque vermelho `#c8102e`: tem contraste de 5,9:1 com o texto branco do botão
  (o mínimo da WCAG AA é 4,5:1). Texto principal `#1a1a1a` sobre branco, cerca de 17:1.
- Casas do tabuleiro: cinza claro `#ececec` e cinza médio `#9e9e9e`, dois neutros
  com bom contraste entre si (SPEC, seção 9). Pode ser preciso ajustar quando as
  peças e o guia vermelho estiverem no tabuleiro.
- Criei uma classe `.grid` simples nos estilos globais para as telas usarem depois.
- Com "menos movimento" ligado no sistema (`prefers-reduced-motion`), a duração das
  animações vira 0.
- O detector de cores procura hex, `rgb()`/`rgba()` e `hsl()`/`hsla()` em
  arquivos .css, .ts, .tsx, .js, .jsx e .json de `src/`. Nomes de cor como `red`
  não são procurados, porque a funcionalidade não pede.
**Problemas e pendências:**
- A tela inicial ainda é um rascunho sem margens (o texto encosta na borda). O
  layout de verdade vem na funcionalidade da tela de Início.
- Capturas de tela em `docs/capturas/f02-desktop.png` e `f02-celular.png`.
**Próximo turno:** F03 · Rotas e páginas vazias. Vai precisar de uma biblioteca de
rotas (por exemplo, `react-router`) ou de uma solução simples feita à mão. Lembre de
registrar a licença se instalar algo.
