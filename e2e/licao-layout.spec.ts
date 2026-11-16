import { expect, test } from '@playwright/test'

// Layout da tela de lição (F17): tabuleiro e painel lado a lado no desktop,
// um embaixo do outro no celular, sem rolagem horizontal.
test('o tabuleiro e o painel aparecem e não há rolagem horizontal', async ({ page }) => {
  await page.goto('/abertura/italiana')
  await expect(page.getByRole('group', { name: /Tabuleiro de xadrez/ })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Painel da lição' })).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Etapas da lição' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Voltar à trilha' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Continuar' })).toBeVisible()

  const scrolls = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  )
  expect(scrolls).toBe(false)
})

test('no desktop o painel fica à direita do tabuleiro; no celular, abaixo', async ({ page }, testInfo) => {
  await page.goto('/abertura/italiana')
  const board = await page.getByRole('group', { name: /Tabuleiro de xadrez/ }).boundingBox()
  const panel = await page.getByRole('region', { name: 'Painel da lição' }).boundingBox()
  expect(board).not.toBeNull()
  expect(panel).not.toBeNull()

  if (testInfo.project.name === 'desktop') {
    expect(panel!.x).toBeGreaterThanOrEqual(board!.x + board!.width)
  } else {
    expect(panel!.y).toBeGreaterThanOrEqual(board!.y + board!.height)
  }
})
