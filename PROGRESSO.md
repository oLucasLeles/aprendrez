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

## Turno 2026-11-15 21:05 · [F05] Modelo de dados da árvore de abertura
**Status:** concluída
**O que fiz:** Criei `src/chess/openingTree.ts` com os tipos de uma abertura (`Opening`)
e de cada lance da árvore (`OpeningNode`: lance em SAN, de quem é, explicação, dica,
erros comuns, nome da variação e filhos). Também fiz as funções para percorrer a
árvore: `getMainLine` (linha principal), `getVariations` (lista de variações),
`getPathToNode` (caminho até um nó) e `findNodePath` (segue uma lista de lances).
Os testes em `src/chess/openingTree.test.ts` usam uma abertura de exemplo de pretas,
com duas variações e uma alternativa da pessoa, para mostrar que só galhos do
adversário contam como variação.
**Decisões:**
- **O primeiro filho de cada nó é sempre a linha principal.** Os demais filhos de um
  lance do adversário são variações. Assim a ordem dos filhos no arquivo de conteúdo
  já diz qual é a linha principal, sem precisar de um campo extra.
- **A árvore começa na posição inicial e inclui o lance assumido** (por exemplo, 1.e4
  nas aberturas de pretas) como primeiro nó, do adversário. O campo `assumedFirstMove`
  repete esse lance só para a interface saber qual lance o app joga sozinho. Assim
  toda linha pode ser comparada direto com a base do Lichess no validador (F06).
- `tree` é uma lista com os primeiros lances possíveis (em vez de um nó raiz vazio),
  para não precisar inventar um "lance falso" para a posição inicial.
- A notação em português (Cf3, Bc4…) não fica no conteúdo: os dados guardam SAN
  (notação inglesa) e a conversão vem na F07.
- Uma variação dentro de outra variação também aparece em `getVariations`, com o
  caminho completo até ela. A linha de uma variação = caminho até o desvio + sempre o
  primeiro filho depois dele.
- Nenhuma dependência nova.
**Problemas e pendências:** nenhum. Funcionalidade só de lógica, sem interface, então
não houve captura de tela. Não existe Python nesta máquina; usei só Node para editar.
**Próximo turno:** F06 · Validador automático do conteúdo (usa `Opening`/`getMainLine`/
`getVariations` daqui, `chess.js` e `startsWithNamedOpening` da F04). O validador deve
tratar `by: 'user'` com mais de um filho como alternativa (só permitida em `kind: 'system'`).

## Turno 2026-11-15 21:10 · [F06] Validador automático do conteúdo
**Status:** concluída
**O que fiz:** Criei `src/chess/validateOpening.ts`: uma função que recebe uma abertura e
devolve a lista de problemas encontrados (lista vazia = tudo certo), cada um com uma
mensagem em português que diz qual lance e depois de quais lances. Ela confere: lances
legais (com `chess.js`), linhas que começam com uma entrada da base do Lichess, explicação
e dica nos lances da pessoa, alternativas da pessoa só em sistemas, nome nas variações,
mínimo de 6 lances de cada lado na linha principal e de 1 a 2 variações. Os testes em
`src/chess/validateOpening.test.ts` têm uma abertura de exemplo válida e vários exemplos
inválidos (só nos testes): lance ilegal, linha que não bate com a base, dica vazia e
alternativa em linha fixa, entre outros. O mesmo arquivo de teste roda o validador sobre
todos os arquivos de `src/content/openings/` (a pasta ainda está vazia; a primeira
abertura chega na F08).
**Decisões:**
- **Cada arquivo de conteúdo faz `export default` de uma `Opening`.** O teste descobre os
  arquivos sozinho (`import.meta.glob`), então abrir uma abertura nova já a coloca no
  validador, sem lista para manter. `index.ts` e `*.test.ts` da pasta são ignorados.
- O lance precisa estar escrito na forma exata do `chess.js` (inclusive `+` de xeque e `#`
  de mate), porque a comparação com a base do Lichess é feita lance a lance.
- Conferências extras, pequenas e baratas: de quem é cada lance bate com a vez e com a cor
  da abertura; lances repetidos no mesmo ponto; lance assumido das pretas igual ao primeiro
  nó; erros comuns precisam ser legais, diferentes dos lances ensinados e ter explicação.
- Contei "variações" com `getVariations` (da F05), então uma variação dentro de outra também conta no limite de 2.
- Como a base do Lichess é lida do disco, o validador é só para Node (testes e scripts).
- Nenhuma dependência nova. Sem interface, então sem captura de tela.
**Problemas e pendências:** enquanto `src/content/openings/` estiver vazia, o teste "conteúdo
real" não valida nenhuma abertura de verdade (só passa vazio). Criei um `.gitkeep` para a pasta existir no git.
**Próximo turno:** F07 · Notação em português (SAN → R, D, T, B, C). As mensagens do validador
usam SAN (inglês); se quiser, a F09 pode trocar por notação portuguesa nos textos para revisão humana.
