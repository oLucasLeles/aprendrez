import type { RandomSource } from './lessonEngine'

/**
 * Lê o parâmetro de teste `?acaso=0.99` do endereço e devolve uma fonte de acaso fixa.
 * Serve só para os testes de ponta a ponta do Desafio escolherem sempre o mesmo galho:
 * 0 escolhe o primeiro galho (a linha principal) e um valor perto de 1 escolhe o último.
 * Valores que não são números entre 0 e 1 são ignorados (devolve `undefined`, e o
 * Desafio usa o acaso de verdade). Quem chama só deve usar isto no servidor de desenvolvimento.
 */
export function parseTestRandom(value: string | null): RandomSource | undefined {
  if (value === null || value.trim() === '') return undefined
  const number = Number(value)
  if (!Number.isFinite(number) || number < 0 || number > 1) return undefined
  return () => number
}
