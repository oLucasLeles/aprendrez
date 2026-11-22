import { expect, test, type Page } from '@playwright/test'

// Defesa Siciliana, linha aberta (F39): linha fixa, pretas, nível 3, contra 1.e4.
// Linha principal: 1.e4 c5 2.Cf3 Cc6 3.d4 cxd4 4.Cxd4 Cf6 5.Cc3 d6 6.Be2 e5 7.Cb3 Be7 8.O-O O-O 9.Be3 Be6

const square = (page: Page, name: string) => page.locator(`[data-square="${name}"]`)

/** Abre a lição direto no Desafio (só no desenvolvimento) e volta para "Praticar sozinho". */
async function openSoloPractice(page: Page) {
  await page.goto('/abertura/siciliana?etapa=desafio')
  const panel = page.getByRole('region', { name: 'Painel da lição' })
  await panel.getByRole('button', { name: 'Praticar sozinho', exact: true }).click()
  await expect(panel.getByRole('heading', { name: 'Praticar sozinho' })).toBeVisible()
  // O app joga sozinho o 1.e4 das brancas.
  await expect(panel.getByLabel('Lista de lances')).toHaveText('1. e4')
  return panel
}

/** Joga um lance por clique e espera a lista de lances mostrar o texto esperado (inclui a resposta do adversário). */
async function play(page: Page, from: string, to: string, expectedList: string) {
  const panel = page.getByRole('region', { name: 'Painel da lição' })
  await square(page, from).click()
  await square(page, to).click()
  await expect(panel.getByLabel('Lista de lances')).toHaveText(expectedList)
}

// Cada item: [de, para, lista de lances esperada depois da resposta das brancas]
const mainLine: [string, string, string][] = [
  ['c7', 'c5', '1. e4 c5 2. Cf3'],
  ['b8', 'c6', '1. e4 c5 2. Cf3 Cc6 3. d4'],
  ['c5', 'd4', '1. e4 c5 2. Cf3 Cc6 3. d4 cxd4 4. Cxd4'],
  ['g8', 'f6', '1. e4 c5 2. Cf3 Cc6 3. d4 cxd4 4. Cxd4 Cf6 5. Cc3'],
  ['d7', 'd6', '1. e4 c5 2. Cf3 Cc6 3. d4 cxd4 4. Cxd4 Cf6 5. Cc3 d6 6. Be2'],
  ['e7', 'e5', '1. e4 c5 2. Cf3 Cc6 3. d4 cxd4 4. Cxd4 Cf6 5. Cc3 d6 6. Be2 e5 7. Cb3'],
  ['f8', 'e7', '1. e4 c5 2. Cf3 Cc6 3. d4 cxd4 4. Cxd4 Cf6 5. Cc3 d6 6. Be2 e5 7. Cb3 Be7 8. O-O'],
  ['e8', 'g8', '1. e4 c5 2. Cf3 Cc6 3. d4 cxd4 4. Cxd4 Cf6 5. Cc3 d6 6. Be2 e5 7. Cb3 Be7 8. O-O O-O 9. Be3'],
]

test('linha principal inteira em "Praticar sozinho", do 1...c5 ao 9...Be6', async ({ page }) => {
  const panel = await openSoloPractice(page)
  for (const [from, to, list] of mainLine) await play(page, from, to, list)
  await play(page, 'c8', 'e6', '1. e4 c5 2. Cf3 Cc6 3. d4 cxd4 4. Cxd4 Cf6 5. Cc3 d6 6. Be2 e5 7. Cb3 Be7 8. O-O O-O 9. Be3 Be6')
  await expect(panel.getByText(/Você chegou ao fim da linha/)).toBeVisible()
  await expect(panel.getByText('Lance fora do roteiro.')).toHaveCount(0)
})

test('só um lance é aceito: outro lance legal fica fora do roteiro e "Voltar" o desfaz', async ({ page }) => {
  const panel = await openSoloPractice(page)

  // 1...e5 é legal (e é a resposta mais comum), mas aqui o lance da lição é 1...c5.
  await square(page, 'e7').click()
  await square(page, 'e5').click()
  await expect(panel.getByText('Lance fora do roteiro.')).toBeVisible()
  await expect(panel.getByRole('button', { name: 'Voltar' })).toBeVisible()

  await panel.getByRole('button', { name: 'Voltar' }).click()
  await expect(panel.getByLabel('Lista de lances')).toHaveText('1. e4')
  await play(page, 'c7', 'c5', '1. e4 c5 2. Cf3')
})

test('erro comum do conteúdo: 3...e5 em vez de 3...cxd4 mostra a explicação específica', async ({ page }) => {
  const panel = await openSoloPractice(page)
  for (const [from, to, list] of mainLine.slice(0, 2)) await play(page, from, to, list)

  await square(page, 'e7').click()
  await square(page, 'e5').click()
  await expect(panel.getByText('Lance fora do roteiro.')).toBeVisible()
  await expect(panel.getByText(/você fica com um peão a menos/)).toBeVisible()
})

test('a etapa Variações mostra as duas variações da Siciliana, cada uma com o nome do desvio', async ({ page }) => {
  await page.goto('/abertura/siciliana?etapa=desafio')
  const panel = page.getByRole('region', { name: 'Painel da lição' })
  await panel.getByRole('button', { name: 'Variações', exact: true }).click()
  await expect(panel.getByRole('heading', { name: 'Variações' })).toBeVisible()
  await expect(panel.getByTestId('variacao-atual')).toContainText('Variação 1 de 2: ')
  await expect(panel.getByTestId('variacao-atual')).toContainText(/Brancas (jogam Bg5 em vez de Be2|trocam os cavalos)/)
})

test('a abertura aparece na trilha (nível 3) e a etapa Conhecer mostra a Siciliana com as pretas embaixo', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Defesa Siciliana (linha aberta)' }).click()
  await expect(page).toHaveURL(/\/abertura\/siciliana$/)
  const panel = page.getByRole('region', { name: 'Painel da lição' })
  await expect(panel.getByRole('heading', { name: 'Conhecer' })).toBeVisible()
  await expect(panel.getByText('Defesa Siciliana (linha aberta)')).toBeVisible()
  await expect(panel.getByText(/chances de vitória para os dois lados/)).toBeVisible()
  await expect(page.getByRole('group', { name: /Tabuleiro de xadrez/ })).toHaveAccessibleName(/pretas embaixo/)
})
