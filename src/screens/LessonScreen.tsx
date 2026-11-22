import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'
import Board from '../components/Board'
import BoardText from '../components/BoardText'
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
import { getMainLine, getMainLineMoves, getVariations, type OpeningNode } from '../chess/openingTree'
import type { ClickMove } from '../chess/squareClick'
import {
  getDeviationStep,
  getVariationQuestion,
  nextVariationPosition,
  VARIATION_PHASE_LABELS,
  type VariationPosition,
} from '../chess/variationStage'
import { parseTestRandom } from '../chess/testRandom'
import {
  CHALLENGE_STAGE,
  getInnerAction,
  getNeighbourStages,
  isStageDone,
  STAGES,
  VARIATIONS_STAGE,
  type InnerAction,
  type StageMoment,
} from '../chess/stageNavigation'
import { clampStep, getWatchView } from '../chess/watchLine'
import NotFoundScreen from './NotFoundScreen'

// Em quais etapas existe uma partida em andamento (o estado do motor da lição).
function isPracticeStage(stage: number): boolean {
  return stage === 2 || stage === 3 || stage === CHALLENGE_STAGE
}

// Atraso da resposta do adversário (SPEC 7.5): dá tempo de perceber o que aconteceu.
const OPPONENT_DELAY_MS = 400

// Tela da Lição de uma abertura. O endereço é /abertura/:id, e o ":id"
// (por exemplo, "italiana") diz qual abertura abrir. Se não existir, mostra "não encontrada".
// Desktop: tabuleiro à esquerda (7 colunas) e painel à direita (5 colunas).
// Celular: tabuleiro em cima e painel embaixo (CSS em src/index.css).
function LessonScreen() {
  const { id } = useParams()
  const opening = getOpening(id)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  // Só no servidor de desenvolvimento: `?acaso=0.99` fixa o sorteio do Desafio, para os testes
  // de ponta a ponta saberem qual galho virá. No app publicado o parâmetro é ignorado.
  const challengeRandom = import.meta.env.DEV ? parseTestRandom(searchParams.get('acaso')) : undefined
  // Também só no desenvolvimento: `?etapa=desafio` abre a lição direto no Desafio, para o teste
  // não precisar jogar todas as etapas antes (cada uma leva vários segundos).
  const startAtChallenge = import.meta.env.DEV && searchParams.get('etapa') === 'desafio'

  // A exploração é livre: nada é salvo e todas as etapas ficam abertas o tempo todo.
  // A lição sempre começa em "Conhecer"; com `?etapa=desafio` (só no desenvolvimento), no Desafio.
  const [initialStage] = useState(() => (startAtChallenge ? CHALLENGE_STAGE : 0))

  // A etapa atual e, na etapa Assistir, quantos lances da linha já foram mostrados.
  const [stageIndex, setStageIndex] = useState(initialStage)
  const [watchStep, setWatchStep] = useState(() => {
    // Ao abrir direto nas Variações, o "Assistir" começa logo antes do desvio da primeira.
    const first = opening && initialStage === VARIATIONS_STAGE ? getVariations(opening)[0] : undefined
    return first ? getDeviationStep(first) : 0
  })

  // Etapas de prática (com guia e sozinho): o estado do motor da lição (F15) e a última explicação.
  const [practice, setPractice] = useState<LessonState | null>(() =>
    opening && isPracticeStage(initialStage) ? createLesson(opening) : null,
  )
  const [correctText, setCorrectText] = useState<string | null>(null)
  // "Ver dica" (etapa sem guia): a posição (FEN) em que a pessoa pediu para ver o guia.
  // Quando a posição muda, o guia some sozinho, sem precisar limpar nada.
  const [peekFen, setPeekFen] = useState<string | null>(null)
  // Casa citada no texto que está sob o mouse (ex.: "e4"): fica destacada no tabuleiro.
  const [hoverSquare, setHoverSquare] = useState<string | null>(null)
  // A linha que o adversário segue na prática: a principal ou a de uma variação.
  const [practiceLine, setPracticeLine] = useState<OpeningNode[]>(() =>
    opening && isPracticeStage(initialStage) ? getMainLine(opening) : [],
  )
  // Etapa Variações: qual variação e em qual passo dela (assistir, com guia, sozinho).
  const [variationPos, setVariationPos] = useState<VariationPosition>({ index: 0, phase: 'watch' })

  const inVariations = stageIndex === VARIATIONS_STAGE
  const guidedStage = stageIndex === 2 || (inVariations && variationPos.phase === 'guided')
  // O Desafio é uma prática sem guia (como "Praticar sozinho"), mas o adversário sorteia os galhos.
  const challengeStage = stageIndex === CHALLENGE_STAGE
  const soloStage = stageIndex === 3 || challengeStage || (inVariations && variationPos.phase === 'solo')
  const practicing = (guidedStage || soloStage) && practice !== null
  const practiceStatus = practice ? getStatus(practice) : null

  // Quando é a vez do adversário, ele responde sozinho depois de ~400 ms.
  // Se a pessoa sair da etapa antes disso, o temporizador é cancelado.
  useEffect(() => {
    if (!practicing || !practice || practiceStatus !== 'opponent-turn') return
    const timer = setTimeout(() => {
      const mode = challengeStage
        ? ({ kind: 'challenge', random: challengeRandom } as const)
        : ({ kind: 'path', line: practiceLine } as const)
      setPractice(playOpponentTurn(practice, mode))
    }, OPPONENT_DELAY_MS)
    return () => clearTimeout(timer)
  }, [practicing, practice, practiceStatus, practiceLine, challengeStage, challengeRandom])

  if (!opening) return <NotFoundScreen />

  const mainLine = getMainLineMoves(opening)
  const line = getMainLine(opening)
  const variations = getVariations(opening)
  const variation = inVariations ? (variations[variationPos.index] ?? null) : null
  const watching = stageIndex === 1 || (inVariations && variationPos.phase === 'watch')
  // Na etapa Variações, assiste-se à linha da variação; nas outras, à linha principal.
  const watchLine = variation ? variation.line : line
  const watchView = getWatchView(watchLine, watchStep, opening.color)
  const atDeviation = variation !== null && watchStep === getDeviationStep(variation)

  // Etapa 1 · Conhecer (SPEC 6): tabuleiro estático na posição característica.
  // Etapa 2 · Assistir: a posição depois dos lances mostrados até agora.
  // Nas duas, o tabuleiro é só para olhar (sem `playerColor`, não aceita lances).
  // Etapa 3 · Praticar com guia: a posição do motor, com o guia no lance esperado.
  const boardFen = practicing ? practice.fen : watching ? watchView.fen : getCharacteristicFen(opening)
  const boardLastMove = practicing ? practice.lastMove : watching ? watchView.lastMove : null
  // Com guia: sempre visível. Sozinho: só depois de "Ver dica", e só para o lance atual.
  const showGuide = practicing && practiceStatus === 'user-turn' && (guidedStage || peekFen === practice.fen)
  const guide = showGuide ? getGuide(practice) : null
  const offScript = practicing ? practice.offScript : null

  // Começa uma prática do zero, com o adversário seguindo a linha dada.
  function startPractice(lineToFollow: OpeningNode[]) {
    setPractice(createLesson(opening!))
    setPracticeLine(lineToFollow)
    setCorrectText(null)
    setPeekFen(null)
  }

  // Mostra um passo da etapa Variações. O "Assistir" começa logo antes do desvio.
  function enterVariationPosition(position: VariationPosition) {
    const target = variations[position.index]
    setVariationPos(position)
    if (position.phase === 'watch') setWatchStep(getDeviationStep(target))
    else startPractice(target.line)
  }

  // Entra numa etapa, sempre desde o começo dela. Serve para o indicador de etapas
  // e para os botões "Etapa anterior" / "Próxima etapa" do rodapé do painel.
  function enterStage(target: number) {
    if (target === 1) setWatchStep(0)
    // Ao entrar numa etapa de prática, a linha principal começa do zero.
    if (target === 2 || target === 3 || target === CHALLENGE_STAGE) startPractice(line)
    if (target === VARIATIONS_STAGE) {
      if (variations.length === 0) {
        // Conteúdo sem variações (o validador não deixa, mas não travamos): pula a etapa.
        startPractice(line)
        target = CHALLENGE_STAGE
      } else {
        enterVariationPosition({ index: 0, phase: 'watch' })
      }
    }
    setStageIndex(target)
  }

  // A ação principal, sempre DENTRO da etapa atual (veja src/chess/stageNavigation.ts).
  function runInnerAction(action: InnerAction) {
    if (action.kind === 'next-move') setWatchStep(clampStep(watchStep + 1, watchLine))
    else if (action.kind === 'undo') handleUndo()
    else if (action.kind === 'summary') finishChallenge()
    else {
      // Passos da etapa Variações: com guia, sozinho, próxima variação.
      const next = nextVariationPosition(variationPos, variations.length)
      if (next) enterVariationPosition(next)
    }
  }

  // "Recomeçar": volta a etapa atual para o primeiro lance (na prática, a partida recomeça).
  function restartLine() {
    if (watching) setWatchStep(variation ? getDeviationStep(variation) : 0)
    else if (practicing) startPractice(challengeStage ? line : practiceLine)
  }

  // No fim do Desafio, a tela de resumo da abertura.
  function finishChallenge() {
    navigate(`/abertura/${opening!.id}/conclusao`)
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

  const lastVariation = variationPos.index === variations.length - 1
  const variationPhase = inVariations ? variationPos.phase : undefined
  const moment: StageMoment =
    stageIndex === 0
      ? { kind: 'intro' }
      : watching
        ? { kind: 'watch', atEnd: watchStep === watchLine.length, variationPhase, lastVariation }
        : {
            kind: 'practice',
            finished: practiceStatus === 'finished',
            offScript: offScript !== null,
            variationPhase,
            lastVariation,
            challenge: challengeStage,
          }
  const innerAction = getInnerAction(moment)
  const stageDone = isStageDone(moment)
  const neighbours = getNeighbourStages(stageIndex)

  return (
    <main className="grid page lesson">
      <title>{`${opening.name} · Aprendrez`}</title>

      <div className="grid-full lesson-header">
        {/* Botão "Voltar": leva à trilha. O nome completo fica para os leitores de tela. */}
        <Link to="/" className="button-secondary button-with-icon lesson-back" aria-label="Voltar à trilha">
          <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" className="button-icon">
            <path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Voltar
        </Link>
        <h1 className="lesson-title">{opening.name}</h1>
        {/* Indicador de etapas em segmentos (referência: Brilliant). Cada segmento é um botão:
            a exploração é livre, então qualquer etapa abre a qualquer momento. Nada fica "concluído". */}
        <nav className="lesson-stepper" aria-label="Etapas da lição">
          <p className="lesson-step-count">
            Etapa {stageIndex + 1} de {STAGES.length}
          </p>
          <ol className="lesson-stepper-list">
            {STAGES.map((stage, index) => (
              <li key={stage.name}>
                <button
                  type="button"
                  className="lesson-stepper-button"
                  aria-current={index === stageIndex ? 'step' : undefined}
                  aria-label={stage.name}
                  title={stage.name}
                  onClick={() => enterStage(index)}
                >
                  <span className="lesson-stepper-bar" aria-hidden="true" />
                  <span className="lesson-stepper-label" aria-hidden="true">
                    {stage.name}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </nav>
      </div>

      <div className="lesson-board">
        <Board
          fen={boardFen}
          orientation={opening.color}
          lastMove={boardLastMove}
          guide={guide}
          textHoverSquare={hoverSquare}
          playerColor={practicing ? opening.color : undefined}
          onMove={practicing ? handleUserMove : undefined}
        />
      </div>

      <section className="lesson-panel" aria-label="Painel da lição">
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
          <p><BoardText text={opening.idea} onHoverSquare={setHoverSquare} /></p>
          <h3>Ideias-chave</h3>
          <ul className="lesson-key-ideas">
            {opening.keyIdeas.map((keyIdea) => (
              <li key={keyIdea}><BoardText text={keyIdea} onHoverSquare={setHoverSquare} /></li>
            ))}
          </ul>
          <p className="lesson-hint">O tabuleiro mostra a posição que você vai alcançar no fim da linha.</p>
        </div>
        )}

        {watching && (
          <div className="lesson-text" aria-live="polite">
            <h2>{variation ? 'Variações' : 'Assistir'}</h2>
            {variation && (
              <>
                <p className="lesson-hint" data-testid="variacao-atual">
                  Variação {variationPos.index + 1} de {variations.length}: {variation.name} · Assistir
                </p>
                <p className="lesson-question"><BoardText text={getVariationQuestion(variation, opening.color)} onHoverSquare={setHoverSquare} /></p>
              </>
            )}
            <p className="lesson-hint">
              Lance {watchStep} de {watchLine.length}
            </p>
            <p className="lesson-narration">
              {atDeviation
                ? 'Até aqui o jogo é igual ao da linha principal. Aperte "Próximo lance" para ver a resposta diferente.'
                : <BoardText text={watchView.narration} onHoverSquare={setHoverSquare} />}
            </p>
          </div>
        )}

        {practicing && practice && (
          <div className="lesson-text" aria-live="polite">
            <h2>{variation ? 'Variações' : challengeStage ? 'Desafio' : guidedStage ? 'Praticar com guia' : 'Praticar sozinho'}</h2>
            {variation && (
              <>
                <p className="lesson-hint" data-testid="variacao-atual">
                  Variação {variationPos.index + 1} de {variations.length}: {variation.name} ·{' '}
                  {VARIATION_PHASE_LABELS[variationPos.phase]}
                </p>
                <p className="lesson-question"><BoardText text={getVariationQuestion(variation, opening.color)} onHoverSquare={setHoverSquare} /></p>
              </>
            )}
            {practiceStatus === 'user-turn' && guidedStage && (
              <p className="lesson-hint">Sua vez: mova a peça marcada até a casa da seta.</p>
            )}
            {challengeStage && practiceStatus === 'user-turn' && practice.moves.length === 0 && (
              <p className="lesson-hint">
                Uma partida do começo ao fim, sem ajuda. O adversário pode responder de jeitos diferentes: preste atenção
                em cada lance.
              </p>
            )}
            {practiceStatus === 'user-turn' && soloStage && (
              <p className="lesson-hint">Sua vez: jogue o próximo lance da abertura. Se precisar, use "Ver dica".</p>
            )}
            {practiceStatus === 'opponent-turn' && <p className="lesson-hint">O adversário está respondendo…</p>}
            {practiceStatus === 'finished' && (
              <p className="lesson-hint">
                {challengeStage
                  ? 'Você chegou ao fim da linha. Veja o resumo da abertura.'
                  : inVariations
                    ? 'Você chegou ao fim desta variação.'
                    : 'Você chegou ao fim da linha. Jogue de novo ou siga para a próxima etapa.'}
              </p>
            )}
            {offScript && (
              <p className="lesson-narration lesson-offscript">
                {/* Ícone discreto de erro: um círculo com "!", na cor do texto (nunca vermelho). */}
                <svg
                  className="lesson-offscript-icon"
                  data-testid="icone-fora-do-roteiro"
                  viewBox="0 0 16 16"
                  width="16"
                  height="16"
                  aria-hidden="true"
                >
                  <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M8 4v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="8" cy="11.5" r="0.9" fill="currentColor" />
                </svg>
                <span>
                  <strong>Lance fora do roteiro.</strong> <BoardText text={offScript.message} onHoverSquare={setHoverSquare} />
                </span>
              </p>
            )}
            {!offScript && correctText !== null && (
              <p className="lesson-narration">
                <span aria-hidden="true">✓ </span>
                <strong>Lance correto.</strong> <BoardText text={correctText} onHoverSquare={setHoverSquare} />
              </p>
            )}
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
                    <BoardText text={toPortugueseSan(san)} onHoverSquare={setHoverSquare} />
                  </span>{' '}
                </span>
              ))}
            </p>
          ) : practicing && practice ? (
            <p className="lesson-moves-list" aria-label="Lista de lances">
              {practice.moves.length === 0 ? 'Nenhum lance ainda.' : <BoardText text={formatMoveList(practice.moves, 'white')} onHoverSquare={setHoverSquare} />}
            </p>
          ) : (
            <p className="lesson-moves-list" aria-label="Lista de lances">
              <BoardText text={formatMoveList(mainLine, 'white')} onHoverSquare={setHoverSquare} />
            </p>
          )}
        </div>

        {/* Ações DENTRO da etapa. O botão principal (vermelho) nunca troca de etapa. */}
        <div className="lesson-actions">
          {watching && (
            <button
              type="button"
              className="button-secondary"
              disabled={watchStep === 0}
              onClick={() => setWatchStep(clampStep(watchStep - 1, watchLine))}
            >
              Lance anterior
            </button>
          )}
          {soloStage && practicing && practiceStatus === 'user-turn' && !offScript && (
            <button type="button" className="button-secondary" onClick={() => setPeekFen(practice!.fen)}>
              Ver dica
            </button>
          )}
          {innerAction && (
            <button type="button" className="button-primary" onClick={() => runInnerAction(innerAction)}>
              {innerAction.label}
            </button>
          )}
          {stageIndex !== 0 && (
            <button type="button" className="button-tertiary button-with-icon" onClick={restartLine}>
              <RestartIcon />
              {watching ? 'Voltar ao início' : 'Recomeçar a partida'}
            </button>
          )}
        </div>

        {/* Trocar de etapa: controle separado, no rodapé do painel. "Próxima etapa" só ganha o
            destaque do botão principal quando não sobra nada para fazer na etapa atual. */}
        <nav className="lesson-stage-nav" aria-label="Trocar de etapa">
          {neighbours.previous !== null && (
            <button
              type="button"
              className="lesson-stage-nav-button lesson-stage-nav-previous"
              onClick={() => enterStage(neighbours.previous!)}
            >
              <span className="lesson-stage-nav-caption">← Etapa anterior</span>
              <span className="lesson-stage-nav-name">{STAGES[neighbours.previous].name}</span>
            </button>
          )}
          {neighbours.next !== null && (
            <button
              type="button"
              className={`lesson-stage-nav-button lesson-stage-nav-next${stageDone ? ' is-emphasized' : ''}`}
              onClick={() => enterStage(neighbours.next!)}
            >
              <span className="lesson-stage-nav-caption">Próxima etapa →</span>
              <span className="lesson-stage-nav-name">{STAGES[neighbours.next].name}</span>
            </button>
          )}
        </nav>
      </section>
    </main>
  )
}

// Ícone de "recomeçar": uma seta em círculo. Decorativo: o texto do botão já diz o que ele faz.
function RestartIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" className="button-icon">
      <path d="M3 8a5 5 0 1 0 1.5-3.6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M3 2.5v2.5h2.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default LessonScreen
