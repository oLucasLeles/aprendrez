import { expect, test } from '@playwright/test'
import { expectStage } from './etapas'

// Etapa 2 · Assistir (F19): a linha principal lance a lance, com narração.
async function openWatchStage(page: import('@playwright/test').Page) {
  await page.goto('/abertura/italiana')
  const panel = page.getByRole('region', { name: 'Painel da lição' })
  await panel.getByRole('button', { name: /Próxima etapa/ }).click()
  await expect(panel.getByRole('heading', { name: 'Assistir' })).toBeVisible()
  return panel
}

test('avançar três lances mostra a narração do terceiro e a lista 1. e4 e5 2. Cf3', async ({ page }) => {
  const panel = await openWatchStage(page)
  const board = page.getByRole('group', { name: /Tabuleiro de xadrez/ })

  await expectStage(page, 'Assistir')
  await expect(panel.getByLabel('Lista de lances')).toContainText('Nenhum lance ainda')

  const next = panel.getByRole('button', { name: 'Próximo lance' })
  await next.click()
  await next.click()
  await next.click()

  await expect(panel.getByLabel('Lista de lances')).toHaveText(/^\s*1\. e4 e5 2\. Cf3\s*$/)
  await expect(panel.getByText(/O cavalo sai para uma casa de onde ataca o peão preto de e5/)).toBeVisible()
  await expect(panel.getByText(/Lance 3 de \d+/)).toBeVisible()

  // O tabuleiro acompanha: cavalo em f3, e o lance atual está destacado na lista.
  await expect(board.locator('[data-square="f3"] [data-piece="wN"]')).toBeVisible()
  await expect(board.locator('[data-square="g1"] [data-piece]')).toHaveCount(0)
  await expect(panel.getByLabel('Lista de lances').locator('[aria-current="step"]')).toHaveText('Cf3')
})

test('"Anterior" volta a posição e a narração', async ({ page }) => {
  const panel = await openWatchStage(page)
  const board = page.getByRole('group', { name: /Tabuleiro de xadrez/ })
  const next = panel.getByRole('button', { name: 'Próximo lance' })
  const previous = panel.getByRole('button', { name: 'Lance anterior' })

  await expect(previous).toBeDisabled()
  await next.click()
  await next.click()
  await next.click()
  await previous.click()

  await expect(panel.getByLabel('Lista de lances')).toHaveText(/^\s*1\. e4 e5\s*$/)
  await expect(panel.getByText('As pretas respondem com e5.')).toBeVisible()
  await expect(board.locator('[data-square="g1"] [data-piece="wN"]')).toBeVisible()
  await expect(board.locator('[data-square="f3"] [data-piece]')).toHaveCount(0)
})

test('o Próximo acaba no último lance da linha e a página não rola para os lados', async ({ page }) => {
  const panel = await openWatchStage(page)
  const next = panel.getByRole('button', { name: 'Próximo lance' })
  for (let i = 0; i < 16; i++) {
    if (await next.isDisabled()) break
    await next.click()
  }
  await expect(next).toHaveCount(0)
  await expect(panel.getByLabel('Lista de lances')).toContainText('8. Bb3 Ba7')

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)
  expect(overflow).toBe(false)
})
