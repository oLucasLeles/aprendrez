// Validador automático do conteúdo das aberturas (SPEC, seção 12).
//
// Recebe uma abertura e devolve uma lista de problemas, cada um com uma
// mensagem clara em português. Lista vazia = abertura válida.
//
// ATENÇÃO: usa a base do Lichess (que lê arquivos), então é só para Node
// (testes e scripts), nunca para o código do navegador.
import { Chess } from 'chess.js'
import { startsWithNamedOpening, findOpeningsByName, type LichessOpening } from './lichessOpenings'
import { getMainLine, getVariations, type Opening, type OpeningNode } from './openingTree'

/** Quantos lances de cada lado a linha principal precisa ter, no mínimo. */
const MIN_MOVES_PER_SIDE = 6
const MIN_VARIATIONS = 1
const MAX_VARIATIONS = 2

/** "e4 e5 Nf3" (ou "o começo da partida" quando ainda não houve lances). */
function describePath(moves: readonly string[]): string {
  return moves.length === 0 ? 'o começo da partida' : moves.join(' ')
}

/** Tenta jogar `san` na posição atual. Devolve o lance canônico ou `null` se for ilegal. */
function tryMove(chess: Chess, san: string): string | null {
  try {
    // strict: não aceita jeitos "alternativos" de escrever o lance (ex.: "Ngf3" desnecessário).
    return chess.move(san, { strict: true }).san
  } catch {
    return null
  }
}

/** Confere uma abertura inteira e devolve os problemas encontrados. */
export function validateOpening(
  opening: Opening,
  lichess: readonly LichessOpening[],
): string[] {
  const problems: string[] = []
  const prefix = `[${opening.id}]`
  const report = (message: string) => problems.push(`${prefix} ${message}`)

  // --- Nome na base do Lichess ---
  if (findOpeningsByName(lichess, opening.lichessName).length === 0) {
    report(`O nome "${opening.lichessName}" não existe na base do Lichess.`)
  }

  // --- Primeiro lance assumido (aberturas de pretas) ---
  if (opening.color === 'white' && opening.assumedFirstMove !== null) {
    report('Abertura de brancas não deve ter lance assumido do adversário.')
  }
  if (opening.color === 'black' && opening.assumedFirstMove !== opening.tree[0]?.san) {
    report(
      `O lance assumido (${opening.assumedFirstMove}) precisa ser o primeiro nó da árvore (${opening.tree[0]?.san ?? 'árvore vazia'}).`,
    )
  }

  if (opening.tree.length === 0) {
    report('A árvore de lances está vazia.')
    return problems
  }

  // --- Percorre a árvore toda, lance a lance ---
  const chess = new Chess()

  function visitOptions(options: OpeningNode[], movesSoFar: string[]): void {
    const ply = movesSoFar.length
    const whiteToMove = ply % 2 === 0
    const expectedOwner =
      whiteToMove === (opening.color === 'white') ? 'user' : 'opponent'
    const where = describePath(movesSoFar)

    // Lances repetidos no mesmo ponto deixariam a árvore ambígua.
    const seen = new Set<string>()
    for (const node of options) {
      if (seen.has(node.san)) report(`O lance ${node.san} aparece duas vezes depois de ${where}.`)
      seen.add(node.san)
    }

    // Só sistemas podem ter mais de um lance da pessoa na mesma posição.
    const userNodes = options.filter((node) => node.by === 'user')
    if (userNodes.length > 1 && opening.kind !== 'system') {
      report(
        `Alternativa em linha fixa: depois de ${where} há ${userNodes.length} lances da pessoa (${userNodes
          .map((node) => node.san)
          .join(', ')}), mas só sistemas podem ter alternativas.`,
      )
    }

    options.forEach((node, index) => {
      const path = [...movesSoFar, node.san]

      // De quem é o lance precisa bater com a vez e com a cor da abertura.
      if (node.by !== expectedOwner) {
        report(
          `O lance ${node.san} (depois de ${where}) está marcado como "${node.by}", mas deveria ser "${expectedOwner}".`,
        )
      }

      // Erros comuns são lances legais *nesta* posição (antes do lance ser jogado),
      // que não sejam um dos lances ensinados, e cada um precisa de explicação.
      if (node.by === 'user') {
        for (const mistake of node.commonMistakes ?? []) {
          const canonical = tryMove(chess, mistake.san)
          if (canonical === null) {
            report(`Erro comum ilegal: ${mistake.san} não pode ser jogado depois de ${where}.`)
          } else {
            chess.undo()
            if (options.some((option) => option.san === mistake.san)) {
              report(`O erro comum ${mistake.san} (depois de ${where}) é um dos lances ensinados.`)
            }
          }
          if (!mistake.explanation.trim()) {
            report(`O erro comum ${mistake.san} (depois de ${where}) não tem explicação.`)
          }
        }
      }

      // O lance precisa ser legal e escrito do jeito canônico (inclui + e #).
      const canonical = tryMove(chess, node.san)
      if (canonical === null) {
        report(`Lance ilegal: ${node.san} não pode ser jogado depois de ${where}.`)
        return // sem posição válida, não dá para seguir por este galho
      }
      if (canonical !== node.san) {
        report(
          `O lance ${node.san} depois de ${where} deveria ser escrito como ${canonical}.`,
        )
      }

      if (node.by === 'user') {
        if (!node.explanation?.trim()) {
          report(`O lance ${node.san} (depois de ${where}) não tem explicação.`)
        }
        if (!node.hint?.trim()) {
          report(`O lance ${node.san} (depois de ${where}) não tem dica.`)
        }
      }

      // Variação do adversário (todo galho que não é o primeiro) precisa de nome.
      if (index > 0 && node.by === 'opponent' && !node.variationName?.trim()) {
        report(`O galho ${node.san} do adversário (depois de ${where}) não tem nome de variação.`)
      }

      // Toda linha, da raiz até cada folha, precisa começar com a entrada do Lichess.
      if (node.children.length === 0 && !startsWithNamedOpening(lichess, opening.lichessName, path)) {
        report(
          `A linha ${path.join(' ')} não começa com nenhuma entrada "${opening.lichessName}" da base do Lichess.`,
        )
      }

      visitOptions(node.children, path)
      chess.undo()
    })
  }

  visitOptions(opening.tree, [])

  // --- Linha principal: tamanho mínimo de cada lado ---
  const mainLine = getMainLine(opening)
  const userMoves = mainLine.filter((node) => node.by === 'user').length
  const opponentMoves = mainLine.length - userMoves
  if (userMoves < MIN_MOVES_PER_SIDE || opponentMoves < MIN_MOVES_PER_SIDE) {
    report(
      `A linha principal precisa de pelo menos ${MIN_MOVES_PER_SIDE} lances de cada lado, mas tem ${userMoves} da pessoa e ${opponentMoves} do adversário.`,
    )
  }

  // --- Quantidade de variações ---
  const variationCount = getVariations(opening).length
  if (variationCount < MIN_VARIATIONS || variationCount > MAX_VARIATIONS) {
    report(
      `A abertura precisa ter de ${MIN_VARIATIONS} a ${MAX_VARIATIONS} variações, mas tem ${variationCount}.`,
    )
  }

  return problems
}
