// Leitura da base de aberturas do Lichess (data/lichess-openings/*.tsv).
//
// ATENÇÃO: este módulo é só para Node (testes e scripts). Ele lê arquivos do
// disco, então NÃO deve ser importado pelo código que roda no navegador.
//
// Cada linha da base tem três colunas separadas por tabulação (TSV):
//   eco  name  pgn
// Exemplo: "C50<TAB>Italian Game: Giuoco Piano<TAB>1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5"
// O "pgn" é a lista de lances em notação inglesa (SAN), com os números dos lances.
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

export interface LichessOpening {
  /** Código ECO, como "C50". */
  eco: string
  /** Nome exato na base, em inglês, como "Italian Game: Giuoco Piano". */
  name: string
  /** Os lances da entrada em SAN, sem números: ["e4", "e5", "Nf3", ...]. */
  moves: string[]
}

/** Pasta padrão da base, relativa à raiz do projeto. */
export const LICHESS_DIR = join(import.meta.dirname, '..', '..', 'data', 'lichess-openings')

/**
 * Transforma "1. e4 e5 2. Nf3" em ["e4", "e5", "Nf3"].
 * Aceita também uma lista que já vem sem números ("e4 e5 Nf3").
 */
export function parseMoves(pgn: string): string[] {
  return pgn
    .split(/\s+/)
    .filter((token) => token !== '' && !/^\d+\.(\.\.)?$/.test(token))
}

/** Lê o texto de um arquivo TSV da base e devolve as entradas. */
export function parseOpeningsTsv(text: string): LichessOpening[] {
  const entries: LichessOpening[] = []
  const lines = text.split(/\r?\n/)
  // A primeira linha é o cabeçalho ("eco name pgn"), por isso começa em 1.
  for (const line of lines.slice(1)) {
    if (line.trim() === '') continue
    const [eco, name, pgn] = line.split('\t')
    if (!eco || !name || !pgn) {
      throw new Error(`Linha inválida na base do Lichess: "${line}"`)
    }
    entries.push({ eco, name, moves: parseMoves(pgn) })
  }
  return entries
}

/** Lê todos os arquivos .tsv da pasta da base (a.tsv a e.tsv). */
export function loadLichessOpenings(dir: string = LICHESS_DIR): LichessOpening[] {
  return readdirSync(dir)
    .filter((file) => file.endsWith('.tsv'))
    .sort()
    .flatMap((file) => parseOpeningsTsv(readFileSync(join(dir, file), 'utf8')))
}

/**
 * Busca entradas pelo nome exato (maiúsculas e minúsculas contam).
 * Devolve uma lista porque a base repete alguns nomes, quando a mesma
 * abertura pode ser alcançada por ordens de lances diferentes.
 * Se o nome não existir, a lista vem vazia.
 */
export function findOpeningsByName(
  openings: readonly LichessOpening[],
  name: string,
): LichessOpening[] {
  return openings.filter((opening) => opening.name === name)
}

/** Diz se `moves` começa exatamente com os lances de `opening`. */
export function startsWithOpening(
  moves: readonly string[],
  opening: LichessOpening,
): boolean {
  if (moves.length < opening.moves.length) return false
  return opening.moves.every((move, index) => moves[index] === move)
}

/**
 * Diz se `moves` começa com os lances de ALGUMA entrada que tenha esse nome.
 * É a verificação que o validador de conteúdo usa em cada linha de abertura.
 */
export function startsWithNamedOpening(
  openings: readonly LichessOpening[],
  name: string,
  moves: readonly string[],
): boolean {
  return findOpeningsByName(openings, name).some((opening) =>
    startsWithOpening(moves, opening),
  )
}
