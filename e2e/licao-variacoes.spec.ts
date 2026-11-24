import { expect, test, type Locator, type Page } from '@playwright/test'
import { expectStage } from './etapas'

// Etapa 5 · Variações (F22): para cada variação da Italiana, assistir, praticar com guia
// e praticar sozinho. A primeira variação da árvore é 5...a6: 6.O-O d6 7.Te1 O-O. A segunda é 4...d6.

const square = (page: Page, name: string) => page.locator(`[data-square="${name}"]`)
const arrow = (page: Page) => page.getByRole('group', { name: /Tabuleiro de xadrez/ }).locator('svg path[stroke]')
const originHighlight = (page: Page, name: string) => square(page, name).locator('> div[style*="box-shadow"]')

/** Monta a lista numerada esperada, como "1. e4 e5 2. Cf3". */
function numbered(tokens: string[]): string {
  return tokens.map((token, index) => (index % 2 === 0 ? `${index / 2 + 1}. ${token}` : token)).join(' ')
}

// Os lances da pessoa (de, para) e as respostas do adversário, em português.
const MAIN_USER = [
  ['e2', 'e4'],
  ['g1', 'f3'],
  ['f1', 'c4'],
  ['c2', 'c3'],
  ['d2', 'd3'],
  ['e1', 'g1'],
  ['f1', 'e1'],
  ['c4', 'b3'],
]
const MAIN_TOKENS = ['e4', 'e5', 'Cf3', 'Cc6', 'Bc4', 'Bc5', 'c3', 'Cf6', 'd3', 'd6', 'O-O', 'O-O', 'Te1', 'a6', 'Bb3', 'Ba7']

const VAR1_USER = MAIN_USER.slice(0, 7)
const VAR1_TOKENS = ['e4', 'e5', 'Cf3', 'Cc6', 'Bc4', 'Bc5', 'c3', 'Cf6', 'd3', 'a6', 'O-O', 'd6', 'Te1', 'O-O']

/** Joga os lances da pessoa e espera cada resposta do adversário aparecer na lista. */
async function playLine(page: Page, moves: Locator, userMoves: string[][], tokens: string[], guided: boolean) {
  // Espera a partida nova aparecer (lista vazia) antes do primeiro clique. Sem isso, um clique
  // logo depois de trocar de etapa ou de passo podia cair na tela antiga e se perder, deixando o teste instável.
  await expect(moves).toHaveText('Nenhum lance ainda.')
  for (const [index, [from, to]] of userMoves.entries()) {
    if (guided) await expect(originHighlight(page, from)).toHaveCount(1)
    await square(page, from).click()
    await square(page, to).click()
    // depois do lance da pessoa vem a resposta do adversário (a menos que a linha tenha acabado)
    const shown = Math.min(tokens.length, (index + 1) * 2)
    await expect(moves).toHaveText(numbered(tokens.slice(0, shown)))
  }
}

/** Abre a Italiana e chega à etapa Variações, jogando as etapas anteriores. */
async function openVariations(page: Page) {
  await page.goto('/abertura/italiana')
  const panel = page.getByRole('region', { name: 'Painel da lição' })
  const moves = panel.getByLabel('Lista de lances')
  const next = panel.getByRole('button', { name: /Próxima etapa/ })

  await next.click() // Conhecer → Assistir
  await next.click() // Assistir → Praticar com guia
  await playLine(page, moves, MAIN_USER, MAIN_TOKENS, true)
  await next.click() // → Praticar sozinho
  await playLine(page, moves, MAIN_USER, MAIN_TOKENS, false)
  await expect(panel.getByText(/Você chegou ao fim da linha/)).toBeVisible()
  await next.click() // → Variações
  return { panel, moves, next }
}

test('completar a primeira variação da Italiana: assistir, praticar com guia e praticar sozinho', async ({ page }) => {
  test.setTimeout(90_000)
  const { panel, moves, next } = await openVariations(page)
  const board = page.getByRole('group', { name: /Tabuleiro de xadrez/ })
  const stages = page.getByRole('navigation', { name: 'Etapas da lição' })

  // --- Assistir: começa no momento do desvio, com a pergunta
  await expect(panel.getByRole('heading', { name: 'Variações' })).toBeVisible()
  await expect(panel.getByText('E se as pretas jogarem 5... a6?')).toBeVisible()
  await expect(panel.getByTestId('variacao-atual')).toContainText('Variação 1 de 2: Pretas jogam a6 antes do roque · Assistir')
  await expectStage(page, 'Variações')
  await expect(moves).toHaveText(numbered(VAR1_TOKENS.slice(0, 9)))

  // a continuação, lance a lance
  const forward = panel.getByRole('button', { name: 'Próximo lance' })
  await forward.click()
  await expect(board.locator('[data-square="a6"] [data-piece="bP"]')).toBeVisible()
  await expect(moves).toHaveText(numbered(VAR1_TOKENS.slice(0, 10)))
  await expect(panel.getByText('As pretas respondem com a6.')).toBeVisible()
  for (let i = 0; i < 4; i++) await forward.click()
  await expect(moves).toHaveText(numbered(VAR1_TOKENS))
  await expect(forward).toHaveCount(0)

  // --- Praticar com guia: a pessoa joga a variação; o adversário desvia sozinho
  await panel.getByRole('button', { name: 'Praticar esta variação com guia' }).click()
  await expect(panel.getByTestId('variacao-atual')).toContainText('Variação 1 de 2: Pretas jogam a6 antes do roque · Praticar com guia')
  await expect(panel.getByLabel('Lista de lances')).toContainText('Nenhum lance ainda')
  await playLine(page, moves, VAR1_USER, VAR1_TOKENS, true)
  await expect(panel.getByText(/Você chegou ao fim desta variação/)).toBeVisible()
  await expect(arrow(page)).toHaveCount(0)

  // --- Praticar sozinho: a mesma variação, sem guia
  await panel.getByRole('button', { name: 'Praticar esta variação sozinho' }).click()
  await expect(panel.getByTestId('variacao-atual')).toContainText('Variação 1 de 2: Pretas jogam a6 antes do roque · Praticar sozinho')
  await expect(arrow(page)).toHaveCount(0)
  await expect(originHighlight(page, 'e2')).toHaveCount(0)
  await playLine(page, moves, VAR1_USER, VAR1_TOKENS, false)
  await expect(panel.getByText(/Você chegou ao fim desta variação/)).toBeVisible()

  // --- Segue para a segunda variação
  await panel.getByRole('button', { name: 'Próxima variação' }).click()
  await expectStage(page, 'Variações')
  await expect(panel.getByText('E se as pretas jogarem 4... d6?')).toBeVisible()
  await expect(panel.getByTestId('variacao-atual')).toContainText('Variação 2 de 2: Pretas jogam d6 cedo · Assistir')
})
