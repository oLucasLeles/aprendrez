import { expect, test, type Page } from '@playwright/test'

// Defesa Caro-Kann (F36): linha fixa, pretas, nível 2, contra 1.e4.
// Linha principal: 1.e4 c6 2.d4 d5 3.Cd2 dxe4 4.Cxe4 Bf5 5.Cg3 Bg6 6.h4 h6 7.Cf3 Cd7 8.h5 Bh7 9.Bd3 Bxd3 10.Dxd3

const square = (page: Page, name: string) => page.locator(`[data-square="${name}"]`)

/** Abre a lição direto no Desafio (só no desenvolvimento) e volta para "Praticar sozinho". */
async function openSoloPractice(page: Page) {
  await page.goto('/abertura/caro-kann?etapa=desafio')
  const panel = page.getByRole('region', { name: 'Painel da lição' })
  await panel.getByRole('button', { name: /Praticar sozinho/ }).click()
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
  ['c7', 'c6', '1. e4 c6 2. d4'],
  ['d7', 'd5', '1. e4 c6 2. d4 d5 3. Cd2'],
  ['d5', 'e4', '1. e4 c6 2. d4 d5 3. Cd2 dxe4 4. Cxe4'],
  ['c8', 'f5', '1. e4 c6 2. d4 d5 3. Cd2 dxe4 4. Cxe4 Bf5 5. Cg3'],
  ['f5', 'g6', '1. e4 c6 2. d4 d5 3. Cd2 dxe4 4. Cxe4 Bf5 5. Cg3 Bg6 6. h4'],
  ['h7', 'h6', '1. e4 c6 2. d4 d5 3. Cd2 dxe4 4. Cxe4 Bf5 5. Cg3 Bg6 6. h4 h6 7. Cf3'],
  ['b8', 'd7', '1. e4 c6 2. d4 d5 3. Cd2 dxe4 4. Cxe4 Bf5 5. Cg3 Bg6 6. h4 h6 7. Cf3 Cd7 8. h5'],
]

async function playUntilEighthMove(page: Page) {
  for (const [from, to, list] of mainLine) await play(page, from, to, list)
}

test('linha principal inteira em "Praticar sozinho", do 1...c6 ao 9...Bxd3', async ({ page }) => {
  const panel = await openSoloPractice(page)
  await playUntilEighthMove(page)
  const base = '1. e4 c6 2. d4 d5 3. Cd2 dxe4 4. Cxe4 Bf5 5. Cg3 Bg6 6. h4 h6 7. Cf3 Cd7 8. h5'
  await play(page, 'g6', 'h7', `${base} Bh7 9. Bd3`)
  await play(page, 'h7', 'd3', `${base} Bh7 9. Bd3 Bxd3 10. Dxd3`)
  await expect(panel.getByText(/Você chegou ao fim da linha/)).toBeVisible()
  await expect(panel.getByText('Lance fora do roteiro.')).toHaveCount(0)
})

test('só um lance é aceito: outro lance legal fica fora do roteiro e "Voltar" o desfaz', async ({ page }) => {
  const panel = await openSoloPractice(page)

  // 1...e5 é legal (e é uma defesa clássica), mas aqui o lance da lição é 1...c6.
  await square(page, 'e7').click()
  await square(page, 'e5').click()
  await expect(panel.getByText('Lance fora do roteiro.')).toBeVisible()
  await expect(panel.getByRole('button', { name: 'Voltar' })).toBeVisible()

  await panel.getByRole('button', { name: 'Voltar' }).click()
  await expect(panel.getByLabel('Lista de lances')).toHaveText('1. e4')
  await play(page, 'c7', 'c6', '1. e4 c6 2. d4')
})

test('erro comum do conteúdo: Bxh5 depois de 8.h5 mostra a explicação específica', async ({ page }) => {
  const panel = await openSoloPractice(page)
  await playUntilEighthMove(page)

  // Em vez de recuar o bispo, captura o peão de h5.
  await square(page, 'g6').click()
  await square(page, 'h5').click()
  await expect(panel.getByText('Lance fora do roteiro.')).toBeVisible()
  await expect(panel.getByText(/o cavalo branco de g3 captura o bispo/)).toBeVisible()
})

test('a etapa Variações mostra as duas variações da Caro-Kann, cada uma com o nome do desvio', async ({ page }) => {
  await page.goto('/abertura/caro-kann?etapa=desafio')
  const panel = page.getByRole('region', { name: 'Painel da lição' })
  await panel.getByRole('button', { name: /Variações/ }).click()
  await expect(panel.getByRole('heading', { name: 'Variações' })).toBeVisible()
  await expect(panel.getByTestId('variacao-atual')).toContainText('Variação 1 de 2: ')
  await expect(panel.getByTestId('variacao-atual')).toContainText(/Brancas jogam (h5 antes de Cf3|Bc4 em vez de h4)/)
})

test('a abertura aparece na trilha (nível 2) e a etapa Conhecer mostra a Caro-Kann com as pretas embaixo', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Defesa Caro-Kann' }).click()
  await expect(page).toHaveURL(/\/abertura\/caro-kann$/)
  const panel = page.getByRole('region', { name: 'Painel da lição' })
  await expect(panel.getByRole('heading', { name: 'Conhecer' })).toBeVisible()
  await expect(panel.getByText('Defesa Caro-Kann')).toBeVisible()
  await expect(panel.getByText(/sem pontos fracos/)).toBeVisible()
  await expect(page.getByRole('group', { name: /Tabuleiro de xadrez/ })).toHaveAccessibleName(/pretas embaixo/)
})
