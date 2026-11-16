import { Link, useParams } from 'react-router'
import { getOpening } from '../content/openings'
import NotFoundScreen from './NotFoundScreen'

// Tela de conclusão da abertura (SPEC 10.3). Por enquanto é só a versão mínima, para o
// Desafio ter para onde levar; a posição final, a ideia e os botões chegam na F27.
function ConclusionScreen() {
  const { id } = useParams()
  const opening = getOpening(id)
  if (!opening) return <NotFoundScreen />

  return (
    <main className="grid page">
      <div className="grid-full">
        <title>{`${opening.name} concluída · Aprendrez`}</title>
        <h1>Abertura concluída</h1>
        <p>Você completou o Desafio da abertura {opening.name}.</p>
        <p>
          <Link to="/">Voltar à trilha</Link>
        </p>
      </div>
    </main>
  )
}

export default ConclusionScreen
