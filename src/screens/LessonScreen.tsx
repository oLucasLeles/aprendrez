import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import Board from '../components/Board'
import { getOpening } from '../content/openings'
import {
  createLesson,
  getGuide,
  getStatus,
  playOpponentTurn,
  playUserMove,
  undoOffScriptMove,
  type LessonState,
} from '../chess/lessonEngine'
import { formatMoveList, toPortugueseSan } from '../chess/notation'
import { COLOR_NAMES, getCharacteristicFen, LEVEL_NAMES } from '../chess/openingPosition'
import { getMainLine, getMainLineMoves } from '../chess/openingTree'
import type { ClickMove } from '../chess/squareClick'
import { clampStep, getWatchView } from '../chess/watchLine'
import NotFoundScreen from './NotFoundScreen'

// As etapas da lição, na ordem da SPEC (seção 6). Por enquanto só Conhecer e
// Assistir têm conteúdo; as outras entram nas próximas funcionalidades.
const STAGES = ['Conhecer', 'Assistir', 'Praticar com guia', 'Praticar sozinho', 'Variações', 'Desafio']

// Atraso da resposta do adversário (SPEC 7.5): dá tempo de perceber o que aconteceu.
const OPPONENT_DELAY_MS = 400

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

  // Etapa Praticar com guia: o estado do motor da lição (F15) e a última explicação.
  const [practice, setPractice] = useState<LessonState | null>(null)
  const [correctText, setCorrectText] = useState<string | null>(null)

  const practicing = stageIndex === 2 && practice !== null
  const practiceStatus = practice ? getStatus(practice) : null

  // Quando é a vez do adversário, ele responde sozinho depois de ~400 ms.
  // Se a pessoa sair da etapa antes disso, o temporizador é cancelado.
  useEffect(() => {
    if (!practicing || !practice || practiceStatus !== 'opponent-turn') return
    const timer = setTimeout(() => {
      setPractice(playOpponentTurn(practice, { kind: 'path', line: getMainLine(practice.opening) }))
    }, OPPONENT_DELAY_MS)
    return () => clearTimeout(timer)
  }, [practicing, practice, practiceStatus])

  if (!opening) return <NotFoundScreen />

  const mainLine = getMainLineMoves(opening)
  const line = getMainLine(opening)
  const watching = stageIndex === 1
  const watchView = getWatchView(line, watchStep, opening.color)

  // Etapa 1 · Conhecer (SPEC 6): tabuleiro estático na posição característica.
  // Etapa 2 · Assistir: a posição depois dos lances mostrados até agora.
  // Nas duas, o tabuleiro é só para olhar (sem `playerColor`, não aceita lances).
  // Etapa 3 · Praticar com guia: a posição do motor, com o guia no lance esperado.
  const boardFen = practicing ? practice.fen : watching ? watchView.fen : getCharacteristicFen(opening)
  const boardLastMove = practicing ? practice.lastMove : watching ? watchView.lastMove : null
  const guide = practicing && practiceStatus === 'user-turn' ? getGuide(practice) : null
  const offScript = practicing ? practice.offScript : null

  function goToNextStage() {
    const next = stageIndex + 1
    // Ao entrar na prática, a linha começa do zero.
    if (next === 2) {
      setPractice(createLesson(opening!))
      setCorrectText(null)
    }
    setStageIndex(next)
  }

  function handleUserMove(move: ClickMove) {
    if (!practice) return
    const result = playUserMove(practice, move)
    if (result.kind === 'rejected') return
    setPractice(result.state)
    setCorrectText(result.kind === 'correct' ? result.explanation : null)
  }

  function handleUndo() {
    if (practice) setPractice(undoOffScriptMove(practice))
  }

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
        <Board
          fen={boardFen}
          orientation={opening.color}
          lastMove={boardLastMove}
          guide={guide}
          playerColor={practicing ? opening.color : undefined}
          onMove={practicing ? handleUserMove : undefined}
        />
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

        {practicing && practice && (
          <div className="lesson-text" aria-live="polite">
            <h2>Praticar com guia</h2>
            {practiceStatus === 'user-turn' && (
              <p className="lesson-hint">Sua vez: mova a peça marcada até a casa da seta.</p>
            )}
            {practiceStatus === 'opponent-turn' && <p className="lesson-hint">O adversário está respondendo…</p>}
            {practiceStatus === 'finished' && (
              <p className="lesson-hint">Você chegou ao fim da linha. Clique em Continuar.</p>
            )}
            {offScript && <p className="lesson-narration">{offScript.message}</p>}
            {!offScript && correctText !== null && (
              <p className="lesson-narration">
                <span aria-hidden="true">✓ </span>
                <strong>Lance correto.</strong> {correctText}
              </p>
            )}
          </div>
        )}

        {stageIndex > 2 && (
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
          ) : practicing && practice ? (
            <p className="lesson-moves-list" aria-label="Lista de lances">
              {practice.moves.length === 0 ? 'Nenhum lance ainda.' : formatMoveList(practice.moves, 'white')}
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
          {offScript ? (
            <button type="button" className="button-primary" onClick={handleUndo}>
              Voltar
            </button>
          ) : (
            <button
              type="button"
              className="button-primary"
              // Na prática, só dá para continuar quando a linha chegou ao fim.
              disabled={stageIndex === STAGES.length - 1 || (practicing && practiceStatus !== 'finished')}
              onClick={goToNextStage}
            >
              Continuar
            </button>
          )}
        </div>
      </section>
    </main>
  )
}

export default LessonScreen
