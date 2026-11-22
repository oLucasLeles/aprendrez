// Lógica pura da seta do guia: calcula o desenho da seta em "unidades de casa"
// (o tabuleiro vai de 0 a 8 nos dois eixos; cada casa mede 1).
//
// Por que não usar a seta da biblioteca: ela sai do CENTRO da casa de origem e passa
// por cima da peça que a pessoa precisa mover. Aqui a seta começa na BORDA da casa de
// origem, no lado para onde a peça vai (como no chess.com), então a peça fica visível.
// O lance do cavalo vira uma seta em "L": primeiro o trecho de 2 casas, depois o de 1.

export type Point = { x: number; y: number }

export type ArrowShape = {
  /** Pontos da haste: do começo (borda da casa de origem) até a base da ponta. */
  shaft: Point[]
  /** Os três cantos da ponta da seta (um triângulo). */
  head: [Point, Point, Point]
}

/** Espessura da haste, em casas. */
export const SHAFT_WIDTH = 0.2
const HEAD_LENGTH = 0.45
const HEAD_WIDTH = 0.6
/** A ponta passa um pouco do centro da casa de destino. */
const TIP_OVERSHOOT = 0.1

/** Centro de uma casa ("e2"), em unidades de casa, com o lado da pessoa embaixo. */
export function squareCenter(square: string, orientation: 'white' | 'black'): Point {
  const file = square.charCodeAt(0) - 'a'.charCodeAt(0) // 0 a 7
  const rank = Number(square[1]) // 1 a 8
  const col = orientation === 'white' ? file : 7 - file
  const row = orientation === 'white' ? 8 - rank : rank - 1
  return { x: col + 0.5, y: row + 0.5 }
}

const sub = (a: Point, b: Point): Point => ({ x: a.x - b.x, y: a.y - b.y })
const add = (a: Point, b: Point): Point => ({ x: a.x + b.x, y: a.y + b.y })
const scale = (a: Point, k: number): Point => ({ x: a.x * k, y: a.y * k })
const unit = (a: Point): Point => scale(a, 1 / Math.hypot(a.x, a.y))

/** Ponto onde a reta que sai do centro da casa na direção `u` cruza a borda da casa. */
function edgePoint(center: Point, u: Point): Point {
  return add(center, scale(u, 0.5 / Math.max(Math.abs(u.x), Math.abs(u.y))))
}

function headAt(tip: Point, u: Point): [Point, Point, Point] {
  const base = sub(tip, scale(u, HEAD_LENGTH))
  const normal = { x: -u.y, y: u.x }
  return [tip, add(base, scale(normal, HEAD_WIDTH / 2)), sub(base, scale(normal, HEAD_WIDTH / 2))]
}

/** Desenho da seta do guia de `from` até `to` (casas como "e2" e "e4"). */
export function getArrowShape(from: string, to: string, orientation: 'white' | 'black'): ArrowShape {
  const a = squareCenter(from, orientation)
  const b = squareCenter(to, orientation)
  const d = sub(b, a)
  const isKnight = Math.abs(d.x) * Math.abs(d.y) === 2 // pulo em "L": 2×1 casas

  if (isKnight) {
    // O canto do "L" fica no fim do trecho mais longo (2 casas).
    const corner = Math.abs(d.y) === 2 ? { x: a.x, y: b.y } : { x: b.x, y: a.y }
    const u1 = unit(sub(corner, a))
    const u2 = unit(sub(b, corner))
    const tip = add(b, scale(u2, TIP_OVERSHOOT))
    return {
      shaft: [edgePoint(a, u1), corner, sub(tip, scale(u2, HEAD_LENGTH))],
      head: headAt(tip, u2),
    }
  }

  const u = unit(d)
  const tip = add(b, scale(u, TIP_OVERSHOOT))
  return { shaft: [edgePoint(a, u), sub(tip, scale(u, HEAD_LENGTH))], head: headAt(tip, u) }
}
