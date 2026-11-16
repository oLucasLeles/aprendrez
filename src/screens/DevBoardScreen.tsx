import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { Chess } from 'chess.js'
import Board from '../components/Board'
import type { LastMove } from '../components/boardHighlights'
import type { ClickMove } from '../chess/squareClick'

const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

// Página de testes do tabuleiro. SÓ EXISTE no servidor de desenvolvimento
// (veja App.tsx): não vai para o app publicado. Os testes e2e usam esta página
// para ver o tabuleiro em várias situações, escolhidas pelo endereço:
//   /dev/tabuleiro?cor=pretas&de=e2&para=e4&fen=...
//   &jogar=brancas|pretas  -> liga os cliques para essa cor (a página aplica os
//                             lances com o chess.js; não há adversário automático)
function DevBoardScreen() {
  const [params] = useSearchParams()
  const orientation = params.get('cor') === 'pretas' ? 'black' : 'white'
  const play = params.get('jogar')
  const playerColor = play === 'brancas' ? 'white' : play === 'pretas' ? 'black' : undefined
  const from = params.get('de')
  const to = params.get('para')

  const [fen, setFen] = useState(params.get('fen') ?? START_FEN)
  const [lastMove, setLastMove] = useState<LastMove | null>(from && to ? { from, to } : null)
  const [moves, setMoves] = useState<string[]>([])

  function handleMove(move: ClickMove) {
    const chess = new Chess(fen)
    const done = chess.move(move)
    setFen(chess.fen())
    setLastMove({ from: done.from, to: done.to })
    setMoves((list) => [...list, done.san])
  }

  return (
    <main className="grid page">
      <div className="grid-full">
        <title>Teste do tabuleiro · Aprendrez</title>
        <h1>Teste do tabuleiro</h1>
        <Board
          fen={fen}
          orientation={orientation}
          lastMove={lastMove}
          playerColor={playerColor}
          onMove={handleMove}
        />
        <p data-testid="lances-feitos">{moves.join(' ')}</p>
      </div>
    </main>
  )
}

export default DevBoardScreen
