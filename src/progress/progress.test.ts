import { describe, expect, it } from 'vitest'
import {
  emptyProgress,
  getFirstIncompleteStage,
  getOpeningProgress,
  getOpeningStatus,
  getReachedStage,
  loadProgress,
  resetProgress,
  saveProgress,
  STORAGE_KEY,
  withOpeningCompleted,
  withStageCompleted,
  type StorageLike,
} from './progress'

// Um armazenamento de mentira que guarda tudo na memória.
function memoryStorage(initial: Record<string, string> = {}): StorageLike {
  const data = new Map(Object.entries(initial))
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
    removeItem: (key) => void data.delete(key),
  }
}

// Um armazenamento que lança erro em tudo, como acontece quando o navegador o bloqueia.
const brokenStorage: StorageLike = {
  getItem: () => {
    throw new Error('armazenamento indisponível')
  },
  setItem: () => {
    throw new Error('armazenamento indisponível')
  },
  removeItem: () => {
    throw new Error('armazenamento indisponível')
  },
}

describe('salvar e ler o progresso', () => {
  it('o que foi salvo é lido de volta igual', () => {
    const storage = memoryStorage()
    let progress = withStageCompleted(emptyProgress(), 'italiana', 0)
    progress = withStageCompleted(progress, 'italiana', 1)
    expect(saveProgress(progress, storage)).toBe(true)
    expect(loadProgress(storage)).toEqual(progress)
  })

  it('armazenamento vazio vale como primeira visita', () => {
    expect(loadProgress(memoryStorage())).toEqual(emptyProgress())
  })

  it('texto estragado ou de outra versão vale como primeira visita', () => {
    for (const raw of ['não é json', '[]', 'null', '{"version":2,"openings":{}}', '{"version":1}']) {
      expect(loadProgress(memoryStorage({ [STORAGE_KEY]: raw }))).toEqual(emptyProgress())
    }
  })

  it('ignora etapas inválidas e repetidas', () => {
    const raw = JSON.stringify({
      version: 1,
      openings: { italiana: { stages: [1, 1, 0, 99, -1, 'x'], completed: 'sim' }, quebrada: 5 },
    })
    const progress = loadProgress(memoryStorage({ [STORAGE_KEY]: raw }))
    expect(progress.openings).toEqual({ italiana: { stages: [0, 1], completed: false } })
  })
})

describe('armazenamento indisponível (que lança erro)', () => {
  it('ler devolve um progresso vazio, sem lançar erro', () => {
    expect(loadProgress(brokenStorage)).toEqual(emptyProgress())
  })

  it('salvar devolve false, sem lançar erro', () => {
    expect(saveProgress(withStageCompleted(emptyProgress(), 'italiana', 0), brokenStorage)).toBe(false)
  })

  it('reiniciar não lança erro', () => {
    expect(() => resetProgress(brokenStorage)).not.toThrow()
  })

  it('sem armazenamento nenhum (null) o app também funciona', () => {
    expect(loadProgress(null)).toEqual(emptyProgress())
    expect(saveProgress(emptyProgress(), null)).toBe(false)
    expect(() => resetProgress(null)).not.toThrow()
  })
})

describe('etapas e aberturas concluídas', () => {
  it('marcar uma etapa não altera o progresso antigo e não repete etapas', () => {
    const before = emptyProgress()
    const after = withStageCompleted(before, 'italiana', 2)
    expect(before.openings).toEqual({})
    expect(getOpeningProgress(after, 'italiana').stages).toEqual([2])
    expect(withStageCompleted(after, 'italiana', 2)).toBe(after)
  })

  it('o progresso de uma abertura não afeta as outras', () => {
    const progress = withStageCompleted(emptyProgress(), 'italiana', 0)
    expect(getOpeningProgress(progress, 'escandinava')).toEqual({ stages: [], completed: false })
  })

  it('concluir a abertura marca todas as etapas', () => {
    const progress = withOpeningCompleted(emptyProgress(), 'italiana')
    expect(getOpeningProgress(progress, 'italiana')).toEqual({ stages: [0, 1, 2, 3, 4, 5], completed: true })
  })

  it('reiniciar apaga tudo', () => {
    const storage = memoryStorage()
    saveProgress(withOpeningCompleted(emptyProgress(), 'italiana'), storage)
    resetProgress(storage)
    expect(loadProgress(storage)).toEqual(emptyProgress())
  })
})

describe('onde a lição deve abrir', () => {
  it('na primeira visita, em Conhecer', () => {
    const entry = getOpeningProgress(emptyProgress(), 'italiana')
    expect(getFirstIncompleteStage(entry)).toBe(0)
    expect(getReachedStage(entry)).toBe(0)
  })

  it('com Conhecer e Assistir concluídas, em Praticar com guia', () => {
    let progress = withStageCompleted(emptyProgress(), 'italiana', 0)
    progress = withStageCompleted(progress, 'italiana', 1)
    const entry = getOpeningProgress(progress, 'italiana')
    expect(getFirstIncompleteStage(entry)).toBe(2)
    expect(getReachedStage(entry)).toBe(2)
  })

  it('com a abertura concluída, volta a Conhecer mas deixa visitar todas as etapas', () => {
    const entry = getOpeningProgress(withOpeningCompleted(emptyProgress(), 'italiana'), 'italiana')
    expect(getFirstIncompleteStage(entry)).toBe(0)
    expect(getReachedStage(entry)).toBe(5)
  })
})

describe('status do cartão da trilha', () => {
  it('não iniciada, em andamento e concluída', () => {
    expect(getOpeningStatus(emptyProgress(), 'italiana')).toBe('not-started')
    expect(getOpeningStatus(withStageCompleted(emptyProgress(), 'italiana', 0), 'italiana')).toBe('in-progress')
    expect(getOpeningStatus(withOpeningCompleted(emptyProgress(), 'italiana'), 'italiana')).toBe('completed')
  })
})
