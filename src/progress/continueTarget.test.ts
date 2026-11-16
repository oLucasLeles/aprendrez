import { describe, expect, it } from 'vitest'
import { getContinueTarget } from './continueTarget'
import { emptyProgress, withOpeningCompleted, withStageCompleted } from './progress'

const TRAIL = ['italiana', 'escandinava', 'espanhola']

describe('getContinueTarget', () => {
  it('na primeira visita, "Começar" leva à primeira abertura da trilha', () => {
    expect(getContinueTarget(emptyProgress(), TRAIL)).toEqual({ openingId: 'italiana', kind: 'start' })
  })

  it('com a primeira concluída, leva à próxima da trilha', () => {
    const progress = withOpeningCompleted(emptyProgress(), 'italiana')
    expect(getContinueTarget(progress, TRAIL)).toEqual({ openingId: 'escandinava', kind: 'continue' })
  })

  it('uma abertura em andamento vem antes das seguintes', () => {
    const progress = withStageCompleted(emptyProgress(), 'italiana', 0)
    expect(getContinueTarget(progress, TRAIL)).toEqual({ openingId: 'italiana', kind: 'continue' })
  })

  it('pula as concluídas, mesmo no meio da trilha', () => {
    let progress = withOpeningCompleted(emptyProgress(), 'italiana')
    progress = withOpeningCompleted(progress, 'espanhola')
    expect(getContinueTarget(progress, TRAIL).openingId).toBe('escandinava')
  })

  it('com tudo concluído, oferece rever desde o início', () => {
    let progress = emptyProgress()
    for (const id of TRAIL) progress = withOpeningCompleted(progress, id)
    expect(getContinueTarget(progress, TRAIL)).toEqual({ openingId: 'italiana', kind: 'review' })
  })

  it('trilha vazia não quebra', () => {
    expect(getContinueTarget(emptyProgress(), []).openingId).toBeUndefined()
  })
})
