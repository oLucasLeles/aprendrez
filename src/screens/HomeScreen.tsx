import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import Board from '../components/Board'
import { COLOR_NAMES, getCharacteristicFen, getIdeaSummary, LEVEL_NAMES } from '../chess/openingPosition'
import type { Opening, OpeningLevel } from '../chess/openingTree'
import { trailOpenings } from '../content/trail'
import { getOpeningStatus, loadProgress, type OpeningStatus } from '../progress/progress'

// Tela de Início (SPEC 10.1): o nome do app, a trilha de aberturas agrupada por nível
// e o indicador geral de progresso. Aberturas ainda sem conteúdo não aparecem.

const STATUS_NAMES: Record<OpeningStatus, string> = {
  'not-started': 'Não iniciada',
  'in-progress': 'Em andamento',
  completed: 'Concluída',
}

const LEVELS: OpeningLevel[] = [1, 2, 3]

// Filtro por cor (SPEC 10.1): Todas · Brancas · Pretas.
type ColorFilter = 'all' | Opening['color']

const FILTERS: { value: ColorFilter; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'white', label: 'Brancas' },
  { value: 'black', label: 'Pretas' },
]

// Ícone da cor: círculo vazio para as brancas e cheio para as pretas (sempre junto do texto).
function ColorIcon({ color }: { color: Opening['color'] }) {
  return (
    <svg className="trail-color-icon" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
      <circle cx="6" cy="6" r="5" fill={color === 'black' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function OpeningCard({ opening, status }: { opening: Opening; status: OpeningStatus }) {
  return (
    <li className="trail-card">
      <div className="trail-card-board">
        {/* Mini-tabuleiro só para olhar, na posição característica */}
        <Board fen={getCharacteristicFen(opening)} orientation={opening.color} showNotation={false} />
      </div>
      <div className="trail-card-text">
        <h3 className="trail-card-title">
          <Link to={`/abertura/${opening.id}`}>{opening.name}</Link>
        </h3>
        <p className="trail-card-meta">
          <span className="trail-color">
            <ColorIcon color={opening.color} />
            {COLOR_NAMES[opening.color]}
          </span>
          <span className="trail-status" data-status={status}>
            {STATUS_NAMES[status]}
          </span>
        </p>
        <p className="trail-card-idea">{getIdeaSummary(opening)}</p>
      </div>
    </li>
  )
}

function HomeScreen() {
  const [filter, setFilter] = useState<ColorFilter>('all')
  // O progresso é lido uma vez ao abrir a tela.
  const progress = useMemo(() => loadProgress(), [])
  const statuses = new Map(trailOpenings.map((opening) => [opening.id, getOpeningStatus(progress, opening.id)]))
  const completedCount = [...statuses.values()].filter((status) => status === 'completed').length

  return (
    <main className="grid page">
      <title>Aprendrez</title>
      <header className="grid-full trail-header">
        <h1>Aprendrez</h1>
        <p className="trail-tagline">Aprenda aberturas de xadrez jogando.</p>
        <p className="trail-progress">
          {completedCount} de {trailOpenings.length} {trailOpenings.length === 1 ? 'abertura concluída' : 'aberturas concluídas'}
        </p>
      </header>

      {/* Grupo de botões: o botão escolhido é anunciado como "pressionado" (aria-pressed) e também ganha ✓ */}
      <div className="grid-full trail-filter" role="group" aria-label="Filtrar por cor">
        {FILTERS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            className="trail-filter-button"
            aria-pressed={filter === value}
            onClick={() => setFilter(value)}
          >
            {filter === value && <span aria-hidden="true">✓ </span>}
            {label}
          </button>
        ))}
      </div>

      {LEVELS.map((level) => {
        const levelOpenings = trailOpenings.filter(
          (opening) => opening.level === level && (filter === 'all' || opening.color === filter),
        )
        if (levelOpenings.length === 0) return null
        return (
          <section key={level} className="grid-full trail-level" aria-labelledby={`nivel-${level}`}>
            <h2 id={`nivel-${level}`}>
              <span className="trail-level-number">{level}</span> {LEVEL_NAMES[level]}
            </h2>
            <ul className="trail-cards">
              {levelOpenings.map((opening) => (
                <OpeningCard key={opening.id} opening={opening} status={statuses.get(opening.id)!} />
              ))}
            </ul>
          </section>
        )
      })}
    </main>
  )
}

export default HomeScreen
