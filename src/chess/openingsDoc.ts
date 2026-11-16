// Gera o texto de docs/ABERTURAS.md a partir dos dados das aberturas.
//
// Esse documento existe para uma PESSOA revisar o conteúdo (SPEC, seção 15): os testes
// garantem que os lances são legais, mas só um olhar humano diz se as explicações ensinam bem.
// Função pura (recebe as aberturas, devolve texto), então os testes de unidade a usam direto.
// O script `npm run docs:aberturas` é quem grava o resultado no arquivo.
import { formatMoveList, toPortugueseSan } from './notation'
import {
  getMainLine,
  getVariations,
  type Opening,
  type OpeningColor,
  type OpeningLevel,
  type OpeningNode,
} from './openingTree'

const LEVEL_NAMES: Record<OpeningLevel, string> = {
  1: 'Primeiros passos',
  2: 'Construindo repertório',
  3: 'Desafio',
}

const COLOR_NAMES: Record<OpeningColor, string> = {
  white: 'Brancas',
  black: 'Pretas',
}

/** A trilha vai do nível mais fácil ao mais difícil; dentro do nível, mantém a ordem recebida. */
function sortByTrail(openings: readonly Opening[]): Opening[] {
  return [...openings].sort((a, b) => a.level - b.level)
}

/** Número do lance e lance em português, como "2. Cf3" (brancas) ou "2... Cc6" (pretas). */
function numberedMove(san: string, indexInLine: number): string {
  const moveNumber = Math.floor(indexInLine / 2) + 1
  const isWhite = indexInLine % 2 === 0
  return `${moveNumber}${isWhite ? '.' : '...'} ${toPortugueseSan(san)}`
}

/** Uma linha de lances (a partir da posição inicial) em notação portuguesa. */
function lineText(nodes: readonly OpeningNode[]): string {
  return formatMoveList(nodes.map((node) => node.san))
}

/** Os lances da pessoa de uma linha, um a um, com explicação, dica e erros comuns. */
function userMovesSection(line: readonly OpeningNode[], startIndex = 0): string[] {
  const out: string[] = []
  line.forEach((node, index) => {
    if (index < startIndex || node.by !== 'user') return
    out.push(`- **${numberedMove(node.san, index)}**: ${node.explanation ?? ''}`)
    out.push(`  - Dica: ${node.hint ?? ''}`)
    for (const mistake of node.commonMistakes ?? []) {
      out.push(`  - Erro comum, ${toPortugueseSan(mistake.san)}: ${mistake.explanation}`)
    }
  })
  return out
}

/**
 * Alternativas de ordem aceitas (só existem em sistemas): lances da pessoa que têm
 * mais de um filho da pessoa. O primeiro filho é o lance principal; os demais são alternativas.
 */
function acceptedAlternatives(opening: Opening): string[] {
  const out: string[] = []

  function visit(options: readonly OpeningNode[], path: readonly OpeningNode[]): void {
    const userOptions = options.filter((node) => node.by === 'user')
    if (userOptions.length > 1) {
      const [main, ...others] = userOptions
      for (const alternative of others) {
        const position = path.length
        const before = path.length > 0 ? `depois de ${lineText(path)}` : 'na posição inicial'
        out.push(
          `- ${before}, em vez de **${numberedMove(main.san, position)}** também vale **${numberedMove(alternative.san, position)}**. Justificativa: ${alternative.explanation ?? ''}`,
        )
      }
    }
    for (const node of options) visit(node.children, [...path, node])
  }

  visit(opening.tree, [])
  return out
}

function openingSection(opening: Opening): string {
  const mainLine = getMainLine(opening)
  const variations = getVariations(opening)
  const lines: string[] = []

  lines.push(`## ${opening.name}`, '')
  lines.push(`- **Cor:** ${COLOR_NAMES[opening.color]}`)
  lines.push(`- **Nível:** ${opening.level} · ${LEVEL_NAMES[opening.level]}`)
  lines.push(`- **Tipo:** ${opening.kind === 'system' ? 'Sistema' : 'Linha fixa'}`)
  lines.push(`- **Nome na base do Lichess:** ${opening.lichessName}`)
  if (opening.assumedFirstMove) {
    lines.push(`- **Assume que o adversário começa com:** 1. ${toPortugueseSan(opening.assumedFirstMove)}`)
  }
  lines.push('', `**Ideia:** ${opening.idea}`, '', '**Ideias-chave:**', '')
  for (const idea of opening.keyIdeas) lines.push(`- ${idea}`)

  lines.push('', '### Linha principal', '', `\`${lineText(mainLine)}\``, '')
  lines.push(...userMovesSection(mainLine))

  lines.push('', '### Variações', '')
  if (variations.length === 0) {
    lines.push('Nenhuma.')
  }
  variations.forEach((variation, index) => {
    // Só os lances da pessoa depois do desvio são novos: antes dele, a explicação já está na linha principal.
    const deviationIndex = variation.path.length - 1
    if (index > 0) lines.push('')
    lines.push(`#### ${variation.name}`, '', `\`${lineText(variation.line)}\``, '')
    lines.push(...userMovesSection(variation.line, deviationIndex))
  })

  if (opening.kind === 'system') {
    lines.push('', '### Alternativas de ordem aceitas', '')
    const alternatives = acceptedAlternatives(opening)
    lines.push(...(alternatives.length > 0 ? alternatives : ['Nenhuma.']))
  }

  return lines.join('\n')
}

/** O texto completo de docs/ABERTURAS.md (termina com uma quebra de linha). */
export function generateOpeningsDoc(openings: readonly Opening[]): string {
  const header = [
    '# Catálogo de aberturas',
    '',
    '> Arquivo **gerado** por `npm run docs:aberturas` a partir de `src/content/openings/`.',
    '> Não edite à mão: mude o conteúdo e gere de novo. Os lances aparecem em notação',
    '> portuguesa (R, D, T, B, C). Serve para uma pessoa revisar se as explicações ensinam bem.',
  ].join('\n')

  const sections = sortByTrail(openings).map(openingSection)
  return [header, ...sections].join('\n\n---\n\n').replace(/\n+$/, '') + '\n'
}
