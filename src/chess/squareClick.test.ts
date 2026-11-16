import { describe, expect, it } from 'vitest'
import { getLegalTargets, getTargets, handleSquareClick } from './squareClick'

const START = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
// Peão branco em e7 prestes a promover (rei branco em a1, rei preto em h8)
const PROMOTION = '7k/4P3/8/8/8/8/8/K7 w - - 0 1'

describe('getLegalTargets', () => {
  it('peão de e2 pode ir para e3 e e4', () => {
    expect(getLegalTargets(START, 'e2').sort()).toEqual(['e3', 'e4'])
  })

  it('cavalo de g1 pode ir para f3 e h3', () => {
    expect(getLegalTargets(START, 'g1').sort()).toEqual(['f3', 'h3'])
  })

  it('peça do adversário (fora da vez) não tem destinos', () => {
    expect(getLegalTargets(START, 'e7')).toEqual([])
  })

  it('casa vazia não tem destinos', () => {
    expect(getLegalTargets(START, 'e4')).toEqual([])
  })

  it('respeita a cor da pessoa: nas pretas, peça branca não é selecionável', () => {
    expect(getLegalTargets(START, 'e2', 'black')).toEqual([])
  })

  it('não repete a casa de destino numa promoção', () => {
    expect(getLegalTargets(PROMOTION, 'e7').sort()).toEqual(['e8'])
  })
})

describe('getTargets', () => {
  it('avisa quais destinos são capturas (inclusive en passant)', () => {
    // Brancas: peão em e5; peão preto acabou de jogar d7-d5; cavalo preto em f6
    const fen = '4k3/8/5n2/3pP3/8/8/8/4K3 w - d6 0 1'
    const targets = getTargets(fen, 'e5')
    expect(targets).toContainEqual({ square: 'd6', capture: true }) // en passant
    expect(targets).toContainEqual({ square: 'f6', capture: true })
    expect(targets).toContainEqual({ square: 'e6', capture: false })
  })
})

describe('handleSquareClick', () => {
  it('clicar numa peça própria seleciona', () => {
    expect(handleSquareClick(START, null, 'e2')).toEqual({ selected: 'e2', move: null })
  })

  it('clicar numa casa marcada faz o lance', () => {
    expect(handleSquareClick(START, 'e2', 'e4')).toEqual({
      selected: null,
      move: { from: 'e2', to: 'e4' },
    })
  })

  it('clicar na mesma peça desfaz a seleção', () => {
    expect(handleSquareClick(START, 'e2', 'e2')).toEqual({ selected: null, move: null })
  })

  it('clicar numa casa não marcada desfaz a seleção e não faz lance', () => {
    expect(handleSquareClick(START, 'e2', 'e5')).toEqual({ selected: null, move: null })
    expect(handleSquareClick(START, 'e2', 'a6')).toEqual({ selected: null, move: null })
  })

  it('clicar em peça do adversário não seleciona nada', () => {
    expect(handleSquareClick(START, null, 'e7')).toEqual({ selected: null, move: null })
  })

  it('clicar em peça do adversário com outra selecionada desfaz a seleção', () => {
    expect(handleSquareClick(START, 'e2', 'e7')).toEqual({ selected: null, move: null })
  })

  it('clicar em outra peça própria troca a seleção', () => {
    expect(handleSquareClick(START, 'e2', 'g1')).toEqual({ selected: 'g1', move: null })
  })

  it('a jogada nunca é ilegal: um lance que deixaria o rei em xeque não é marcado', () => {
    // Torre preta em e8 prende a torre branca em e2 contra o rei em e1
    const pinned = '4r2k/8/8/8/8/8/4R3/4K3 w - - 0 1'
    expect(getLegalTargets(pinned, 'e2')).not.toContain('d2')
    expect(handleSquareClick(pinned, 'e2', 'd2')).toEqual({ selected: null, move: null })
  })

  it('promoção por clique vira dama', () => {
    expect(handleSquareClick(PROMOTION, 'e7', 'e8')).toEqual({
      selected: null,
      move: { from: 'e7', to: 'e8', promotion: 'q' },
    })
  })

  it('a pessoa de pretas não mexe nas peças brancas, mesmo na vez delas', () => {
    expect(handleSquareClick(START, null, 'e2', 'black')).toEqual({ selected: null, move: null })
  })
})
