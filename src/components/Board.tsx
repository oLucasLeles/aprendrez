import { Chessboard } from 'react-chessboard'
import { getSquareStyles, type LastMove } from './boardHighlights'

type BoardProps = {
  /** Posição no formato FEN (texto que descreve onde cada peça está). */
  fen: string
  /** Cor que fica embaixo: 'white' (brancas) ou 'black' (pretas). */
  orientation?: 'white' | 'black'
  /** Último lance jogado: as duas casas ganham um contorno. */
  lastMove?: LastMove | null
}

// Quem pediu "menos movimento" no sistema não vê as peças deslizando (SPEC, seção 9).
function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

// Tabuleiro do Aprendrez. Por enquanto só mostra uma posição (F10); os lances por
// clique e por arrastar chegam nas próximas funcionalidades. As cores das casas
// vêm dos tokens (src/styles/tokens.css), nunca escritas aqui.
function Board({ fen, orientation = 'white', lastMove = null }: BoardProps) {
  const label = `Tabuleiro de xadrez, ${orientation === 'white' ? 'brancas' : 'pretas'} embaixo`

  return (
    <div className="board" role="group" aria-label={label}>
      <Chessboard
        options={{
          id: 'aprendrez-board',
          position: fen,
          boardOrientation: orientation,
          allowDragging: false,
          showAnimations: !prefersReducedMotion(),
          animationDurationInMs: 150,
          lightSquareStyle: { backgroundColor: 'var(--color-board-light)' },
          darkSquareStyle: { backgroundColor: 'var(--color-board-dark)' },
          squareStyles: getSquareStyles(lastMove),
          boardStyle: { borderRadius: 'var(--radius-sm)' },
          // As letras e números das bordas usam o texto padrão em todas as casas
          lightSquareNotationStyle: { color: 'var(--color-text)' },
          darkSquareNotationStyle: { color: 'var(--color-text)' },
          alphaNotationStyle: { color: 'var(--color-text)', fontSize: 'var(--font-size-sm)' },
          numericNotationStyle: { color: 'var(--color-text)', fontSize: 'var(--font-size-sm)' },
        }}
      />
    </div>
  )
}

export default Board
