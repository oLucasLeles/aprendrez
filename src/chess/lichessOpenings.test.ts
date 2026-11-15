// @vitest-environment node
// Testes da leitura da base de aberturas do Lichess.
import { describe, expect, it } from 'vitest'
import {
  findOpeningsByName,
  loadLichessOpenings,
  parseMoves,
  parseOpeningsTsv,
  startsWithNamedOpening,
  startsWithOpening,
} from './lichessOpenings'

const openings = loadLichessOpenings()

describe('parseMoves', () => {
  it('tira os números dos lances', () => {
    expect(parseMoves('1. e4 e5 2. Nf3 Nc6')).toEqual(['e4', 'e5', 'Nf3', 'Nc6'])
  })

  it('aceita uma lista sem números', () => {
    expect(parseMoves('e4 e5 Nf3')).toEqual(['e4', 'e5', 'Nf3'])
  })
})

describe('parseOpeningsTsv', () => {
  it('lê o cabeçalho e as linhas', () => {
    const text = 'eco\tname\tpgn\nA00\tAmar Opening\t1. Nh3\nC50\tItalian Game\t1. e4 e5 2. Nf3 Nc6 3. Bc4\n'
    expect(parseOpeningsTsv(text)).toEqual([
      { eco: 'A00', name: 'Amar Opening', moves: ['Nh3'] },
      { eco: 'C50', name: 'Italian Game', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4'] },
    ])
  })

  it('recusa uma linha incompleta', () => {
    expect(() => parseOpeningsTsv('eco\tname\tpgn\nA00\tSem lances')).toThrow(/inválida/)
  })
})

describe('base do Lichess (arquivos reais)', () => {
  it('carrega milhares de entradas dos cinco arquivos', () => {
    expect(openings.length).toBeGreaterThan(3000)
  })

  it('a busca por "Italian Game: Giuoco Piano" retorna a linha 1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5', () => {
    const found = findOpeningsByName(openings, 'Italian Game: Giuoco Piano')
    expect(found).toHaveLength(1)
    expect(found[0].eco).toBe('C50')
    expect(found[0].moves).toEqual(['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5'])
  })

  it('um nome que não existe devolve lista vazia', () => {
    expect(findOpeningsByName(openings, 'Abertura Inventada')).toEqual([])
  })

  it('a busca exige o nome exato', () => {
    expect(findOpeningsByName(openings, 'italian game: giuoco piano')).toEqual([])
    expect(findOpeningsByName(openings, 'Italian Game: Giuoco')).toEqual([])
  })

  it('nomes repetidos na base devolvem todas as entradas', () => {
    expect(findOpeningsByName(openings, 'Alekhine Defense').length).toBeGreaterThan(1)
  })
})

describe('startsWithOpening / startsWithNamedOpening', () => {
  const italiana = 'Italian Game: Giuoco Piano'

  it('reconhece e4 e5 Nf3 Nc6 Bc4 Bc5 c3 como começando com a entrada', () => {
    const line = ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'c3']
    expect(startsWithNamedOpening(openings, italiana, line)).toBe(true)
    const [entry] = findOpeningsByName(openings, italiana)
    expect(startsWithOpening(line, entry)).toBe(true)
  })

  it('a sequência igual à entrada também conta', () => {
    const line = ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5']
    expect(startsWithNamedOpening(openings, italiana, line)).toBe(true)
  })

  it('e4 e5 Nf3 Nc6 Bb5 não começa com a entrada', () => {
    const line = ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5']
    expect(startsWithNamedOpening(openings, italiana, line)).toBe(false)
  })

  it('uma sequência mais curta que a entrada não conta', () => {
    expect(startsWithNamedOpening(openings, italiana, ['e4', 'e5', 'Nf3'])).toBe(false)
  })

  it('um nome que não existe nunca confere', () => {
    expect(startsWithNamedOpening(openings, 'Abertura Inventada', ['e4'])).toBe(false)
  })
})
