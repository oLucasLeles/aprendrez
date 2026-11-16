import { Link, useParams } from 'react-router'
import Board from '../components/Board'

// As etapas da lição, na ordem da SPEC (seção 6). Por enquanto o indicador só
// mostra os nomes; tornar cada etapa clicável e funcional vem nas próximas funcionalidades.
const STAGES = ['Conhecer', 'Assistir', 'Praticar com guia', 'Praticar sozinho', 'Variações', 'Desafio']

const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

// Tela da Lição de uma abertura. O endereço é /abertura/:id, e o ":id"
// (por exemplo, "italiana") diz qual abertura abrir.
// Aqui está só o LAYOUT (SPEC 10.2): tabuleiro de um lado e painel do outro.
// O conteúdo de cada etapa entra nas funcionalidades seguintes.
// Desktop: tabuleiro à esquerda (7 colunas) e painel à direita (5 colunas).
// Celular: tabuleiro em cima e painel embaixo (CSS em src/index.css).
function LessonScreen() {
  const { id } = useParams()

  return (
    <main className="grid page lesson">
      <title>Lição · Aprendrez</title>

      <div className="grid-full lesson-header">
        <p>
          <Link to="/">Voltar à trilha</Link>
        </p>
        <h1>Lição</h1>
        <p>Abertura: {id}</p>
      </div>

      <div className="lesson-board">
        <Board fen={START_FEN} />
      </div>

      <section className="lesson-panel" aria-label="Painel da lição">
        <nav aria-label="Etapas da lição">
          <ol className="lesson-stages">
            {STAGES.map((stage, index) => (
              <li key={stage} aria-current={index === 0 ? 'step' : undefined}>
                {stage}
              </li>
            ))}
          </ol>
        </nav>

        <div className="lesson-text" aria-live="polite">
          <h2>Conhecer</h2>
          <p>O texto de cada etapa aparece aqui.</p>
        </div>

        <div className="lesson-moves">
          <h3>Lances</h3>
          <p className="lesson-moves-list" aria-label="Lista de lances">
            Nenhum lance ainda.
          </p>
        </div>

        <div className="lesson-actions">
          <button type="button" className="button-primary">
            Continuar
          </button>
        </div>
      </section>
    </main>
  )
}

export default LessonScreen
