import { expect, test } from '@playwright/test'
import { expectStage } from './etapas'

// Etapa 1 · Conhecer (F18): nome, cor, nível, ideia, ideias-chave e tabuleiro estático.
test('em /abertura/italiana aparecem o nome, a ideia e as ideias-chave', async ({ page }) => {
  await page.goto('/abertura/italiana')
  const panel = page.getByRole('region', { name: 'Painel da lição' })

  await expect(panel.getByRole('heading', { name: 'Conhecer' })).toBeVisible()
  await expect(panel.getByText('Italiana (Giuoco Piano)')).toBeVisible()
  await expect(panel.getByText('Brancas')).toBeVisible()
  await expect(panel.getByText('1 · Primeiros passos')).toBeVisible()
  await expect(panel.getByText(/Você ocupa o centro do tabuleiro/)).toBeVisible()

  await expect(panel.getByRole('heading', { name: 'Ideias-chave' })).toBeVisible()
  await expect(panel.getByRole('listitem').filter({ hasText: 'O bispo em c4 aponta para f7' })).toBeVisible()
  expect(await panel.locator('.lesson-key-ideas li').count()).toBeGreaterThanOrEqual(2)

  await expect(panel.getByLabel('Lista de lances')).toContainText('1. e4 e5 2. Cf3 Cc6 3. Bc4 Bc5')
  await expect(page.getByRole('button', { name: /Próxima etapa/ })).toBeVisible()
  await expectStage(page, 'Conhecer')
})

test('o tabuleiro mostra a posição do fim da linha e não aceita lances', async ({ page }) => {
  await page.goto('/abertura/italiana')
  const board = page.getByRole('group', { name: /Tabuleiro de xadrez, brancas embaixo/ })
  await expect(board).toBeVisible()

  // O bispo branco está em b3 (fim da linha principal), e não mais em f1.
  await expect(board.locator('[data-square="b3"] [data-piece="wB"]')).toBeVisible()
  await expect(board.locator('[data-square="f1"] [data-piece]')).toHaveCount(0)

  // Nenhuma casa entra no caminho do Tab e clicar numa peça não seleciona nada.
  await expect(board.locator('[tabindex="0"]')).toHaveCount(0)
  await board.locator('[data-square="b3"]').click()
  await expect(board.locator('[data-square="b3"]')).not.toHaveCSS('outline-style', 'solid')
  await expect(board.getByRole('button')).toHaveCount(0)
})

test('uma abertura que não existe mostra Página não encontrada', async ({ page }) => {
  await page.goto('/abertura/nao-existe')
  await expect(page.getByRole('heading', { level: 1, name: 'Página não encontrada' })).toBeVisible()
})
