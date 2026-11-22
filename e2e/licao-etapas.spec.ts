import { expect, test, type Page } from '@playwright/test'

// Navegação entre etapas (F24): o indicador mostra a etapa atual e deixa abrir qualquer
// etapa a qualquer momento (exploração livre); "Voltar ao início" / "Recomeçar a partida" recomeçam a etapa atual.

const square = (page: Page, name: string) => page.locator(`[data-square="${name}"]`)

async function openLesson(page: Page) {
  await page.goto('/abertura/italiana')
  const panel = page.getByRole('region', { name: 'Painel da lição' })
  const stages = page.getByRole('navigation', { name: 'Etapas da lição' })
  return { panel, stages }
}

test('depois de chegar a "Praticar com guia", clicar em "Assistir" volta para aquela etapa', async ({ page }) => {
  const { panel, stages } = await openLesson(page)
  await panel.getByRole('button', { name: /Próxima etapa/ }).click() // Conhecer → Assistir
  await panel.getByRole('button', { name: /Próxima etapa/ }).click() // Assistir → Praticar com guia
  await expect(panel.getByRole('heading', { name: 'Praticar com guia' })).toBeVisible()
  await expect(stages.locator('[aria-current="step"]')).toHaveAccessibleName('Praticar com guia')

  await stages.getByRole('button', { name: 'Assistir' }).click()
  await expect(panel.getByRole('heading', { name: 'Assistir' })).toBeVisible()
  await expect(stages.locator('[aria-current="step"]')).toHaveAccessibleName('Assistir')
  await expect(panel.getByLabel('Lista de lances')).toContainText('Nenhum lance ainda')

  // A etapa onde a pessoa já esteve continua acessível.
  await stages.getByRole('button', { name: 'Praticar com guia' }).click()
  await expect(panel.getByRole('heading', { name: 'Praticar com guia' })).toBeVisible()

  // Também dá para voltar à primeira etapa.
  await stages.getByRole('button', { name: 'Conhecer' }).click()
  await expect(panel.getByRole('heading', { name: 'Conhecer' })).toBeVisible()
})

test('qualquer etapa pode ser aberta logo de início, sem marca de "concluída"', async ({ page }) => {
  const { panel, stages } = await openLesson(page)
  await stages.getByRole('button', { name: 'Desafio' }).click()
  await expect(panel.getByRole('heading', { name: 'Desafio' })).toBeVisible()
  await stages.getByRole('button', { name: 'Praticar sozinho' }).click()
  await expect(panel.getByRole('heading', { name: 'Praticar sozinho' })).toBeVisible()
  await stages.getByRole('button', { name: 'Variações' }).click()
  await expect(panel.getByRole('heading', { name: 'Variações' })).toBeVisible()
  // Nenhuma etapa fica desabilitada nem aparece como concluída.
  for (const name of ['Conhecer', 'Assistir', 'Praticar com guia', 'Praticar sozinho', 'Desafio']) {
    await expect(stages.getByRole('button', { name, exact: true })).toBeEnabled()
  }
  await expect(stages.getByText(/concluída/)).toHaveCount(0)
})

test('"Voltar ao início" volta o Assistir para o primeiro lance', async ({ page }) => {
  const { panel } = await openLesson(page)
  await panel.getByRole('button', { name: /Próxima etapa/ }).click() // → Assistir
  const moves = panel.getByLabel('Lista de lances')

  await panel.getByRole('button', { name: 'Próximo lance' }).click()
  await panel.getByRole('button', { name: 'Próximo lance' }).click()
  // (a lista do Assistir termina com um espaço, por isso o \s*)
  await expect(moves).toHaveText(/^1\. e4 e5\s*$/)

  await panel.getByRole('button', { name: 'Voltar ao início' }).click()
  await expect(moves).toContainText('Nenhum lance ainda')
  await expect(panel.getByText('Lance 0 de')).toBeVisible()
})

test('"Recomeçar a partida" volta a posição para o início da prática', async ({ page }) => {
  const { panel } = await openLesson(page)
  await panel.getByRole('button', { name: /Próxima etapa/ }).click() // → Assistir
  await panel.getByRole('button', { name: /Próxima etapa/ }).click() // → Praticar com guia
  const board = page.getByRole('group', { name: /Tabuleiro de xadrez/ })
  const moves = panel.getByLabel('Lista de lances')

  await square(page, 'e2').click()
  await square(page, 'e4').click()
  // O adversário responde sozinho (~400 ms): a partida já tem dois lances.
  await expect(moves).toHaveText(/^1\. e4 e5$/)

  await panel.getByRole('button', { name: 'Recomeçar a partida' }).click()
  await expect(moves).toContainText('Nenhum lance ainda')
  await expect(board.locator('[data-square="e2"] [data-piece="wP"]')).toBeVisible()
  await expect(board.locator('[data-square="e4"] [data-piece]')).toHaveCount(0)
  await expect(board.locator('[data-square="e5"] [data-piece]')).toHaveCount(0)
  // O guia do primeiro lance volta, e dá para jogar de novo.
  await expect(square(page, 'e2').locator('> div[style*="box-shadow"]')).toHaveCount(1)
  await square(page, 'e2').click()
  await square(page, 'e4').click()
  await expect(moves).toHaveText(/^1\. e4/)
})

test('"Recomeçar" não aparece na etapa Conhecer', async ({ page }) => {
  const { panel } = await openLesson(page)
  await expect(panel.getByRole('button', { name: /Recomeçar|Voltar ao início/ })).toHaveCount(0)
})
