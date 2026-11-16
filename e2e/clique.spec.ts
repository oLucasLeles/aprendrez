import { expect, test, type Page } from '@playwright/test'

// Lances por clique (F11, SPEC seção 7.1). Usa a página de testes /dev/tabuleiro
// com ?jogar=brancas, que liga os cliques e aplica os lances com o chess.js.

const square = (page: Page, name: string) => page.locator(`[data-square="${name}"]`)

// Casas de destino marcadas: as que ganharam a bolinha ou o anel de destino
const marked = (page: Page) =>
  page.locator('[data-square] > div[style*="radial-gradient"], [data-square] > div[style*="border-radius: 50%"]')

// Casa da peça selecionada: contorno na cor de destaque (não é bolinha nem anel)
const selected = (page: Page) =>
  page.locator('[data-square] > div[style*="box-shadow"]:not([style*="border-radius: 50%"])')

test('clicar no peão de e2 marca e3 e e4; clicar em e4 faz o lance', async ({ page }) => {
  await page.goto('/dev/tabuleiro?jogar=brancas')
  await square(page, 'e2').click()

  await expect(marked(page)).toHaveCount(2)
  await expect(square(page, 'e3').locator('> div[style*="radial-gradient"]')).toHaveCount(1)
  await expect(square(page, 'e4').locator('> div[style*="radial-gradient"]')).toHaveCount(1)
  await expect(selected(page)).toHaveCount(1)

  await square(page, 'e4').click()
  await expect(page.getByTestId('lances-feitos')).toHaveText('e4')
  // o peão saiu de e2 e está em e4; a seleção e as marcas sumiram
  await expect(square(page, 'e4').locator('[data-piece="wP"]')).toHaveCount(1)
  await expect(square(page, 'e2').locator('[data-piece]')).toHaveCount(0)
  await expect(marked(page)).toHaveCount(0)
})

test('clicar numa peça preta na vez das brancas não seleciona nada', async ({ page }) => {
  await page.goto('/dev/tabuleiro?jogar=brancas')
  await square(page, 'e7').click()
  await expect(marked(page)).toHaveCount(0)
  await expect(selected(page)).toHaveCount(0)
})

test('depois do lance das brancas, as peças delas não podem ser selecionadas', async ({ page }) => {
  // Aqui é a vez das pretas, mas a pessoa joga de brancas
  await page.goto('/dev/tabuleiro?jogar=brancas&fen=rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR%20b%20KQkq%20-%200%201')
  await square(page, 'd2').click()
  await square(page, 'e7').click()
  await expect(marked(page)).toHaveCount(0)
  await expect(selected(page)).toHaveCount(0)
})

test('clicar numa casa não marcada não faz lance e desfaz a seleção', async ({ page }) => {
  await page.goto('/dev/tabuleiro?jogar=brancas')
  await square(page, 'e2').click()
  await expect(marked(page)).toHaveCount(2)

  await square(page, 'e5').click() // casa que não é destino do peão
  await expect(marked(page)).toHaveCount(0)
  await expect(selected(page)).toHaveCount(0)
  await expect(page.getByTestId('lances-feitos')).toHaveText('')
  await expect(square(page, 'e2').locator('[data-piece="wP"]')).toHaveCount(1)
})

test('clicar de novo na mesma peça desfaz a seleção', async ({ page }) => {
  await page.goto('/dev/tabuleiro?jogar=brancas')
  await square(page, 'g1').click()
  await expect(marked(page)).toHaveCount(2) // f3 e h3
  await square(page, 'g1').click()
  await expect(marked(page)).toHaveCount(0)
  await expect(selected(page)).toHaveCount(0)
})

test('o tabuleiro sem "jogar" é só para olhar: clicar não seleciona', async ({ page }) => {
  await page.goto('/dev/tabuleiro')
  await square(page, 'e2').click()
  await expect(marked(page)).toHaveCount(0)
  await expect(selected(page)).toHaveCount(0)
})
