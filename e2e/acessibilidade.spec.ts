import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { goToStage } from './etapas'

// Acessibilidade automática (F40). O axe-core é um verificador que lê a página e aponta
// problemas conhecidos (contraste, nomes que faltam em botões, papéis errados…).
// Aqui exigimos zero violações de gravidade "serious" (séria) ou "critical" (crítica)
// na tela inicial, em cada etapa da lição e na conclusão. Os testes rodam nos dois
// tamanhos de tela (desktop e celular), porque o e2e já tem os dois projetos.

const square = (page: Page, name: string) => page.locator(`[data-square="${name}"]`)

/** Roda o axe e falha mostrando, em português simples, o que foi encontrado. */
async function expectNoSeriousViolations(page: Page, onde: string) {
  const results = await new AxeBuilder({ page })
    // Regras de acessibilidade nível WCAG 2.x A e AA (as que a SPEC pede: contraste AA).
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze()
  const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
  const resumo = serious.map(
    (v) => `${v.id} (${v.impact}): ${v.help}\n  ${v.nodes.map((n) => n.target.join(' ')).slice(0, 5).join('\n  ')}`,
  )
  expect(resumo, `Violações de acessibilidade em: ${onde}`).toEqual([])
}

test('tela inicial (trilha) não tem violações sérias', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Aprendrez' })).toBeVisible()
  await expectNoSeriousViolations(page, 'tela inicial')
})

test('tela inicial com o filtro "Pretas"', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Pretas' }).click()
  await expectNoSeriousViolations(page, 'tela inicial com filtro Pretas')

})

const STAGES = ['Conhecer', 'Assistir', 'Praticar com guia', 'Praticar sozinho', 'Variações', 'Desafio']

test('lição: cada uma das 6 etapas não tem violações sérias (abertura de brancas)', async ({ page }) => {
  test.setTimeout(60_000)
  await page.goto('/abertura/italiana')
  const panel = page.getByRole('region', { name: 'Painel da lição' })
  const stages = page.getByRole('navigation', { name: 'Etapas da lição' })

  for (const stage of STAGES) {
    // A lição abre em "Conhecer" (a etapa atual não é botão); as outras abrem pelo indicador.
    if (stage !== 'Conhecer') await goToStage(page, stage)
    await expect(panel.getByRole('heading', { name: stage })).toBeVisible()
    await expectNoSeriousViolations(page, `lição da Italiana, etapa ${stage}`)
  }
})

test('lição de pretas (tabuleiro invertido): primeira e última etapas', async ({ page }) => {
  await page.goto('/abertura/siciliana')
  const panel = page.getByRole('region', { name: 'Painel da lição' })
  const stages = page.getByRole('navigation', { name: 'Etapas da lição' })

  // A lição abre em "Conhecer".
  await expect(panel.getByRole('heading', { name: 'Conhecer' })).toBeVisible()
  await expectNoSeriousViolations(page, 'Siciliana, etapa Conhecer')
  await goToStage(page, 'Desafio')
  await expect(panel.getByRole('heading', { name: 'Desafio' })).toBeVisible()
  await expectNoSeriousViolations(page, 'Siciliana, etapa Desafio')
})

test('lição: mensagens de acerto e de lance fora do roteiro também passam', async ({ page }) => {
  await page.goto('/abertura/italiana')
  const panel = page.getByRole('region', { name: 'Painel da lição' })
  const stages = page.getByRole('navigation', { name: 'Etapas da lição' })

  await goToStage(page, 'Praticar sozinho')
  await expect(panel.getByLabel('Lista de lances')).toHaveText('Nenhum lance ainda.')

  // Lance fora do roteiro: 1.d4 (legal, mas não é o da Italiana).
  await square(page, 'd2').click()
  await square(page, 'd4').click()
  await expect(panel.getByRole('button', { name: 'Voltar' })).toBeVisible()
  await expectNoSeriousViolations(page, 'mensagem de lance fora do roteiro')

  // Voltar e jogar o lance certo (1.e4): aparece a explicação do acerto.
  await panel.getByRole('button', { name: 'Voltar' }).click()
  await square(page, 'e2').click()
  await square(page, 'e4').click()
  await expect(panel.getByLabel('Lista de lances')).toContainText('1. e4')
  await expectNoSeriousViolations(page, 'mensagem de lance correto')
})

test('tela de conclusão não tem violações sérias', async ({ page }) => {
  await page.goto('/abertura/italiana/conclusao')
  await expect(page.getByRole('heading', { name: 'Fim do Desafio' })).toBeVisible()
  await expectNoSeriousViolations(page, 'tela de conclusão')
})

test('página não encontrada não tem violações sérias', async ({ page }) => {
  await page.goto('/isto-nao-existe')
  await expect(page.getByRole('heading', { name: /não encontrada/i })).toBeVisible()
  await expectNoSeriousViolations(page, 'página não encontrada')
})
