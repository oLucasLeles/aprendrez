import { expect, test } from '@playwright/test'

// Navegação entre as telas num navegador de verdade (F03).
test('cada endereço mostra a tela certa', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1, name: 'Aprendrez' })).toBeVisible()

  await page.goto('/abertura/italiana')
  await expect(page.getByRole('heading', { level: 1, name: 'Italiana (Giuoco Piano)' })).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Etapas da lição' })).toBeVisible()

  await page.goto('/rota-que-nao-existe')
  await expect(page.getByRole('heading', { level: 1, name: 'Página não encontrada' })).toBeVisible()
})

test('os links levam de volta ao início', async ({ page }) => {
  await page.goto('/rota-que-nao-existe')
  await page.getByRole('link', { name: 'Ir para o início' }).click()
  await expect(page).toHaveURL('/')
  await expect(page.getByRole('heading', { level: 1, name: 'Aprendrez' })).toBeVisible()

  await page.goto('/abertura/italiana')
  await page.getByRole('link', { name: 'Voltar à trilha' }).click()
  await expect(page).toHaveURL('/')
})

test('recarregar a lição continua mostrando a lição', async ({ page }) => {
  await page.goto('/abertura/italiana')
  await page.reload()
  await expect(page.getByRole('heading', { level: 1, name: 'Italiana (Giuoco Piano)' })).toBeVisible()
})

test('as páginas não têm rolagem horizontal', async ({ page }) => {
  for (const path of ['/', '/abertura/italiana', '/rota-que-nao-existe']) {
    await page.goto(path)
    const scrolls = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    )
    expect(scrolls, path).toBe(false)
  }
})
