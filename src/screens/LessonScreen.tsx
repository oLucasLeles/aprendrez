import { useState } from 'react'
import { Link, useParams } from 'react-router'
import Board from '../components/Board'
import { getOpening } from '../content/openings'
import { formatMoveList, toPortugueseSan } from '../chess/notation'
import { COLOR_NAMES, getCharacteristicFen, LEVEL_NAMES } from '../chess/openingPosition'
import { getMainLine, getMainLineMoves } from '../chess/openingTree'
import { clampStep, getWatchView } from '../chess/watchLine'
import NotFoundScreen from './NotFoundScreen'

// As etapas da lição, na ordem da SPEC (seção 6). Por enquanto só Conhecer e
// Assistir têm conteúdo; as outras entram nas próximas funcionalidades.
const STAGES = ['Conhecer', 'Assistir', 'Praticar com guia', 'Praticar sozinho', 'Variações', 'Desafio']

// Tela da Lição de uma abertura. O endereço é /abertura/:id, e o ":id"
// (por exemplo, "italiana") diz qual abertura abrir. Se não existir, mostra "não encontrada".
// Desktop: tabuleiro à esquerda (7 colunas) e painel à direita (5 colunas).
// Celular: tabuleiro em cima e painel embaixo (CSS em src/index.css).
function LessonScreen() {
  const { id } = useParams()
  const opening = getOpening(id)

  // A etapa atual e, na etapa Assistir, quantos lances da linha já foram mostrados.
  const [stageIndex, setStageIndex] = useState(0)
  const [watchStep, setWatchStep] = useState(0)

  if (!opening) return <NotFoundScreen />

  const mainLine = getMainLineMoves(opening)
  const line = getMainLine(opening)
  const watching = stageIndex === 1
  const watchView = getWatchView(line, watchStep, opening.color)

  // Etapa 1 · Conhecer (SPEC 6): tabuleiro estático na posição característica.
  // Etapa 2 · Assistir: a posição depois dos lances mostrados até agora.
  // Nas duas, o tabuleiro é só para olhar (sem `playerColor`, não aceita lances).
  const boardFen = watching ? watchView.fen : getCharacteristicFen(opening)
  const boardLastMove = watching ? watchView.lastMove : null

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
        <Board fen={boardFen} orientation={opening.color} lastMove={boardLastMove} />
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

        {stageIndex === 0 && (
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
        )}

        {watching && (
          <div className="lesson-text" aria-live="polite">
            <h2>Assistir</h2>
            <p className="lesson-hint">
              Lance {watchStep} de {line.length}
            </p>
            <p className="lesson-narration">{watchView.narration}</p>
          </div>
        )}

        {stageIndex > 1 && (
          <div className="lesson-text">
            <h2>{STAGES[stageIndex]}</h2>
            <p className="lesson-hint">Esta etapa chega nas próximas funcionalidades.</p>
          </div>
        )}

        <div className="lesson-moves">
          <h3>Lances</h3>
          {watching ? (
            <p className="lesson-moves-list" aria-label="Lista de lances">
              {watchView.shownMoves.length === 0 && 'Nenhum lance ainda.'}
              {watchView.shownMoves.map((san, index) => (
                <span key={index}>
                  {index % 2 === 0 && `${index / 2 + 1}. `}
                  <span
                    className={index === watchStep - 1 ? 'lesson-move-current' : undefined}
                    aria-current={index === watchStep - 1 ? 'step' : undefined}
                  >
                    {toPortugueseSan(san)}
                  </span>{' '}
                </span>
              ))}
            </p>
          ) : (
            <p className="lesson-moves-list" aria-label="Lista de lances">
              {formatMoveList(mainLine, 'white')}
            </p>
          )}
        </div>

        <div className="lesson-actions">
          {watching && (
            <>
              <button
                type="button"
                className="button-secondary"
                disabled={watchStep === 0}
                onClick={() => setWatchStep(clampStep(watchStep - 1, line))}
              >
                Anterior
              </button>
              <button
                type="button"
                className="button-secondary"
                disabled={watchStep === line.length}
                onClick={() => setWatchStep(clampStep(watchStep + 1, line))}
              >
                Próximo
              </button>
            </>
          )}
          <button
            type="button"
            className="button-primary"
            disabled={stageIndex === STAGES.length - 1}
            onClick={() => setStageIndex(stageIndex + 1)}
          >
            Continuar
          </button>
        </div>
      </section>
    </main>
  )
}

export default LessonScreen
