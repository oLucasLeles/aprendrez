import { expect, test, type Page } from '@playwright/test'

// Etapa 3 · Praticar com guia (F20): a pessoa joga a linha principal da Italiana
// seguindo o guia (peça marcada + seta); o adversário responde sozinho (~400 ms).

const square = (page: Page, name: string) => page.locator(`[data-square="${name}"]`)
const arrow = (page: Page) => page.getByRole('group', { name: /Tabuleiro de xadrez/ }).locator('svg path[stroke]')

// Os lances das brancas na linha principal (de casa para casa) e a lista esperada depois de cada um.
const USER_MOVES: Array<{ from: string; to: string; list: RegExp }> = [
  { from: 'e2', to: 'e4', list: /^1\. e4$/ },
  { from: 'g1', to: 'f3', list: /^1\. e4 e5 2\. Cf3$/ },
  { from: 'f1', to: 'c4', list: /^1\. e4 e5 2\. Cf3 Cc6 3\. Bc4$/ },
  { from: 'c2', to: 'c3', list: /3\. Bc4 Bc5 4\. c3$/ },
  { from: 'd2', to: 'd3', list: /4\. c3 Cf6 5\. d3$/ },
  { from: 'e1', to: 'g1', list: /5\. d3 d6 6\. O-O$/ },
  { from: 'f1', to: 'e1', list: /6\. O-O O-O 7\. Te1$/ },
  { from: 'c4', to: 'b3', list: /7\. Te1 a6 8\. Bb3$/ },
]

async function openGuidedPractice(page: Page) {
  await page.goto('/abertura/italiana')
  const panel = page.getByRole('region', { name: 'Painel da lição' })
  await panel.getByRole('button', { name: /Próxima etapa/ }).click() // Conhecer → Assistir
  await panel.getByRole('button', { name: /Próxima etapa/ }).click() // Assistir → Praticar com guia
  await expect(panel.getByRole('heading', { name: 'Praticar com guia' })).toBeVisible()
  return panel
}

test('jogar a linha principal da Italiana inteira seguindo o guia, por clique', async ({ page }) => {
  const panel = await openGuidedPractice(page)
  const moves = panel.getByLabel('Lista de lances')

  await expect(moves).toContainText('Nenhum lance ainda')
  // "Continuar" só abre no fim da linha
  await expect(panel.getByRole('button', { name: /Próxima etapa/ })).not.toHaveClass(/is-emphasized/)

  for (const move of USER_MOVES) {
    // o guia aponta a peça certa (destaque na origem) e existe uma seta
    await expect(square(page, move.from).locator('> div[style*="box-shadow"]')).toHaveCount(1)
    await expect(arrow(page)).toHaveCount(1)

    await square(page, move.from).click()
    await square(page, move.to).click()

    await expect(panel.getByText('Lance correto.')).toBeVisible()
    await expect(moves).toHaveText(move.list)
  }

  // Depois do último lance das brancas o adversário ainda responde (8...Ba7), e a linha termina.
  await expect(moves).toContainText('8. Bb3 Ba7')
  await expect(panel.getByText(/Você chegou ao fim da linha/)).toBeVisible()
  await expect(arrow(page)).toHaveCount(0)
  await expect(panel.getByRole('button', { name: /Próxima etapa/ })).toHaveClass(/is-emphasized/)
})

test('o lance do adversário aparece sozinho depois de cada lance correto', async ({ page }) => {
  const panel = await openGuidedPractice(page)
  const board = page.getByRole('group', { name: /Tabuleiro de xadrez/ })
  const moves = panel.getByLabel('Lista de lances')

  await square(page, 'e2').click()
  await square(page, 'e4').click()

  // Logo depois do lance, só o das brancas está na lista; a explicação do lance aparece.
  await expect(moves).toHaveText(/^1\. e4$/)
  await expect(panel.getByText('Lance correto.')).toBeVisible()

  // Sem nenhum clique, as pretas respondem e5 (depois de ~400 ms).
  await expect(moves).toHaveText(/^1\. e4 e5$/)
  await expect(board.locator('[data-square="e5"] [data-piece="bP"]')).toBeVisible()
  await expect(board.locator('[data-square="e7"] [data-piece]')).toHaveCount(0)

  // E aparece o guia do próximo lance (g1 → f3).
  await expect(square(page, 'g1').locator('> div[style*="box-shadow"]')).toHaveCount(1)
})

test('um lance legal fora da linha fica no tabuleiro e o botão "Voltar" o desfaz', async ({ page }) => {
  const panel = await openGuidedPractice(page)
  const board = page.getByRole('group', { name: /Tabuleiro de xadrez/ })

  await square(page, 'd2').click()
  await square(page, 'd4').click()

  await expect(panel.getByText(/possível, mas não é o da abertura/)).toBeVisible()
  await expect(board.locator('[data-square="d4"] [data-piece="wP"]')).toBeVisible()
  await expect(panel.getByRole('button', { name: /Próxima etapa/ })).not.toHaveClass(/is-emphasized/)

  await panel.getByRole('button', { name: 'Voltar' }).click()
  await expect(board.locator('[data-square="d2"] [data-piece="wP"]')).toBeVisible()
  await expect(board.locator('[data-square="d4"] [data-piece]')).toHaveCount(0)
  await expect(panel.getByLabel('Lista de lances')).toContainText('Nenhum lance ainda')
})
