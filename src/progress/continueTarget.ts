// Para onde o botão principal da tela inicial leva (SPEC 10.1).
// Lógica pura: recebe o progresso e a ordem da trilha, e diz qual abertura abrir e qual texto mostrar.
// A etapa certa não precisa ser calculada aqui: a lição já abre na primeira etapa não concluída (F28).
import { getOpeningStatus, type Progress } from './progress'

export type ContinueTarget = {
  /** Id da abertura que o botão abre. `undefined` se a trilha estiver vazia. */
  openingId: string | undefined
  /**
   * 'start' = primeira visita ("Começar");
   * 'continue' = há progresso e ainda falta abertura ("Continuar de onde parei");
   * 'review' = tudo concluído ("Rever desde o início").
   */
  kind: 'start' | 'continue' | 'review'
}

export const CONTINUE_LABELS: Record<ContinueTarget['kind'], string> = {
  start: 'Começar',
  continue: 'Continuar de onde parei',
  review: 'Rever desde o início',
}

export function getContinueTarget(progress: Progress, trailIds: string[]): ContinueTarget {
  const statuses = trailIds.map((id) => getOpeningStatus(progress, id))

  // Primeira visita: nada foi iniciado nem concluído.
  if (statuses.every((status) => status === 'not-started')) {
    return { openingId: trailIds[0], kind: 'start' }
  }

  // A primeira abertura não concluída na ordem da trilha (uma em andamento também conta).
  const nextIndex = statuses.findIndex((status) => status !== 'completed')
  if (nextIndex !== -1) {
    return { openingId: trailIds[nextIndex], kind: 'continue' }
  }

  // Tudo concluído: volta ao começo da trilha, para quem quer rever.
  return { openingId: trailIds[0], kind: 'review' }
}
