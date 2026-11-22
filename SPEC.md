# Especificação: Aprendrez (MVP)

> **Para o agente:** este documento é a fonte de verdade sobre *o que* construir.
> Se algo aqui estiver ambíguo, escolha a opção mais simples que respeite os
> princípios da seção 9 e registre a decisão no diário de bordo.
> Nunca amplie o escopo além da seção 4.

Status: **aprovada v1.0** · Nome do app: **Aprendrez**

---

## 1. Visão

O Aprendrez é um app web gratuito, em português, para **aprender aberturas de
xadrez jogando**. Para cada abertura, o tabuleiro simula o começo de uma partida:
mostra qual peça mover e para onde, o adversário responde, e a pessoa aos poucos
passa a jogar a sequência sozinha. Funciona tanto para aberturas de brancas
quanto de pretas.

**Problema:** quem já sabe as regras costuma sair da abertura com a posição ruim,
porque joga os primeiros lances no improviso. O material sobre aberturas que
existe é passivo (vídeos, livros, listas de lances), cheio de jargão e quase
sempre em inglês. Decorar uma lista de lances sem praticar não fica na memória.

## 2. Público

**Persona principal: "a pessoa que sabe mexer as peças, mas não sabe como começar a partida"**
- Conhece todas as regras do xadrez
- Joga de vez em quando, online ou com amigos
- Não tem um repertório de aberturas; nos primeiros lances, joga "o que parece bom"
- Estuda em sessões curtas (10 a 20 minutos), normalmente no computador
- Fala português e não tem vocabulário técnico de xadrez

## 3. Objetivos de aprendizado

Para cada abertura estudada, a pessoa deve conseguir:
1. Jogar de memória a linha principal (cerca de 6 a 8 lances de cada lado)
2. Reagir corretamente às 1 ou 2 respostas mais comuns do adversário (as variações)
3. Explicar em uma frase a **ideia** da abertura, ou seja, por que aqueles lances são jogados

## 4. Escopo do MVP

### Dentro
- **8 aberturas** (4 de brancas e 4 de pretas), distribuídas em uma trilha sugerida por nível (seção 5)
- Cada abertura com uma linha principal e de 1 a 2 variações
- Lição de abertura em etapas: conhecer, assistir, praticar com guia, praticar sozinho e desafio (seção 6)
- Tabuleiro interativo com as regras de interação da seção 7
- Exploração livre: qualquer abertura e qualquer etapa podem ser abertas a qualquer momento, sem login
- Interface só em português do Brasil, com a notação dos lances em português
- Desktop primeiro, mas funcional em telas de até 375 px de largura
- Publicado online na Vercel, no plano gratuito (seção 12)

### Fora (não construir agora)
- Jogo livre contra o computador, puzzles táticos, análise de partidas
- Aberturas além das 8 do catálogo
- Login, contas, sincronização entre aparelhos, qualquer servidor ou banco de dados
- Outros idiomas
- Progresso, status de "concluída"/"em andamento" e qualquer gamificação (pontos, sequências de dias, rankings)
- Som e música

## 5. Catálogo de aberturas e trilha

A trilha é **só uma referência**, da abertura mais fácil para a mais difícil.
Todas as aberturas ficam abertas desde o início.

| Nível | Abertura | Cor | Assume que o adversário começa com | Tipo |
|---|---|---|---|---|
| 1 · Primeiros passos | Italiana (Giuoco Piano) | Brancas | (as brancas começam) | Linha fixa |
| 1 · Primeiros passos | Sistema Londres | Brancas | (as brancas começam) | **Sistema** |
| 1 · Primeiros passos | Defesa Escandinava | Pretas | 1.e4 | Linha fixa |
| 2 · Construindo repertório | Espanhola (Ruy Lopez) | Brancas | (as brancas começam) | Linha fixa |
| 2 · Construindo repertório | Defesa Caro-Kann | Pretas | 1.e4 | Linha fixa |
| 2 · Construindo repertório | Gambito da Dama Recusado | Pretas | 1.d4 | Linha fixa |
| 3 · Desafio | Gambito da Dama | Brancas | (as brancas começam) | Linha fixa |
| 3 · Desafio | Defesa Siciliana (linha aberta) | Pretas | 1.e4 | Linha fixa |

### Linha fixa vs. sistema
- **Linha fixa:** a ordem dos lances importa. Trocar a ordem pode dar ao adversário
  uma resposta melhor. Em cada lance, **só um lance é aceito**.
- **Sistema:** a pessoa monta a mesma estrutura de peças contra quase qualquer
  resposta, e às vezes a ordem dos lances é flexível. Mesmo assim, uma ordem
  alternativa **só é aceita se estiver escrita explicitamente no conteúdo**,
  como mais um ramo da árvore (seção 8), com uma frase justificando.
- Regra geral: **por padrão, só um lance correto.** Alternativas aceitas são
  exceção, definidas uma a uma no conteúdo, nunca deduzidas pelo app.

### Documento de catálogo
O arquivo `docs/ABERTURAS.md` descreve cada abertura: cor, nível, tipo, ideia
central, a linha principal, as variações e (só nos sistemas) as alternativas de
ordem aceitas, cada uma com a sua justificativa. É o documento que uma pessoa
revisa para conferir o conteúdo.

### Fonte de verdade das linhas
Os nomes e as linhas das aberturas precisam conferir com a base aberta
[lichess-org/chess-openings](https://github.com/lichess-org/chess-openings)
(licença CC0), copiada para o repositório. Cada linha do app começa com a
sequência de lances de uma entrada nomeada dessa base.

## 6. Anatomia de uma lição de abertura

Cada abertura é uma lição. A lição tira a ajuda aos poucos: primeiro a pessoa
**vê**, depois **faz com ajuda**, depois **faz sozinha** e por fim **aplica num
cenário imprevisível**.

| # | Etapa | O que acontece | Quem move as peças |
|---|---|---|---|
| 1 | **Conhecer** | Nome, cor, nível, a ideia da abertura em até 3 frases, 2 ou 3 "ideias-chave" e o tabuleiro na posição característica | Ninguém (tabuleiro estático) |
| 2 | **Assistir** | A linha principal, lance a lance. A pessoa avança e volta, e cada lance tem uma frase de narração dizendo **por que** ele é jogado | O app |
| 3 | **Praticar com guia** | A pessoa joga a linha principal. O tabuleiro destaca a peça que deve se mover e a casa de destino (com uma seta). O adversário responde automaticamente | A pessoa (com guia) e o app (adversário) |
| 4 | **Praticar sozinho** | A mesma linha, sem destaques. Se a pessoa jogar um lance fora do roteiro, vale a regra da seção 7.3 | A pessoa (sem guia) e o app |
| 5 | **Variações** | Para cada variação: o app mostra o momento em que o adversário desvia ("E se as pretas jogarem…?"), a pessoa assiste à continuação e depois pratica com guia e sozinha | Todos |
| 6 | **Desafio** | Uma partida do começo até o fim da linha, sem guia. A cada resposta, o adversário escolhe **ao acaso** entre os ramos ensinados, e a pessoa não sabe qual virá | A pessoa (sem guia) e o app |

- Terminar o **Desafio** leva a um resumo da abertura. Nada é marcado como concluído.
- Quando a pessoa joga de pretas, o tabuleiro fica **invertido** (pretas embaixo)
  e o app joga automaticamente o primeiro lance das brancas.
- Uma lista de lances em notação portuguesa acompanha a partida em todas as
  etapas (por exemplo, `1. e4 e5 2. Cf3 Cc6`). As letras das peças são:
  R (rei), D (dama), T (torre), B (bispo), C (cavalo).
- O botão **"Ver lance"** fica disponível nas etapas sem guia: ele mostra o guia
  (peça e seta) só para o lance atual, sem nenhuma penalidade.

## 7. Regras de interação do tabuleiro

### 7.1 Clicar
- Clicar numa peça da sua cor, na sua vez, **seleciona** a peça e marca as casas de destino legais
- Clicar numa casa marcada faz o lance
- Clicar em qualquer outro lugar (ou na mesma peça) desfaz a seleção
- Pelo clique, **só é possível fazer lances legais**
- Peças do adversário e peças fora da vez não podem ser selecionadas

### 7.2 Arrastar
- Arrastar uma peça também marca as casas de destino legais enquanto ela é arrastada
- Soltar numa casa legal faz o lance
- Soltar numa casa ilegal (ou fora do tabuleiro) faz a peça **voltar à casa de origem**, sem mensagem e sem contar como nada

### 7.3 Lance legal, mas fora do roteiro
Na etapa sem guia, um lance legal que não faz parte da abertura:
- **Fica no tabuleiro** (não é desfeito automaticamente) e é destacado como fora do roteiro
- Aparece uma mensagem curta e encorajadora, que diz que o lance é possível mas
  não é o da abertura e mostra a **dica** daquele momento (a dica dá a ideia sem
  entregar o lance, por exemplo: "Desenvolva uma peça que ajude a controlar o centro")
- Se o conteúdo tiver uma explicação específica para aquele lance (um erro comum),
  ela aparece no lugar da mensagem genérica
- O botão principal "Continuar" vira **"Voltar"**, que desfaz o lance para a pessoa tentar de novo
- Não existe limite de tentativas nem penalidade

### 7.4 Lance correto
- Confirmação visual, a frase explicando o lance e, em seguida, a resposta automática do adversário

### 7.5 Geral
- O último lance jogado fica destacado no tabuleiro
- As respostas do adversário têm um pequeno atraso (cerca de 400 ms) para que dê para perceber o que aconteceu
- O tabuleiro funciona com teclado (seção 9)

## 8. O conteúdo é uma árvore de lances

Uma abertura não é uma lista de lances: é uma **árvore**. Cada posição é um nó,
e cada lance é um galho que leva à posição seguinte.

- Nos **lances do adversário**, um nó pode ter vários filhos: são as **variações**.
- Nos **lances da pessoa**, um nó normalmente tem **um filho só**. Mais de um
  filho só aparece nos sistemas, para as alternativas de ordem aceitas (seção 5).
- Todo lance da pessoa tem uma **explicação** (o porquê) e uma **dica** (a ideia,
  sem entregar o lance).
- Um lance pode ter **explicações de erros comuns**: lances legais que um
  iniciante costuma jogar ali, cada um com a explicação de por que não é o ideal.
- O conteúdo fica em **arquivos de dados separados do código da interface**,
  um arquivo por abertura.

## 9. Princípios de design

### Cores (regra 60/30/10)
| Proporção | Papel | Cores |
|---|---|---|
| 60% | Superfícies | Branco e cinzas muito claros |
| 30% | Estrutura e texto | Neutro primário (cinza escuro) e neutro secundário (cinza claro) |
| 10% | Destaque | **Vermelho**: ação principal, guia de lance (peça e seta), seleção e foco |

- O tabuleiro segue a paleta: as casas usam dois neutros com bom contraste entre si
- O vermelho é **reservado ao destaque**. Ele não é usado para indicar erro (veja a seção 13, item 1)
- Lance fora do roteiro e lance correto são indicados com **ícone discreto e texto**, nunca só com cor
- O botão de ação principal usa sempre a cor de destaque, seja "Continuar" ou "Voltar"

### Referência visual: design suíço
- **Grid** de 12 colunas no desktop e 4 no celular, invisível para quem usa o app, e espaçamentos em múltiplos de 8 px
- **Hierarquia pela tipografia:** uma família sem serifa do tipo grotesca
  (por exemplo, Inter), com grande contraste entre os tamanhos dos títulos e do texto
- Texto alinhado à esquerda, layouts que podem ser assimétricos, sem ornamentos,
  sombras discretas ou nenhuma, cantos retos ou levemente arredondados
- Alto contraste entre os neutros

### Os outros princípios
- **Tom de voz:** encorajador, direto e sem jargão. Um termo técnico, quando aparece, é explicado na primeira vez.
- **Feedback claro:** nunca depende só de cor.
- **Acessibilidade:** contraste WCAG AA, tudo navegável por teclado (incluindo
  selecionar a peça e a casa de destino), foco visível.
- **Consistência:** cores, espaçamentos e tipografia definidos como variáveis (tokens) em um único lugar.
- **Movimento:** animações sutis e curtas (até 200 ms), respeitando `prefers-reduced-motion`.
- **Licenças:** as imagens das peças e a fonte precisam ter licença que permita o
  uso público. Se a licença exigir atribuição, ela aparece no rodapé.

## 10. Telas e fluxos

### 10.1 Início (trilha)
- Nome **Aprendrez** e uma frase explicando a proposta
- Botão principal "Começar", que leva à primeira abertura da trilha
- Filtro: **Todas · Brancas · Pretas**
- As aberturas agrupadas pelos 3 níveis. Cada cartão mostra: nome, cor (com
  ícone e texto), um mini-tabuleiro na posição característica e a ideia em uma
  frase. Não há status nem contagem de progresso

### 10.2 Lição da abertura
- **Desktop:** tabuleiro à esquerda (o protagonista da tela), painel à direita com:
  - indicador das etapas (Conhecer · Assistir · Praticar com guia · Praticar sozinho · Variações · Desafio), em que qualquer etapa pode ser aberta a qualquer momento
  - o texto da etapa atual (narração, explicação, dica ou mensagem)
  - a lista de lances da partida
  - as ações (Continuar/Voltar, Ver lance, Reiniciar a linha)
- **Telas estreitas:** tabuleiro em cima, painel embaixo
- Um link para voltar à trilha

### 10.3 Fim do Desafio (resumo da abertura)
- Aparece ao terminar o Desafio
- Mostra a posição final da linha principal, a ideia da abertura em uma frase e a linha principal em notação
- Botões "Próxima abertura" (a próxima da trilha) e "Voltar à trilha"

### 10.4 Página não encontrada
- Mensagem simples e um link para o início

## 11. Exploração livre (sem progresso)

- Decisão do dono do projeto (2026-11-22): o app não guarda progresso nem mostra
  "concluída" ou "em andamento". A pessoa explora livremente
- Toda lição abre em "Conhecer", e qualquer etapa pode ser aberta pelo indicador
- Nada é salvo no navegador

## 12. Restrições técnicas e publicação

- App **estático** (sem servidor)
- React + TypeScript + Vite
- Regras do xadrez: `chess.js`. Não reimplementar regras nem geração de lances.
- Tabuleiro: uma biblioteca de tabuleiro com licença permissiva (MIT ou similar)
  que permita as regras de interação da seção 7
- Testes: testes de unidade para a lógica e testes de ponta a ponta no navegador (Playwright) para os fluxos
- **Validação automática do conteúdo** (testes obrigatórios):
  - todo lance de toda árvore é legal na sua posição
  - toda linha começa com a sequência de lances de uma entrada nomeada da base lichess-org/chess-openings
  - todo lance da pessoa tem explicação e dica
  - só sistemas têm lances da pessoa com mais de um filho
- **Publicação:** Vercel, no plano gratuito (Hobby), conectada ao repositório no
  GitHub, com cada envio para a branch principal publicando automaticamente. A
  conexão das contas é feita por uma pessoa, não pelo agente.

## 13. Decisões tomadas

1. **Vermelho é só destaque.** As mensagens de lance fora do roteiro levam um
   **ícone discreto de erro** ao lado do texto, sem usar vermelho. O app não é
   punitivo: o botão de ação principal mantém sempre a cor de destaque, seja
   "Continuar" (depois de um acerto) ou "Voltar" (depois de um lance fora do roteiro).
   As cores são tokens e podem mudar depois.
2. **"Ver lance"** fica disponível nas etapas sem guia, sem penalidade.

## 14. Definição de pronto do MVP

- [ ] As 8 aberturas existem e cada uma pode ser concluída do começo ao fim, Desafio incluído
- [ ] Todos os testes passam, incluindo a validação do conteúdo
- [ ] O app funciona em 1440 px e em 375 px de largura, sem rolagem horizontal
- [ ] `npm run build` gera a pasta pronta para publicação
- [ ] O app está publicado na Vercel com link público (feito por uma pessoa, fora da execução autônoma)

## 15. Questões em aberto

1. **Revisão humana do conteúdo:** os testes garantem que os lances são legais e
   batem com aberturas reais, mas não que as explicações estão corretas e ensinam
   bem. Essa revisão fica com uma pessoa, a partir do `docs/ABERTURAS.md`.
