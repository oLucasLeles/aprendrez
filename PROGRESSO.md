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

## Nota de supervisão 2026-11-15 · ajuste no harness (feito por uma pessoa, não é uma funcionalidade)
O turno da F02 foi revisado e aprovado. O motor de turnos (`scripts/rodar-turnos.ps1`)
agora guarda a trilha completa de cada turno em `logs/turno_*.jsonl` e registra o
consumo em `logs/consumo.csv`. Nada muda na rotina do turno.
**Próximo turno:** F03 · Rotas e páginas vazias (veja as dicas na entrada da F02).

## Turno 2026-11-15 20:50 · [F03] Rotas e páginas vazias
**Status:** concluída
**O que fiz:** O app agora tem três telas, cada uma no seu endereço: Início (`/`),
Lição (`/abertura/:id`, onde `:id` é o nome curto da abertura, como `italiana`) e
Página não encontrada (qualquer outro endereço). As telas ficam em `src/screens/` e
ainda são só esqueletos, com título e um link para voltar ao início. Criei o
`vercel.json`, que diz à Vercel para entregar o `index.html` em qualquer endereço,
porque quem decide qual tela mostrar é o próprio app (é um "app de página única").
Testes novos: `src/App.test.tsx` (unidade) e `e2e/rotas.spec.ts` (navegador).
**Decisões:**
- Nova dependência: `react-router` (v7.18.5), **licença MIT**. É a biblioteca de
  rotas mais usada com React e já traz links, leitura do `:id` do endereço e
  navegação, que as próximas telas vão usar. Usei o modo simples (`BrowserRouter` +
  `Routes`), sem os recursos de "framework" dela.
- A tabela de rotas (`AppRoutes`) fica separada do `BrowserRouter` em `src/App.tsx`,
  para os testes de unidade usarem um roteador "de mentira" (`MemoryRouter`).
- A Lição aceita qualquer `:id` por enquanto e só mostra o texto "Abertura: <id>".
  Mostrar "não encontrada" para um id que não existe fica para quando houver o
  catálogo de aberturas.
- O título da aba do navegador muda em cada tela (com a tag `<title>`, que o React 19
  aceita dentro dos componentes).
- Duas classes globais novas em `src/index.css`: `.grid-full` (ocupa todas as colunas
  do grid) e `.page` (respiro no topo e no pé da tela), usando só tokens.
- Conferi o passo 3 (recarregar em `/abertura/italiana` no `npm run preview`) com um
  script do Playwright rodado à mão contra o build de produção: status 200 e a tela da
  Lição aparece. O teste e2e de recarregar roda no servidor de desenvolvimento, porque
  é nele que todos os testes e2e rodam hoje.
**Problemas e pendências:**
- Capturas de tela em `docs/capturas/f03-*-desktop.png` e `f03-*-celular.png`.
**Próximo turno:** F04 · Leitura da base de aberturas do Lichess (módulo para Node,
usado só nos testes, que lê os TSV de `data/lichess-openings/`).

## Turno 2026-11-15 21:00 · [F04] Leitura da base de aberturas do Lichess
**Status:** concluída
**O que fiz:** Criei `src/chess/lichessOpenings.ts`, um módulo que lê os arquivos
`a.tsv` a `e.tsv` de `data/lichess-openings/` e transforma cada linha em uma entrada
(código ECO, nome e lista de lances sem os números). Ele tem funções para buscar
entradas pelo nome exato e para conferir se uma sequência de lances começa com a
linha de uma entrada (`startsWithOpening` e `startsWithNamedOpening`). O validador
de conteúdo (F06) vai usar essa última em cada linha de abertura. Os testes em
`src/chess/lichessOpenings.test.ts` cobrem os dois passos de verificação (Italian
Game: Giuoco Piano = `e4 e5 Nf3 Nc6 Bc4 Bc5`; com `c3` no fim conta, com `Bb5` não)
e mais alguns casos de borda (nome inexistente, sequência curta demais, linha quebrada).
**Decisões:**
- A busca por nome devolve uma **lista**, não uma entrada só: a base repete alguns
  nomes (por exemplo "Alekhine Defense"), porque a mesma abertura pode ser alcançada
  por ordens de lances diferentes. `startsWithNamedOpening` aceita se a sequência
  começar com **qualquer** uma das entradas desse nome.
- O módulo usa `node:fs`, então só pode ser importado por testes e scripts, nunca pelo
  código do navegador (está avisado no comentário do topo do arquivo). Fica em
  `src/chess/` porque o CLAUDE.md pede lógica de xadrez ali. Os testes dele rodam
  com `@vitest-environment node`, como o de tokens.
- Nenhuma dependência nova.
**Problemas e pendências:** nenhum. Esta funcionalidade é só lógica, sem interface,
então não houve captura de tela.
**Próximo turno:** F05 · Modelo de dados da árvore de abertura (tipos em `src/chess/`
e funções para percorrer a árvore).
