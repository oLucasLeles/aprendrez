import { expect, test, type Page } from '@playwright/test'
import { goToStage } from './etapas'

// Gambito da Dama (F38): linha fixa, brancas, nível 3.
// Linha principal: 1.d4 d5 2.c4 e6 3.Cc3 Cf6 4.Bg5 Be7 5.e3 O-O 6.Cf3 Cbd7 7.Tc1 c6 8.Bd3 dxc4 9.Bxc4 Cd5

const square = (page: Page, name: string) => page.locator(`[data-square="${name}"]`)

/** Abre a lição direto no Desafio (só no desenvolvimento) e volta para "Praticar sozinho". */
async function openSoloPractice(page: Page) {
  await page.goto('/abertura/gambito-da-dama?etapa=desafio')
  const panel = page.getByRole('region', { name: 'Painel da lição' })
  await goToStage(page, 'Praticar sozinho')
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
  ['d2', 'd4', '1. d4 d5'],
  ['c2', 'c4', '1. d4 d5 2. c4 e6'],
  ['b1', 'c3', '1. d4 d5 2. c4 e6 3. Cc3 Cf6'],
  ['c1', 'g5', '1. d4 d5 2. c4 e6 3. Cc3 Cf6 4. Bg5 Be7'],
  ['e2', 'e3', '1. d4 d5 2. c4 e6 3. Cc3 Cf6 4. Bg5 Be7 5. e3 O-O'],
  ['g1', 'f3', '1. d4 d5 2. c4 e6 3. Cc3 Cf6 4. Bg5 Be7 5. e3 O-O 6. Cf3 Cbd7'],
  ['a1', 'c1', '1. d4 d5 2. c4 e6 3. Cc3 Cf6 4. Bg5 Be7 5. e3 O-O 6. Cf3 Cbd7 7. Tc1 c6'],
  ['f1', 'd3', '1. d4 d5 2. c4 e6 3. Cc3 Cf6 4. Bg5 Be7 5. e3 O-O 6. Cf3 Cbd7 7. Tc1 c6 8. Bd3 dxc4'],
  ['d3', 'c4', '1. d4 d5 2. c4 e6 3. Cc3 Cf6 4. Bg5 Be7 5. e3 O-O 6. Cf3 Cbd7 7. Tc1 c6 8. Bd3 dxc4 9. Bxc4 Cd5'],
]

test('linha principal inteira em "Praticar sozinho", do 1.d4 ao 9...Cd5', async ({ page }) => {
  const panel = await openSoloPractice(page)
  for (const [from, to, list] of mainLine) await play(page, from, to, list)
  await expect(panel.getByText(/Você chegou ao fim da linha/)).toBeVisible()
  await expect(panel.getByText('Lance fora do roteiro.')).toHaveCount(0)
})

test('só um lance é aceito: outro lance legal fica fora do roteiro e "Voltar" o desfaz', async ({ page }) => {
  const panel = await openSoloPractice(page)

  // 1.e4 é legal (e muito comum), mas aqui o lance da lição é 1.d4.
  await square(page, 'e2').click()
  await square(page, 'e4').click()
  await expect(panel.getByText('Lance fora do roteiro.')).toBeVisible()
  await expect(panel.getByRole('button', { name: 'Voltar' })).toBeVisible()

  await panel.getByRole('button', { name: 'Voltar' }).click()
  await expect(panel.getByLabel('Lista de lances')).toContainText('Nenhum lance ainda')
  await play(page, 'd2', 'd4', '1. d4 d5')
})

test('erro comum do conteúdo: Bf4 no segundo lance mostra a explicação específica', async ({ page }) => {
  const panel = await openSoloPractice(page)
  await play(page, 'd2', 'd4', '1. d4 d5')

  // Em vez de oferecer o gambito com c4, sai com o bispo (Sistema Londres).
  await square(page, 'c1').click()
  await square(page, 'f4').click()
  await expect(panel.getByText('Lance fora do roteiro.')).toBeVisible()
  await expect(panel.getByText(/Sistema Londres/)).toBeVisible()
})

test('a etapa Variações mostra as duas variações, cada uma com o nome do desvio', async ({ page }) => {
  await page.goto('/abertura/gambito-da-dama?etapa=desafio')
  const panel = page.getByRole('region', { name: 'Painel da lição' })
  await goToStage(page, 'Variações')
  await expect(panel.getByRole('heading', { name: 'Variações' })).toBeVisible()
  await expect(panel.getByTestId('variacao-atual')).toContainText('Variação 1 de 2: Pretas jogam dxc4 em vez de e6')
  await expect(panel.getByText('E se as pretas jogarem 2... dxc4?')).toBeVisible()
})

test('a abertura aparece na trilha (nível 3) e a etapa Conhecer mostra o Gambito da Dama com as brancas embaixo', async ({ page }) => {
  await page.goto('/')
  const nivel3 = page.getByRole('region', { name: /Desafio/ })
  await expect(nivel3.getByRole('heading', { level: 3 })).toHaveText(['Gambito da Dama', 'Defesa Siciliana (linha aberta)'])
  await nivel3.getByRole('link', { name: 'Gambito da Dama' }).click()
  await expect(page).toHaveURL(/\/abertura\/gambito-da-dama$/)
  const panel = page.getByRole('region', { name: 'Painel da lição' })
  await expect(panel.getByRole('heading', { name: 'Conhecer' })).toBeVisible()
  await expect(panel.getByText('Gambito da Dama').first()).toBeVisible()
  await expect(panel.getByText(/Você oferece um peão com o lance c4/)).toBeVisible()
  await expect(page.getByRole('group', { name: /Tabuleiro de xadrez/ })).toHaveAccessibleName(/brancas embaixo/)
})
