import { expect, test, type Page } from '@playwright/test'

// Tela de conclusão (F27, SPEC 10.3): posição final, ideia, linha principal e os dois botões.

const square = (page: Page, name: string) => page.locator(`[data-square="${name}"]`)

const MAIN_USER: [string, string][] = [
  ['e2', 'e4'],
  ['g1', 'f3'],
  ['f1', 'c4'],
  ['c2', 'c3'],
  ['d2', 'd3'],
  ['e1', 'g1'],
  ['f1', 'e1'],
  ['c4', 'b3'],
]
const MAIN_LINE = '1. e4 e5 2. Cf3 Cc6 3. Bc4 Bc5 4. c3 Cf6 5. d3 d6 6. O-O O-O 7. Te1 a6 8. Bb3 Ba7'

test('ao concluir a Italiana, a tela mostra a linha principal e "Próxima abertura" leva à próxima da trilha', async ({
  page,
}) => {
  test.setTimeout(60_000)
  // Joga o Desafio inteiro (acaso = 0: o adversário segue a linha principal)
  await page.goto('/abertura/italiana?etapa=desafio&acaso=0')
  const panel = page.getByRole('region', { name: 'Painel da lição' })
  for (const [index, [from, to]] of MAIN_USER.entries()) {
    await square(page, from).click()
    await square(page, to).click()
    // espera a resposta do adversário antes do próximo lance
    await expect(panel.getByLabel('Lista de lances')).toHaveText(
      MAIN_LINE.split(' ').slice(0, (index + 1) * 3).join(' '),
    )
  }
  await panel.getByRole('button', { name: 'Concluir' }).click()

  await expect(page).toHaveURL(/\/abertura\/italiana\/conclusao$/)
  await expect(page.getByRole('heading', { name: 'Fim do Desafio' })).toBeVisible()
  await expect(page.getByLabel('Linha principal em notação')).toHaveText(MAIN_LINE)
  await expect(page.getByRole('heading', { name: 'A ideia' })).toBeVisible()
  await expect(page.getByText(/Você ocupa o centro do tabuleiro/)).toBeVisible()
  // posição final: bispo branco em b3 e bispo preto em a7
  await expect(square(page, 'b3').locator('svg')).toHaveCount(1)
  await expect(square(page, 'a7').locator('svg')).toHaveCount(1)

  await page.getByRole('button', { name: 'Próxima abertura' }).click()
  // Na trilha da SPEC, depois da Italiana vem o Sistema Londres.
  await expect(page).toHaveURL(/\/abertura\/londres$/)
  await expect(page.getByRole('heading', { level: 1, name: 'Sistema Londres' })).toBeVisible()
})

test('"Voltar à trilha" leva ao início', async ({ page }) => {
  await page.goto('/abertura/italiana/conclusao')
  await page.getByRole('button', { name: 'Voltar à trilha' }).click()
  await expect(page).toHaveURL(/\/$/)
})

test('abertura inexistente mostra a página não encontrada', async ({ page }) => {
  await page.goto('/abertura/xyz/conclusao')
  await expect(page.getByRole('heading', { name: /não encontrada/i })).toBeVisible()
})

test('a tela de conclusão não tem rolagem horizontal', async ({ page }) => {
  await page.goto('/abertura/italiana/conclusao')
  await expect(page.getByRole('heading', { name: 'Fim do Desafio' })).toBeVisible()
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
  expect(overflow).toBe(false)
  // A captura vai para a pasta temporária dos testes (test-results), e não para docs/capturas:
  // senão cada execução dos testes mudaria um arquivo do projeto e deixaria "alterações sem commit".
  await page.screenshot({ path: test.info().outputPath(`f27-${test.info().project.name}.png`), fullPage: true })
})
