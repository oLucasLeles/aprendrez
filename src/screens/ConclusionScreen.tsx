import { useNavigate, useParams } from 'react-router'
import Board from '../components/Board'
import { formatMoveList } from '../chess/notation'
import { getCharacteristicFen } from '../chess/openingPosition'
import { getMainLineMoves } from '../chess/openingTree'
import { getOpening } from '../content/openings'
import { getNextOpening } from '../content/trail'
import NotFoundScreen from './NotFoundScreen'

// Tela de resumo da abertura (SPEC 10.3): aparece ao terminar o Desafio.
// Não marca nada como "concluído": a exploração é livre.
// Mostra a posição final da linha principal, a ideia da abertura e a linha em notação.
function ConclusionScreen() {
  const { id } = useParams()
  const navigate = useNavigate()
  const opening = getOpening(id)
  if (!opening) return <NotFoundScreen />

  const next = getNextOpening(opening.id)
  const mainLine = formatMoveList(getMainLineMoves(opening), 'white')

  return (
    <main className="grid page">
      <title>{`Resumo: ${opening.name} · Aprendrez`}</title>

      <div className="conclusion-board">
        {/* Tabuleiro só para olhar, na posição final, com o lado da pessoa embaixo */}
        <Board fen={getCharacteristicFen(opening)} orientation={opening.color} />
      </div>

      <div className="conclusion-text">
        <h1>Fim do Desafio</h1>
        <p>Você jogou a {opening.name} do começo ao fim, sem ajuda.</p>

        <h2>A ideia</h2>
        <p>{opening.idea}</p>

        <h2>A linha principal</h2>
        <p className="conclusion-moves" aria-label="Linha principal em notação">
          {mainLine}
        </p>

        <div className="conclusion-actions">
          {next && (
            <button type="button" className="button-primary" onClick={() => navigate(`/abertura/${next.id}`)}>
              Próxima abertura
            </button>
          )}
          <button type="button" className="button-secondary" onClick={() => navigate('/')}>
            Voltar à trilha
          </button>
        </div>
        {next && <p className="conclusion-next">Em seguida: {next.name}</p>}
      </div>
    </main>
  )
}

export default ConclusionScreen
