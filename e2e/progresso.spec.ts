import { expect, test } from '@playwright/test'

// Progresso salvo no navegador (F28): ao reabrir uma abertura em andamento, a lição
// continua na primeira etapa não concluída. Sem armazenamento, o app funciona como na primeira visita.

test('concluir Conhecer e Assistir, recarregar: a lição continua em "Praticar com guia"', async ({ page }) => {
  await page.goto('/abertura/italiana')
  const panel = page.getByRole('region', { name: 'Painel da lição' })
  const stages = page.getByRole('navigation', { name: 'Etapas da lição' })

  await panel.getByRole('button', { name: 'Continuar' }).click() // Conhecer → Assistir
  await panel.getByRole('button', { name: 'Continuar' }).click() // Assistir → Praticar com guia
  await expect(panel.getByRole('heading', { name: 'Praticar com guia' })).toBeVisible()

  await page.reload()

  await expect(panel.getByRole('heading', { name: 'Praticar com guia' })).toBeVisible()
  await expect(stages.locator('[aria-current="step"]')).toHaveText('Praticar com guia')
  // As etapas anteriores continuam marcadas como concluídas e acessíveis.
  await expect(stages.getByRole('button', { name: 'Conhecer (concluída)' })).toBeVisible()
  await expect(stages.getByRole('button', { name: 'Assistir (concluída)' })).toBeVisible()
  // A etapa seguinte ainda não foi alcançada.
  await expect(stages.getByRole('button', { name: 'Praticar sozinho' })).toBeDisabled()
  // A prática com guia está pronta para jogar: o guia aponta o primeiro lance.
  await expect(panel.getByLabel('Lista de lances')).toContainText('Nenhum lance ainda')
})

test('só concluir "Conhecer": ao recarregar, a lição abre em "Assistir"', async ({ page }) => {
  await page.goto('/abertura/italiana')
  const panel = page.getByRole('region', { name: 'Painel da lição' })
  await panel.getByRole('button', { name: 'Continuar' }).click()
  await page.reload()
  await expect(panel.getByRole('heading', { name: 'Assistir' })).toBeVisible()
})

test('o progresso de uma abertura não muda a outra', async ({ page }) => {
  await page.goto('/abertura/italiana')
  const panel = page.getByRole('region', { name: 'Painel da lição' })
  await panel.getByRole('button', { name: 'Continuar' }).click()

  await page.goto('/abertura/escandinava')
  await expect(panel.getByRole('heading', { name: 'Conhecer' })).toBeVisible()
})

test('sem progresso salvo (primeira visita), a lição abre em "Conhecer"', async ({ page }) => {
  await page.goto('/abertura/italiana')
  await expect(page.getByRole('region', { name: 'Painel da lição' }).getByRole('heading', { name: 'Conhecer' })).toBeVisible()
})

test('com o armazenamento quebrado, o app funciona como na primeira visita', async ({ page }) => {
  // Simula um navegador em que o localStorage lança erro em qualquer uso.
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new Error('armazenamento indisponível')
      },
    })
  })
  const erros: string[] = []
  page.on('pageerror', (erro) => erros.push(erro.message))

  await page.goto('/abertura/italiana')
  const panel = page.getByRole('region', { name: 'Painel da lição' })
  await expect(panel.getByRole('heading', { name: 'Conhecer' })).toBeVisible()
  await panel.getByRole('button', { name: 'Continuar' }).click()
  await expect(panel.getByRole('heading', { name: 'Assistir' })).toBeVisible()

  await page.reload()
  await expect(panel.getByRole('heading', { name: 'Conhecer' })).toBeVisible()
  expect(erros).toEqual([])
})

test('dados estragados no armazenamento valem como primeira visita', async ({ page }) => {
  await page.addInitScript(() => window.localStorage.setItem('aprendrez:progresso', '{isto não é json'))
  await page.goto('/abertura/italiana')
  await expect(page.getByRole('region', { name: 'Painel da lição' }).getByRole('heading', { name: 'Conhecer' })).toBeVisible()
})

test('concluir o Desafio marca a abertura como concluída e a lição reabre em "Conhecer" com tudo acessível', async ({ page }) => {
  await page.goto('/abertura/italiana?etapa=desafio&acaso=0')
  const panel = page.getByRole('region', { name: 'Painel da lição' })
  const stages = page.getByRole('navigation', { name: 'Etapas da lição' })

  // Joga a linha principal inteira (as brancas) por clique; o adversário responde sozinho.
  // Cada item: casa de origem, casa de destino e o trecho da lista de lances que aparece
  // quando o adversário já respondeu.
  const lances: Array<[string, string, string]> = [
    ['e2', 'e4', '1. e4 e5'],
    ['g1', 'f3', '2. Cf3 Cc6'],
    ['f1', 'c4', '3. Bc4 Bc5'],
    ['c2', 'c3', '4. c3 Cf6'],
    ['d2', 'd3', '5. d3 d6'],
    ['e1', 'g1', '6. O-O O-O'],
    ['f1', 'e1', '7. Te1 a6'],
    ['c4', 'b3', '8. Bb3 Ba7'],
  ]
  for (const [de, para, trecho] of lances) {
    await page.locator(`[data-square="${de}"]`).click()
    await page.locator(`[data-square="${para}"]`).click()
    await expect(panel.getByLabel('Lista de lances')).toContainText(trecho)
  }
  await expect(panel.getByRole('button', { name: 'Concluir' })).toBeEnabled({ timeout: 5000 })
  await panel.getByRole('button', { name: 'Concluir' }).click()
  await expect(page).toHaveURL(/\/abertura\/italiana\/conclusao$/)

  const salvo = await page.evaluate(() => window.localStorage.getItem('aprendrez:progresso'))
  expect(JSON.parse(salvo ?? '{}').openings.italiana).toEqual({ stages: [0, 1, 2, 3, 4, 5], completed: true })

  await page.goto('/abertura/italiana')
  await expect(panel.getByRole('heading', { name: 'Conhecer' })).toBeVisible()
  await expect(stages.getByRole('button', { name: 'Desafio (concluída)' })).toBeEnabled()
})
