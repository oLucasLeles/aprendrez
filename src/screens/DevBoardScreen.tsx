import { useSearchParams } from 'react-router'
import Board from '../components/Board'

const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

// Página de testes do tabuleiro. SÓ EXISTE no servidor de desenvolvimento
// (veja App.tsx): não vai para o app publicado. Os testes e2e usam esta página
// para ver o tabuleiro em várias situações, escolhidas pelo endereço:
//   /dev/tabuleiro?cor=pretas&de=e2&para=e4&fen=...
function DevBoardScreen() {
  const [params] = useSearchParams()
  const orientation = params.get('cor') === 'pretas' ? 'black' : 'white'
  const from = params.get('de')
  const to = params.get('para')

  return (
    <main className="grid page">
      <div className="grid-full">
        <title>Teste do tabuleiro · Aprendrez</title>
        <h1>Teste do tabuleiro</h1>
        <Board
          fen={params.get('fen') ?? START_FEN}
          orientation={orientation}
          lastMove={from && to ? { from, to } : null}
        />
      </div>
    </main>
  )
}

export default DevBoardScreen
