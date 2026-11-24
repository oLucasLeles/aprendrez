import { expect, test, type Page } from '@playwright/test'
import { expectStage } from './etapas'

// Etapa 6 · Desafio (F23): partida do começo ao fim, sem guia, e o adversário sorteia os galhos.
// O parâmetro `?acaso=` (só no servidor de desenvolvimento) fixa o sorteio: 0 = primeiro galho
// (linha principal) e 0.99 = último galho. `?etapa=desafio` abre a lição direto no Desafio.

const square = (page: Page, name: string) => page.locator(`[data-square="${name}"]`)
const arrow = (page: Page) => page.getByRole('group', { name: /Tabuleiro de xadrez/ }).locator('svg path[stroke]')

/** Monta a lista numerada esperada, como "1. e4 e5 2. Cf3". */
function numbered(tokens: string[]): string {
  return tokens.map((token, index) => (index % 2 === 0 ? `${index / 2 + 1}. ${token}` : token)).join(' ')
}

type Move = [string, string]
const MAIN_USER: Move[] = [
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

// Variação 4...d6 (o último galho depois de 4.c3): 5.d4 exd4 6.cxd4 Bb6 7.Cc3 Cf6
const D6_USER: Move[] = [...MAIN_USER.slice(0, 4), ['d2', 'd4'], ['c3', 'd4'], ['b1', 'c3']]
const D6_TOKENS = ['e4', 'e5', 'Cf3', 'Cc6', 'Bc4', 'Bc5', 'c3', 'd6', 'd4', 'exd4', 'cxd4', 'Bb6', 'Cc3', 'Cf6']

async function playChallenge(page: Page, userMoves: Move[], tokens: string[]) {
  const panel = page.getByRole('region', { name: 'Painel da lição' })
  const moves = panel.getByLabel('Lista de lances')
  for (const [index, [from, to]] of userMoves.entries()) {
    // Sem guia: nenhuma seta durante todo o Desafio
    await expect(arrow(page)).toHaveCount(0)
    await square(page, from).click()
    await square(page, to).click()
    await expect(moves).toHaveText(numbered(tokens.slice(0, Math.min(tokens.length, (index + 1) * 2))))
  }
}

test('completar o Desafio da Italiana (linha principal sorteada) leva à tela de conclusão', async ({ page }) => {
  test.setTimeout(60_000)
  await page.goto('/abertura/italiana?etapa=desafio&acaso=0')
  const panel = page.getByRole('region', { name: 'Painel da lição' })
  const stages = page.getByRole('navigation', { name: 'Etapas da lição' })

  await expectStage(page, 'Desafio')
  await expect(panel.getByRole('heading', { name: 'Desafio' })).toBeVisible()
  // "Concluir" só abre quando a partida acaba
  await expect(panel.getByRole('button', { name: 'Ver resumo' })).toHaveCount(0)

  await playChallenge(page, MAIN_USER, MAIN_TOKENS)
  await expect(panel.getByText(/Você chegou ao fim da linha/)).toBeVisible()

  await panel.getByRole('button', { name: 'Ver resumo' }).click()
  await expect(page).toHaveURL(/\/abertura\/italiana\/conclusao$/)
  await expect(page.getByRole('heading', { name: 'Fim do Desafio' })).toBeVisible()
})

test('o adversário pode desviar para uma variação ensinada e o Desafio também termina', async ({ page }) => {
  test.setTimeout(60_000)
  await page.goto('/abertura/italiana?etapa=desafio&acaso=0.99')
  const panel = page.getByRole('region', { name: 'Painel da lição' })

  await playChallenge(page, D6_USER, D6_TOKENS)
  await expect(panel.getByText(/Você chegou ao fim da linha/)).toBeVisible()
  await panel.getByRole('button', { name: 'Ver resumo' }).click()
  await expect(page.getByRole('heading', { name: 'Fim do Desafio' })).toBeVisible()
})

test('no Desafio vale o lance fora do roteiro e o "Ver dica"', async ({ page }) => {
  await page.goto('/abertura/italiana?etapa=desafio&acaso=0')
  const panel = page.getByRole('region', { name: 'Painel da lição' })

  // "Ver dica" mostra a seta só para o lance atual
  await panel.getByRole('button', { name: 'Ver dica' }).click()
  await expect(arrow(page)).toHaveCount(1)

  // Lance legal fora do roteiro (1. d4): fica no tabuleiro, com aviso, e "Voltar" desfaz
  await square(page, 'd2').click()
  await square(page, 'd4').click()
  await expect(panel.getByText('Lance fora do roteiro.')).toBeVisible()
  await expect(panel.getByTestId('icone-fora-do-roteiro')).toBeVisible()
  await panel.getByRole('button', { name: 'Voltar' }).click()
  await expect(panel.getByLabel('Lista de lances')).toContainText('Nenhum lance ainda')
  await expect(panel.getByText('Lance fora do roteiro.')).toHaveCount(0)
})
