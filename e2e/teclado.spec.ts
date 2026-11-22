import { expect, test, type Page } from '@playwright/test'

// Tabuleiro pelo teclado (F14). Usa a página de testes /dev/tabuleiro com ?jogar=brancas|pretas.

const square = (page: Page, name: string) => page.locator(`[data-square="${name}"]`)
const casa = (page: Page, nome: string) => page.getByRole('button', { name: nome, exact: true })

// Casas de destino marcadas (bolinha ou anel) e casa selecionada, como em clique.spec.ts
const marked = (page: Page) =>
  page.locator('[data-square] > div[style*="radial-gradient"], [data-square] > div[style*="border-radius: 50%"]')
const selected = (page: Page) =>
  page.locator('[data-square] > div[style*="box-shadow"]:not([style*="border-radius: 50%"])')


/**
 * Aperta Tab até o foco chegar no elemento (como uma pessoa faria). Antes do conteúdo
 * vêm o nome do app e os 3 botões de tema do header.
 */
async function tabTo(page: Page, target: import('@playwright/test').Locator) {
  for (let i = 0; i < 10; i++) {
    await page.keyboard.press('Tab')
    if (await target.evaluate((el) => el === document.activeElement).catch(() => false)) return
  }
  await expect(target).toBeFocused()
}

const AFTER_E4 = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR%20b%20KQkq%20-%200%201'

test('fazer 1. e4 usando só o teclado', async ({ page }) => {
  await page.goto('/dev/tabuleiro?jogar=brancas')

  await tabTo(page, casa(page, 'e2, peão branco')) // o foco chega ao tabuleiro (depois do header)

  await page.keyboard.press('Enter') // seleciona o peão
  await expect(selected(page)).toHaveCount(1)
  await expect(marked(page)).toHaveCount(2) // e3 e e4
  await expect(casa(page, 'e2, peão branco')).toHaveAttribute('aria-pressed', 'true')

  await page.keyboard.press('ArrowUp')
  await page.keyboard.press('ArrowUp')
  await expect(casa(page, 'e4, vazia, destino possível')).toBeFocused()

  await page.keyboard.press('Space') // escolhe a casa de destino
  await expect(page.getByTestId('lances-feitos')).toHaveText('e4')
  await expect(square(page, 'e4').locator('[data-piece="wP"]')).toHaveCount(1)
  await expect(square(page, 'e2').locator('[data-piece]')).toHaveCount(0)
  await expect(marked(page)).toHaveCount(0)
  // o foco continua na casa do lance, e as peças não viraram paradas do Tab
  await expect(casa(page, 'e4, peão branco')).toBeFocused()
})

test('a casa com foco tem um indicador visível (contorno)', async ({ page }) => {
  await page.goto('/dev/tabuleiro?jogar=brancas')
  await tabTo(page, casa(page, 'e2, peão branco'))
  const focada = casa(page, 'e2, peão branco')
  await expect(focada).toBeFocused()
  await expect(focada).toHaveCSS('outline-style', 'solid')
  await expect(focada).toHaveCSS('outline-width', '3px')

  // a seta move o indicador junto com o foco
  await page.keyboard.press('ArrowRight')
  await expect(casa(page, 'f2, peão branco')).toBeFocused()
  await expect(casa(page, 'f2, peão branco')).toHaveCSS('outline-style', 'solid')
  await expect(focada).toHaveCSS('outline-style', 'none')
})

test('Esc desfaz a seleção', async ({ page }) => {
  await page.goto('/dev/tabuleiro?jogar=brancas')
  await tabTo(page, casa(page, 'e2, peão branco'))
  await page.keyboard.press('Enter')
  await expect(marked(page)).toHaveCount(2)

  await page.keyboard.press('Escape')
  await expect(marked(page)).toHaveCount(0)
  await expect(selected(page)).toHaveCount(0)
  await expect(page.getByTestId('lances-feitos')).toHaveText('')
})

test('Enter numa casa que não é destino não faz lance e desfaz a seleção', async ({ page }) => {
  await page.goto('/dev/tabuleiro?jogar=brancas')
  await tabTo(page, casa(page, 'e2, peão branco'))
  await page.keyboard.press('Enter') // seleciona e2
  await page.keyboard.press('ArrowRight') // f2: não é destino do peão de e2
  await page.keyboard.press('Enter')
  await expect(page.getByTestId('lances-feitos')).toHaveText('')
  await expect(casa(page, 'e2, peão branco')).toHaveAttribute('aria-pressed', 'false')
})

test('peça do adversário não é selecionada pelo teclado', async ({ page }) => {
  await page.goto('/dev/tabuleiro?jogar=brancas')
  await casa(page, 'e7, peão preto').focus()
  await page.keyboard.press('Enter')
  await expect(marked(page)).toHaveCount(0)
  await expect(selected(page)).toHaveCount(0)
})

test('cada casa tem um nome acessível e só uma casa fica no caminho do Tab', async ({ page }) => {
  await page.goto('/dev/tabuleiro?jogar=brancas')
  await expect(casa(page, 'e2, peão branco')).toBeVisible()
  await expect(casa(page, 'g1, cavalo branco')).toBeVisible()
  await expect(casa(page, 'd8, dama preta')).toBeVisible()
  await expect(casa(page, 'e4, vazia')).toBeVisible()
  await expect(page.getByRole('group', { name: /Tabuleiro de xadrez/ }).getByRole('button')).toHaveCount(64)
  await expect(page.locator('.board [tabindex="0"]')).toHaveCount(1)
})

test('com as pretas embaixo, as setas seguem o tabuleiro invertido', async ({ page }) => {
  await page.goto(`/dev/tabuleiro?jogar=pretas&cor=pretas&fen=${AFTER_E4}`)
  await tabTo(page, casa(page, 'e7, peão preto')) // o foco chega ao tabuleiro (depois do header)
  await page.keyboard.press('Enter')
  await page.keyboard.press('ArrowUp') // para cima, na tela, é em direção às brancas
  await page.keyboard.press('ArrowUp')
  await expect(casa(page, 'e5, vazia, destino possível')).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.getByTestId('lances-feitos')).toHaveText('e5')
})

test('o tabuleiro só para olhar não entra no caminho do teclado', async ({ page }) => {
  await page.goto('/dev/tabuleiro')
  await expect(page.getByRole('group', { name: /Tabuleiro de xadrez/ }).getByRole('button')).toHaveCount(0)
  await expect(page.locator('.board [tabindex="0"]')).toHaveCount(0) // -1 não entra no caminho do Tab
})
