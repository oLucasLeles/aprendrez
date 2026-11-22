// Lógica pura do tabuleiro: monta os estilos das casas destacadas.
// Fica separada do componente para ser testada sem abrir um navegador.
import type { CSSProperties } from 'react'

export type LastMove = { from: string; to: string }

/** Guia de lance (F13): a peça que deve se mover (`from`) e a casa de destino (`to`). */
export type Guide = { from: string; to: string }

/** Uma casa de destino legal. `capture` = há uma peça do adversário nela. */
export type TargetSquare = { square: string; capture: boolean }

/** Peça selecionada e as casas para onde ela pode ir. */
export type Selection = { square: string; targets: TargetSquare[] }

// O último lance ganha um contorno escuro por dentro da casa. Usei contorno (e
// não só uma cor de fundo) porque ele aparece bem tanto na casa clara quanto na
// escura, e porque a SPEC pede que nada dependa só de cor.
const lastMoveStyle: CSSProperties = {
  boxShadow: 'inset 0 0 0 4px var(--color-board-last-move)',
}

// A peça selecionada ganha um contorno na cor de destaque (SPEC: o vermelho
// marca a seleção).
const selectedStyle: CSSProperties = {
  boxShadow: 'inset 0 0 0 4px var(--color-accent)',
}

// Guia de lance: a casa da peça que deve se mover ganha um fundo avermelhado suave
// e um contorno na cor de destaque. A seta até o destino é desenhada pelo Board.
// (A seta e o contorno são formas, então o guia não depende só de cor.)
const guideStyle: CSSProperties = {
  backgroundColor: 'var(--color-accent-soft)',
  boxShadow: 'inset 0 0 0 4px var(--color-accent)',
}

// Casa de destino vazia: uma bolinha no centro. Casa com peça a capturar:
// um anel em volta da casa. São formas diferentes, então não dependem só de cor.
const targetStyle: CSSProperties = {
  backgroundImage: 'radial-gradient(circle, var(--color-accent) 0 18%, transparent 20%)',
}
const captureTargetStyle: CSSProperties = {
  boxShadow: 'inset 0 0 0 4px var(--color-accent)',
  borderRadius: '50%',
}

// Casa citada no texto (a pessoa passou o mouse sobre "e4", "Cf6"…): contorno tracejado, que
// combina com o sublinhado pontilhado do texto. É um contorno (outline), então soma com os
// outros destaques da casa em vez de substituí-los.
const textHoverStyle: CSSProperties = {
  outline: '3px dashed var(--color-accent)',
  outlineOffset: '-3px',
}

export function getSquareStyles(
  lastMove?: LastMove | null,
  selection?: Selection | null,
  guide?: Guide | null,
  textHover?: string | null,
): Record<string, CSSProperties> {
  const styles: Record<string, CSSProperties> = {}
  if (lastMove) {
    styles[lastMove.from] = lastMoveStyle
    styles[lastMove.to] = lastMoveStyle
  }
  if (guide) {
    styles[guide.from] = guideStyle
  }
  if (selection) {
    for (const { square, capture } of selection.targets) {
      styles[square] = capture ? captureTargetStyle : targetStyle
    }
    styles[selection.square] = selectedStyle
  }
  if (textHover) {
    styles[textHover] = { ...styles[textHover], ...textHoverStyle }
  }
  return styles
}
