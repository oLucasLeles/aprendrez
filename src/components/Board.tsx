import { useState } from 'react'
import { Chessboard, defaultArrowOptions } from 'react-chessboard'
import {
  canMovePiece,
  getTargets,
  handleDrop,
  handleSquareClick,
  type ClickMove,
  type PlayerColor,
} from '../chess/squareClick'
import { getSquareStyles, type Guide, type LastMove } from './boardHighlights'

type BoardProps = {
  /** Posição no formato FEN (texto que descreve onde cada peça está). */
  fen: string
  /** Cor que fica embaixo: 'white' (brancas) ou 'black' (pretas). */
  orientation?: 'white' | 'black'
  /** Último lance jogado: as duas casas ganham um contorno. */
  lastMove?: LastMove | null
  /**
   * Guia de lance: destaca a peça que deve se mover e desenha uma seta até a casa
   * de destino, na cor de destaque. Serve para "Praticar com guia" e "Ver lance".
   */
  guide?: Guide | null
  /**
   * Cor da pessoa que joga. Quando existe, o tabuleiro aceita cliques: só as
   * peças dessa cor, na vez dela, podem ser selecionadas. Sem ela, o tabuleiro
   * é só para olhar.
   */
  playerColor?: PlayerColor
  /** Chamado quando a pessoa faz um lance legal, clicando ou arrastando. O pai atualiza o `fen`. */
  onMove?: (move: ClickMove) => void
}

// Quem pediu "menos movimento" no sistema não vê as peças deslizando (SPEC, seção 9).
function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

// Tabuleiro do Aprendrez. Mostra uma posição (F10) e aceita lances por clique
// (F11) e por arrastar (F12); o teclado chega numa próxima funcionalidade. As cores das
// casas vêm dos tokens (src/styles/tokens.css), nunca escritas aqui.
function Board({ fen, orientation = 'white', lastMove = null, guide = null, playerColor, onMove }: BoardProps) {
  const label = `Tabuleiro de xadrez, ${orientation === 'white' ? 'brancas' : 'pretas'} embaixo`
  const interactive = playerColor !== undefined

  // Guardamos a posição junto com a seleção: se a posição mudar (lance feito,
  // adversário respondeu, "Voltar"), a seleção antiga deixa de valer sozinha.
  const [selection, setSelection] = useState<{ fen: string; square: string } | null>(null)
  const selectedSquare = selection && selection.fen === fen ? selection.square : null

  const targets = selectedSquare ? getTargets(fen, selectedSquare, playerColor) : []

  function onSquareClick({ square }: { square: string }) {
    if (!interactive) return
    const result = handleSquareClick(fen, selectedSquare, square, playerColor)
    setSelection(result.selected ? { fen, square: result.selected } : null)
    if (result.move) onMove?.(result.move)
  }

  // Arrastar (SPEC, seção 7.2): ao começar a arrastar, marca os destinos legais;
  // ao soltar, só um lance legal é feito. Devolver false faz a peça voltar à
  // casa de origem, sem mensagem e sem contar como nada.
  function onPieceDrag({ square }: { square: string | null }) {
    if (square) setSelection({ fen, square })
  }

  function onPieceDrop({ sourceSquare, targetSquare }: { sourceSquare: string; targetSquare: string | null }) {
    setSelection(null)
    const move = handleDrop(fen, sourceSquare, targetSquare, playerColor)
    if (!move) return false
    onMove?.(move)
    return true
  }

  return (
    <div className="board" role="group" aria-label={label}>
      <Chessboard
        options={{
          id: 'aprendrez-board',
          position: fen,
          boardOrientation: orientation,
          allowDragging: interactive,
          canDragPiece: ({ square }) => (square ? canMovePiece(fen, square, playerColor) : false),
          onPieceDrag,
          onPieceDrop,
          onPieceDragCancel: () => setSelection(null),
          showAnimations: !prefersReducedMotion(),
          animationDurationInMs: 150,
          onSquareClick,
          lightSquareStyle: { backgroundColor: 'var(--color-board-light)' },
          darkSquareStyle: { backgroundColor: 'var(--color-board-dark)' },
          squareStyles: getSquareStyles(
            lastMove,
            selectedSquare ? { square: selectedSquare, targets } : null,
            guide,
          ),
          // A seta do guia usa o token de destaque (o SVG aceita var() na cor).
          // Desligamos o desenho de setas com o botão direito: não faz parte do app.
          arrows: guide
            ? [{ startSquare: guide.from, endSquare: guide.to, color: 'var(--color-accent)' }]
            : [],
          allowDrawingArrows: false,
          arrowOptions: { ...defaultArrowOptions, opacity: 0.85 },
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
