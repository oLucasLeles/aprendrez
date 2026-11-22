// Acha, num texto em português, as referências a casas do tabuleiro ("e4") e a lances
// ("Cf6", "Bxc4", "exd5", "d8=D+"), para a interface sublinhá-las e destacar a casa no
// tabuleiro quando a pessoa passa o mouse. Lógica pura, com testes.

export type TextPart = { text: string; square?: string }

// Um lance em notação portuguesa (ou só uma casa):
//   peça opcional (R, D, T, B, C) com desambiguação e "x" de captura, ou um peão capturando ("ex"),
//   depois a casa de destino (a-h + 1-8), promoção opcional ("=D") e xeque/mate opcional.
// As bordas (\b e o "não seguido de letra/número") evitam pegar pedaços de palavras.
const MOVE_OR_SQUARE = /\b(?:[RDTBC][a-h]?[1-8]?x?|[a-h]x)?([a-h][1-8])(?:=[DTBC])?[+#]?(?![\p{L}\d])/gu

/** Divide o texto em pedaços; os pedaços que citam uma casa trazem a casa em `square`. */
export function splitSquareRefs(text: string): TextPart[] {
  const parts: TextPart[] = []
  let last = 0
  for (const match of text.matchAll(MOVE_OR_SQUARE)) {
    const start = match.index
    if (start > last) parts.push({ text: text.slice(last, start) })
    parts.push({ text: match[0], square: match[1] })
    last = start + match[0].length
  }
  if (last < text.length) parts.push({ text: text.slice(last) })
  return parts
}
