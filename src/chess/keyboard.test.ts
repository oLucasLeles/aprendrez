import { describe, expect, it } from 'vitest'
import { initialFocusSquare, isArrowKey, moveFocus, squareLabel } from './keyboard'

describe('moveFocus', () => {
  it('com as brancas embaixo, as setas seguem o que se vê na tela', () => {
    expect(moveFocus('e2', 'ArrowUp', 'white')).toBe('e3')
    expect(moveFocus('e2', 'ArrowDown', 'white')).toBe('e1')
    expect(moveFocus('e2', 'ArrowRight', 'white')).toBe('f2')
    expect(moveFocus('e2', 'ArrowLeft', 'white')).toBe('d2')
  })

  it('com as pretas embaixo (tabuleiro invertido), tudo se inverte', () => {
    expect(moveFocus('e7', 'ArrowUp', 'black')).toBe('e6')
    expect(moveFocus('e7', 'ArrowDown', 'black')).toBe('e8')
    expect(moveFocus('e7', 'ArrowRight', 'black')).toBe('d7')
    expect(moveFocus('e7', 'ArrowLeft', 'black')).toBe('f7')
  })

  it('na borda do tabuleiro o foco fica onde está', () => {
    expect(moveFocus('a1', 'ArrowLeft', 'white')).toBe('a1')
    expect(moveFocus('a1', 'ArrowDown', 'white')).toBe('a1')
    expect(moveFocus('h8', 'ArrowRight', 'white')).toBe('h8')
    expect(moveFocus('h8', 'ArrowUp', 'white')).toBe('h8')
    expect(moveFocus('h8', 'ArrowLeft', 'black')).toBe('h8')
    expect(moveFocus('a1', 'ArrowUp', 'black')).toBe('a1')
  })
})

describe('isArrowKey', () => {
  it('reconhece só as quatro setas', () => {
    expect(isArrowKey('ArrowUp')).toBe(true)
    expect(isArrowKey('Enter')).toBe(false)
    expect(isArrowKey('a')).toBe(false)
  })
})

describe('initialFocusSquare', () => {
  it('começa numa casa de peão da frente, do lado de quem joga', () => {
    expect(initialFocusSquare('white')).toBe('e2')
    expect(initialFocusSquare('black')).toBe('e7')
  })
})

describe('squareLabel', () => {
  it('diz a casa e a peça, em português', () => {
    expect(squareLabel('e2', 'wP')).toBe('e2, peão branco')
    expect(squareLabel('g8', 'bN')).toBe('g8, cavalo preto')
    expect(squareLabel('d1', 'wQ')).toBe('d1, dama branca')
    expect(squareLabel('a8', 'bR')).toBe('a8, torre preta')
    expect(squareLabel('c1', 'wB')).toBe('c1, bispo branco')
    expect(squareLabel('e8', 'bK')).toBe('e8, rei preto')
  })

  it('casa sem peça é "vazia"', () => {
    expect(squareLabel('e4')).toBe('e4, vazia')
    expect(squareLabel('e4', null)).toBe('e4, vazia')
  })
})
