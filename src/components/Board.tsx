import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { Chessboard, defaultArrowOptions } from 'react-chessboard'
import {
  canMovePiece,
  getTargets,
  handleDrop,
  handleSquareClick,
  type ClickMove,
  type PlayerColor,
} from '../chess/squareClick'
import { initialFocusSquare, isArrowKey, moveFocus, squareLabel } from '../chess/keyboard'
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
  /** Mostra as letras (a–h) e os números (1–8) nas bordas. Os mini-tabuleiros da trilha escondem. */
  showNotation?: boolean
}

// Quem pediu "menos movimento" no sistema não vê as peças deslizando (SPEC, seção 9).
function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

// Tabuleiro do Aprendrez. Mostra uma posição (F10) e aceita lances por clique
// (F11), por arrastar (F12) e pelo teclado (F14). As cores das
// casas vêm dos tokens (src/styles/tokens.css), nunca escritas aqui.
function Board({ fen, orientation = 'white', lastMove = null, guide = null, playerColor, onMove, showNotation = true }: BoardProps) {
  const label = `Tabuleiro de xadrez, ${orientation === 'white' ? 'brancas' : 'pretas'} embaixo`
  const interactive = playerColor !== undefined

  // Guardamos a posição junto com a seleção: se a posição mudar (lance feito,
  // adversário respondeu, "Voltar"), a seleção antiga deixa de valer sozinha.
  const [selection, setSelection] = useState<{ fen: string; square: string } | null>(null)
  const selectedSquare = selection && selection.fen === fen ? selection.square : null

  const targets = selectedSquare ? getTargets(fen, selectedSquare, playerColor) : []

  // Teclado (F14): só uma casa fica no caminho do Tab ("foco móvel"); as setas
  // movem o foco entre as casas e Enter/Espaço fazem o mesmo que um clique.
  const [focusSquare, setFocusSquare] = useState(() => initialFocusSquare(orientation))
  const containerRef = useRef<HTMLDivElement>(null)

  // A biblioteca deixa cada peça como um botão que recebe Tab. Com 32 peças isso
  // seria 32 paradas no caminho do teclado, e a peça "roubaria" o Enter/Espaço
  // das casas. Tiramos as peças do caminho do Tab: quem tem foco é sempre a casa (e, no
  // tabuleiro só para olhar, nada).
  useEffect(() => {
    containerRef.current?.querySelectorAll('[aria-roledescription="draggable"]').forEach((el) => {
      el.setAttribute('tabindex', '-1')
      el.removeAttribute('role')
      el.removeAttribute('aria-roledescription')
      el.removeAttribute('aria-describedby')
    })
  })

  function focusOn(square: string) {
    setFocusSquare(square)
    containerRef.current?.querySelector<HTMLElement>(`[data-square="${square}"] [data-keyboard-square]`)?.focus()
  }

  // Um clique (ou Enter/Espaço) numa casa: seleciona a peça, faz o lance ou desfaz a seleção.
  function activateSquare(square: string) {
    const result = handleSquareClick(fen, selectedSquare, square, playerColor)
    setSelection(result.selected ? { fen, square: result.selected } : null)
    if (result.move) onMove?.(result.move)
  }

  function onSquareClick({ square }: { square: string }) {
    if (!interactive) return
    activateSquare(square)
  }

  function onSquareKeyDown(event: KeyboardEvent, square: string) {
    if (isArrowKey(event.key)) {
      event.preventDefault()
      focusOn(moveFocus(square, event.key, orientation))
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault() // o Espaço não pode rolar a página
      activateSquare(square)
    } else if (event.key === 'Escape') {
      setSelection(null)
    }
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

  const squareStyles = getSquareStyles(
    lastMove,
    selectedSquare ? { square: selectedSquare, targets } : null,
    guide,
  )

  // Cada casa vira um botão com nome acessível ("e2, peão branco"). Como este
  // desenho substitui o da biblioteca, aplicamos aqui os estilos das casas.
  function renderSquare({ piece, square, children }: { piece: { pieceType: string } | null; square: string; children?: ReactNode }) {
    const isTarget = targets.some((t) => t.square === square)
    return (
      <div
        role="button"
        data-keyboard-square
        className="board-square"
        tabIndex={square === focusSquare ? 0 : -1}
        aria-label={squareLabel(square, piece?.pieceType) + (isTarget ? ', destino possível' : '')}
        aria-pressed={square === selectedSquare}
        onFocus={() => setFocusSquare(square)}
        onKeyDown={(event) => onSquareKeyDown(event, square)}
        style={{ width: '100%', height: '100%', ...squareStyles[square] }}
      >
        {children}
      </div>
    )
  }

  return (
    <div className="board" role="group" aria-label={label} ref={containerRef}>
      <Chessboard
        options={{
          id: 'aprendrez-board',
          position: fen,
          boardOrientation: orientation,
          allowDragging: interactive,
          showNotation,
          canDragPiece: ({ square }) => (square ? canMovePiece(fen, square, playerColor) : false),
          onPieceDrag,
          onPieceDrop,
          onPieceDragCancel: () => setSelection(null),
          showAnimations: !prefersReducedMotion(),
          animationDurationInMs: 150,
          onSquareClick,
          lightSquareStyle: { backgroundColor: 'var(--color-board-light)' },
          darkSquareStyle: { backgroundColor: 'var(--color-board-dark)' },
          squareStyles,
          squareRenderer: interactive ? renderSquare : undefined,
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
