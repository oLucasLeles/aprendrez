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

## Turno 2026-11-15 21:50 · [F12] Lances por arrastar
**Status:** concluída
**O que fiz:** O tabuleiro agora aceita lances por arrastar (SPEC, seção 7.2). Ao começar a arrastar uma
peça, as casas de destino legais ficam marcadas (a mesma bolinha/anel e o mesmo contorno do clique).
Ao soltar numa casa legal, o lance é feito; ao soltar numa casa ilegal ou fora do tabuleiro, a peça
volta para a casa de origem, sem mensagem e sem mudar a vez. A decisão ficou em duas funções puras
novas em `src/chess/squareClick.ts` (`handleDrop` e `canMovePiece`), testadas com testes de unidade.
No `Board`, o arrastar só liga quando existe `playerColor` e só deixa pegar peças da pessoa, na vez dela.
Testes de ponta a ponta novos em `e2e/arrastar.spec.ts` (desktop e celular): e2→e4 faz o lance, e2→e5
devolve a peça, soltar fora do tabuleiro, peça do adversário e clique ainda funcionando. Capturas de tela
olhadas: `docs/capturas/f12-arrastando-desktop.png` e `f12-arrastando-celular.png`.
**Decisões:**
- Reaproveitei `getLegalTargets` (da F11) dentro de `handleDrop`, então clicar e arrastar seguem exatamente a
  mesma regra de lance legal. Promoção por arrastar também vira sempre dama, como no clique.
- A seleção do arrasto usa o mesmo estado da seleção por clique; ao soltar ou cancelar, ela é limpa.
- Nenhuma dependência nova (as funções de arrastar já vêm no `react-chessboard`).
**Problemas e pendências:**
- Os testes de arrastar usam o mouse do Playwright em passos pequenos; num computador muito lento podem
  precisar de mais passos. Os seletores das casas marcadas dependem do `style` inline, como na F11.
- Arrastar com o dedo (toque) no celular não foi testado de verdade, só o mouse na largura de 375 px.
- Teclado ainda não existe (F14).
**Próximo turno:** F13, a próxima funcionalidade com `passes: false` em `features.json`.

## Turno 2026-11-15 22:00 · [F13] Guia de lance
**Status:** concluída
**O que fiz:** O `Board` ganhou a prop `guide` (`{ from, to }`). Quando ela existe, a casa da peça que deve se
mover ganha um fundo avermelhado suave com contorno na cor de destaque, e uma seta vermelha vai até a casa de
destino. O destaque da casa fica em `boardHighlights.ts` (função `getSquareStyles`, com testes de unidade); a
seta usa a que já vem no `react-chessboard`. A página de testes `/dev/tabuleiro` aceita `?guia=e2-e4`. Testes
novos em `e2e/guia.spec.ts` (desktop e celular): confere o destaque em e2, que a seta começa em e2 e termina perto de
e4 (lendo as coordenadas do desenho), que a cor vem do token `--color-accent` e que, sem guia, nada aparece.
Capturas olhadas: `docs/capturas/f13-guia-desktop.png` e `f13-guia-celular.png`.
**Decisões:**
- A cor da seta é `var(--color-accent)`, passada direto ao SVG; o teste confirma que o navegador a resolve para o
  vermelho do token (nenhuma cor escrita no componente).
- Desliguei `allowDrawingArrows` (desenhar setas com o botão direito do mouse), porque não faz parte do app.
- A seta ficou um pouco mais opaca (0,85 em vez de 0,65) para aparecer bem sobre as casas cinza.
- Lance de cavalo: a biblioteca desenha a seta em "L" (como na captura de g1 para f3). Mantive, porque é o desenho
  usual para cavalos.
- O destaque do guia só marca a casa de origem; o destino é indicado pela seta (SPEC: "a peça e uma seta").
- Nenhuma dependência nova.
**Problemas e pendências:**
- Se a peça do guia estiver selecionada, o contorno do guia e o da seleção ficam iguais (os dois são vermelhos);
  é o esperado, mas vale rever o visual quando a prática com guia (F20 em diante) estiver na tela.
- O teste da seta lê o `<path>` do SVG da biblioteca (frágil se ela mudar o desenho das setas).
**Próximo turno:** F14 · Tabuleiro pelo teclado. O `Board` hoje não tem foco nem nome acessível por casa; a
biblioteca tem `squareRenderer` e `onSquareClick`, que podem ajudar. Lembre de manter o foco visível (token `--color-focus`).

## Turno 2026-11-15 22:15 · [F14] Tabuleiro pelo teclado
**Status:** concluída
**O que fiz:** Dá para jogar só com o teclado. Tab leva o foco ao tabuleiro (na casa e2, ou e7 para as pretas),
as setas movem o foco entre as casas, Enter ou Espaço seleciona a peça e depois a casa de destino (faz o mesmo que
um clique) e Esc desfaz a seleção. Cada casa virou um botão com nome acessível, como "e2, peão branco" ou
"e4, vazia" (e "destino possível" nas casas marcadas). O foco aparece como um anel vermelho dentro da casa, afastado
do contorno da seleção para não se confundirem. A lógica de "para onde vai o foco" e dos nomes ficou em
`src/chess/keyboard.ts` (com testes de unidade); a interface está em `Board.tsx`; os testes de navegador em
`e2e/teclado.spec.ts` (desktop e celular). Capturas olhadas: `docs/capturas/f14-teclado-desktop.png` e `f14-teclado-celular.png`.
**Decisões:**
- **Só uma casa fica no caminho do Tab** ("foco móvel"): as outras 63 têm `tabindex=-1` e se alcançam pelas setas.
  Assim a pessoa não precisa apertar Tab 64 vezes.
- **As setas seguem o que se vê na tela**: com as pretas embaixo, "para cima" vai em direção às brancas.
- **A biblioteca (react-chessboard) deixa cada peça como um botão que recebe Tab** e tem um sensor de teclado próprio,
  que disputaria o Enter/Espaço com as casas. Por isso, a cada renderização o `Board` tira as peças do caminho do Tab
  (`tabindex=-1`, sem papel de botão). Vale também para o tabuleiro só para olhar (sem `playerColor`), que fica sem
  nenhuma parada de teclado. Foi a saída mais simples sem trocar de biblioteca.
- Ao usar `squareRenderer` da biblioteca, o desenho padrão da casa deixa de existir; por isso o `Board` aplica os
  estilos das casas (último lance, seleção, guia, destinos) no próprio botão da casa. Os testes antigos de clique,
  arrastar e guia continuaram passando sem mudança.
- Esc só desfaz a seleção; não tira o foco da casa.
- Nenhuma dependência nova.
**Problemas e pendências:**
- A limpeza das peças mexe em atributos de elementos criados pela biblioteca; se uma atualização dela mudar o
  `aria-roledescription="draggable"`, o teste "só uma casa fica no caminho do Tab" avisa.
- 64 botões num leitor de tela é muita coisa para ouvir; não testei com um leitor de verdade, só os nomes e papéis
  pelos testes. Uma versão em "grade" (`role="grid"`) pode ser melhor depois, mas não está na SPEC.
- Enquanto uma peça é arrastada com o mouse, o foco do teclado não muda (é esperado).
- Arrastar com o dedo (toque) continua sem teste de verdade, como na F12.
- Um comando `cd` para dentro de `node_modules` desviou a pasta de trabalho do shell no meio do turno; voltei à raiz
  e confirmei que nada foi alterado lá.
**Próximo turno:** F15 · Motor da lição (lógica pura). Usa `Opening`/`findNodePath` da F05 e `chess.js`; ainda sem interface.

## Turno 2026-11-15 22:30 · [F15] Motor da lição (lógica pura)
**Status:** concluída
**O que fiz:** Criei `src/chess/lessonEngine.ts`, a lógica (sem interface) que conduz uma linha da árvore.
Ela guarda um "estado da lição" e tem funções que devolvem um estado novo, sem mexer no antigo: de quem é a
vez (`getStatus`, `getTurn`), quais lances são aceitos (`getExpectedMoves`), `playUserMove` (avalia o lance da
pessoa: **correto**, com a explicação; **fora do roteiro**, que fica no tabuleiro; ou **rejeitado**, se for
ilegal ou fora da vez), `playOpponentMove` (a resposta do adversário), `undoOffScriptMove` ("Voltar") e `getGuide`
("Ver lance": peça e casa de destino). Os testes em `src/chess/lessonEngine.test.ts` cobrem os 4 passos da
funcionalidade: linha principal da Italiana inteira, lance fora do roteiro com dica e "Voltar", erros comuns
com a explicação específica, e um sistema de exemplo com ordem alternativa aceita.
**Decisões:**
- O lance da pessoa pode vir em SAN (`"Nf3"`) ou por casas (`{ from, to }`, como o tabuleiro entrega).
  Quem confere a legalidade é o `chess.js`; promoção vira sempre dama, como no clique e no arrastar.
- Enquanto há um lance fora do roteiro no tabuleiro, o estado é `off-script` e novos lances da pessoa são
  rejeitados até o "Voltar" (SPEC 7.3: o botão principal vira "Voltar").
- A mensagem genérica é "Esse lance é possível, mas não é o da abertura. Dica: …" com a dica do lance
  esperado (o primeiro, se houver alternativas). Se o lance for um erro comum cadastrado, entra a explicação dele.
- O ícone de erro (SPEC 13) é assunto da interface; o motor só diz se foi erro comum (`isCommonMistake`).
- `playOpponentMove(state, escolhido?)` joga a linha principal por padrão e já aceita um galho escolhido,
  para a F16 só acrescentar a escolha (caminho específico e Desafio com acaso).
- A abertura de sistema dos testes é um exemplo só dos testes (não há sistema no conteúdo ainda).
- Nenhuma dependência nova. Sem interface, então sem captura de tela.
**Problemas e pendências:** o motor ainda não sabe começar numa variação nem escolher galhos ao acaso (F16).
O estado não guarda "etapa" da lição (Assistir, Praticar…); isso é da camada de interface.
**Próximo turno:** F16 · Escolha de galhos do adversário (modos caminho/variação e Desafio com acaso injetável).
Use `getOpponentOptions` e o parâmetro `chosen` de `playOpponentMove`.

## Turno 2026-11-15 22:45 · [F16] Escolha de galhos do adversário
**Status:** concluída
**O que fiz:** Acrescentei ao motor da lição (`src/chess/lessonEngine.ts`) a escolha de qual galho o adversário
joga. Há dois modos: `path` (segue um caminho já escolhido, que é a linha principal ou uma variação) e `challenge`
(o modo Desafio, que sorteia entre os galhos existentes). Duas funções novas: `chooseOpponentNode` (só escolhe,
sem jogar) e `playOpponentTurn` (escolhe e joga). A fonte de acaso (`random`) é passada de fora, então os testes
controlam o resultado; se não for passada, usa `Math.random`. Os testes novos em `src/chess/lessonEngine.test.ts`
cobrem os dois passos: no modo caminho o adversário joga exatamente cada variação da Italiana (e não cai na linha
principal); no Desafio, com acaso controlado, cada galho pode ser escolhido e toda partida chega a uma folha
(ponta da árvore, sem mais lances).
**Decisões:**
- No modo `path`, a linha a seguir é uma lista de nós (`getMainLine(abertura)` ou `variação.line`, da F05). A escolha
  compara pelo objeto da árvore. Se a linha não combina com a posição (por exemplo, a pessoa usou uma ordem
  alternativa de um sistema), o adversário joga a linha principal em vez de travar.
- No Desafio, o número sorteado (0 a menos de 1) é dividido em fatias iguais, uma por galho. Se a fonte devolver
  exatamente 1, escolhe o último galho, para nunca estourar a lista.
- Num teste, um sorteio de valor fixo repetia a mesma escolha em todas as bifurcações e nunca combinava "principal
  numa, variação na outra". Troquei por um gerador simples com semente fixa (60 partidas, sempre o mesmo resultado).
- `playOpponentMove` (F15) não mudou; a escolha nova só decide qual nó passar a ele.
- Nenhuma dependência nova. Sem interface, então sem captura de tela.
**Problemas e pendências:** o motor ainda não guarda a "etapa" da lição (Assistir, Praticar…) nem decide quando uma
variação começa; isso é da camada de interface. Um comando de shell com texto longo falhou por aspas no meio do
turno; nada foi alterado por ele e refiz com as ferramentas de edição.
**Próximo turno:** a próxima funcionalidade com `passes: false` em `features.json` (F17).

## Turno 2026-11-15 23:00 · [F17] Layout da tela de lição
**Status:** concluída
**O que fiz:** A tela da Lição (`src/screens/LessonScreen.tsx`) agora tem o layout da SPEC 10.2. No desktop, o tabuleiro
fica à esquerda (7 das 12 colunas do grid) e o painel à direita (5 colunas); no celular, o tabuleiro vem em cima e o painel
embaixo. O painel tem o indicador das 6 etapas (a atual em negrito e sublinhada, para não depender só de cor), o texto da
etapa, a lista de lances e o botão "Continuar" na cor de destaque. O link "Voltar à trilha" fica no topo. Os estilos estão em
`src/index.css`, só com tokens. Teste novo: `e2e/licao-layout.spec.ts` (desktop e celular): tabuleiro e painel aparecem, sem
rolagem horizontal, painel à direita no desktop e abaixo no celular. Capturas olhadas: `docs/capturas/f17-desktop.png` e
`f17-celular.png`.
**Decisões:**
- O conteúdo ainda é de mentira: o tabuleiro mostra a posição inicial (só para olhar), o texto é "O texto de cada etapa
  aparece aqui" e o botão "Continuar" ainda não faz nada. Cada etapa de verdade vem em F18 em diante. Mantive o título
  "Lição" e o texto "Abertura: <id>" para os testes das rotas continuarem valendo sem mudança.
- O indicador de etapas é uma lista numerada dentro de um `nav`, com `aria-current="step"` na etapa atual. Ainda não é clicável
  (a SPEC pede isso mais adiante, quando houver etapas para voltar).
- Criei a classe global `.button-primary` (botão de ação principal, sempre vermelho de destaque), que as próximas telas reaproveitam.
- Nenhuma dependência nova.
**Problemas e pendências:**
- O tabuleiro tem largura máxima de 640 px (classe `.board`); no desktop ele fica um pouco menor que as 7 colunas inteiras.
  Pode valer revisar quando a lista de lances e o texto de cada etapa estiverem no painel.
- Subi o servidor de desenvolvimento em segundo plano para tirar as capturas; pode ter ficado rodando na porta 5173.
**Próximo turno:** F18 · Etapa Conhecer (nome, cor, nível, ideia e ideias-chave da Italiana, tabuleiro estático). Vai precisar
carregar a abertura pelo `:id` (por exemplo com `import.meta.glob` em `src/content/openings/`) e mostrar "não encontrada" para
um id que não existe.

## Turno 2026-11-15 23:15 · [F18] Etapa Conhecer
**Status:** concluída
**O que fiz:** A tela da Lição agora abre a abertura de verdade pelo endereço (`/abertura/italiana`) e mostra a etapa
**Conhecer**: nome, cor ("Você joga de"), nível, a ideia, as ideias-chave e a lista de lances da linha principal em notação
portuguesa. O tabuleiro fica parado na posição do fim da linha principal (com as pretas embaixo nas aberturas de pretas) e
não aceita lances. Se o `:id` não existe (por exemplo `/abertura/xyz`), aparece a Página não encontrada. Para isso criei um
catálogo (`src/content/openings/index.ts`, que junta sozinho todos os arquivos da pasta) e `src/chess/openingPosition.ts` (posição
característica em FEN e os nomes em português de níveis e cores), com testes de unidade. Teste novo em `e2e/licao-conhecer.spec.ts`
(desktop e celular). Capturas olhadas: `docs/capturas/f18-desktop.png` e `f18-celular.png`.
**Decisões:**
- A posição característica é sempre o fim da linha principal; não criei campo novo no conteúdo (a SPEC só pede isso se não houver
  outra definida, e hoje não há).
- Mantive o título "Lição" e o texto "Abertura: <nome>" no topo. O texto agora mostra o nome da abertura em vez do id, então
  atualizei o teste de unidade de `src/App.test.tsx` que esperava o id (o teste e2e de rotas continuou igual e passou). Aproveitei
  para acrescentar nele um caso de id inexistente e uma limpeza da tela entre testes (`afterEach(cleanup)`).
- A lista de lances da etapa Conhecer já mostra a linha principal inteira, porque o tabuleiro está no fim dela.
- O botão "Continuar" continua sem ação: a navegação entre etapas começa na F19 (Assistir).
- Nenhuma dependência nova.
**Problemas e pendências:**
- O teste "não aceita lances" confere que não há botões/casas focáveis e que clicar não seleciona nada; o tabuleiro só para olhar
  não tem casas com nome acessível (só o modo interativo tem), então os testes localizam casas por `data-square`, da biblioteca.
- O servidor de desenvolvimento pode ter ficado rodando na porta 5173 (usado pelo Playwright).
**Próximo turno:** F19 · Etapa Assistir. Vai precisar guardar a etapa atual no estado da tela (hoje `stageIndex` é fixo em 0) e
fazer o "Continuar" da etapa Conhecer levar a ela.

## Turno 2026-11-15 23:30 · [F19] Etapa Assistir
**Status:** concluída
**O que fiz:** O "Continuar" da etapa Conhecer agora leva à etapa **Assistir**. Nela a linha principal da abertura é mostrada lance
a lance: "Próximo" e "Anterior" avançam e voltam, o tabuleiro acompanha (com o último lance contornado), o texto mostra a narração
(o porquê do lance) e a lista de lances em notação portuguesa cresce junto, com o lance atual em negrito e sublinhado. A lógica
(posição, último lance e narração para um dado passo) ficou em `src/chess/watchLine.ts`, com testes de unidade. Teste novo em
`e2e/licao-assistir.spec.ts` (desktop e celular): avançar três lances mostra a narração do terceiro e `1. e4 e5 2. Cf3`; "Anterior"
volta posição e narração; o "Próximo" para no último lance. Capturas olhadas: `docs/capturas/f19-desktop.png` e `f19-celular.png`.
**Decisões:**
- **Lances do adversário não têm explicação no conteúdo** (só os da pessoa têm). Para esses, a narração é uma frase simples:
  "As pretas respondem com e5." (ou "As brancas…" nas aberturas de pretas). Não inventei explicações novas, porque isso é conteúdo
  que precisa de revisão humana.
- A lista de lances da etapa Assistir mostra **só os lances já vistos** (não a linha inteira), para destacar o atual.
- Os botões "Anterior" e "Próximo" ficam desabilitados nas pontas. Criei a classe global `.button-secondary` (contorno neutro): o
  vermelho continua reservado à ação principal ("Continuar").
- O "Continuar" agora avança qualquer etapa (até a última), mas as etapas depois de Assistir mostram só um aviso de que ainda não
  existem. Navegar clicando no indicador de etapas e "Reiniciar a linha" ficam para a F24.
- Ao passar de etapa, o passo do Assistir não é zerado; a F24 decide como reiniciar.
- Nenhuma dependência nova.
**Problemas e pendências:** o Assistir ainda não destaca a bifurcação das variações (isso é da etapa Variações, F22). Subi o servidor
de desenvolvimento em segundo plano para as capturas; pode ter ficado rodando na porta 5173.
**Próximo turno:** F20 · Etapa Praticar com guia. Use `Board` com `playerColor`, `guide` e `onMove`, e o motor da lição
(`playUserMove`, `playOpponentTurn`, `getGuide`) de `src/chess/lessonEngine.ts`; o adversário responde após cerca de 400 ms.

## Turno 2026-11-15 23:45 · [F20] Etapa Praticar com guia
**Status:** concluída
**O que fiz:** O "Continuar" da etapa Assistir agora leva à etapa **Praticar com guia**. A pessoa joga a linha principal pelo
tabuleiro (clique, arrastar ou teclado), com o guia da F13 mostrando a peça (destaque) e o destino (seta). Depois de um lance
correto aparece "✓ Lance correto." com a explicação, e o adversário responde sozinho depois de 400 ms. A lista de lances cresce
junto. No fim da linha a seta some e o "Continuar" é liberado. Toda a lógica vem do motor da lição (F15/F16: `createLesson`,
`playUserMove`, `playOpponentTurn`, `getGuide`); o que fiz foi ligá-lo à tela em `src/screens/LessonScreen.tsx`. Teste novo:
`e2e/licao-praticar-guia.spec.ts` (desktop e celular), que joga a Italiana inteira por clique seguindo o guia, confere o adversário
respondendo sozinho e confere o caminho de lance fora do roteiro + "Voltar". Capturas olhadas: `docs/capturas/f20-desktop.png` e `f20-celular.png`.
**Decisões:**
- Durante a prática, "Continuar" fica desabilitado até a linha acabar (o indicador de etapas ainda não é clicável, então não dá para pular).
- Mesmo com guia, a pessoa pode fazer um lance legal fora da linha. Para não travar, já tratei: o lance fica no tabuleiro, aparece
  a mensagem do motor (dica ou erro comum) e o botão principal vira "Voltar", que desfaz. O ícone de erro, o "Ver lance" e os testes
  desse fluxo são da F21; aqui só o mínimo para não travar (um teste cobre).
- O adversário responde sempre pela linha principal (modo `path`). Variações e acaso entram nas etapas Variações e Desafio.
- Ao entrar na etapa, a linha recomeça do zero. O temporizador de 400 ms é cancelado se a pessoa sair da etapa.
- Não criei teste e2e para abertura de pretas (só há a Italiana, de brancas). A abertura automática do adversário já nasce
  do mesmo código (`playOpponentTurn` quando é a vez dele), mas não foi exercitada no navegador.
- Nenhuma dependência nova.
**Problemas e pendências:** o teste da linha inteira leva ~10 s por causa dos 8 atrasos de 400 ms (é o esperado). O servidor de
desenvolvimento ficou rodando em segundo plano (porta 5173) para as capturas.
**Próximo turno:** F21 · Etapa Praticar sozinho. Reaproveite o estado `practice` da tela: falta passar `guide={null}`, o botão
"Ver lance" (use `getGuide`) e o ícone de erro na mensagem fora do roteiro (sem vermelho).

## Turno 2026-11-16 00:00 · [F21] Etapa Praticar sozinho
**Status:** concluída
**O que fiz:** O "Continuar" da etapa Praticar com guia agora leva à etapa **Praticar sozinho**: a mesma linha da Italiana, mas sem
peça marcada nem seta. Reaproveitei o estado da prática da F20 (a tela só passou a atender duas etapas). Um lance legal fora do
roteiro fica no tabuleiro e mostra uma mensagem com um **ícone discreto de erro** (um círculo com "!", na cor do texto), o texto
"Lance fora do roteiro." e a dica (ou a explicação do erro comum, quando existe); o botão principal vira "Voltar", em vermelho de
destaque, e desfaz o lance. Novo botão **"Ver lance"**: mostra peça e seta só para o lance atual; quando a posição muda, o guia
some sozinho. Teste novo: `e2e/licao-praticar-sozinho.spec.ts` (desktop e celular), cobrindo os 4 passos da funcionalidade, e um
caso extra de erro comum (`a4`). Capturas olhadas: `docs/capturas/f21-*.png` (fora do roteiro e "Ver lance", 1440 px e 375 px).
**Decisões:**
- O "Ver lance" guarda a **posição (FEN)** em que foi pedido (`peekFen`) e só mostra o guia enquanto a posição for essa. Assim não
  precisa de código para "apagar" o guia depois do lance, do mesmo jeito que a seleção da F11.
- O botão "Ver lance" só existe na etapa sem guia, e some enquanto há um lance fora do roteiro (aí o botão é o "Voltar").
- A mensagem fora do roteiro usa fundo cinza claro e uma barra cinza escura na lateral, sem vermelho (SPEC 13, item 1). O ícone é um
  SVG pequeno desenhado na própria tela, sem biblioteca de ícones. Também passei a mostrar o texto "Lance fora do roteiro." antes da
  mensagem do motor, para o aviso não depender só do ícone. Isso vale também na etapa com guia, que usa o mesmo código.
- Nenhuma dependência nova.
**Problemas e pendências:**
- Os testes de prática ficam lentos (~10 s cada), porque cada um joga a linha inteira com guia para chegar à etapa (8 atrasos de 400 ms).
  Quando a F24 permitir clicar nas etapas, dá para encurtar o caminho.
- Ainda não existe "Reiniciar a linha" nem indicador clicável (F24). Em Praticar sozinho, o "Continuar" só abre no fim da linha.
- Subi o servidor de desenvolvimento para as capturas e o encerrei no fim do turno.
**Próximo turno:** F22 · Etapa Variações. Vai precisar de `getVariations` (F05) e do modo `path` com `variação.line` (F16) para o
adversário seguir o desvio; a prática com guia e sozinho já aceita `guidedStage`/`soloStage`, mas hoje começa sempre da linha principal.

## Turno 2026-11-16 00:20 · [F22] Etapa Variações
**Status:** concluída
**O que fiz:** O "Continuar" da etapa Praticar sozinho agora leva à etapa **Variações**. Para cada variação da abertura
a pessoa passa por três passos: **Assistir** (começa logo antes do desvio, com a pergunta "E se as pretas jogarem 5... a6?"
e a continuação lance a lance), **Praticar com guia** e **Praticar sozinho**. As práticas reaproveitam o código das etapas
anteriores; a diferença é que o adversário segue a linha da variação (modo `path` com `variação.line`, da F16) em vez da linha
principal. Ao terminar a última variação, o "Continuar" leva ao Desafio. O indicador de etapas mostra "Variações (1 de 2)" e o
painel diz o nome da variação e o passo ("Variação 1 de 2: Pretas jogam a6 antes do roque · Praticar com guia"). A ordem dos
passos e os textos ficaram em `src/chess/variationStage.ts` (com testes de unidade); a ligação com a tela, em `LessonScreen.tsx`.
Teste novo em `e2e/licao-variacoes.spec.ts` (desktop e celular) completa a primeira variação nos três passos e confere o
indicador e a chegada à segunda variação. Capturas olhadas: `docs/capturas/f22-*.png` (1440 px e 375 px).
**Decisões:**
- **Ordem das variações:** segui a ordem de `getVariations` (F05), que percorre a árvore em profundidade. Na Italiana isso faz a
  **primeira** variação ser `5...a6` (mais fundo na linha) e a segunda `4...d6` (desvio mais cedo). Não mudei `getVariations`
  para não mexer em algo já testado e usado pelo gerador do `docs/ABERTURAS.md`. Se a pessoa dona preferir a ordem "desvio mais
  cedo primeiro", é um ajuste pequeno (ordenar por `path.length`), mas mudaria também o documento gerado.
- **A prática da variação recomeça do zero** (posição inicial), e a pessoa joga de novo os lances que antecedem o desvio. Foi o
  mais simples e funciona com o motor sem mudanças; também serve de revisão da linha principal.
- No passo Assistir da variação, o texto do momento do desvio diz "Até aqui o jogo é igual ao da linha principal" em vez da
  narração do lance anterior, para a pergunta ficar em destaque. Depois do "Próximo", a narração do adversário é a frase simples da F19.
- Se um conteúdo não tiver variações (o validador não deixa), a etapa é pulada em vez de travar.
- Nenhuma dependência nova.
**Problemas e pendências:**
- O teste e2e leva ~33 s (joga a linha principal duas vezes, com os atrasos de 400 ms, para chegar à etapa). Quando a F24 permitir
  clicar nas etapas, dá para encurtar.
- Uma primeira execução do teste falhou uma vez no desktop, num momento em que o servidor tinha acabado de subir; nas execuções
  seguintes (e no `npm run verificar`) passou sempre. Fico de olho se voltar a acontecer.
- Os textos de explicação dos lances do adversário continuam sendo a frase genérica (não há explicação no conteúdo para eles).
- O servidor de desenvolvimento foi encerrado no fim do turno.
**Próximo turno:** F23 · Etapa Desafio. Reaproveite `startPractice`, a prática sem guia e `playOpponentTurn` com `{ kind: 'challenge', random }`
(F16); o acaso precisa poder ser controlado por um parâmetro de teste (por exemplo, na URL, só no servidor de desenvolvimento).

## Turno 2026-11-16 00:40 · [F23] Etapa Desafio
**Status:** concluída
**O que fiz:** O "Continuar" da última variação agora leva à etapa **Desafio**: uma partida do começo ao fim da linha, sem
guia, em que o adversário **sorteia** entre os galhos ensinados (linha principal ou variação) a cada resposta. Reaproveitei a
prática sem guia da F21 (lance fora do roteiro com ícone e "Voltar", "Ver lance"); a única diferença é que o adversário usa o
modo `challenge` do motor (F16). No fim da partida o botão vira **"Concluir"** e leva a `/abertura/:id/conclusao`. Criei uma
versão mínima dessa tela (`src/screens/ConclusionScreen.tsx`, só título e link de volta) para o Desafio ter para onde ir; ela é
completada na F27. Testes novos em `e2e/licao-desafio.spec.ts` (desktop e celular): Desafio com a linha principal sorteada até a
conclusão, Desafio em que o adversário desvia para a variação `4...d6`, e lance fora do roteiro + "Ver lance" no Desafio. Mais um
teste de unidade em `src/chess/testRandom.test.ts`. Capturas olhadas: `docs/capturas/f23-*.png` (1440 px e 375 px).
**Decisões:**
- **Acaso controlável por parâmetro de teste, só no desenvolvimento:** `?acaso=0` escolhe sempre o primeiro galho (linha
  principal) e `?acaso=0.99` o último (`src/chess/testRandom.ts`). Em `import.meta.env.DEV` o parâmetro vale; no app publicado
  ele é ignorado e o sorteio é o `Math.random` de verdade.
- **`?etapa=desafio` (também só no desenvolvimento)** abre a lição direto no Desafio. Sem isso, cada teste teria de jogar as etapas
  anteriores (mais de 1 minuto). Quando a F24 permitir clicar nas etapas, dá para trocar isso por cliques, se quiserem.
- O Desafio recomeça do zero ao entrar na etapa, como as práticas.
- "Concluir" só abre quando a linha acaba. O progresso (marcar a abertura como concluída) ainda **não** é salvo: é a F28.
- Nenhuma dependência nova.
**Problemas e pendências:**
- O caminho **Variações → Desafio** (clicar em Continuar na última variação) não tem teste e2e fixo, porque exigiria jogar tudo
  (~35 s por tela). Conferi uma vez à mão com um script descartável do Playwright (passou) e apaguei o script.
- No Desafio com uma variação, a lista de lances e a lógica seguem a árvore, mas a mensagem de "fim da linha" é a mesma da prática.
- O servidor de desenvolvimento foi encerrado pelo próprio Playwright no fim de cada execução.
**Próximo turno:** F24 · Navegação entre etapas (indicador clicável, etapas concluídas e "Reiniciar a linha"). Hoje o indicador é
só uma lista; `stageIndex` e o estado de prática ficam em `LessonScreen.tsx`.

## Turno 2026-11-16 01:00 · [F24] Navegação entre etapas
**Status:** concluída
**O que fiz:** O indicador de etapas agora é clicável. A etapa atual aparece em negrito e sublinhada; as etapas já
alcançadas viram botões (com "✓" e o texto escondido "(concluída)" para leitores de tela, quando a pessoa já passou
por elas); as que ainda não foram alcançadas ficam desabilitadas e apagadas. Clicar numa etapa já alcançada abre essa etapa
desde o começo. Também criei o botão **"Reiniciar a linha"**, que recomeça a etapa atual: no Assistir volta ao primeiro
passo (ou ao desvio, nas variações) e nas práticas e no Desafio a partida volta à posição inicial. Ele não aparece na
etapa Conhecer, que não tem linha para reiniciar. Para isso, juntei a entrada em etapa numa função só (`enterStage`, em
`LessonScreen.tsx`), usada tanto pelo "Continuar" quanto pelos cliques. Testes novos em `e2e/licao-etapas.spec.ts`
(desktop e celular), cobrindo os 3 passos da funcionalidade e mais dois casos. Capturas olhadas: `docs/capturas/f24-desktop.png` e `f24-celular.png`.
**Decisões:**
- "Etapa alcançada" = a mais avançada em que a pessoa já esteve (`reachedStage`). Ela só cresce; voltar para uma etapa
  anterior não "desconquista" as seguintes. O progresso salvo no navegador (F28) é outro assunto e ainda não existe.
- Clicar em **Variações** no indicador começa pela primeira variação, no passo Assistir. Voltar para uma etapa de prática
  recomeça a linha do zero (como já acontecia ao entrar nelas com "Continuar").
- Ao entrar no Assistir, o passo volta a 0 (antes não zerava; a F19 deixou essa decisão para esta funcionalidade).
- Com `?etapa=desafio` (só no desenvolvimento), todas as etapas já contam como alcançadas.
- O indicador mantém `aria-current="step"` no item da etapa atual, então os testes antigos continuaram valendo sem mudança.
- Nenhuma dependência nova.
**Problemas e pendências:**
- Logo depois de clicar numa etapa vindo da prática, o tabuleiro leva uns 200 ms animando as peças de volta; uma captura
  tirada na hora parece "errada", mas é só a animação (confirmei com uma segunda captura, esperando).
- Os testes antigos de Variações e Desafio ainda jogam tudo do zero. Agora dá para encurtar, mas só voltando a etapas já
  vistas, não pulando para frente; deixei como está para não mexer em testes que passam.
- Subi o servidor de desenvolvimento para as capturas e o encerrei no fim do turno.
**Próximo turno:** F25 · Aberturas de pretas (depende do conteúdo da Escandinava, F26). Como a F25 depende da F26, pode
valer fazer a F26 primeiro e registrar o motivo.

## Turno 2026-11-16 01:20 · [F26] Conteúdo: Defesa Escandinava
**Status:** concluída
**O que fiz:** Criei `src/content/openings/escandinava.ts`, a segunda abertura e a primeira de pretas. A linha principal é
`1.e4 d5 2.exd5 Dxd5 3.Cc3 Da5 4.d4 Cf6 5.Cf3 Bf5 6.Bc4 e6 7.Bd2 c6 8.De2` (7 lances da pessoa e 8 do adversário, contando o
`1.e4` assumido, que é o primeiro nó da árvore). Cada lance da pessoa tem explicação e dica, e há erros comuns em 6 deles
(`f5`, `Cc6`, `Dxg2`, `Dxa2`, `Bxc2`...). O validador (F06) pegou o arquivo sozinho e passou, e o `docs/ABERTURAS.md` foi
regenerado com a nova abertura.
**Decisões:**
- **Pulei a F25 (Aberturas de pretas) e fiz a F26 antes**, porque o primeiro passo da F25 diz "depende do conteúdo da Escandinava (F26)".
  A F25 fica para o próximo turno.
- **Nome na base do Lichess: `Scandinavian Defense`** (a entrada `1. e4 d5`), e não uma entrada mais específica como "Main Line".
  Motivo: as variações desviam das brancas no lance 3 (`3.Cf3`), antes de a entrada "Main Line" terminar (`3...Da5`), e o
  validador exige que **toda** linha comece com uma entrada da base. Com o nome mais geral, tudo confere e continua sendo uma entrada real.
- **Variação 1, "Brancas jogam Cf3 em vez de Cc3":** `3.Cf3 Cf6 4.d4 Bg4 5.Be2 e6 6.O-O`. Como a dama não é atacada, a pessoa
  desenvolve o cavalo e depois o bispo.
- **Variação 2, "Brancas jogam Bc4 antes do cavalo":** `5.Bc4 Bf5 6.Cf3 e6 7.Bd2`. É a mesma posição da linha principal com a ordem
  dos lances das brancas trocada; o texto diz isso. Escolhi essa por ser a que tenho mais certeza de que está correta, sem
  consultar um livro de aberturas.
- Mantive o mesmo estilo da Italiana: peças ditas por extenso nos textos, termos como "centro", "desenvolver" e "roque" explicados na primeira vez.
- Nenhuma dependência nova. Sem interface, então sem captura de tela.
**Problemas e pendências:**
- Os testes garantem lances legais e a ligação com a base do Lichess, mas **não** garantem que as explicações ensinam bem nem que as
  continuações depois do trecho da base (do lance 4 em diante) são as mais usadas na teoria. Precisa de revisão humana a partir do
  `docs/ABERTURAS.md` (SPEC, seção 15). Vale olhar principalmente a variação 1 (`4...Bg4 5.Be2`) e a explicação do `Da5`.
- A segunda variação é uma troca de ordem (chega na mesma posição); se quiserem uma variação com ideia diferente, é só trocá-la.
- O arquivo não segue ordem de trilha no `docs/ABERTURAS.md` (a Escandinava aparece antes da Italiana por ordem alfabética dos
  arquivos). Isso já estava anotado na F09 e se resolve quando houver um catálogo com a ordem oficial.
**Próximo turno:** F25 · Aberturas de pretas (agora desbloqueada). Hoje a etapa Praticar do `LessonScreen.tsx` nunca foi exercitada
com abertura de pretas no navegador: confira que o tabuleiro fica invertido em todas as etapas e que o `1.e4` já aparece jogado.

## Turno 2026-11-16 01:40 · [F25] Aberturas de pretas
**Status:** concluída
**O que fiz:** Conferi que as aberturas de pretas funcionam na lição, usando a Defesa Escandinava (F26). O código já estava
certo: o tabuleiro vem com as pretas embaixo em todas as etapas (o `Board` recebe `opening.color` como orientação) e, na
prática, como a árvore começa com o `1.e4` das brancas, o motor da lição trata esse lance como "vez do adversário" e o app o
joga sozinho depois de 400 ms. Por isso **não precisei mudar nenhum código do app**; o trabalho foi escrever o teste que prova
isso: `e2e/licao-pretas.spec.ts` (desktop e celular). Ele confere pretas embaixo em Conhecer, Assistir, Praticar com guia e
Praticar sozinho, o `1. e4` já jogado (peão em e4, e2 vazia), o guia no peão de d7 com a seta, e que jogar `1...d5` é aceito e as
brancas respondem `2. exd5`. Capturas olhadas: `docs/capturas/f25-guia-desktop.png` e `f25-guia-celular.png`.
**Decisões:**
- Para saber que as pretas estão embaixo, o teste confere duas coisas: o nome acessível do tabuleiro ("pretas embaixo") e a
  posição na tela (a casa e8 fica abaixo da e1). Assim o teste não depende só do texto.
- Para a etapa Praticar sozinho, usei `?etapa=desafio` (só no desenvolvimento, da F23) e cliquei em "Praticar sozinho" no
  indicador de etapas (F24), em vez de jogar tudo de novo.
- Não testei Variações nem Desafio com a Escandinava no navegador; usam o mesmo código de prática, já coberto pelos testes da Italiana.
- Nenhuma dependência nova.
**Problemas e pendências:**
- A lista de lances usa `formatMoveList(..., 'white')`, o que está certo porque a árvore sempre começa no lance das brancas
  (inclusive o assumido). Se um dia houver conteúdo cuja árvore comece em outro ponto, isso precisa ser revisto.
- O nome da lição ainda aparece como "Lição / Abertura: Defesa Escandinava"; o texto final de cabeçalho é assunto de polimento.
- Subi o servidor de desenvolvimento para as capturas e o encerrei no fim do turno.
**Próximo turno:** F27 · Tela de conclusão (hoje `ConclusionScreen.tsx` é só um esqueleto da F23). Vai precisar da "próxima abertura
da trilha": hoje só há 2 aberturas (Italiana e Escandinava, ambas nível 1) e a ordem oficial da trilha ainda não existe num catálogo.

## Turno 2026-11-16 02:00 · [F27] Tela de conclusão
**Status:** concluída
**O que fiz:** Completei a tela de conclusão (`src/screens/ConclusionScreen.tsx`): tabuleiro só para olhar na posição final da linha
principal (com o lado da pessoa embaixo), a ideia da abertura, a linha principal em notação portuguesa e os botões **"Próxima
abertura"** (vermelho, leva à próxima da trilha) e **"Voltar à trilha"**. Para saber qual é a "próxima da trilha", criei
`src/content/trail.ts` com a ordem oficial da SPEC (seção 5) e a função `getNextOpening`. Testes novos: `src/content/trail.test.ts`
(unidade) e `e2e/conclusao.spec.ts` (desktop e celular), que joga o Desafio da Italiana inteiro, confere a linha principal, a posição
final e clica em "Próxima abertura". Capturas olhadas: `docs/capturas/f27-desktop.png` e `f27-celular.png`.
**Decisões:**
- **A ordem da trilha fica em `TRAIL_ORDER`** (ids das 8 aberturas, na ordem da tabela da SPEC). Os ids das aberturas que ainda não existem
  (`londres`, `espanhola`, `caro-kann`, `gambito-da-dama-recusado`, `gambito-da-dama`, `siciliana`) são um palpite: quem criar o
  conteúdo precisa usar o mesmo id ou ajustar a lista. Um teste de unidade falha se uma abertura do catálogo não estiver na lista.
  Aberturas sem conteúdo são puladas. Hoje a próxima depois da Italiana é a Escandinava.
- Na última abertura da trilha com conteúdo, o botão "Próxima abertura" não aparece (só "Voltar à trilha").
- Mostrei a **ideia completa** (até 3 frases, como está no conteúdo) e não uma frase só, para não inventar um resumo novo.
- A "próxima" é sempre a seguinte na ordem da trilha, não a próxima ainda não concluída; o progresso (F28) ainda não existe.
- Nenhuma dependência nova.
**Problemas e pendências:**
- O teste `licao-variacoes` no celular falhou uma vez na primeira rodada do `npm run verificar` (e passou sozinho e na rodada seguinte).
  É o mesmo teste que a F22 já tinha anotado como instável: ele é longo (~33 s) e fica sensível quando a máquina está carregada.
  Vale encurtá-lo (voltando a etapas já vistas, agora que a F24 existe) num turno de consertos.
- A tela de conclusão pode ser aberta digitando o endereço, sem ter concluído o Desafio; só o progresso salvo (F28) permitirá controlar isso, se quiserem.
**Próximo turno:** F28 · Progresso no navegador. Pasta `src/progress/` ainda não existe; a lição guarda `reachedStage` em `LessonScreen.tsx`.

## Turno 2026-11-16 02:20 · [F28] Progresso no navegador
**Status:** concluída
**O que fiz:** Criei `src/progress/progress.ts`, que salva no `localStorage` (a memória do navegador) quais etapas de cada
abertura foram concluídas e quais aberturas foram concluídas. A lição agora lê esse progresso ao abrir e começa na primeira etapa
não concluída (por exemplo, depois de Conhecer e Assistir, abre em Praticar com guia, com as etapas anteriores marcadas "✓" e
clicáveis). Uma etapa é gravada como concluída quando a pessoa clica em "Continuar" nela; concluir o Desafio ("Concluir") marca a
abertura inteira como concluída. Se o armazenamento der erro, estiver vazio ou tiver dados estragados, o app funciona como numa
primeira visita (sem mensagens de erro). Testes: `src/progress/progress.test.ts` (unidade, inclui um armazenamento que lança erro)
e `e2e/progresso.spec.ts` (navegador, desktop e celular, incluindo o caso do passo 2 da funcionalidade). Capturas olhadas:
`docs/capturas/f28-retomada-desktop.png` e `f28-retomada-celular.png`.
**Decisões:**
- Formato salvo (chave `aprendrez:progresso`): `{ version: 1, openings: { <id>: { stages: [0,1,...], completed: false } } }`. Dados
  de outra versão ou fora desse formato são ignorados (valem como "sem progresso").
- **Concluir uma etapa = clicar em "Continuar" nela.** Só clicar no indicador de etapas não marca nada. Nas Variações, a etapa só
  conta como concluída quando a última variação termina e a pessoa segue para o Desafio.
- Com a abertura concluída, a lição reabre em **Conhecer** (para rever), mas todas as etapas ficam clicáveis e marcadas como concluídas.
- O parâmetro de desenvolvimento `?etapa=desafio` continua tendo prioridade sobre o progresso salvo.
- O progresso é relido do navegador a cada gravação (e não guardado na tela), para não sobrescrever o que outra aba tenha salvo.
- Já deixei prontas, em `progress.ts`, as funções que a tela inicial vai usar: `getOpeningStatus` (não iniciada / em andamento /
  concluída) e `resetProgress` ("Reiniciar progresso"). Ainda não há interface para elas.
- Nenhuma dependência nova.
**Problemas e pendências:**
- O teste `licao-variacoes` falhou na primeira rodada do `npm run verificar` (desktop e celular): o clique no primeiro lance da
  etapa Praticar sozinho se perdia, porque acontecia logo depois do "Continuar", antes da tela nova aparecer. É a mesma instabilidade
  anotada nas F22 e F27. Não enfraqueci o teste: acrescentei uma espera para a lista de lances mostrar "Nenhum lance ainda." antes
  do primeiro clique (em `playLine`). Depois disso, `npm run verificar` passou inteiro.
- Abrir uma lição ainda sem concluir nenhuma etapa não conta como "em andamento" (o status vem das etapas concluídas). O passo 2 da
  F29 ("em andamento depois de começar a lição") pode pedir que ver "Conhecer" já conte; é uma decisão para aquele turno.
- A tela de conclusão ainda pode ser aberta digitando o endereço, sem ter concluído o Desafio.
- Subi o servidor de desenvolvimento para as capturas e o encerrei no fim do turno.
**Próximo turno:** F29 · Tela inicial com a trilha. Use `TRAIL_ORDER`/`getNextOpening` (`src/content/trail.ts`), o catálogo
(`src/content/openings/index.ts`), `getCharacteristicFen` (mini-tabuleiro com o `Board`) e `getOpeningStatus` (`src/progress/progress.ts`).

## Turno 2026-11-16 02:40 · [F29] Tela inicial com a trilha
**Status:** concluída
**O que fiz:** A tela de Início (`src/screens/HomeScreen.tsx`) agora mostra o nome Aprendrez, a frase da proposta, o indicador geral
("0 de 2 aberturas concluídas") e as aberturas agrupadas por nível ("1 Primeiros passos" etc.), na ordem da trilha. Cada cartão
tem mini-tabuleiro na posição característica (com o lado da pessoa embaixo), nome com link para a lição, cor com ícone e texto
(círculo vazio = brancas, cheio = pretas), status em texto (Não iniciada, Em andamento, Concluída com "✓") e a ideia em uma frase.
Níveis sem aberturas com conteúdo nem aparecem. O status vem do progresso salvo (F28). Testes novos em `e2e/trilha.spec.ts` (desktop
e celular) e em `src/chess/openingPosition.test.ts` (unidade, para o resumo da ideia). Capturas olhadas: `docs/capturas/f29-desktop.png`
e `f29-celular.png`.
**Decisões:**
- **"A ideia em uma frase" = a primeira frase da ideia** do conteúdo (`getIdeaSummary`, em `openingPosition.ts`), para não inventar
  um texto novo que precisaria de revisão humana.
- **"Em andamento" continua valendo a regra da F28:** a pessoa precisa ter concluído pelo menos uma etapa (clicado "Continuar" em
  "Conhecer"). Só abrir a lição não conta. O teste faz exatamente isso. Se preferirem que abrir já conte, é uma mudança pequena em F28.
- O indicador geral conta só as aberturas **que têm conteúdo** ("0 de 2"), e não as 8 da SPEC, para não parecer que falta algo que
  o cartão não mostra. Quando as 8 existirem, vira "x de 8" sozinho.
- O `Board` ganhou a prop `showNotation` (padrão ligado); os mini-tabuleiros desligam as letras e números das bordas, que ficavam
  ilegíveis e poluídos em tamanho pequeno.
- Grade de cartões: 1 coluna no celular, 2 a partir de 768 px e 3 a partir de 1100 px. Só tokens de cor e espaçamento.
- Os botões "Continuar de onde parei", filtro por cor e "Reiniciar progresso" **não** entram aqui: são F31, F30 e F32.
- Nenhuma dependência nova.
**Problemas e pendências:**
- O mini-tabuleiro é um grupo com nome acessível ("Tabuleiro de xadrez…"), repetido em cada cartão; para leitor de tela pode ser
  ruído. A F40 (axe) vai dizer se há violação; se quiserem, dá para esconder o mini-tabuleiro de leitores de tela (o link já diz o nome).
- Só o nome da abertura é link; o cartão inteiro não é clicável.
- As capturas foram tiradas com um teste temporário, apagado em seguida (a F43 fará o script oficial de capturas).
**Próximo turno:** F30 · Filtro por cor (Todas · Brancas · Pretas). Estado do filtro na `HomeScreen`; com o filtro "Pretas" só a Escandinava
aparece hoje, e níveis sem aberturas visíveis devem sumir (já é assim). Considere o indicador geral: ele deve continuar contando todas.

## Turno 2026-11-16 03:00 · [F30] Filtro por cor
**Status:** concluída
**O que fiz:** A tela de Início ganhou o filtro **Todas · Brancas · Pretas** (SPEC 10.1), logo acima dos níveis. É um grupo de
botões (`role="group"` com o nome "Filtrar por cor"); cada botão anuncia se está escolhido com `aria-pressed`, e o escolhido também
fica com fundo escuro, negrito e um "✓", para não depender só de cor. O estado do filtro vive na `HomeScreen`. Com "Pretas" só a Defesa
Escandinava aparece; com "Brancas", só a Italiana; "Todas" mostra tudo. Níveis sem nenhuma abertura visível somem. Testes novos em
`e2e/trilha.spec.ts` (desktop e celular): o passo da funcionalidade (Pretas, Brancas e volta a Todas, conferindo `aria-pressed`) e um
caso extra com teclado (Enter) que confere que o indicador geral continua "0 de 2". Capturas olhadas: `docs/capturas/f30-desktop.png` e `f30-celular.png`.
**Decisões:**
- **O indicador geral de progresso ignora o filtro** e continua contando todas as aberturas ("0 de 2"), como sugerido na F29.
- Escolhi **grupo de botões** (e não abas), por ser o mais simples e porque a SPEC aceita os dois.
- O filtro **não é salvo** (volta para "Todas" ao recarregar): a SPEC só manda salvar etapas e aberturas concluídas.
- Se o filtro esvaziar a lista (hoje não acontece, porque existe conteúdo das duas cores), a tela mostraria só o filtro; quando as 8 aberturas
  existirem isso não deve ocorrer.
- Classes novas em `src/index.css` (`.trail-filter`, `.trail-filter-button`), só com tokens. Nenhuma dependência nova.
**Problemas e pendências:** o espaço entre o indicador de progresso e o filtro ficou um pouco grande (vem da margem do cabeçalho); é assunto
de polimento visual. O teste temporário usado para as capturas foi apagado (a F43 fará o script oficial).
**Próximo turno:** F31 · Continuar de onde parei (botão principal; usa `getNextOpening`/`TRAIL_ORDER` e o progresso salvo, e precisa levar à etapa
certa: a lição já abre na primeira etapa não concluída, F28).

## Turno 2026-11-16 03:20 · [F31] Continuar de onde parei
**Status:** concluída
**O que fiz:** A tela de Início ganhou o botão principal, em vermelho de destaque, logo abaixo do indicador de progresso. Na primeira
visita ele diz **"Começar"** e leva à primeira abertura da trilha (Italiana). Depois que há progresso, diz **"Continuar de onde parei"** e
leva à primeira abertura não concluída na ordem da trilha; a lição já abre sozinha na primeira etapa não concluída (F28), então não precisei
calcular a etapa. A decisão ficou numa função pura, `src/progress/continueTarget.ts` (`getContinueTarget`), com testes de unidade em
`continueTarget.test.ts`. A interface está em `HomeScreen.tsx`. Testes novos em `e2e/trilha.spec.ts` (desktop e celular): os 2 passos da
funcionalidade, mais "abertura em andamento volta a ela na etapa certa" e "tudo concluído". Capturas olhadas: `docs/capturas/f31-desktop.png` e `f31-celular.png`.
**Decisões:**
- **"Primeira visita" = nenhuma abertura da trilha iniciada nem concluída.** Qualquer progresso troca o texto para "Continuar de onde parei".
- **Uma abertura em andamento vem antes das seguintes**, e as concluídas são puladas, mesmo no meio da trilha (a primeira não concluída na ordem).
- **Com todas concluídas** a SPEC não diz nada; escolhi o botão **"Rever desde o início"**, que leva à primeira abertura da trilha. É o mais simples e não deixa a tela sem ação.
- O botão é um **link** (`<a>`) com a aparência de `.button-primary`, porque leva a outra tela. Nos testes ele é achado por `getByRole('link')`.
- Classe nova `.trail-continue` em `src/index.css`, só com tokens. Nenhuma dependência nova.
**Problemas e pendências:** o espaço vertical do cabeçalho ficou um pouco grande (indicador, botão e filtro), assunto de polimento. O servidor
de desenvolvimento foi iniciado e encerrado pelo próprio Playwright; o teste temporário das capturas foi apagado (a F43 fará o script oficial).
**Próximo turno:** F32 · Reiniciar progresso (usa `resetProgress` de `src/progress/progress.ts`; precisa de confirmação acessível e de atualizar o
estado da `HomeScreen`, que hoje lê o progresso uma vez só, com `useMemo`).

## Turno 2026-11-16 03:40 · [F32] Reiniciar progresso
**Status:** concluída
**O que fiz:** A tela de Início ganhou o botão **"Reiniciar progresso"** (secundário, no pé da trilha). Ao clicar, abre uma janela de
confirmação ("Reiniciar progresso?") com **"Cancelar"** e **"Apagar progresso"**. Cancelar não mexe em nada. Confirmar apaga o progresso do
navegador (`resetProgress`, da F28) e a tela se atualiza na hora: contador volta a "0 de 2", todos os cartões ficam "Não iniciada" e o botão
principal volta a ser "Começar". Para a tela reagir, o progresso passou de `useMemo` para `useState` em `HomeScreen.tsx`. Testes novos em
`e2e/trilha.spec.ts` (desktop e celular): cancelar mantém (inclusive depois de recarregar), confirmar apaga (inclusive o `localStorage`) e o
uso pelo teclado. Capturas olhadas: `docs/capturas/f32-desktop.png` e `f32-celular.png`.
**Decisões:**
- Usei o `<dialog>` nativo do navegador com `showModal()`: ele já prende o foco, fecha com Esc e devolve o foco ao botão que abriu. Não
  precisei de biblioteca. O foco começa em "Cancelar", o lado seguro, porque apagar não tem volta.
- Novo token `--color-overlay` (fundo escurecido atrás da janela) em `tokens.css`, para não escrever cor em componente.
- "Apagar progresso" usa o botão de destaque (vermelho), seguindo a regra de que a ação principal da tela tem sempre essa cor.
- Não há teste de unidade novo: `resetProgress` já era testado na F28 e o resto é interface.
- Nenhuma dependência nova.
**Problemas e pendências:** no teste, `getByText('Concluída')` também casava com "aberturas concluídas" (a busca ignora maiúsculas); usei
`exact: true`. O teste temporário das capturas foi apagado (a F43 fará o script oficial).
**Próximo turno:** F33 · Página não encontrada (a próxima com `passes: false`).

## Turno 2026-11-16 04:00 · [F33] Página não encontrada
**Status:** concluída
**O que fiz:** A Página não encontrada (`src/screens/NotFoundScreen.tsx`) ganhou o visual do resto do app: título grande, texto de apoio em
cinza e o link "Ir para o início" com a aparência do botão principal (vermelho de destaque). Ela aparece para qualquer endereço desconhecido
e também para uma abertura que não existe (`/abertura/xyz`) ou a conclusão dela. Teste novo em `e2e/nao-encontrada.spec.ts` (desktop e celular):
a mensagem aparece e o link leva à tela inicial (passo da funcionalidade), abertura inexistente, uso pelo teclado, sem rolagem horizontal e
texto do link legível ao passar o mouse. Capturas olhadas: `docs/capturas/f33-desktop.png` e `f33-celular.png`.
**Decisões:**
- O link é um `Link` do react-router com a classe `.button-primary` (leva a outra tela, então é link e não botão), como já foi feito na F31.
- **Conserto de um defeito pequeno de estilo:** a regra global `a:hover` pintava de vermelho o texto de qualquer link com a classe
  `.button-primary`, ou seja, vermelho sobre fundo vermelho ao passar o mouse. Acrescentei `a.button-primary:hover` em `src/index.css` para o
  texto continuar claro. Isso também conserta o botão "Começar/Continuar de onde parei" da tela inicial (F31), que tinha o mesmo problema.
- Classes novas `.not-found`, `.not-found-text` e `.not-found-link`, só com tokens. Nenhuma dependência nova.
**Problemas e pendências:**
- Na primeira rodada do `npm run verificar` deste turno, o teste `licao-praticar-sozinho` (celular, "lance legal fora do roteiro") falhou uma vez;
  rodado sozinho passou (10 de 10) e a segunda rodada completa passou inteira. É a mesma instabilidade dos testes longos anotada nas F22, F27 e F28
  (jogam a linha toda com atrasos de 400 ms e sofrem com a máquina carregada). Não enfraqueci nenhum teste. Vale um turno de consertos para
  encurtá-los usando a navegação por etapas (F24).
- Os testes de rotas antigos (`e2e/rotas.spec.ts`) continuam valendo sem mudança.
**Próximo turno:** F34 · Conteúdo: Sistema Londres (o primeiro sistema, com alternativa de ordem aceita e justificativa; regenerar `docs/ABERTURAS.md`).
Lembre que o id da abertura precisa ser `londres`, como está em `TRAIL_ORDER`.

## Turno 2026-11-16 04:20 · [F34] Conteúdo: Sistema Londres
**Status:** concluída
**O que fiz:** Criei `src/content/openings/londres.ts`, a primeira abertura do tipo **sistema** (brancas, nível 1). A linha principal é
`1.d4 d5 2.Cf3 Cf6 3.Bf4 c5 4.e3 Cc6 5.Cbd2 e6 6.c3 Bd6 7.Bg3 O-O 8.Bd3 b6` (8 lances de cada lado). Cada lance das brancas tem explicação e dica,
e há erros comuns em 4 lances (`h3`, `Qd3`, `e3` antes do bispo e `g4`). Há **uma alternativa de ordem aceita**, escrita como mais um galho:
depois de `4...Cc6`, a pessoa pode jogar `5.c3` antes de `5.Cbd2`, porque as duas ordens chegam à mesma posição; a justificativa está na explicação
do lance e aparece em "Alternativas de ordem aceitas" no `docs/ABERTURAS.md` (regenerado). Também há 2 variações do adversário: `3...e6` em vez de
`3...c5` e `4...e6` antes de `4...Cc6` (esta chega à mesma posição da linha principal). O validador (F06) pegou o arquivo sozinho e passou. Teste novo:
`e2e/licao-londres.spec.ts` (desktop e celular), que joga a alternativa `5.c3` na etapa Praticar sozinho até o fim da linha, confere a ordem principal,
que um lance legal fora do conteúdo (`a3`) continua "fora do roteiro", o erro comum de `e3`, e a abertura aparecendo na trilha. Capturas olhadas:
`docs/capturas/f34-*.png` (1440 px e 375 px).
**Decisões:**
- **Nome na base do Lichess: `Queen's Pawn Game: London System`** (a entrada `1.d4 d5 2.Nf3 Nf6 3.Bf4`, que a base tem em várias versões mais longas). Troquei a
  ordem de lances do conteúdo para `1.d4 d5 2.Cf3 Cf6 3.Bf4` por causa disso. Uma primeira ideia de variação (`2...e6`) e a ordem acelerada (`2.Bf4`) são entradas
  da base com **outro nome** ("…with e6", "Accelerated London System"), e o validador exige que toda linha comece com uma entrada do nome escolhido; por isso
  as duas ficaram de fora e usei variações que ficam dentro da entrada escolhida.
- **A alternativa de ordem fica depois da entrada do Lichess** (`5.c3` em vez de `5.Cbd2`), por esse mesmo motivo. Ela continua até o fim da linha (os dois galhos
  usam a mesma continuação `6...Bd6 7.Bg3 O-O 8.Bd3 b6`, montada por uma função em `londres.ts` para cada galho ter seus próprios nós).
- **Atualizei testes que tinham "2 aberturas" e "a próxima depois da Italiana é a Escandinava" escritos no código**, porque o catálogo passou a ter 3 aberturas e a
  trilha da SPEC põe o Londres em segundo (`e2e/trilha.spec.ts` e `e2e/conclusao.spec.ts`: "de 2" virou "de 3", a lista de cartões ganhou o Londres, "Não iniciada"
  são 3, a próxima passou a ser `/abertura/londres`, e o teste de "tudo concluído" marca também o Londres). Não removi nem enfraqueci nenhuma checagem; só acompanhei o
  conteúdo novo e acrescentei checagens do cartão do Londres.
- Sem dependências novas. A explicação dos lances do adversário continua a frase genérica da F19 (o conteúdo não tem explicação para eles).
**Problemas e pendências:**
- **Revisão humana do conteúdo** (SPEC, seção 15): os testes garantem lances legais e a ligação com a base, mas não que as explicações ensinam bem. Vale olhar a
  explicação do `Bg3` (diz que, se as pretas trocarem, as brancas recapturam com o peão `h` e ganham uma coluna para a torre) e a das duas variações, que são
  mais curtas.
- O resumo de uma frase do cartão do Londres na trilha é mais longo que o dos outros (a primeira frase da ideia é comprida); vale encurtar a ideia num turno de polimento.
- Os testes de e2e reescrevem `docs/capturas/f27-*.png` a cada execução (os bytes mudam um pouco). Restaurei esses dois arquivos para não sujar o commit.
- A alternativa só vale depois de `4...Cc6`; não há alternativa de ordem nas outras casas. A SPEC pede "pelo menos uma".
**Próximo turno:** F35 · Conteúdo: Espanhola (Ruy Lopez). Use o id `espanhola`, que já está em `TRAIL_ORDER`, e lembre que a linha precisa começar com uma entrada
da base com **exatamente** o nome escolhido em `lichessName`.

## Turno 2026-11-16 04:40 · [F35] Conteúdo: Espanhola (Ruy Lopez)
**Status:** concluída
**O que fiz:** Criei `src/content/openings/espanhola.ts`, a quarta abertura (brancas, nível 2, linha fixa). A linha principal é
`1.e4 e5 2.Cf3 Cc6 3.Bb5 a6 4.Ba4 Cf6 5.O-O Be7 6.Te1 b5 7.Bb3 d6 8.c3 O-O` (8 lances de cada lado). Cada lance das brancas tem explicação e
dica, e há erros comuns em 5 lances (`Qh5`, `Nxe5`, `Bxc6`, `a3` e `Bxb5`). Há 2 variações das pretas: `6...d6` (antes de `b5`) e
`7...O-O` (rocam antes de `d6`, chegando à mesma posição da linha principal). O validador (F06) pegou o arquivo sozinho e passou, e
`docs/ABERTURAS.md` foi regenerado (agora com 4 aberturas). Teste novo: `e2e/licao-espanhola.spec.ts` (desktop e celular): linha principal
inteira, lance legal fora do roteiro (`Bc4`) com "Voltar", erro comum `Bxb5` com a explicação específica, as duas variações na etapa Variações e a
abertura na trilha (nível 2). Capturas olhadas: `docs/capturas/f35-*.png` (1440 px e 375 px).
**Decisões:**
- **Nome na base do Lichess: `Ruy Lopez: Closed`** (a entrada `...5.O-O Be7`, e a `C90`, `...7.Bb3 d6 8.c3 O-O`, que é exatamente a linha principal). Escolhi a
  linha "fechada" porque é a mais clássica e porque fecha em 8 lances de cada lado. As duas variações também começam com entradas dessa família.
- **Cada variação ficou curta** (termina logo no lance do adversário que desvia), como as da Italiana. Assim não preciso inventar teoria além do que conferi.
- **Evitei de propósito `7...O-O 8.c3 d5`** (o Gambito Marshall), que é uma ramificação muito comum e complicada para quem está começando. O conteúdo só ensina
  `8...d6`; se a pessoa jogar contra um adversário real, isso pode aparecer. Fica como assunto de revisão humana.
- **`Bxc6` na lista de erros comuns é honesto:** o texto diz que é um lance real (a Troca) usado por jogadores fortes, mas que nesta lição o plano é manter a pressão.
- **Atualizei `e2e/trilha.spec.ts`** para acompanhar o conteúdo novo: "de 3" virou "de 4", a lista de cartões ganhou a Espanhola (filtro Brancas inclui; Pretas não),
  o teste de "tudo concluído" marca também a `espanhola`, "Não iniciada" são 4, e o nível 2 "Construindo repertório" agora aparece (antes o teste conferia que ele não aparecia).
  Não removi nem enfraqueci checagem nenhuma.
- Nenhuma dependência nova.
**Problemas e pendências:**
- **Revisão humana do conteúdo** (SPEC, seção 15): os testes garantem lances legais e a ligação com a base, mas não que as explicações ensinam bem. Vale olhar a explicação
  do `Re1` (diz que protege `e4` contra o cavalo) e o texto da ideia, que é um pouco abstrato ("plano longo").
- Meu primeiro teste de "erro comum" jogava a linha, reiniciava e jogava de novo: falhou uma vez numa rodada completa (lento demais). Simplifiquei para jogar a linha só uma vez.
- Perto do começo do turno um `cd` para `data/lichess-openings` deslocou a pasta de trabalho do shell; voltei à raiz e nada foi alterado lá.
- Os testes e2e reescrevem `docs/capturas/f27-*.png` a cada execução; restaurei esses dois arquivos para não sujar o commit.
**Próximo turno:** F36 · a próxima funcionalidade com `passes: false` (provavelmente o conteúdo da Defesa Caro-Kann; id `caro-kann` em `TRAIL_ORDER`). Lembre de regenerar `docs/ABERTURAS.md`
e de atualizar `e2e/trilha.spec.ts` (contagem "de 4" e lista de cartões), porque ele escreve o número de aberturas no código.

## Turno 2026-11-16 05:00 · [F36] Conteúdo: Defesa Caro-Kann
**Status:** concluída
**O que fiz:** Criei `src/content/openings/caro-kann.ts`, a quinta abertura (pretas, nível 2, linha fixa, contra 1.e4). A linha principal é
`1.e4 c6 2.d4 d5 3.Cd2 dxe4 4.Cxe4 Bf5 5.Cg3 Bg6 6.h4 h6 7.Cf3 Cd7 8.h5 Bh7 9.Bd3 Bxd3 10.Dxd3` (9 lances das pretas). Cada lance das pretas tem explicação e
dica, e há erros comuns em 6 lances (`g5`, `e5`, `Qxd4`, `Bxc2`, `Bxh5` e `Bg6`). Há 2 variações das brancas: `6.Bc4` em vez de `6.h4` e `7.h5` antes de `7.Cf3`
(esta chega à mesma posição da linha principal). O validador (F06) pegou o arquivo sozinho e passou, e `docs/ABERTURAS.md` foi regenerado (agora com 5 aberturas).
Teste novo: `e2e/licao-caro-kann.spec.ts` (desktop e celular): linha principal inteira, lance legal fora do roteiro (`1...e5`) com "Voltar", erro comum `Bxh5` com a
explicação específica, a etapa Variações e a abertura na trilha (nível 2). Capturas olhadas: `docs/capturas/f36-desktop.png` e `f36-celular.png`.
**Decisões:**
- **Nome na base do Lichess: `Caro-Kann Defense: Classical Variation`.** As entradas com esse nome vão de `3.Nd2 dxe4 4.Nxe4 Bf5` até `7...Nd7`, então a linha usa `3.Cd2`
  (e não o `3.Cc3`, mais comum para quem joga contra, que chega à mesma posição mas que a base não chama de "Classical"). Por isso, as duas variações também ficam
  dentro dessa família (`4...Bf5 5.Cg3 Bg6`).
- A linha tem **9 lances das pretas** (a SPEC pede "cerca de 6 a 8"): terminei em `10.Dxd3` para a troca de bispos, que é o objetivo de `h6` e `Bh7`, não ficar pela metade.
- **Um trecho final repetido** (`9.Bd3 Bxd3 10.Dxd3`) é montado por uma função, `bishopTrade()`, usada na linha principal e na variação 2, para cada galho ter os seus nós.
- Erros comuns são só lances legais e claros (peça perdida ou peão a menos); não incluí lances "estranhos mas jogáveis" para não afirmar teoria que não conferi.
- **Atualizei `e2e/trilha.spec.ts`** para acompanhar o conteúdo novo: "de 4" virou "de 5", o nível 2 agora tem dois cartões (Espanhola e Caro-Kann), o filtro "Pretas" mostra
  Escandinava e Caro-Kann, o teste de "tudo concluído" marca também `caro-kann` e "Não iniciada" são 5. Não removi nem enfraqueci checagem nenhuma.
- Nenhuma dependência nova.
**Problemas e pendências:**
- **Revisão humana do conteúdo** (SPEC, seção 15): os testes garantem lances legais e a ligação com a base, mas não que as explicações ensinam bem. Vale olhar a explicação de
  `Nd7` (diz que evita peões dobrados se houver troca em f6) e a de `Bg6` (diz que o bispo continua vigiando a diagonal até c2).
- As respostas das brancas depois do desvio das variações são curtas (a variação termina logo depois do lance da pessoa), como nas outras aberturas.
- Os testes e2e reescrevem `docs/capturas/f27-*.png` a cada execução; restaurei esses dois arquivos para não sujar o commit.
- Um `cd` para `data/lichess-openings` deslocou a pasta de trabalho do shell no meio do turno; voltei à raiz e nada foi alterado lá.
**Próximo turno:** F37 · a próxima funcionalidade com `passes: false` (provavelmente o conteúdo do Gambito da Dama Recusado; id `gambito-da-dama-recusado`). Lembre de regenerar
`docs/ABERTURAS.md` e de atualizar `e2e/trilha.spec.ts` (contagem "de 5", lista de cartões e filtros), porque ele escreve o número de aberturas no código.

## Turno 2026-11-16 05:20 · [F37] Conteúdo: Gambito da Dama Recusado
**Status:** concluída
**O que fiz:** Criei `src/content/openings/gambito-da-dama-recusado.ts`, a sexta abertura (pretas, nível 2, linha fixa, contra 1.d4). A linha principal é
`1.d4 d5 2.c4 e6 3.Cc3 Cf6 4.Bg5 Be7 5.e3 O-O 6.Cf3 Cbd7 7.Tc1 c6 8.Bd3 dxc4 9.Bxc4 Cd5 10.Bxe7 Dxe7 11.O-O` (10 lances das pretas). Cada lance das pretas tem explicação e
dica, e há erros comuns em 3 lances (`e5`, `dxc4` e `Qh4`). Há 2 variações das brancas: `5.Cf3` antes de `5.e3` (chega à mesma posição da linha principal) e `7.Dc2` em vez de `7.Tc1`.
O validador (F06) pegou o arquivo sozinho e passou, e `docs/ABERTURAS.md` foi regenerado (agora com 6 aberturas). Teste novo: `e2e/licao-gambito-da-dama-recusado.spec.ts`
(desktop e celular): linha principal inteira, lance legal fora do roteiro (`1...Cf6`) com "Voltar", erro comum `dxc4` com a explicação específica, a etapa Variações e a abertura
na trilha (nível 2). Capturas olhadas: `docs/capturas/f37-desktop.png` e `f37-celular.png`.
**Decisões:**
- **Nome na base do Lichess: `Queen's Gambit Declined: Modern Variation`**, que é a entrada `1.d4 d5 2.c4 e6 3.Nc3 Nf6 4.Bg5`. Todas as linhas começam com ela. Escolhi esse nome porque
  as entradas da base para o resto da linha (`Orthodox Defense`, `Rubinstein Variation`…) usam outra ordem de lances ou outros nomes, e o validador exige um prefixo exato.
- **A linha tem 10 lances das pretas** (a SPEC pede "cerca de 6 a 8"). Parei em `11.O-O`, depois da troca de bispos, porque é onde o plano da abertura (trocar peças para ganhar espaço)
  fica claro. Os lances seguintes (`Cxc3` e o avanço `e5`) aparecem só no texto das ideias-chave, para a linha não ficar ainda mais longa.
- **A variação 2 é curta** (`7.Dc2 c6 8.Bd3`) e termina logo depois do lance da pessoa, como as das outras aberturas, para não afirmar teoria que não conferi. A variação 1 usa o mesmo trecho
  final da linha principal, montado pela função `afterKnightD7()` (cada galho tem os seus próprios nós).
- Os erros comuns são só lances legais com consequência clara: `e5` (custa um peão), `dxc4` (jogável, mas é outra abertura, e o texto diz isso com honestidade) e `Qh4` (dama cedo, as brancas ganham tempo).
- **Atualizei `e2e/trilha.spec.ts`** para acompanhar o conteúdo novo: "de 5" virou "de 6", o nível 2 agora tem três cartões, o filtro "Pretas" mostra também o Gambito da Dama Recusado, o teste de
  "tudo concluído" marca o `gambito-da-dama-recusado` e "Não iniciada" são 6. Acrescentei também as checagens do cartão novo. Não removi nem enfraqueci checagem nenhuma.
- Nenhuma dependência nova.
**Problemas e pendências:**
- **Revisão humana do conteúdo** (SPEC, seção 15): os testes garantem lances legais e a ligação com a base, mas não que as explicações ensinam bem. Vale olhar a explicação do `Nd5` (diz que
  trocar peças ajuda quem tem menos espaço) e a do `dxc4` (diz que o bispo gasta dois lances para chegar a c4).
- Eu não conferi no motor de xadrez se `Cd5` e `Dxe7` são os lances mais precisos; são os da teoria clássica da Ortodoxa, mas fica para a revisão humana.
- Os testes e2e reescrevem `docs/capturas/f27-*.png` a cada execução; restaurei esses dois arquivos para não sujar o commit.
- Um `cd` para `data/lichess-openings` deslocou a pasta de trabalho do shell no meio do turno (acontece em turnos anteriores também); voltei à raiz e nada foi alterado lá.
**Próximo turno:** F38 · Conteúdo: Gambito da Dama (brancas, nível 3; id `gambito-da-dama`, já em `TRAIL_ORDER`). Lembre de regenerar `docs/ABERTURAS.md` e de atualizar `e2e/trilha.spec.ts`
(contagem "de 6", lista de cartões e filtro "Brancas"; o nível 3 passa a aparecer na trilha), porque ele escreve o número de aberturas no código.

## Turno 2026-11-16 00:20 · [F38] Conteúdo: Gambito da Dama
**Status:** concluída
**O que fiz:** Criei `src/content/openings/gambito-da-dama.ts`, a sétima abertura (brancas, nível 3, linha fixa). A linha principal é
`1.d4 d5 2.c4 e6 3.Cc3 Cf6 4.Bg5 Be7 5.e3 O-O 6.Cf3 Cbd7 7.Tc1 c6 8.Bd3 dxc4 9.Bxc4 Cd5` (9 lances de cada lado). Cada lance das brancas tem explicação e dica, e há
erros comuns em 5 lances (`f3`, `Bf4`, `cxd5`, `a3` e `Bxf6`). Há 2 variações das pretas, as outras respostas mais comuns ao 2.c4: `2...dxc4` (aceitam o gambito, e você
recupera o peão com `Bxc4`) e `2...c6` (Defesa Eslava, onde `a4` impede o `b5`). O validador (F06) pegou o arquivo sozinho e passou, e `docs/ABERTURAS.md` foi regenerado (agora
com 7 aberturas). Teste novo: `e2e/licao-gambito-da-dama.spec.ts` (desktop e celular): linha principal inteira, lance legal fora do roteiro (`1.e4`) com "Voltar", erro comum
`Bf4` com a explicação específica, a etapa Variações e a abertura na trilha (nível 3, brancas embaixo). Capturas olhadas: `docs/capturas/f38-*.png` (lição e trilha, 1440 px e 375 px).
**Decisões:**
- **Nome na base do Lichess: `Queen's Gambit`** (a entrada `1.d4 d5 2.c4`). É o único nome que as três linhas têm em comum, porque as variações desviam já no segundo lance das pretas.
  As entradas mais longas (`Queen's Gambit Declined: Modern Variation`, `Queen's Gambit Accepted: …`) têm nomes de outras famílias, e o validador pede um nome só por abertura.
- **A linha principal é a mesma posição do Gambito da Dama Recusado (F37), vista do lado das brancas.** A SPEC põe as duas na trilha (nível 2 para as pretas, nível 3 para as brancas),
  e a resposta mais comum ao gambito é recusá-lo com `e6`. Parei em `9...Cd5` (antes de `10.Bxe7 Dxe7 11.O-O`) para a linha ficar com 9 lances de cada lado.
- **Variações curtas, que terminam num lance do adversário** (`6...a6` e `6...e6`), como nas outras aberturas, para não afirmar teoria que não conferi. Não pedi ao motor de xadrez para
  conferir se são as melhores jogadas; os lances são os da teoria clássica de cada defesa e o validador garante que são legais.
- **Atualizei `e2e/trilha.spec.ts`** para acompanhar o conteúdo novo: "de 6" virou "de 7", "Não iniciada" são 7, o filtro "Brancas" passou a incluir o Gambito da Dama, e o nível 3 ("Desafio")
  agora aparece na trilha (antes o teste conferia que ele não aparecia; troquei por checagens do cartão novo). O teste de "tudo concluído" marca também `gambito-da-dama`. Não removi nem enfraqueci checagem nenhuma.
- Nenhuma dependência nova.
**Problemas e pendências:**
- **Teste instável (visto uma vez):** na primeira rodada de `npm run verificar` deste turno, `e2e/licao-variacoes.spec.ts` (celular) falhou: depois de "Continuar" para "Praticar sozinho" a lista de lances
  seguia em "Nenhum lance ainda." (um clique do teste parece ter se perdido). Rodei o teste sozinho 3 vezes e a suíte inteira 2 vezes, e passou sempre; não consegui reproduzir nem guardar o rastro da falha.
  Suspeita (não confirmada): a máquina estava carregada e o clique caiu antes de o tabuleiro estar pronto. Se voltar a acontecer, olhar o `trace.zip` que o Playwright guarda em `test-results/` e considerar
  esperar o tabuleiro ficar interativo antes do primeiro clique em `playLine`.
- **Revisão humana do conteúdo** (SPEC, seção 15): os testes garantem lances legais e a ligação com a base, mas não que as explicações ensinam bem. Vale olhar a explicação do `Tc1` (diz que a torre
  fica pronta para a coluna c se abrir) e a do `Bd3` (diz que ele recupera o peão se as pretas capturarem).
- As duas variações têm só um trecho curto depois do desvio; nenhuma delas leva a uma posição da linha principal.
- Os testes e2e reescrevem `docs/capturas/f27-*.png` a cada execução; restaurei esses dois arquivos para não sujar o commit.
- O shell herdou um `cd` para `data/` no meio do turno (ocorre em turnos anteriores); voltei à raiz e nada foi alterado lá. Subi o servidor de desenvolvimento para as capturas e parei depois.
**Próximo turno:** F39, a próxima funcionalidade com `passes: false` (provavelmente o conteúdo da Defesa Siciliana; id `siciliana`, já em `TRAIL_ORDER`). Lembre de regenerar `docs/ABERTURAS.md` e de atualizar `e2e/trilha.spec.ts`
(contagem "de 7", lista de cartões, filtro "Pretas" e "Não iniciada" = 7), porque ele escreve o número de aberturas no código.
