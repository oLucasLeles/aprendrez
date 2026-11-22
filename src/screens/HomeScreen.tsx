import { useState } from 'react'
import { Link } from 'react-router'
import Board from '../components/Board'
import { COLOR_NAMES, getCharacteristicFen, getIdeaSummary, LEVEL_NAMES } from '../chess/openingPosition'
import type { Opening, OpeningLevel } from '../chess/openingTree'
import { trailOpenings } from '../content/trail'

// Tela de Início (SPEC 10.1): o nome do app e a trilha de aberturas agrupada por nível.
// A exploração é livre: não existe "concluída" nem "em andamento" (decisão do dono do projeto).
// Aberturas ainda sem conteúdo não aparecem.

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

function OpeningCard({ opening }: { opening: Opening }) {
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
        </p>
        <p className="trail-card-idea">{getIdeaSummary(opening)}</p>
      </div>
    </li>
  )
}

function HomeScreen() {
  const [filter, setFilter] = useState<ColorFilter>('all')
  // O botão principal leva à primeira abertura da trilha (a mais fácil). Dali, a pessoa vai aonde quiser.
  const firstOpening = trailOpenings[0]

  return (
    <main className="grid page">
      <title>Aprendrez</title>
      <header className="grid-full trail-header">
        <h1>Aprendrez</h1>
        <p className="trail-tagline">Aprenda aberturas de xadrez jogando.</p>
        {/* Botão principal: é um link (leva a outra tela) com a aparência do botão de destaque */}
        {firstOpening && (
          <Link className="button-primary trail-continue" to={`/abertura/${firstOpening.id}`}>
            Começar
          </Link>
        )}
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
                <OpeningCard key={opening.id} opening={opening} />
              ))}
            </ul>
          </section>
        )
      })}

    </main>
  )
}

export default HomeScreen
