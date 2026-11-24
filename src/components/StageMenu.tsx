import { useEffect, useRef, useState } from 'react'

// Indicador de etapas da lição (desenho do dono do projeto no Figma, 2026-11-23): um anel de
// progresso com "Etapa X de 6" e o nome da etapa, à direita do título. O anel é dividido em 6
// partes; as partes até a etapa atual ficam na cor de destaque (mostra ONDE a pessoa está, não
// o que ela "concluiu"). Clicar abre a lista de etapas: a exploração continua livre.

const RADIUS = 20
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const STROKE = 4 // espessura do anel, em px
// Espaço entre as partes. As pontas são arredondadas e cada ponta cresce meia espessura,
// então somamos a espessura para sobrar uns 4 px visíveis entre uma parte e outra.
const GAP = 4 + STROKE

function ProgressRing({ current, total }: { current: number; total: number }) {
  const part = CIRCUMFERENCE / total
  return (
    <svg className="stage-ring" viewBox="0 0 48 48" width="48" height="48" aria-hidden="true">
      {Array.from({ length: total }, (_, index) => (
        <circle
          key={index}
          cx="24"
          cy="24"
          r={RADIUS}
          fill="none"
          className={index <= current ? 'stage-ring-part is-on' : 'stage-ring-part'}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={`${part - GAP} ${CIRCUMFERENCE - part + GAP}`}
          strokeDashoffset={-index * part}
          transform="rotate(-90 24 24)"
        />
      ))}
    </svg>
  )
}

type StageMenuProps = {
  stages: readonly { name: string }[]
  current: number
  onSelect: (index: number) => void
}

function StageMenu({ stages, current, onSelect }: StageMenuProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLElement>(null)

  // Fecha ao clicar fora ou ao apertar Esc.
  useEffect(() => {
    if (!open) return
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <nav className="lesson-stepper" aria-label="Etapas da lição" ref={rootRef}>
      <button
        type="button"
        className="lesson-stepper-trigger"
        aria-expanded={open}
        aria-controls="lista-de-etapas"
        onClick={() => setOpen((value) => !value)}
      >
        <ProgressRing current={current} total={stages.length} />
        <span className="lesson-stepper-text">
          <span className="lesson-step-count">
            Etapa {current + 1} de {stages.length}
          </span>
          <span className="lesson-step-name">{stages[current].name}</span>
        </span>
      </button>
      {open && (
        <ol className="lesson-stage-menu" id="lista-de-etapas">
          {stages.map((stage, index) => (
            <li key={stage.name}>
              <button
                type="button"
                className="lesson-stage-menu-item"
                aria-current={index === current ? 'step' : undefined}
                onClick={() => {
                  onSelect(index)
                  setOpen(false)
                }}
              >
                <span className="lesson-stage-menu-number" aria-hidden="true">
                  {index + 1}
                </span>
                {stage.name}
              </button>
            </li>
          ))}
        </ol>
      )}
    </nav>
  )
}

export default StageMenu
