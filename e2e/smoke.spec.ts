import { expect, test } from '@playwright/test'

// Abre o app num navegador de verdade e confere o básico.
test('a página inicial abre e não tem rolagem horizontal', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Aprendrez' })).toBeVisible()
  const rolaNaHorizontal = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  )
  expect(rolaNaHorizontal).toBe(false)
})
