import { expect, test, type Page } from '@playwright/test'

// Sistema Londres (F34): é um SISTEMA, então aceita uma alternativa de ordem escrita no conteúdo.
// Depois de 4...Cc6 a pessoa pode jogar 5.c3 antes de 5.Cbd2 e chega à mesma posição.

const square = (page: Page, name: string) => page.locator(`[data-square="${name}"]`)

/** Abre a lição direto no Desafio (só no desenvolvimento) e volta para "Praticar sozinho". */
async function openSoloPractice(page: Page) {
  await page.goto('/abertura/londres?etapa=desafio')
  const panel = page.getByRole('region', { name: 'Painel da lição' })
  await page.getByRole('navigation', { name: 'Etapas da lição' }).getByRole('button', { name: 'Praticar sozinho', exact: true }).click()
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

// Os quatro primeiros lances são iguais nas duas ordens.
async function playOpening(page: Page) {
  await play(page, 'd2', 'd4', '1. d4 d5')
  await play(page, 'g1', 'f3', '1. d4 d5 2. Cf3 Cf6')
  await play(page, 'c1', 'f4', '1. d4 d5 2. Cf3 Cf6 3. Bf4 c5')
  await play(page, 'e2', 'e3', '1. d4 d5 2. Cf3 Cf6 3. Bf4 c5 4. e3 Cc6')
}

test('alternativa de ordem: 5.c3 antes de 5.Cbd2 é aceita e a linha chega ao fim', async ({ page }) => {
  const panel = await openSoloPractice(page)
  await playOpening(page)

  // Em vez de 5.Cbd2 (linha principal), a pessoa joga 5.c3.
  await square(page, 'c2').click()
  await square(page, 'c3').click()
  await expect(panel.getByText('Lance correto.')).toBeVisible()
  await expect(panel.getByText(/Esta ordem também vale/)).toBeVisible()
  await expect(panel.getByLabel('Lista de lances')).toHaveText(
    '1. d4 d5 2. Cf3 Cf6 3. Bf4 c5 4. e3 Cc6 5. c3 e6',
  )
  // Nada de "fora do roteiro": o botão principal continua sendo o de seguir em frente.
  await expect(panel.getByText('Lance fora do roteiro.')).toHaveCount(0)
  await expect(panel.getByRole('button', { name: 'Voltar' })).toHaveCount(0)

  // Agora o cavalo, e a posição fica igual à da linha principal; o resto da linha continua valendo.
  await play(page, 'b1', 'd2', '1. d4 d5 2. Cf3 Cf6 3. Bf4 c5 4. e3 Cc6 5. c3 e6 6. Cbd2 Bd6')
  await play(page, 'f4', 'g3', '1. d4 d5 2. Cf3 Cf6 3. Bf4 c5 4. e3 Cc6 5. c3 e6 6. Cbd2 Bd6 7. Bg3 O-O')
  await play(
    page,
    'f1',
    'd3',
    '1. d4 d5 2. Cf3 Cf6 3. Bf4 c5 4. e3 Cc6 5. c3 e6 6. Cbd2 Bd6 7. Bg3 O-O 8. Bd3 b6',
  )
  await expect(panel.getByText(/Você chegou ao fim da linha/)).toBeVisible()
})

test('a ordem da linha principal (5.Cbd2 e depois 6.c3) também é aceita', async ({ page }) => {
  const panel = await openSoloPractice(page)
  await playOpening(page)

  await play(page, 'b1', 'd2', '1. d4 d5 2. Cf3 Cf6 3. Bf4 c5 4. e3 Cc6 5. Cbd2 e6')
  await play(page, 'c2', 'c3', '1. d4 d5 2. Cf3 Cf6 3. Bf4 c5 4. e3 Cc6 5. Cbd2 e6 6. c3 Bd6')
  await expect(panel.getByText('Lance fora do roteiro.')).toHaveCount(0)
})

test('só as alternativas escritas são aceitas: outro lance legal fica fora do roteiro', async ({ page }) => {
  const panel = await openSoloPractice(page)
  await playOpening(page)

  // 5.a3 é legal, mas não está no conteúdo (nem como linha principal nem como alternativa).
  await square(page, 'a2').click()
  await square(page, 'a3').click()
  await expect(panel.getByText('Lance fora do roteiro.')).toBeVisible()
  await expect(panel.getByRole('button', { name: 'Voltar' })).toBeVisible()

  // "Voltar" desfaz o lance, e a alternativa continua valendo.
  await panel.getByRole('button', { name: 'Voltar' }).click()
  await expect(panel.getByLabel('Lista de lances')).toHaveText('1. d4 d5 2. Cf3 Cf6 3. Bf4 c5 4. e3 Cc6')
  await play(page, 'c2', 'c3', '1. d4 d5 2. Cf3 Cf6 3. Bf4 c5 4. e3 Cc6 5. c3 e6')
})

test('erro comum do conteúdo: e3 antes do bispo mostra a explicação específica', async ({ page }) => {
  const panel = await openSoloPractice(page)
  await play(page, 'd2', 'd4', '1. d4 d5')
  await play(page, 'g1', 'f3', '1. d4 d5 2. Cf3 Cf6')

  await square(page, 'e2').click()
  await square(page, 'e3').click()
  await expect(panel.getByText('Lance fora do roteiro.')).toBeVisible()
  await expect(panel.getByText(/fica preso atrás dele/)).toBeVisible()
})

test('a abertura aparece na trilha e a etapa Conhecer mostra o Sistema Londres', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('link', { name: 'Sistema Londres' })).toBeVisible()
  await page.getByRole('link', { name: 'Sistema Londres' }).click()
  await expect(page).toHaveURL(/\/abertura\/londres$/)
  const panel = page.getByRole('region', { name: 'Painel da lição' })
  await expect(panel.getByRole('heading', { name: 'Conhecer' })).toBeVisible()
  await expect(panel.getByText('Sistema Londres')).toBeVisible()
  await expect(panel.getByText(/bispo da dama sai para f4 antes de você jogar e3/)).toBeVisible()
})
