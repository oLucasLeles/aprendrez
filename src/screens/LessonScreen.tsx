import { Link, useParams } from 'react-router'
import Board from '../components/Board'
import { getOpening } from '../content/openings'
import { formatMoveList } from '../chess/notation'
import { COLOR_NAMES, getCharacteristicFen, LEVEL_NAMES } from '../chess/openingPosition'
import { getMainLineMoves } from '../chess/openingTree'
import NotFoundScreen from './NotFoundScreen'

// As etapas da lição, na ordem da SPEC (seção 6). Por enquanto só a primeira
// (Conhecer) tem conteúdo; as outras entram nas próximas funcionalidades.
const STAGES = ['Conhecer', 'Assistir', 'Praticar com guia', 'Praticar sozinho', 'Variações', 'Desafio']

// Tela da Lição de uma abertura. O endereço é /abertura/:id, e o ":id"
// (por exemplo, "italiana") diz qual abertura abrir. Se não existir, mostra "não encontrada".
// Desktop: tabuleiro à esquerda (7 colunas) e painel à direita (5 colunas).
// Celular: tabuleiro em cima e painel embaixo (CSS em src/index.css).
function LessonScreen() {
  const { id } = useParams()
  const opening = getOpening(id)

  if (!opening) return <NotFoundScreen />

  // Etapa 1 · Conhecer (SPEC 6): tabuleiro estático na posição característica
  // (sem `playerColor`, o tabuleiro é só para olhar e não aceita lances).
  const stageIndex = 0
  const mainLine = getMainLineMoves(opening)

  return (
    <main className="grid page lesson">
      <title>{`${opening.name} · Aprendrez`}</title>

      <div className="grid-full lesson-header">
        <p>
          <Link to="/">Voltar à trilha</Link>
        </p>
        <h1>Lição</h1>
        <p>Abertura: {opening.name}</p>
      </div>

      <div className="lesson-board">
        <Board fen={getCharacteristicFen(opening)} orientation={opening.color} />
      </div>

      <section className="lesson-panel" aria-label="Painel da lição">
        <nav aria-label="Etapas da lição">
          <ol className="lesson-stages">
            {STAGES.map((stage, index) => (
              <li key={stage} aria-current={index === stageIndex ? 'step' : undefined}>
                {stage}
              </li>
            ))}
          </ol>
        </nav>

        <div className="lesson-text" aria-live="polite">
          <h2>Conhecer</h2>
          <dl className="lesson-facts">
            <div>
              <dt>Nome</dt>
              <dd>{opening.name}</dd>
            </div>
            <div>
              <dt>Você joga de</dt>
              <dd>{COLOR_NAMES[opening.color]}</dd>
            </div>
            <div>
              <dt>Nível</dt>
              <dd>
                {opening.level} · {LEVEL_NAMES[opening.level]}
              </dd>
            </div>
          </dl>
          <h3>A ideia</h3>
          <p>{opening.idea}</p>
          <h3>Ideias-chave</h3>
          <ul className="lesson-key-ideas">
            {opening.keyIdeas.map((keyIdea) => (
              <li key={keyIdea}>{keyIdea}</li>
            ))}
          </ul>
          <p className="lesson-hint">O tabuleiro mostra a posição que você vai alcançar no fim da linha.</p>
        </div>

        <div className="lesson-moves">
          <h3>Lances</h3>
          <p className="lesson-moves-list" aria-label="Lista de lances">
            {formatMoveList(mainLine, 'white')}
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
