import { expect, test } from '@playwright/test'

// Página não encontrada (F33, SPEC 10.4).
test('um endereço desconhecido mostra a mensagem e o link leva ao início', async ({ page }) => {
  await page.goto('/rota-que-nao-existe')
  await expect(page.getByRole('heading', { level: 1, name: 'Página não encontrada' })).toBeVisible()
  await expect(page.getByText('Não achamos o que você procurava.')).toBeVisible()
  await expect(page).toHaveTitle('Página não encontrada · Aprendrez')

  await page.getByRole('link', { name: 'Ir para o início' }).click()
  await expect(page).toHaveURL('/')
  await expect(page.getByRole('heading', { level: 1, name: 'Aprendrez' })).toBeVisible()
})

test('uma abertura que não existe também mostra a página não encontrada', async ({ page }) => {
  await page.goto('/abertura/xyz')
  await expect(page.getByRole('heading', { level: 1, name: 'Página não encontrada' })).toBeVisible()
  await page.goto('/abertura/xyz/conclusao')
  await expect(page.getByRole('heading', { level: 1, name: 'Página não encontrada' })).toBeVisible()
})

test('o link tem a aparência do botão principal e o texto continua legível ao passar o mouse', async ({
  page,
}) => {
  await page.goto('/rota-que-nao-existe')
  const link = page.getByRole('link', { name: 'Ir para o início' })
  const accent = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim(),
  )
  const normal = await link.evaluate((el) => {
    const s = getComputedStyle(el)
    return { background: s.backgroundColor, color: s.color }
  })
  await link.hover()
  const hovered = await link.evaluate((el) => getComputedStyle(el).color)
  // O texto não pode virar vermelho sobre o fundo vermelho
  expect(hovered).toBe(normal.color)
  expect(normal.background).not.toBe(normal.color)
  expect(accent).not.toBe('')
})

test('funciona pelo teclado e não tem rolagem horizontal', async ({ page }) => {
  await page.goto('/rota-que-nao-existe')
  // Antes do link vêm o nome do app e os 3 botões de tema do header.
  const link = page.getByRole('link', { name: 'Ir para o início' })
  for (let i = 0; i < 10 && !(await link.evaluate((el) => el === document.activeElement)); i++) {
    await page.keyboard.press('Tab')
  }
  await expect(link).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL('/')

  await page.goto('/rota-que-nao-existe')
  const scrolls = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  )
  expect(scrolls).toBe(false)
})
