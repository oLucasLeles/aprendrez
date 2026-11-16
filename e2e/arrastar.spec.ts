import { expect, test, type Page } from '@playwright/test'

// Lances por arrastar (F12, SPEC seção 7.2). Usa a página de testes
// /dev/tabuleiro com ?jogar=brancas.

const square = (page: Page, name: string) => page.locator(`[data-square="${name}"]`)

// Casas de destino marcadas (bolinha ou anel), como nos testes de clique
const marked = (page: Page) =>
  page.locator('[data-square] > div[style*="radial-gradient"], [data-square] > div[style*="border-radius: 50%"]')

// Arrasta a peça de uma casa até o centro de outra, passo a passo (como uma mão)
async function drag(page: Page, from: string, to: string, { drop = true } = {}) {
  const a = (await square(page, from).boundingBox())!
  const b = (await square(page, to).boundingBox())!
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2)
  await page.mouse.down()
  await page.mouse.move(a.x + a.width / 2 + 10, a.y + a.height / 2 + 10, { steps: 3 })
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 8 })
  if (drop) await page.mouse.up()
}

test('arrastar o peão de e2 para e4 faz o lance', async ({ page }) => {
  await page.goto('/dev/tabuleiro?jogar=brancas')
  await drag(page, 'e2', 'e4')

  await expect(page.getByTestId('lances-feitos')).toHaveText('e4')
  await expect(square(page, 'e4').locator('[data-piece="wP"]')).toHaveCount(1)
  await expect(square(page, 'e2').locator('[data-piece]')).toHaveCount(0)
  await expect(marked(page)).toHaveCount(0)
})

test('enquanto arrasta o peão de e2, e3 e e4 ficam marcadas', async ({ page }) => {
  await page.goto('/dev/tabuleiro?jogar=brancas')
  await drag(page, 'e2', 'e4', { drop: false })
  await expect(marked(page)).toHaveCount(2)
  await page.mouse.up()
  await expect(marked(page)).toHaveCount(0)
})

test('arrastar o peão de e2 para e5 devolve o peão a e2, sem mensagem e sem mudar a vez', async ({ page }) => {
  await page.goto('/dev/tabuleiro?jogar=brancas')
  await drag(page, 'e2', 'e5')

  await expect(square(page, 'e2').locator('[data-piece="wP"]')).toHaveCount(1)
  await expect(square(page, 'e5').locator('[data-piece]')).toHaveCount(0)
  await expect(page.getByTestId('lances-feitos')).toHaveText('')
  await expect(marked(page)).toHaveCount(0)
  await expect(page.getByRole('alert')).toHaveCount(0)

  // Continua sendo a vez das brancas: um lance legal depois ainda funciona
  await drag(page, 'g1', 'f3')
  await expect(page.getByTestId('lances-feitos')).toHaveText('Nf3')
})

test('soltar fora do tabuleiro também devolve a peça', async ({ page }) => {
  await page.goto('/dev/tabuleiro?jogar=brancas')
  const a = (await square(page, 'e2').boundingBox())!
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2)
  await page.mouse.down()
  await page.mouse.move(a.x + a.width / 2 + 10, a.y + 40, { steps: 3 })
  await page.mouse.move(2, 2, { steps: 8 })
  await page.mouse.up()

  await expect(square(page, 'e2').locator('[data-piece="wP"]')).toHaveCount(1)
  await expect(page.getByTestId('lances-feitos')).toHaveText('')
})

test('não dá para arrastar peça do adversário', async ({ page }) => {
  await page.goto('/dev/tabuleiro?jogar=brancas')
  await drag(page, 'e7', 'e5')
  await expect(square(page, 'e7').locator('[data-piece="bP"]')).toHaveCount(1)
  await expect(page.getByTestId('lances-feitos')).toHaveText('')
})

test('clicar numa peça continua selecionando (arrastar não atrapalha o clique)', async ({ page }) => {
  await page.goto('/dev/tabuleiro?jogar=brancas')
  await square(page, 'e2').click()
  await expect(marked(page)).toHaveCount(2)
  await square(page, 'e4').click()
  await expect(page.getByTestId('lances-feitos')).toHaveText('e4')
})
