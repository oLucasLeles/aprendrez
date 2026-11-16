import { expect, test, type Page } from '@playwright/test'

// Tabuleiro (F10). Usa a página de testes /dev/tabuleiro, que só existe no
// servidor de desenvolvimento.

// Posição vertical (em pixels) do centro de uma peça na tela
async function pieceY(page: Page, piece: string) {
  const box = await page.locator(`[data-piece="${piece}"]`).first().boundingBox()
  if (!box) throw new Error(`peça ${piece} não encontrada`)
  return box.y + box.height / 2
}

test('o tabuleiro aparece com as 32 peças na posição inicial', async ({ page }) => {
  await page.goto('/dev/tabuleiro')
  const board = page.getByRole('group', { name: 'Tabuleiro de xadrez, brancas embaixo' })
  await expect(board).toBeVisible()
  await expect(page.locator('[data-piece]')).toHaveCount(32)
  // brancas embaixo: o rei branco fica mais abaixo na tela que o rei preto
  expect(await pieceY(page, 'wK')).toBeGreaterThan(await pieceY(page, 'bK'))
})

test('com orientação pretas, as peças pretas ficam embaixo', async ({ page }) => {
  await page.goto('/dev/tabuleiro?cor=pretas')
  await expect(page.getByRole('group', { name: 'Tabuleiro de xadrez, pretas embaixo' })).toBeVisible()
  await expect(page.locator('[data-piece]')).toHaveCount(32)
  expect(await pieceY(page, 'bK')).toBeGreaterThan(await pieceY(page, 'wK'))
})

test('as casas usam as cores do tabuleiro definidas nos tokens', async ({ page }) => {
  await page.goto('/dev/tabuleiro')
  const colors = await page.evaluate(() => {
    const css = getComputedStyle(document.documentElement)
    const probe = (token: string) => {
      const el = document.createElement('div')
      el.style.backgroundColor = css.getPropertyValue(token)
      document.body.appendChild(el)
      const value = getComputedStyle(el).backgroundColor
      el.remove()
      return value
    }
    const bg = (square: string) =>
      getComputedStyle(document.querySelector(`[data-square="${square}"]`)!).backgroundColor
    return {
      light: probe('--color-board-light'),
      dark: probe('--color-board-dark'),
      a1: bg('a1'), // a1 é casa escura
      a2: bg('a2'), // a2 é casa clara
    }
  })
  expect(colors.a1).toBe(colors.dark)
  expect(colors.a2).toBe(colors.light)
})

test('o último lance fica destacado nas duas casas', async ({ page }) => {
  await page.goto('/dev/tabuleiro?de=e2&para=e4')
  // A biblioteca aplica o estilo num elemento dentro da casa
  const highlighted = (square: string) =>
    page.locator(`[data-square="${square}"] > div[style*="box-shadow"]`)
  await expect(highlighted('e2')).toHaveCount(1)
  await expect(highlighted('e4')).toHaveCount(1)
  await expect(highlighted('e2')).toHaveCSS('box-shadow', /inset/)
  await expect(highlighted('d2')).toHaveCount(0)
})

test('o tabuleiro cabe na tela, sem rolagem horizontal', async ({ page }) => {
  await page.goto('/dev/tabuleiro')
  const box = await page.getByRole('group', { name: /Tabuleiro de xadrez/ }).boundingBox()
  const viewport = page.viewportSize()!
  expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width)
  const scrolls = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  )
  expect(scrolls).toBe(false)
})
