import { expect, test, type Page } from '@playwright/test'
import { goToStage } from './etapas'

// Aberturas de pretas (F25): o tabuleiro fica invertido (pretas embaixo) em todas as etapas
// e o app joga sozinho o primeiro lance das brancas (1.e4 na Defesa Escandinava).

const square = (page: Page, name: string) => page.locator(`[data-square="${name}"]`)
const board = (page: Page) => page.getByRole('group', { name: /Tabuleiro de xadrez/ })

// Com as pretas embaixo, a casa a8 (canto das brancas) fica na parte de baixo à direita, e h1 no alto à esquerda.
// Conferimos pela posição na tela: a casa e8 (rei preto) deve estar abaixo da casa e1.
async function expectBlackAtBottom(page: Page) {
  const e8 = await square(page, 'e8').boundingBox()
  const e1 = await square(page, 'e1').boundingBox()
  expect(e8).not.toBeNull()
  expect(e1).not.toBeNull()
  expect(e8!.y).toBeGreaterThan(e1!.y)
}

test('Conhecer e Assistir: as pretas aparecem embaixo', async ({ page }) => {
  await page.goto('/abertura/escandinava')
  const panel = page.getByRole('region', { name: 'Painel da lição' })

  await expect(board(page)).toHaveAccessibleName(/pretas embaixo/)
  await expectBlackAtBottom(page)

  await panel.getByRole('button', { name: /Próxima etapa/ }).click() // Conhecer → Assistir
  await expect(panel.getByRole('heading', { name: 'Assistir' })).toBeVisible()
  await expect(board(page)).toHaveAccessibleName(/pretas embaixo/)
  await expectBlackAtBottom(page)

  // O primeiro lance da lista é o 1.e4 das brancas.
  await panel.getByRole('button', { name: 'Próximo lance' }).click()
  await expect(panel.getByLabel('Lista de lances')).toHaveText('1. e4')
  await panel.getByRole('button', { name: 'Próximo lance' }).click()
  await expect(panel.getByLabel('Lista de lances')).toHaveText('1. e4 d5')
})

test('Praticar com guia: o 1. e4 já aparece jogado e o guia aponta o lance das pretas', async ({ page }) => {
  await page.goto('/abertura/escandinava')
  const panel = page.getByRole('region', { name: 'Painel da lição' })
  await panel.getByRole('button', { name: /Próxima etapa/ }).click() // Conhecer → Assistir
  await panel.getByRole('button', { name: /Próxima etapa/ }).click() // Assistir → Praticar com guia
  await expect(panel.getByRole('heading', { name: 'Praticar com guia' })).toBeVisible()

  await expect(board(page)).toHaveAccessibleName(/pretas embaixo/)
  await expectBlackAtBottom(page)

  const moves = panel.getByLabel('Lista de lances')
  // O app joga o 1.e4 sozinho, depois de uns 400 ms.
  await expect(moves).toHaveText('1. e4')
  // O peão de e4 está no tabuleiro e o de e2 saiu.
  await expect(square(page, 'e4').locator('[data-piece="wP"]')).toHaveCount(1)
  await expect(square(page, 'e2').locator('[data-piece="wP"]')).toHaveCount(0)

  // O guia aponta o peão de d7 (destaque) e existe uma seta.
  await expect(square(page, 'd7').locator('> div[style*="box-shadow"]')).toHaveCount(1)
  await expect(board(page).locator('svg path[stroke]')).toHaveCount(1)

  // Jogar 1...d5 é aceito; as brancas respondem 2.exd5 sozinhas.
  await square(page, 'd7').click()
  await square(page, 'd5').click()
  await expect(panel.getByText('Lance correto.')).toBeVisible()
  await expect(moves).toHaveText('1. e4 d5 2. exd5')
})

test('Praticar sozinho: sem guia, pretas embaixo e 1. e4 já jogado', async ({ page }) => {
  await page.goto('/abertura/escandinava?etapa=desafio')
  const panel = page.getByRole('region', { name: 'Painel da lição' })

  // O indicador deixa voltar a "Praticar sozinho" (no modo de desenvolvimento todas as etapas estão alcançadas).
  await goToStage(page, 'Praticar sozinho')
  await expect(panel.getByRole('heading', { name: 'Praticar sozinho' })).toBeVisible()
  await expectBlackAtBottom(page)
  await expect(panel.getByLabel('Lista de lances')).toHaveText('1. e4')
  await expect(board(page).locator('svg path[stroke]')).toHaveCount(0)
})
