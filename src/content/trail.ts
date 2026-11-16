// A trilha sugerida (SPEC, seção 5): a ordem das aberturas, da mais fácil para a mais difícil.
// É só uma referência: todas as aberturas ficam abertas desde o início.
//
// Aqui estão os ids de todas as 8 aberturas do catálogo, na ordem da tabela da SPEC.
// Aberturas que ainda não têm conteúdo são simplesmente puladas.
import { openings } from './openings'
import type { Opening } from '../chess/openingTree'

export const TRAIL_ORDER: string[] = [
  'italiana', // 1 · Primeiros passos
  'londres',
  'escandinava',
  'espanhola', // 2 · Construindo repertório
  'caro-kann',
  'gambito-da-dama-recusado',
  'gambito-da-dama', // 3 · Desafio
  'siciliana',
]

/** As aberturas que já têm conteúdo, na ordem da trilha. */
export const trailOpenings: Opening[] = TRAIL_ORDER.flatMap((id) => {
  const opening = openings.find((candidate) => candidate.id === id)
  return opening ? [opening] : []
})

/** A próxima abertura da trilha depois desta, ou `undefined` se esta for a última com conteúdo. */
export function getNextOpening(id: string): Opening | undefined {
  const index = trailOpenings.findIndex((opening) => opening.id === id)
  return index === -1 ? undefined : trailOpenings[index + 1]
}
