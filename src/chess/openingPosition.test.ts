// @vitest-environment node
import { Chess } from 'chess.js'
import { describe, expect, it } from 'vitest'
import { getOpening, openings } from '../content/openings'
import { COLOR_NAMES, getCharacteristicFen, getIdeaSummary, LEVEL_NAMES } from './openingPosition'
import { getMainLineMoves } from './openingTree'

describe('getCharacteristicFen', () => {
  it('é a posição no fim da linha principal da Italiana', () => {
    const italiana = getOpening('italiana')!
    const game = new Chess()
    for (const san of getMainLineMoves(italiana)) game.move(san)
    expect(getCharacteristicFen(italiana)).toBe(game.fen())
  })

  it('na Italiana o bispo branco termina em b3 e o preto em a7', () => {
    const fen = getCharacteristicFen(getOpening('italiana')!)
    const game = new Chess(fen)
    expect(game.get('b3')).toEqual({ type: 'b', color: 'w' })
    expect(game.get('a7')).toEqual({ type: 'b', color: 'b' })
  })
})

describe('catálogo e nomes', () => {
  it('getOpening acha a Italiana e devolve undefined para um id desconhecido', () => {
    expect(getOpening('italiana')?.name).toBe('Italiana (Giuoco Piano)')
    expect(getOpening('nao-existe')).toBeUndefined()
    expect(getOpening(undefined)).toBeUndefined()
  })

  it('o catálogo tem ids únicos', () => {
    const ids = openings.map((opening) => opening.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('nomes de nível e de cor em português', () => {
    expect(LEVEL_NAMES[1]).toBe('Primeiros passos')
    expect(COLOR_NAMES.white).toBe('Brancas')
    expect(COLOR_NAMES.black).toBe('Pretas')
  })
})

describe('getIdeaSummary', () => {
  it('devolve só a primeira frase da ideia', () => {
    const italiana = getOpening('italiana')!
    const resumo = getIdeaSummary(italiana)
    expect(resumo.endsWith('.')).toBe(true)
    expect(resumo.length).toBeLessThan(italiana.idea.length)
    expect(italiana.idea.startsWith(resumo)).toBe(true)
    expect(resumo).not.toContain('. ')
  })

  it('se não há ponto final, devolve o texto inteiro', () => {
    const aberta = { ...getOpening('italiana')!, idea: 'Uma ideia sem ponto' }
    expect(getIdeaSummary(aberta)).toBe('Uma ideia sem ponto')
  })
})
