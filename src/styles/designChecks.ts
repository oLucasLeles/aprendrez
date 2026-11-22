// Ferramentas para conferir as regras de design a partir do código.
// São usadas pelos testes de src/styles/tokens.test.ts.

/**
 * Lê as variáveis CSS (`--nome: valor;`) do primeiro bloco `:root { }` do texto.
 * O bloco do celular/desktop e o de movimento reduzido ficam de fora: para as
 * cores, só o bloco principal importa.
 */
export function parseRootVariables(css: string): Map<string, string> {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '')
  const rootBlock = withoutComments.match(/:root\s*\{([^}]*)\}/)
  const variables = new Map<string, string>()
  if (!rootBlock) return variables
  for (const match of rootBlock[1].matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    variables.set(match[1], match[2].trim())
  }
  return variables
}

/**
 * Variáveis do modo escuro: as do bloco principal, trocadas pelas do bloco
 * `:root[data-theme='dark'] { }`.
 */
export function parseDarkThemeVariables(css: string): Map<string, string> {
  const variables = parseRootVariables(css)
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '')
  const darkBlock = withoutComments.match(/:root\[data-theme='dark'\]\s*\{([^}]*)\}/)
  if (!darkBlock) return variables
  for (const match of darkBlock[1].matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    variables.set(match[1], match[2].trim())
  }
  return variables
}

/**
 * Descobre o valor final de uma variável, seguindo as referências
 * `var(--outra)` até chegar num valor de verdade.
 */
export function resolveVariable(variables: Map<string, string>, name: string): string {
  const seen = new Set<string>()
  let value = variables.get(name)
  while (value !== undefined) {
    const reference = value.match(/^var\((--[\w-]+)\)$/)
    if (!reference) return value
    if (seen.has(reference[1])) throw new Error(`Referência circular em ${name}`)
    seen.add(reference[1])
    value = variables.get(reference[1])
  }
  throw new Error(`Variável não encontrada: ${name}`)
}

/** Converte uma cor hexadecimal (#rgb ou #rrggbb) em [vermelho, verde, azul] de 0 a 255. */
export function hexToRgb(hex: string): [number, number, number] {
  let digits = hex.replace('#', '')
  if (digits.length === 3) digits = [...digits].map((d) => d + d).join('')
  if (!/^[0-9a-fA-F]{6}$/.test(digits)) throw new Error(`Cor hexadecimal inválida: ${hex}`)
  return [0, 2, 4].map((i) => parseInt(digits.slice(i, i + 2), 16)) as [number, number, number]
}

/** Luminância relativa: o quanto uma cor "parece clara", pela fórmula da WCAG. */
export function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((channel) => {
    const c = channel / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** Razão de contraste da WCAG entre duas cores: vai de 1 (iguais) a 21 (preto e branco). */
export function contrastRatio(hexA: string, hexB: string): number {
  const a = relativeLuminance(hexA)
  const b = relativeLuminance(hexB)
  const lighter = Math.max(a, b)
  const darker = Math.min(a, b)
  return (lighter + 0.05) / (darker + 0.05)
}

// Padrões de cor escrita direto no código. Montados por partes para que
// este próprio arquivo não contenha uma cor e não seja acusado pelo teste.
const HEX_COLOR = new RegExp('(?<![\\w&])' + '#' + '(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![\\w-])', 'g')
const FUNCTION_COLOR = new RegExp('\\b(?:rgba?|hsla?)' + '\\(', 'gi')

/** Procura cores escritas direto num texto. Devolve as que encontrou, com o número da linha. */
export function findHardcodedColors(text: string): { line: number; match: string }[] {
  const found: { line: number; match: string }[] = []
  text.split('\n').forEach((content, index) => {
    for (const pattern of [HEX_COLOR, FUNCTION_COLOR]) {
      for (const match of content.matchAll(pattern)) {
        found.push({ line: index + 1, match: match[0] })
      }
    }
  })
  return found
}
