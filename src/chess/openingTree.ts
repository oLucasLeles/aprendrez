// Modelo de dados de uma abertura: uma ÁRVORE de lances (SPEC, seção 8).
//
// Cada posição é um nó e cada lance é um galho que leva à posição seguinte.
// Este arquivo só tem tipos e funções puras (sem interface, sem Node), então
// pode ser usado tanto pelo navegador quanto pelos testes.
//
// Convenção importante: em qualquer nó, o PRIMEIRO filho é sempre o caminho da
// linha principal. Os outros filhos de um lance do adversário são variações.

/** De quem é o lance: da pessoa que estuda ou do adversário (o app joga). */
export type MoveOwner = 'user' | 'opponent'

export type OpeningColor = 'white' | 'black'

/** "fixed" = linha fixa (só um lance aceito); "system" = sistema (ordens alternativas escritas à mão). */
export type OpeningKind = 'fixed' | 'system'

/** Nível da trilha: 1 Primeiros passos, 2 Construindo repertório, 3 Desafio. */
export type OpeningLevel = 1 | 2 | 3

/** Um lance legal que iniciantes costumam jogar ali, com o porquê de não ser o ideal. */
export interface CommonMistake {
  /** O lance em SAN (notação inglesa interna, como "h3"). */
  san: string
  /** Explicação em português de por que esse lance não é o ideal. */
  explanation: string
}

/** Um nó da árvore: o lance que leva até esta posição e o que vem depois. */
export interface OpeningNode {
  /** O lance em SAN, como "Nf3". A notação em português é só para exibir. */
  san: string
  /** Quem joga este lance. */
  by: MoveOwner
  /** Por que o lance é jogado (obrigatório nos lances da pessoa). */
  explanation?: string
  /** A ideia do lance sem entregá-lo (obrigatória nos lances da pessoa). */
  hint?: string
  /** Erros comuns: lances legais fora do roteiro com explicação específica (lances da pessoa). */
  commonMistakes?: CommonMistake[]
  /** Nome da variação, quando este é um galho do adversário fora da linha principal. */
  variationName?: string
  /** Lances possíveis a seguir. O primeiro é o da linha principal. */
  children: OpeningNode[]
}

export interface Opening {
  /** Nome curto usado no endereço, como "italiana". */
  id: string
  /** Nome em português mostrado na interface. */
  name: string
  /** Nome exato da entrada na base do Lichess (inglês), como "Italian Game: Giuoco Piano". */
  lichessName: string
  color: OpeningColor
  level: OpeningLevel
  kind: OpeningKind
  /**
   * Para aberturas de pretas: o primeiro lance das brancas, que o app joga
   * sozinho ("e4"). Para aberturas de brancas fica `null`.
   * Esse lance também aparece na árvore, como primeiro nó (do adversário).
   */
  assumedFirstMove: string | null
  /** A ideia da abertura, em até 3 frases. */
  idea: string
  /** 2 ou 3 ideias-chave. */
  keyIdeas: string[]
  /** Os primeiros lances possíveis, a partir da posição inicial. O primeiro é o da linha principal. */
  tree: OpeningNode[]
}

/** Uma variação: o adversário desvia da linha principal. */
export interface Variation {
  name: string
  /** O nó do adversário onde a variação começa (o lance que desvia). */
  deviation: OpeningNode
  /** Os nós desde o primeiro lance até o lance que desvia (inclusive). */
  path: OpeningNode[]
  /** A linha completa da variação: o caminho até o desvio mais a continuação principal depois dele. */
  line: OpeningNode[]
}

/** Segue sempre o primeiro filho a partir de uma lista de nós, até chegar numa folha. */
function followFirstChildren(start: OpeningNode[]): OpeningNode[] {
  const line: OpeningNode[] = []
  let options = start
  while (options.length > 0) {
    const next = options[0]
    line.push(next)
    options = next.children
  }
  return line
}

/** A linha principal: do primeiro lance até a folha, sempre pelo primeiro filho. */
export function getMainLine(opening: Opening): OpeningNode[] {
  return followFirstChildren(opening.tree)
}

/** A linha principal só com os lances em SAN: ["e4", "e5", "Nf3", ...]. */
export function getMainLineMoves(opening: Opening): string[] {
  return getMainLine(opening).map((node) => node.san)
}

/**
 * Todas as variações da abertura, na ordem em que aparecem na árvore.
 * Uma variação é qualquer filho do adversário que não seja o primeiro filho
 * do seu nó. Inclui variações que nascem dentro de outras variações.
 */
export function getVariations(opening: Opening): Variation[] {
  const variations: Variation[] = []

  function visit(options: OpeningNode[], pathSoFar: OpeningNode[]): void {
    options.forEach((node, index) => {
      const path = [...pathSoFar, node]
      if (index > 0 && node.by === 'opponent') {
        variations.push({
          name: node.variationName ?? '',
          deviation: node,
          path,
          line: [...path, ...followFirstChildren(node.children)],
        })
      }
      visit(node.children, path)
    })
  }

  visit(opening.tree, [])
  return variations
}

/**
 * O caminho (do primeiro lance até o nó pedido, inclusive) ou `null` se o nó
 * não pertence à árvore. O nó é procurado pela identidade (é o mesmo objeto).
 */
export function getPathToNode(opening: Opening, target: OpeningNode): OpeningNode[] | null {
  function search(options: OpeningNode[], pathSoFar: OpeningNode[]): OpeningNode[] | null {
    for (const node of options) {
      const path = [...pathSoFar, node]
      if (node === target) return path
      const found = search(node.children, path)
      if (found) return found
    }
    return null
  }
  return search(opening.tree, [])
}

/**
 * Segue uma lista de lances em SAN a partir da posição inicial e devolve os
 * nós percorridos, ou `null` se algum lance não existir na árvore.
 * Serve para achar "onde estamos" na árvore depois de uma sequência de lances.
 */
export function findNodePath(opening: Opening, moves: string[]): OpeningNode[] | null {
  const path: OpeningNode[] = []
  let options = opening.tree
  for (const san of moves) {
    const node = options.find((candidate) => candidate.san === san)
    if (!node) return null
    path.push(node)
    options = node.children
  }
  return path
}
