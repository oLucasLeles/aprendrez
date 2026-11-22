import { expect, test, type Page } from '@playwright/test'

// Guia de lance (F13). Usa a página de testes /dev/tabuleiro com ?guia=e2-e4.

const square = (page: Page, name: string) => page.locator(`[data-square="${name}"]`)

// A seta é desenhada pelo nosso Board num SVG por cima do tabuleiro: a haste é o <path> com traço
const arrow = (page: Page) => page.getByRole('group', { name: /Tabuleiro de xadrez/ }).locator('svg path[stroke]')

// Centro de uma casa, em pixels da tela
async function center(page: Page, name: string) {
  const box = await square(page, name).boundingBox()
  if (!box) throw new Error(`casa ${name} não encontrada`)
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 }
}

test('com um guia de e2 para e4, e2 tem o destaque e existe uma seta de e2 para e4', async ({ page }) => {
  await page.goto('/dev/tabuleiro?guia=e2-e4')

  // destaque na casa de origem (e só nela)
  await expect(square(page, 'e2').locator('> div[style*="box-shadow"]')).toHaveCount(1)
  await expect(square(page, 'e4').locator('> div[style*="box-shadow"]')).toHaveCount(0)

  // uma seta, que começa na BORDA de e2 (sem cobrir a peça, como no chess.com) e termina perto do centro de e4
  await expect(arrow(page)).toHaveCount(1)
  const pts = await arrow(page).evaluate((path: SVGPathElement) => {
    const len = path.getTotalLength()
    const toScreen = (p: DOMPoint) => {
      const m = path.getScreenCTM()!
      const q = new DOMPoint(p.x, p.y).matrixTransform(m)
      return { x: q.x, y: q.y }
    }
    return { start: toScreen(path.getPointAtLength(0)), end: toScreen(path.getPointAtLength(len)) }
  })
  const e2 = await center(page, 'e2')
  const e4 = await center(page, 'e4')
  const side = (await square(page, 'e2').boundingBox())!.width
  const tol = side / 2
  expect(Math.abs(pts.start.x - e2.x)).toBeLessThan(tol)
  // o começo fica na borda de cima de e2 (meia casa acima do centro), fora do desenho da peça
  expect(Math.abs(pts.start.y - (e2.y - side / 2))).toBeLessThan(side * 0.1)
  expect(Math.abs(pts.end.x - e4.x)).toBeLessThan(tol)
  expect(Math.abs(pts.end.y - e4.y)).toBeLessThan(tol)
})

test('a cor do guia vem do token de destaque', async ({ page }) => {
  await page.goto('/dev/tabuleiro?guia=e2-e4')
  const accent = await page.evaluate(() => {
    const el = document.createElement('div')
    el.style.color = getComputedStyle(document.documentElement).getPropertyValue('--color-accent')
    document.body.appendChild(el)
    const value = getComputedStyle(el).color
    el.remove()
    return value
  })

  // seta: o traço é calculado a partir do token
  expect(await arrow(page).evaluate((p) => getComputedStyle(p).stroke)).toBe(accent)
  // casa de origem: o contorno usa o mesmo token
  const shadow = await square(page, 'e2')
    .locator('> div[style*="box-shadow"]')
    .evaluate((el) => getComputedStyle(el).boxShadow)
  expect(shadow).toContain(accent)
})

test('sem guia, não há seta nem destaque', async ({ page }) => {
  await page.goto('/dev/tabuleiro')
  await expect(arrow(page)).toHaveCount(0)
  await expect(page.locator('[data-square] > div[style*="box-shadow"]')).toHaveCount(0)
})

test('a seta do guia não atrapalha os cliques no tabuleiro', async ({ page }) => {
  await page.goto('/dev/tabuleiro?guia=e2-e4&jogar=brancas')
  await square(page, 'e2').click()
  await square(page, 'e4').click()
  await expect(page.getByTestId('lances-feitos')).toHaveText('e4')
})
