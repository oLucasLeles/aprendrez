import { expect, test } from '@playwright/test'

// Rodapé de créditos (F42, SPEC 9 "Licenças").

test('o rodapé aparece na tela inicial com os créditos de peças, fonte e aberturas', async ({ page }) => {
  await page.goto('/')
  const footer = page.getByRole('contentinfo')
  await expect(footer).toBeVisible()
  await expect(footer).toContainText('Colin M.L. Burnett')
  await expect(footer).toContainText('CC BY-SA 3.0')
  await expect(footer).toContainText('Inter')
  await expect(footer).toContainText('SIL OFL 1.1')
  await expect(footer).toContainText('Lichess')
  await expect(footer).toContainText('CC0')
})

test('o rodapé também aparece na lição, onde as peças são mostradas, sem rolagem horizontal', async ({
  page,
}) => {
  await page.goto('/abertura/italiana')
  await expect(page.getByRole('contentinfo')).toContainText('Colin M.L. Burnett')
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)
  expect(overflow).toBe(false)
})

test('o rodapé é discreto: texto pequeno, na cor secundária e depois do conteúdo', async ({ page }) => {
  await page.goto('/')
  const footer = page.getByRole('contentinfo')
  const text = footer.locator('p')
  const secondary = await page.evaluate(() => {
    const probe = document.createElement('span')
    probe.style.color = 'var(--color-text-secondary)'
    document.body.append(probe)
    const color = getComputedStyle(probe).color
    probe.remove()
    return color
  })
  expect(await text.evaluate((el) => getComputedStyle(el).color)).toBe(secondary)
  expect(await text.evaluate((el) => parseFloat(getComputedStyle(el).fontSize))).toBeLessThanOrEqual(14)

  const main = await page.getByRole('main').boundingBox()
  const foot = await footer.boundingBox()
  expect(foot!.y).toBeGreaterThanOrEqual(main!.y + main!.height - 1)
})
