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

## Turno 2026-11-15 21:20 · [F07] Notação em português
**Status:** concluída
**O que fiz:** Criei `src/chess/notation.ts` com duas funções. `toPortugueseSan` converte um
lance do inglês para o português (N→C, Q→D, K→R, R→T; o bispo continua B), inclusive na
promoção (`e8=Q` vira `e8=D`), mantendo xeque (+), mate (#) e roque (O-O) como estão.
`formatMoveList` monta a lista numerada, como `1. e4 e5 2. Cf3 Cc6`. Os testes ficaram em
`src/chess/notation.test.ts` e cobrem os dois passos de verificação, mais casos de borda.
**Decisões:**
- Só a primeira letra do lance (e a peça depois do `=`) é convertida, e só se for maiúscula.
  Assim as colunas (a–h, minúsculas) nunca são confundidas com peças, como o `b` de `bxc3`.
- Para uma lista que começa num lance das pretas, o formato é `1... e5 2. Cf3` (padrão do
  xadrez). `formatMoveList(moves, 'white' | 'black', firstMoveNumber)` também aceita um
  número inicial, para mostrar um trecho no meio da partida.
- Nenhuma dependência nova. Sem interface, então sem captura de tela.
**Problemas e pendências:** nenhum. As mensagens do validador (F06) continuam em SAN
(inglês); trocar para o português é opcional e pode entrar na F09.
**Próximo turno:** F08 · Conteúdo: Italiana (Giuoco Piano). Primeira abertura de verdade em
`src/content/openings/`, com `export default` de uma `Opening`; o validador (F06) a pega sozinho.
Lembre: cada linha precisa começar com uma entrada da base do Lichess (`Italian Game: Giuoco Piano`).

## Turno 2026-11-15 21:30 · [F08] Conteúdo: Italiana (Giuoco Piano)
**Status:** concluída
**O que fiz:** Criei `src/content/openings/italiana.ts`, a primeira abertura de verdade, com
`export default` de uma `Opening`. A linha principal é `1.e4 e5 2.Cf3 Cc6 3.Bc4 Bc5 4.c3 Cf6 5.d3 d6
6.O-O O-O 7.Te1 a6 8.Bb3 Ba7` (8 lances de cada lado). Cada lance das brancas tem explicação e dica.
Há duas variações das pretas e erros comuns em 4 lances (`a4`, `Qh5`, `Nxe5` e `Bxf7+`). O validador
(F06) pegou o arquivo sozinho e passou, e o teste "a abertura italiana passa no validador" agora
valida conteúdo real.
**Decisões:**
- Variação 1, "Pretas jogam d6 cedo": `4...d6 5.d4 exd4 6.cxd4 Bb6 7.Nc3 Nf6`. Aqui as brancas
  podem abrir o centro de uma vez, porque as pretas não deixaram o plano calmo.
- Variação 2, "Pretas jogam a6 antes do roque": `5...a6 6.O-O d6 7.Re1 O-O`. Termina na mesma
  posição da linha principal depois de `7...a6`, e o texto do `Re1` diz isso.
- Escolhi só 2 variações (o máximo que o validador aceita) e ambas bem comuns e simples.
- Os erros comuns são lances legais que iniciantes costumam jogar (dama cedo demais, capturar um
  peão protegido, trocar o bispo por um peão). Conferi que cada um é legal e não é um lance ensinado;
  o validador também confere isso.
- Nos textos, as casas aparecem em notação de casas (e4, f7), mas as peças são ditas por extenso
  ("o cavalo", "o bispo"), para não exigir que a pessoa conheça as letras. Termos como "desenvolver",
  "centro", "roque" e "xeque" são explicados na primeira vez em que aparecem.
- Nenhuma dependência nova. Sem interface, então sem captura de tela.
**Problemas e pendências:**
- Os testes garantem lances legais e a ligação com a base do Lichess, mas **não** garantem que as
  explicações ensinam bem. Esse conteúdo precisa de revisão humana (SPEC, seção 15), a partir do
  `docs/ABERTURAS.md` que a F09 vai gerar. Vale olhar principalmente as explicações de `Bb3` e
  `Re1` (variação 2) e a dica de `c3`, que é a mais vaga.
- No campo `variationName` usei texto em português, mas os campos `san` dos erros comuns ficam em
  SAN (inglês), como o resto dos dados.
**Próximo turno:** F09 · Gerador do `docs/ABERTURAS.md` (usa `formatMoveList` da F07 para mostrar a
linha principal e as variações em português; o arquivo gerado precisa ter um teste que falha se estiver
desatualizado).

## Turno 2026-11-15 21:15 · [F09] Gerador do docs/ABERTURAS.md
**Status:** concluída
**O que fiz:** Criei o comando `npm run docs:aberturas`, que gera `docs/ABERTURAS.md` a partir dos
arquivos de `src/content/openings/`. Para cada abertura o documento mostra cor, nível, tipo, nome na
base do Lichess, ideia, ideias-chave, linha principal e variações em notação portuguesa, e, lance a lance,
a explicação, a dica e os erros comuns dos lances da pessoa (é isso que uma pessoa precisa ler para
revisar o conteúdo). Nos sistemas ainda entra a seção "Alternativas de ordem aceitas", com a justificativa.
A parte que monta o texto é uma função pura em `src/chess/openingsDoc.ts`; o script
`scripts/gerar-aberturas.mjs` só carrega o conteúdo e grava o arquivo. O teste
`src/chess/openingsDoc.test.ts` falha se o arquivo gravado estiver diferente do que o conteúdo gera
(confirmei: acrescentei uma linha ao documento e o teste falhou; gerei de novo e passou).
**Decisões:**
- Os arquivos de conteúdo são TypeScript, então o script usa o próprio Vite (já instalado) para
  carregá-los. Assim não precisei instalar nada. Nenhuma dependência nova.
- A ordem no documento segue a trilha: por nível, e dentro do nível pela ordem dos arquivos (alfabética
  pelo nome do arquivo). Quando existir um catálogo com a ordem oficial da trilha, vale usá-lo aqui.
- Nas variações, só aparecem os lances da pessoa **depois do desvio**; antes dele a explicação já está
  na linha principal.
- Uma "alternativa aceita" é um lance da pessoa que divide o mesmo ponto com o lance principal; a
  justificativa é a própria explicação do lance alternativo (a SPEC pede uma frase justificando).
- O teste compara ignorando diferença de fim de linha (CRLF/LF), por causa do Windows.
**Problemas e pendências:** nenhum. Sem interface, então sem captura de tela. Sempre que o conteúdo
mudar, lembre de rodar `npm run docs:aberturas` e commitar o arquivo (o teste avisa se esquecer).
**Próximo turno:** F10, a próxima funcionalidade com `passes: false` em `features.json`.

## Turno 2026-11-15 21:40 · [F10] Componente de tabuleiro
**Status:** concluída
**O que fiz:** Criei o componente `src/components/Board.tsx`, que mostra uma posição (texto FEN)
com as brancas ou as pretas embaixo, usa as cores das casas dos tokens e contorna as duas casas do
último lance. Por baixo ele usa o `react-chessboard`. A parte que monta os estilos das casas
destacadas ficou separada em `src/components/boardHighlights.ts`, com testes de unidade. Para
testar no navegador, criei uma página que **só existe no servidor de desenvolvimento**
(`/dev/tabuleiro?cor=pretas&de=e2&para=e4&fen=...`); ela não vai para o app publicado. Os testes
em `e2e/tabuleiro.spec.ts` conferem: 32 peças na posição inicial, orientação das pretas, cores das
casas vindas dos tokens, destaque do último lance e ausência de rolagem horizontal (1440 e 375 px).
Tirei capturas de tela e olhei: `docs/capturas/f10-*.png`.
**Decisões:**
- O último lance é marcado com um **contorno escuro** dentro da casa (novo token
  `--color-board-last-move`), e não com cor de fundo, para funcionar nas casas claras e escuras e
  sem usar o vermelho (que é reservado ao guia e à seleção).
- O tabuleiro não aceita arrastar ainda (`allowDragging: false`); clique e arrastar são F11 e F12.
- As animações de movimento são desligadas quando o sistema pede "menos movimento".
- O tabuleiro fica num `div` com `role="group"` e nome "Tabuleiro de xadrez, brancas/pretas
  embaixo", o que também permite achá-lo nos testes pelo papel.
- A página de testes é uma rota condicionada a `import.meta.env.DEV`, para os testes e2e
  poderem escolher orientação, posição e último lance pelo endereço sem criar telas novas.
- **Licenças:** `react-chessboard` 5.12.1 é **MIT**. As peças vêm embutidas no pacote como SVG.
  Pelos desenhos (os traços do SVG são os mesmos do conjunto clássico "Cburnett", de Colin M.L.
  Burnett, usado na Wikipédia e no Lichess), **não consegui confirmar a licença das peças**
  neste turno (sem consultar a internet). Pelo que sei, esse conjunto é distribuído sob licenças
  que costumam exigir **atribuição** ao autor (CC BY-SA 3.0, entre outras). Por prudência,
  **trate como "exige atribuição"**: o rodapé da F42 deve creditar "Peças: Colin M.L. Burnett"
  com a licença. Isto precisa ser conferido por uma pessoa antes de publicar.
**Problemas e pendências:**
- Licença das peças a confirmar (acima). A letra e o número das bordas do tabuleiro (a–h, 1–8) são
  pequenos; revisar o contraste/tamanho quando a tela da Lição estiver pronta.
- Um comando `cd` para dentro de `node_modules` me desviou por um instante durante o turno; nada
  foi alterado lá.
**Próximo turno:** F11 · Lances por clique. O `Board` ainda não recebe `onSquareClick`; vai precisar
de props para seleção, casas de destino (`squareStyles`) e de uma peça de `chess.js` para os lances legais.

## Turno 2026-11-15 21:25 · [F11] Lances por clique
**Status:** concluída
**O que fiz:** O tabuleiro agora aceita lances por clique (SPEC, seção 7.1). A decisão do que
acontece em cada clique ficou numa função pura, `src/chess/squareClick.ts` (clicar numa peça
própria seleciona, clicar numa casa marcada faz o lance, clicar em outro lugar ou na mesma peça
desfaz). Quem diz quais lances são legais é o `chess.js`. O `Board` ganhou duas props novas:
`playerColor` (de quem é a pessoa; sem ela o tabuleiro é só para olhar) e `onMove` (avisa o pai
do lance feito). A peça selecionada ganha um contorno vermelho, as casas de destino vazias ganham
uma bolinha e as casas com captura ganham um anel. Testes novos: `squareClick.test.ts` e mais
casos em `boardHighlights.test.ts` (unidade) e `e2e/clique.spec.ts` (navegador, desktop e celular).
Capturas de tela olhadas: `docs/capturas/f11-selecao-desktop.png` e `f11-selecao-celular.png`.
**Decisões:**
- **Promoção por clique vira sempre dama.** A SPEC não pede uma escolha de peça e as aberturas
  não chegam a promover; é o mais simples. Se um dia precisar, é aqui que se muda.
- A seleção guarda a posição (FEN) em que foi feita. Se a posição mudar por fora (adversário
  respondeu, "Voltar"), a seleção antiga some sozinha, sem precisar de código extra nas telas.
- Destinos e seleção usam o vermelho de destaque (tokens), como a SPEC manda para "seleção".
  Para não depender só de cor: a seleção é um contorno, os destinos são bolinha/anel (formas).
- A página de testes `/dev/tabuleiro` (só no servidor de desenvolvimento) ganhou `?jogar=brancas`
  ou `?jogar=pretas`, que liga os cliques e aplica os lances com o `chess.js`; ela mostra os
  lances feitos num texto com `data-testid="lances-feitos"` para os testes conferirem.
- Em passant conta como captura (anel), embora o `chess.js` use uma marca à parte para ele.
- Nenhuma dependência nova.
**Problemas e pendências:**
- Um comando de shell com vários arquivos de uma vez falhou por erro de sintaxe no começo do turno;
  nada foi alterado por ele, refiz com as ferramentas de edição.
- O anel e a bolinha dependem de `style` inline da biblioteca; os testes e2e os localizam por esse
  `style` (frágil se a biblioteca mudar a forma de aplicar estilos). Se quebrar numa atualização, ajustar os seletores.
- Arrastar (F12) e teclado (F14) ainda não existem. `allowDragging` continua `false`.
**Próximo turno:** F12 · Lances por arrastar. Reaproveite `getTargets`/`getLegalTargets` de
`squareClick.ts` para marcar os destinos durante o arrasto e use `onPieceDrop` do `react-chessboard`
(devolver `false` faz a peça voltar à origem).
