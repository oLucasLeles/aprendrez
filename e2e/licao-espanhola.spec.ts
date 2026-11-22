import { expect, test, type Page } from '@playwright/test'

// Espanhola / Ruy Lopez (F35): linha fixa, brancas, nível 2.
// Linha principal: 1.e4 e5 2.Cf3 Cc6 3.Bb5 a6 4.Ba4 Cf6 5.O-O Be7 6.Te1 b5 7.Bb3 d6 8.c3 O-O

const square = (page: Page, name: string) => page.locator(`[data-square="${name}"]`)

/** Abre a lição direto no Desafio (só no desenvolvimento) e volta para "Praticar sozinho". */
async function openSoloPractice(page: Page) {
  await page.goto('/abertura/espanhola?etapa=desafio')
  const panel = page.getByRole('region', { name: 'Painel da lição' })
  await panel.getByRole('button', { name: 'Praticar sozinho', exact: true }).click()
  await expect(panel.getByRole('heading', { name: 'Praticar sozinho' })).toBeVisible()
  await expect(panel.getByLabel('Lista de lances')).toContainText('Nenhum lance ainda')
  return panel
}

/** Joga um lance por clique e espera a lista de lances mostrar o texto esperado (inclui a resposta do adversário). */
async function play(page: Page, from: string, to: string, expectedList: string) {
  const panel = page.getByRole('region', { name: 'Painel da lição' })
  await square(page, from).click()
  await square(page, to).click()
  await expect(panel.getByLabel('Lista de lances')).toHaveText(expectedList)
}

// Cada item: [de, para, lista de lances esperada depois da resposta do adversário]
const mainLine: [string, string, string][] = [
  ['e2', 'e4', '1. e4 e5'],
  ['g1', 'f3', '1. e4 e5 2. Cf3 Cc6'],
  ['f1', 'b5', '1. e4 e5 2. Cf3 Cc6 3. Bb5 a6'],
  ['b5', 'a4', '1. e4 e5 2. Cf3 Cc6 3. Bb5 a6 4. Ba4 Cf6'],
  ['e1', 'g1', '1. e4 e5 2. Cf3 Cc6 3. Bb5 a6 4. Ba4 Cf6 5. O-O Be7'],
  ['f1', 'e1', '1. e4 e5 2. Cf3 Cc6 3. Bb5 a6 4. Ba4 Cf6 5. O-O Be7 6. Te1 b5'],
]

async function playUntilSixthMove(page: Page) {
  for (const [from, to, list] of mainLine) await play(page, from, to, list)
}

test('linha principal inteira em "Praticar sozinho", do 1.e4 ao 8...O-O', async ({ page }) => {
  const panel = await openSoloPractice(page)
  await playUntilSixthMove(page)
  const base = '1. e4 e5 2. Cf3 Cc6 3. Bb5 a6 4. Ba4 Cf6 5. O-O Be7 6. Te1 b5'
  await play(page, 'a4', 'b3', `${base} 7. Bb3 d6`)
  await play(page, 'c2', 'c3', `${base} 7. Bb3 d6 8. c3 O-O`)
  await expect(panel.getByText(/Você chegou ao fim da linha/)).toBeVisible()
  await expect(panel.getByText('Lance fora do roteiro.')).toHaveCount(0)
})

test('só um lance é aceito: outro lance legal fica fora do roteiro e "Voltar" o desfaz', async ({ page }) => {
  const panel = await openSoloPractice(page)
  await play(page, 'e2', 'e4', '1. e4 e5')
  await play(page, 'g1', 'f3', '1. e4 e5 2. Cf3 Cc6')

  // 3.Bc4 é legal (e é a Italiana), mas aqui o lance da lição é 3.Bb5.
  await square(page, 'f1').click()
  await square(page, 'c4').click()
  await expect(panel.getByText('Lance fora do roteiro.')).toBeVisible()
  await expect(panel.getByRole('button', { name: 'Voltar' })).toBeVisible()

  await panel.getByRole('button', { name: 'Voltar' }).click()
  await expect(panel.getByLabel('Lista de lances')).toHaveText('1. e4 e5 2. Cf3 Cc6')
  await play(page, 'f1', 'b5', '1. e4 e5 2. Cf3 Cc6 3. Bb5 a6')
})

test('erro comum do conteúdo: Bxb5 depois de 6...b5 mostra a explicação específica', async ({ page }) => {
  const panel = await openSoloPractice(page)
  await playUntilSixthMove(page)

  // Em vez de recuar o bispo, captura o peão de b5.
  await square(page, 'a4').click()
  await square(page, 'b5').click()
  await expect(panel.getByText('Lance fora do roteiro.')).toBeVisible()
  await expect(panel.getByText(/o peão de a6 recaptura/)).toBeVisible()
})

test('a etapa Variações mostra as duas variações da Espanhola, cada uma com o nome do desvio', async ({ page }) => {
  await page.goto('/abertura/espanhola?etapa=desafio')
  const panel = page.getByRole('region', { name: 'Painel da lição' })
  await panel.getByRole('button', { name: 'Variações', exact: true }).click()
  await expect(panel.getByRole('heading', { name: 'Variações' })).toBeVisible()
  // A primeira variação encontrada na árvore é a mais profunda (7...O-O), depois vem 6...d6.
  await expect(panel.getByTestId('variacao-atual')).toContainText('Variação 1 de 2: Pretas rocam antes de d6 · Assistir')
})

test('a abertura aparece na trilha (nível 2) e a etapa Conhecer mostra a Espanhola', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Espanhola (Ruy Lopez)' }).click()
  await expect(page).toHaveURL(/\/abertura\/espanhola$/)
  const panel = page.getByRole('region', { name: 'Painel da lição' })
  await expect(panel.getByRole('heading', { name: 'Conhecer' })).toBeVisible()
  await expect(panel.getByText('Espanhola (Ruy Lopez)')).toBeVisible()
  await expect(panel.getByText(/pressão sobre o cavalo que protege o peão central/)).toBeVisible()
})
