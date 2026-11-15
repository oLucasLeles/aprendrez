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
