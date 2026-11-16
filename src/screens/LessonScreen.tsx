import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'
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
  getFirstIncompleteStage,
  getOpeningProgress,
  getReachedStage,
  loadProgress,
  saveProgress,
  withOpeningCompleted,
  withStageCompleted,
} from '../progress/progress'
import { clampStep, getWatchView } from '../chess/watchLine'
import NotFoundScreen from './NotFoundScreen'

// As etapas da lição, na ordem da SPEC (seção 6).
const STAGES = ['Conhecer', 'Assistir', 'Praticar com guia', 'Praticar sozinho', 'Variações', 'Desafio']
const VARIATIONS_STAGE = 4
const CHALLENGE_STAGE = 5

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

  // O progresso salvo (F28) é lido uma vez, ao abrir a tela. A lição abre na primeira etapa
  // ainda não concluída; com `?etapa=desafio` (só no desenvolvimento), direto no Desafio.
  const [initialStage] = useState(() => {
    if (startAtChallenge) return CHALLENGE_STAGE
    return opening ? getFirstIncompleteStage(getOpeningProgress(loadProgress(), opening.id)) : 0
  })
  const [initialReached] = useState(() => {
    if (startAtChallenge) return CHALLENGE_STAGE
    return opening ? getReachedStage(getOpeningProgress(loadProgress(), opening.id)) : 0
  })

  // Abertura já concluída antes (Desafio feito): todas as etapas aparecem como concluídas.
  const [openingCompleted] = useState(() => (opening ? getOpeningProgress(loadProgress(), opening.id).completed : false))

  // A etapa atual e, na etapa Assistir, quantos lances da linha já foram mostrados.
  const [stageIndex, setStageIndex] = useState(initialStage)
  const [watchStep, setWatchStep] = useState(() => {
    // Ao abrir direto nas Variações, o "Assistir" começa logo antes do desvio da primeira.
    const first = opening && initialStage === VARIATIONS_STAGE ? getVariations(opening)[0] : undefined
    return first ? getDeviationStep(first) : 0
  })
  // A etapa mais avançada que a pessoa já alcançou. As etapas até ela podem ser revisitadas
  // pelo indicador; as que vêm depois ficam desabilitadas.
  const [reachedStage, setReachedStage] = useState(initialReached)

  // Etapas de prática (com guia e sozinho): o estado do motor da lição (F15) e a última explicação.
  const [practice, setPractice] = useState<LessonState | null>(() =>
    opening && isPracticeStage(initialStage) ? createLesson(opening) : null,
  )
  const [correctText, setCorrectText] = useState<string | null>(null)
  // "Ver lance" (etapa sem guia): a posição (FEN) em que a pessoa pediu para ver o guia.
  // Quando a posição muda, o guia some sozinho, sem precisar limpar nada.
  const [peekFen, setPeekFen] = useState<string | null>(null)
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
  // Com guia: sempre visível. Sozinho: só depois de "Ver lance", e só para o lance atual.
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

  // Entra numa etapa, sempre desde o começo dela. Serve tanto para o "Continuar" quanto
  // para os cliques no indicador de etapas.
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
    setReachedStage((reached) => Math.max(reached, target))
  }

  // Salva no navegador que a pessoa concluiu uma etapa. Lê o progresso de novo a cada vez,
  // para não sobrescrever o que outra aba tenha salvo. Se o armazenamento falhar, segue sem salvar.
  function saveStageDone(stage: number) {
    saveProgress(withStageCompleted(loadProgress(), opening!.id, stage))
  }

  function goToNextStage() {
    // Dentro das Variações, "Continuar" anda pelos passos de cada variação.
    if (inVariations) {
      const next = nextVariationPosition(variationPos, variations.length)
      if (next) enterVariationPosition(next)
      else {
        // Última variação concluída: a etapa Variações está feita e o Desafio começa, do zero.
        saveStageDone(stageIndex)
        enterStage(CHALLENGE_STAGE)
      }
      return
    }
    // "Continuar" é o que marca a etapa como concluída (clicar no indicador não marca).
    saveStageDone(stageIndex)
    enterStage(stageIndex + 1)
  }

  // "Reiniciar a linha": recomeça a etapa atual (na prática, a partida volta ao início).
  function restartLine() {
    if (watching) setWatchStep(variation ? getDeviationStep(variation) : 0)
    else if (practicing) startPractice(challengeStage ? line : practiceLine)
  }

  // Concluir o Desafio marca a abertura como concluída e leva à tela de conclusão.
  function finishChallenge() {
    saveProgress(withOpeningCompleted(loadProgress(), opening!.id))
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

  return (
    <main className="grid page lesson">
      <title>{`${opening.name} · Aprendrez`}</title>

      <div className="grid-full lesson-header">
        <p>
          <Link to="/">Voltar à trilha</Link>
        </p>
        {/* O nome da abertura é o título da tela; "Lição" vira uma etiqueta pequena acima dele. */}
        <p className="lesson-eyebrow">Lição de abertura</p>
        <h1 className="lesson-title">{opening.name}</h1>
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
            {STAGES.map((stage, index) => {
              const isCurrent = index === stageIndex
              const isDone = (index < reachedStage || (openingCompleted && index === CHALLENGE_STAGE)) && !isCurrent
              return (
                <li key={stage} aria-current={isCurrent ? 'step' : undefined}>
                  {isCurrent ? (
                    <>
                      {stage}
                      {/* Dentro das Variações, o indicador diz em qual delas a pessoa está. */}
                      {inVariations && ` (${variationPos.index + 1} de ${variations.length})`}
                    </>
                  ) : (
                    // Etapas já alcançadas são botões; as que ainda não foram alcançadas ficam desabilitadas.
                    <button
                      type="button"
                      className="lesson-stage-button"
                      disabled={index > reachedStage}
                      onClick={() => enterStage(index)}
                    >
                      {/* O "✓" marca as etapas concluídas sem depender só de cor. */}
                      {isDone && <span aria-hidden="true">✓ </span>}
                      {stage}
                      {isDone && <span className="visually-hidden"> (concluída)</span>}
                    </button>
                  )}
                </li>
              )
            })}
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
            <h2>{variation ? 'Variações' : 'Assistir'}</h2>
            {variation && (
              <>
                <p className="lesson-hint" data-testid="variacao-atual">
                  Variação {variationPos.index + 1} de {variations.length}: {variation.name} · Assistir
                </p>
                <p className="lesson-question">{getVariationQuestion(variation, opening.color)}</p>
              </>
            )}
            <p className="lesson-hint">
              Lance {watchStep} de {watchLine.length}
            </p>
            <p className="lesson-narration">
              {atDeviation
                ? 'Até aqui o jogo é igual ao da linha principal. Aperte "Próximo" para ver a resposta diferente.'
                : watchView.narration}
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
                <p className="lesson-question">{getVariationQuestion(variation, opening.color)}</p>
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
              <p className="lesson-hint">Sua vez: jogue o próximo lance da abertura. Se precisar, use "Ver lance".</p>
            )}
            {practiceStatus === 'opponent-turn' && <p className="lesson-hint">O adversário está respondendo…</p>}
            {practiceStatus === 'finished' && (
              <p className="lesson-hint">
                {challengeStage
                  ? 'Você chegou ao fim da linha. Clique em Concluir.'
                  : 'Você chegou ao fim da linha. Clique em Continuar.'}
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
                  <strong>Lance fora do roteiro.</strong> {offScript.message}
                </span>
              </p>
            )}
            {!offScript && correctText !== null && (
              <p className="lesson-narration">
                <span aria-hidden="true">✓ </span>
                <strong>Lance correto.</strong> {correctText}
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
                onClick={() => setWatchStep(clampStep(watchStep - 1, watchLine))}
              >
                Anterior
              </button>
              <button
                type="button"
                className="button-secondary"
                disabled={watchStep === watchLine.length}
                onClick={() => setWatchStep(clampStep(watchStep + 1, watchLine))}
              >
                Próximo
              </button>
            </>
          )}
          {soloStage && practicing && practiceStatus === 'user-turn' && !offScript && (
            <button type="button" className="button-secondary" onClick={() => setPeekFen(practice!.fen)}>
              Ver lance
            </button>
          )}
          {stageIndex !== 0 && (
            <button type="button" className="button-secondary" onClick={restartLine}>
              Reiniciar a linha
            </button>
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
              disabled={practicing && practiceStatus !== 'finished'}
              onClick={challengeStage ? finishChallenge : goToNextStage}
            >
              {challengeStage ? 'Concluir' : 'Continuar'}
            </button>
          )}
        </div>
      </section>
    </main>
  )
}

export default LessonScreen
