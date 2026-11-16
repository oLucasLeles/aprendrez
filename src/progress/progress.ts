// Progresso da pessoa, salvo no navegador (SPEC, seção 11).
// Guarda duas coisas por abertura: quais etapas foram concluídas e se a abertura inteira foi concluída.
// Lógica pura: o "armazenamento" entra como parâmetro, então os testes usam um de mentira
// (inclusive um que lança erro, como acontece em janelas privadas ou com o armazenamento bloqueado).
//
// Regra de ouro: se ler ou gravar falhar, o app continua funcionando como numa primeira visita.

// A parte do localStorage que usamos. Qualquer objeto com esses três métodos serve.
export type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

export type OpeningProgress = {
  /** Índices das etapas concluídas (0 = Conhecer … 5 = Desafio), sem repetição e em ordem. */
  stages: number[]
  /** Verdadeiro depois de concluir o Desafio. */
  completed: boolean
}

export type Progress = {
  version: 1
  openings: Record<string, OpeningProgress>
}

export const STORAGE_KEY = 'aprendrez:progresso'
/** Quantas etapas tem uma lição (SPEC, seção 6). */
export const STAGE_COUNT = 6

export function emptyProgress(): Progress {
  return { version: 1, openings: {} }
}

// Acessar `window.localStorage` pode lançar erro (cookies bloqueados, por exemplo).
// Por isso o acesso fica dentro de um try/catch e, se falhar, devolvemos `null` ("sem armazenamento").
export function getBrowserStorage(): StorageLike | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null
  } catch {
    return null
  }
}

// Confere o formato do que foi lido. Dados estragados ou de outra versão viram "sem progresso".
function parseProgress(raw: string | null): Progress {
  if (!raw) return emptyProgress()
  try {
    const data: unknown = JSON.parse(raw)
    if (typeof data !== 'object' || data === null) return emptyProgress()
    const record = data as { version?: unknown; openings?: unknown }
    if (record.version !== 1 || typeof record.openings !== 'object' || record.openings === null) {
      return emptyProgress()
    }
    const openings: Record<string, OpeningProgress> = {}
    for (const [id, value] of Object.entries(record.openings)) {
      if (typeof value !== 'object' || value === null) continue
      const entry = value as { stages?: unknown; completed?: unknown }
      const stages = Array.isArray(entry.stages)
        ? [...new Set(entry.stages)]
            .filter((s): s is number => Number.isInteger(s) && s >= 0 && s < STAGE_COUNT)
            .sort((a, b) => a - b)
        : []
      openings[id] = { stages, completed: entry.completed === true }
    }
    return { version: 1, openings }
  } catch {
    return emptyProgress()
  }
}

export function loadProgress(storage: StorageLike | null = getBrowserStorage()): Progress {
  if (!storage) return emptyProgress()
  try {
    return parseProgress(storage.getItem(STORAGE_KEY))
  } catch {
    return emptyProgress()
  }
}

// Devolve `true` se conseguiu gravar. Se o armazenamento falhar, o app segue sem salvar.
export function saveProgress(progress: Progress, storage: StorageLike | null = getBrowserStorage()): boolean {
  if (!storage) return false
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(progress))
    return true
  } catch {
    return false
  }
}

// Apaga todo o progresso ("Reiniciar progresso", na tela inicial).
export function resetProgress(storage: StorageLike | null = getBrowserStorage()): void {
  if (!storage) return
  try {
    storage.removeItem(STORAGE_KEY)
  } catch {
    // Sem armazenamento: não há o que apagar.
  }
}

export function getOpeningProgress(progress: Progress, openingId: string): OpeningProgress {
  return progress.openings[openingId] ?? { stages: [], completed: false }
}

// Marca uma etapa como concluída. Devolve um progresso novo, sem alterar o antigo.
export function withStageCompleted(progress: Progress, openingId: string, stage: number): Progress {
  const current = getOpeningProgress(progress, openingId)
  if (current.stages.includes(stage)) return progress
  const stages = [...current.stages, stage].sort((a, b) => a - b)
  return { ...progress, openings: { ...progress.openings, [openingId]: { ...current, stages } } }
}

// Marca a abertura como concluída (e, junto, todas as etapas dela).
export function withOpeningCompleted(progress: Progress, openingId: string): Progress {
  const stages = Array.from({ length: STAGE_COUNT }, (_, index) => index)
  return { ...progress, openings: { ...progress.openings, [openingId]: { stages, completed: true } } }
}

// Em que etapa a lição deve abrir: a primeira ainda não concluída.
// Se tudo estiver concluído, volta ao começo (Conhecer), para quem quer rever.
export function getFirstIncompleteStage(opening: OpeningProgress): number {
  for (let stage = 0; stage < STAGE_COUNT; stage++) {
    if (!opening.stages.includes(stage)) return stage
  }
  return 0
}

// A etapa mais avançada que o indicador deve deixar clicar: a primeira não concluída,
// ou a última se tudo estiver concluído.
export function getReachedStage(opening: OpeningProgress): number {
  const first = getFirstIncompleteStage(opening)
  return first === 0 && opening.stages.length === STAGE_COUNT ? STAGE_COUNT - 1 : first
}

export type OpeningStatus = 'not-started' | 'in-progress' | 'completed'

// O status de um cartão da trilha: não iniciada, em andamento ou concluída.
export function getOpeningStatus(progress: Progress, openingId: string): OpeningStatus {
  const entry = getOpeningProgress(progress, openingId)
  if (entry.completed) return 'completed'
  return entry.stages.length > 0 ? 'in-progress' : 'not-started'
}
