import { expect, test, type Page } from '@playwright/test'

// Gambito da Dama Recusado (F37): linha fixa, pretas, nível 2, contra 1.d4.
// Linha principal: 1.d4 d5 2.c4 e6 3.Cc3 Cf6 4.Bg5 Be7 5.e3 O-O 6.Cf3 Cbd7 7.Tc1 c6 8.Bd3 dxc4 9.Bxc4 Cd5 10.Bxe7 Dxe7 11.O-O

const square = (page: Page, name: string) => page.locator(`[data-square="${name}"]`)

/** Abre a lição direto no Desafio (só no desenvolvimento) e volta para "Praticar sozinho". */
async function openSoloPractice(page: Page) {
  await page.goto('/abertura/gambito-da-dama-recusado?etapa=desafio')
  const panel = page.getByRole('region', { name: 'Painel da lição' })
  await panel.getByRole('button', { name: /Praticar sozinho/ }).click()
  await expect(panel.getByRole('heading', { name: 'Praticar sozinho' })).toBeVisible()
  // O app joga sozinho o 1.d4 das brancas.
  await expect(panel.getByLabel('Lista de lances')).toHaveText('1. d4')
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
  ['d7', 'd5', '1. d4 d5 2. c4'],
  ['e7', 'e6', '1. d4 d5 2. c4 e6 3. Cc3'],
  ['g8', 'f6', '1. d4 d5 2. c4 e6 3. Cc3 Cf6 4. Bg5'],
  ['f8', 'e7', '1. d4 d5 2. c4 e6 3. Cc3 Cf6 4. Bg5 Be7 5. e3'],
  ['e8', 'g8', '1. d4 d5 2. c4 e6 3. Cc3 Cf6 4. Bg5 Be7 5. e3 O-O 6. Cf3'],
  ['b8', 'd7', '1. d4 d5 2. c4 e6 3. Cc3 Cf6 4. Bg5 Be7 5. e3 O-O 6. Cf3 Cbd7 7. Tc1'],
  ['c7', 'c6', '1. d4 d5 2. c4 e6 3. Cc3 Cf6 4. Bg5 Be7 5. e3 O-O 6. Cf3 Cbd7 7. Tc1 c6 8. Bd3'],
  ['d5', 'c4', '1. d4 d5 2. c4 e6 3. Cc3 Cf6 4. Bg5 Be7 5. e3 O-O 6. Cf3 Cbd7 7. Tc1 c6 8. Bd3 dxc4 9. Bxc4'],
  ['f6', 'd5', '1. d4 d5 2. c4 e6 3. Cc3 Cf6 4. Bg5 Be7 5. e3 O-O 6. Cf3 Cbd7 7. Tc1 c6 8. Bd3 dxc4 9. Bxc4 Cd5 10. Bxe7'],
]

test('linha principal inteira em "Praticar sozinho", do 1...d5 ao 10...Dxe7', async ({ page }) => {
  const panel = await openSoloPractice(page)
  for (const [from, to, list] of mainLine) await play(page, from, to, list)
  await play(
    page,
    'd8',
    'e7',
    '1. d4 d5 2. c4 e6 3. Cc3 Cf6 4. Bg5 Be7 5. e3 O-O 6. Cf3 Cbd7 7. Tc1 c6 8. Bd3 dxc4 9. Bxc4 Cd5 10. Bxe7 Dxe7 11. O-O',
  )
  await expect(panel.getByText(/Você chegou ao fim da linha/)).toBeVisible()
  await expect(panel.getByText('Lance fora do roteiro.')).toHaveCount(0)
})

test('só um lance é aceito: outro lance legal fica fora do roteiro e "Voltar" o desfaz', async ({ page }) => {
  const panel = await openSoloPractice(page)

  // 1...Cf6 é legal (e muito comum), mas aqui o lance da lição é 1...d5.
  await square(page, 'g8').click()
  await square(page, 'f6').click()
  await expect(panel.getByText('Lance fora do roteiro.')).toBeVisible()
  await expect(panel.getByRole('button', { name: 'Voltar' })).toBeVisible()

  await panel.getByRole('button', { name: 'Voltar' }).click()
  await expect(panel.getByLabel('Lista de lances')).toHaveText('1. d4')
  await play(page, 'd7', 'd5', '1. d4 d5 2. c4')
})

test('erro comum do conteúdo: dxc4 no segundo lance mostra a explicação específica', async ({ page }) => {
  const panel = await openSoloPractice(page)
  await play(page, 'd7', 'd5', '1. d4 d5 2. c4')

  // Em vez de recusar o gambito com e6, captura o peão de c4.
  await square(page, 'd5').click()
  await square(page, 'c4').click()
  await expect(panel.getByText('Lance fora do roteiro.')).toBeVisible()
  await expect(panel.getByText(/Gambito da Dama Aceito/)).toBeVisible()
})

test('a etapa Variações mostra as duas variações, cada uma com o nome do desvio', async ({ page }) => {
  await page.goto('/abertura/gambito-da-dama-recusado?etapa=desafio')
  const panel = page.getByRole('region', { name: 'Painel da lição' })
  await panel.getByRole('button', { name: /Variações/ }).click()
  await expect(panel.getByRole('heading', { name: 'Variações' })).toBeVisible()
  await expect(panel.getByTestId('variacao-atual')).toContainText('Variação 1 de 2: ')
  await expect(panel.getByTestId('variacao-atual')).toContainText(/Brancas jogam (Cf3 antes de e3|Dc2 em vez de Tc1)/)
})

test('a abertura aparece na trilha (nível 2) e a etapa Conhecer mostra o Gambito da Dama Recusado com as pretas embaixo', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Gambito da Dama Recusado' }).click()
  await expect(page).toHaveURL(/\/abertura\/gambito-da-dama-recusado$/)
  const panel = page.getByRole('region', { name: 'Painel da lição' })
  await expect(panel.getByRole('heading', { name: 'Conhecer' })).toBeVisible()
  await expect(panel.getByText('Gambito da Dama Recusado').first()).toBeVisible()
  await expect(panel.getByText(/Você recusa a oferta/)).toBeVisible()
  await expect(page.getByRole('group', { name: /Tabuleiro de xadrez/ })).toHaveAccessibleName(/pretas embaixo/)
})
