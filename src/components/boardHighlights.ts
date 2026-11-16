// Lógica pura do tabuleiro: monta os estilos das casas destacadas.
// Fica separada do componente para ser testada sem abrir um navegador.
import type { CSSProperties } from 'react'

export type LastMove = { from: string; to: string }

// O último lance ganha um contorno escuro por dentro da casa. Usei contorno (e
// não só uma cor de fundo) porque ele aparece bem tanto na casa clara quanto na
// escura, e porque a SPEC pede que nada dependa só de cor.
const lastMoveStyle: CSSProperties = {
  boxShadow: 'inset 0 0 0 4px var(--color-board-last-move)',
}

export function getSquareStyles(lastMove?: LastMove | null): Record<string, CSSProperties> {
  if (!lastMove) return {}
  return {
    [lastMove.from]: lastMoveStyle,
    [lastMove.to]: lastMoveStyle,
  }
}
