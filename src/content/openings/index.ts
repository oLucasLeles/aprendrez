// Catálogo das aberturas: junta todos os arquivos desta pasta (um por abertura).
// Cada arquivo faz `export default` de uma `Opening`; um arquivo novo entra aqui sozinho.
import type { Opening } from '../../chess/openingTree'

const modules = import.meta.glob<{ default: Opening }>(['./*.ts', '!./index.ts', '!./*.test.ts'], {
  eager: true,
})

/** Todas as aberturas, ordenadas por nível e depois pelo nome do arquivo. */
export const openings: Opening[] = Object.entries(modules)
  .sort(([pathA], [pathB]) => pathA.localeCompare(pathB))
  .map(([, module]) => module.default)
  .sort((a, b) => a.level - b.level)

/** Busca uma abertura pelo id do endereço (por exemplo, "italiana"). */
export function getOpening(id: string | undefined): Opening | undefined {
  return openings.find((opening) => opening.id === id)
}
