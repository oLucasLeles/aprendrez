import { expect, test } from '@playwright/test'

// Pedido do dono do projeto (2026-11-22): header com seletor de tema (claro, escuro, sistema)
// e casas citadas no texto da lição com sublinhado pontilhado que destacam a casa no tabuleiro.

test('o header tem o nome do app e o seletor de tema; o tema escuro fica lembrado', async ({ page }) => {
  await page.goto('/')
  const header = page.getByRole('banner')
  await expect(header.getByRole('link', { name: 'Aprendrez' })).toHaveAttribute('href', '/')
  const tema = header.getByRole('group', { name: 'Tema' })

  await tema.getByRole('button', { name: 'Tema escuro' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect(tema.getByRole('button', { name: 'Tema escuro' })).toHaveAttribute('aria-pressed', 'true')

  // Depois de recarregar, o escuro continua.
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')

  await tema.getByRole('button', { name: 'Tema claro' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
})

test('"Tema do sistema" segue a preferência do sistema operacional', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/')
  await page.getByRole('button', { name: 'Tema do sistema' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await page.emulateMedia({ colorScheme: 'light' })
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
})

test('na lição, passar o mouse sobre uma casa citada no texto destaca a casa no tabuleiro', async ({ page }) => {
  await page.goto('/abertura/italiana')
  const panel = page.getByRole('region', { name: 'Painel da lição' })
  // "O bispo em c4 aponta para f7…" (ideias-chave da Italiana)
  const ref = panel.locator('[data-square-ref="c4"]').first()
  await expect(ref).toHaveCSS('text-decoration-style', 'dotted')

  const square = page.locator('[data-square="c4"] > div[style*="dashed"]')
  await expect(square).toHaveCount(0)
  await ref.hover()
  await expect(square).toHaveCount(1)
  await page.getByRole('heading', { level: 1 }).hover()
  await expect(square).toHaveCount(0)
})

test('na lição, o indicador de etapas fica abaixo do título, fora do painel, e o botão "Voltar" leva à trilha', async ({ page }) => {
  await page.goto('/abertura/italiana')
  const panel = page.getByRole('region', { name: 'Painel da lição' })
  await expect(panel.getByRole('navigation', { name: 'Etapas da lição' })).toHaveCount(0)
  await expect(page.getByRole('navigation', { name: 'Etapas da lição' })).toBeVisible()
  await expect(page.getByText('Lição de abertura')).toHaveCount(0)

  const voltar = page.getByRole('link', { name: 'Voltar à trilha' })
  await expect(voltar).toHaveText('Voltar')
  await voltar.click()
  await expect(page).toHaveURL('/')
})

test('o indicador de etapas mostra "Etapa X de 6" e abre a lista das 6 etapas', async ({ page }) => {
  await page.goto('/abertura/italiana')
  const nav = page.getByRole('navigation', { name: 'Etapas da lição' })
  const trigger = nav.getByRole('button', { name: 'Etapa 1 de 6 Conhecer' })
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await trigger.click()
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  await expect(nav.getByRole('listitem')).toHaveCount(6)
  await expect(nav.getByRole('button', { name: 'Conhecer', exact: true })).toHaveAttribute('aria-current', 'step')
  // Esc fecha a lista.
  await page.keyboard.press('Escape')
  await expect(nav.getByRole('listitem')).toHaveCount(0)
  // Escolher uma etapa troca de etapa e fecha a lista.
  await trigger.click()
  await nav.getByRole('button', { name: 'Assistir', exact: true }).click()
  await expect(nav.getByRole('button', { name: 'Etapa 2 de 6 Assistir' })).toBeVisible()
  await expect(nav.getByRole('listitem')).toHaveCount(0)
})

test('o header mostra o logo ao lado do nome', async ({ page }) => {
  await page.goto('/')
  const logo = page.getByRole('banner').locator('img.site-header-logo-mark')
  await expect(logo).toBeVisible()
  expect(await logo.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0)
})
