import { expect, test, type Page } from '@playwright/test'

// Etapa 4 · Praticar sozinho (F21): a mesma linha da Italiana, sem guia.
// Lance fora do roteiro (SPEC 7.3) e botão "Ver lance".

const square = (page: Page, name: string) => page.locator(`[data-square="${name}"]`)
const arrow = (page: Page) => page.getByRole('group', { name: /Tabuleiro de xadrez/ }).locator('svg path[stroke]')
const originHighlight = (page: Page, name: string) => square(page, name).locator('> div[style*="box-shadow"]')

async function openSoloPractice(page: Page) {
  await page.goto('/abertura/italiana')
  const panel = page.getByRole('region', { name: 'Painel da lição' })
  await panel.getByRole('button', { name: /Próxima etapa/ }).click() // Conhecer → Assistir
  await panel.getByRole('button', { name: /Próxima etapa/ }).click() // Assistir → Praticar com guia

  // Joga a linha toda com guia (por clique) só para liberar o "Continuar".
  const steps = [
    ['e2', 'e4'],
    ['g1', 'f3'],
    ['f1', 'c4'],
    ['c2', 'c3'],
    ['d2', 'd3'],
    ['e1', 'g1'],
    ['f1', 'e1'],
    ['c4', 'b3'],
  ]
  for (const [from, to] of steps) {
    await expect(originHighlight(page, from)).toHaveCount(1)
    await square(page, from).click()
    await square(page, to).click()
  }
  await expect(panel.getByText(/Você chegou ao fim da linha/)).toBeVisible()
  await panel.getByRole('button', { name: /Próxima etapa/ }).click() // → Praticar sozinho
  await expect(panel.getByRole('heading', { name: 'Praticar sozinho' })).toBeVisible()
  return panel
}

test('sem guia: nenhuma peça marcada nem seta no começo da etapa', async ({ page }) => {
  const panel = await openSoloPractice(page)
  await expect(panel.getByLabel('Lista de lances')).toContainText('Nenhum lance ainda')
  await expect(arrow(page)).toHaveCount(0)
  await expect(originHighlight(page, 'e2')).toHaveCount(0)
})

test('lance legal fora do roteiro: mensagem com ícone, texto e dica, e o botão "Voltar"', async ({ page }) => {
  const panel = await openSoloPractice(page)
  const board = page.getByRole('group', { name: /Tabuleiro de xadrez/ })

  await square(page, 'd2').click()
  await square(page, 'd4').click()

  // O lance fica no tabuleiro
  await expect(board.locator('[data-square="d4"] [data-piece="wP"]')).toBeVisible()

  // A mensagem tem texto, a dica daquele momento e um ícone
  await expect(panel.getByText('Lance fora do roteiro.')).toBeVisible()
  await expect(panel.getByText(/possível, mas não é o da abertura/)).toBeVisible()
  await expect(panel.getByText(/Comece ocupando o centro com o peão/)).toBeVisible()
  const icon = panel.getByTestId('icone-fora-do-roteiro')
  await expect(icon).toBeVisible()

  // O ícone e a mensagem NÃO usam o vermelho de destaque
  const colors = await page.evaluate(() => {
    const accent = getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim()
    const probe = document.createElement('span')
    probe.style.color = accent
    document.body.appendChild(probe)
    const accentRgb = getComputedStyle(probe).color
    probe.remove()
    const message = document.querySelector('.lesson-offscript') as HTMLElement
    const icon = document.querySelector('[data-testid="icone-fora-do-roteiro"]') as SVGElement
    return {
      accentRgb,
      messageColor: getComputedStyle(message).color,
      iconColor: getComputedStyle(icon).color,
      messageBorder: getComputedStyle(message).borderLeftColor,
    }
  })
  expect(colors.messageColor).not.toBe(colors.accentRgb)
  expect(colors.iconColor).not.toBe(colors.accentRgb)
  expect(colors.messageBorder).not.toBe(colors.accentRgb)

  // O botão principal vira "Voltar" e usa a cor de destaque
  await expect(panel.getByRole('button', { name: /Próxima etapa/ })).not.toHaveClass(/is-emphasized/)
  const back = panel.getByRole('button', { name: 'Voltar' })
  await expect(back).toBeVisible()
  const backBackground = await back.evaluate((el) => getComputedStyle(el).backgroundColor)
  expect(backBackground).toBe(colors.accentRgb)
})

test('um erro comum mostra a explicação específica no lugar da mensagem genérica', async ({ page }) => {
  const panel = await openSoloPractice(page)

  await square(page, 'a2').click()
  await square(page, 'a4').click()

  await expect(panel.getByText('Lance fora do roteiro.')).toBeVisible()
  await expect(panel.getByText(/o peão da borda quase não influencia o centro/)).toBeVisible()
  await expect(panel.getByText(/possível, mas não é o da abertura/)).toHaveCount(0)
})

test('"Voltar" desfaz o lance e permite jogar o correto', async ({ page }) => {
  const panel = await openSoloPractice(page)
  const board = page.getByRole('group', { name: /Tabuleiro de xadrez/ })
  const moves = panel.getByLabel('Lista de lances')

  await square(page, 'd2').click()
  await square(page, 'd4').click()
  await expect(moves).toHaveText(/^1\. d4$/)

  await panel.getByRole('button', { name: 'Voltar' }).click()
  await expect(board.locator('[data-square="d2"] [data-piece="wP"]')).toBeVisible()
  await expect(board.locator('[data-square="d4"] [data-piece]')).toHaveCount(0)
  await expect(moves).toContainText('Nenhum lance ainda')
  await expect(panel.getByText('Lance fora do roteiro.')).toHaveCount(0)

  // agora o lance correto
  await square(page, 'e2').click()
  await square(page, 'e4').click()
  await expect(panel.getByText('Lance correto.')).toBeVisible()
  await expect(moves).toHaveText(/^1\. e4/)
  // e o adversário responde
  await expect(moves).toHaveText(/^1\. e4 e5$/)
})

test('"Ver lance" mostra o guia só do lance atual, sem penalidade', async ({ page }) => {
  const panel = await openSoloPractice(page)
  const moves = panel.getByLabel('Lista de lances')

  await expect(arrow(page)).toHaveCount(0)
  await panel.getByRole('button', { name: 'Ver lance' }).click()

  // o guia do lance atual (e2 → e4)
  await expect(originHighlight(page, 'e2')).toHaveCount(1)
  await expect(arrow(page)).toHaveCount(1)

  // depois de jogar, o guia some e não aparece sozinho no lance seguinte
  await square(page, 'e2').click()
  await square(page, 'e4').click()
  await expect(moves).toHaveText(/^1\. e4 e5$/)
  await expect(arrow(page)).toHaveCount(0)
  await expect(originHighlight(page, 'g1')).toHaveCount(0)
  await expect(panel.getByText('Lance correto.')).toBeVisible() // sem penalidade

  // pedindo de novo, mostra o guia do novo lance (g1 → f3)
  await panel.getByRole('button', { name: 'Ver lance' }).click()
  await expect(originHighlight(page, 'g1')).toHaveCount(1)
  await expect(arrow(page)).toHaveCount(1)
})
