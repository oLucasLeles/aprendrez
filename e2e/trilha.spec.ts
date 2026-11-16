import { expect, test } from '@playwright/test'

// Tela inicial com a trilha (F29, SPEC 10.1).

test('mostra os cartões das aberturas que têm conteúdo, nos níveis certos', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1, name: 'Aprendrez' })).toBeVisible()
  await expect(page.getByText('Aprenda aberturas de xadrez jogando.')).toBeVisible()
  await expect(page.getByText('0 de 2 aberturas concluídas')).toBeVisible()

  // Nível 1 tem a Italiana e a Escandinava; os níveis sem conteúdo nem aparecem.
  const nivel1 = page.getByRole('region', { name: /Primeiros passos/ })
  await expect(nivel1.getByRole('heading', { level: 3 })).toHaveText([
    'Italiana (Giuoco Piano)',
    'Defesa Escandinava',
  ])
  await expect(page.getByRole('heading', { level: 2, name: /Construindo repertório/ })).toHaveCount(0)
  await expect(page.getByRole('heading', { level: 2, name: /Desafio/ })).toHaveCount(0)

  // Cada cartão: cor em texto, status, ideia em uma frase, mini-tabuleiro e link para a lição.
  const italiana = nivel1.getByRole('listitem').filter({ hasText: 'Italiana (Giuoco Piano)' })
  await expect(italiana.getByText('Brancas')).toBeVisible()
  await expect(italiana.getByText('Não iniciada')).toBeVisible()
  await expect(italiana.getByText('Você ocupa o centro do tabuleiro, põe o bispo numa diagonal que mira o ponto mais fraco das pretas e protege o rei com o roque.')).toBeVisible()
  await expect(italiana.getByRole('group', { name: /Tabuleiro de xadrez, brancas embaixo/ })).toBeVisible()
  await expect(italiana.getByRole('link', { name: 'Italiana (Giuoco Piano)' })).toHaveAttribute('href', '/abertura/italiana')

  const escandinava = nivel1.getByRole('listitem').filter({ hasText: 'Defesa Escandinava' })
  await expect(escandinava.getByText('Pretas')).toBeVisible()
  await expect(escandinava.getByRole('group', { name: /pretas embaixo/ })).toBeVisible()
})

test('o status do cartão muda para "em andamento" depois de começar a lição', async ({ page }) => {
  await page.goto('/')
  const italiana = page.getByRole('listitem').filter({ hasText: 'Italiana (Giuoco Piano)' })
  await expect(italiana.getByText('Não iniciada')).toBeVisible()

  await italiana.getByRole('link', { name: 'Italiana (Giuoco Piano)' }).click()
  await page.getByRole('button', { name: 'Continuar' }).click() // conclui "Conhecer"
  await page.getByRole('link', { name: 'Voltar à trilha' }).click()

  await expect(page).toHaveURL('/')
  const depois = page.getByRole('listitem').filter({ hasText: 'Italiana (Giuoco Piano)' })
  await expect(depois.getByText('Em andamento')).toBeVisible()
  // A outra abertura não muda.
  await expect(page.getByRole('listitem').filter({ hasText: 'Defesa Escandinava' }).getByText('Não iniciada')).toBeVisible()
})

test('uma abertura concluída aparece como concluída e entra na contagem', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      'aprendrez:progresso',
      JSON.stringify({ version: 1, openings: { escandinava: { stages: [0, 1, 2, 3, 4, 5], completed: true } } }),
    )
  })
  await page.goto('/')
  await expect(page.getByText('1 de 2 aberturas concluídas')).toBeVisible()
  await expect(page.getByRole('listitem').filter({ hasText: 'Defesa Escandinava' }).getByText('Concluída')).toBeVisible()
})

test('a tela inicial não tem rolagem horizontal', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 3 }).first()).toBeVisible()
  const rola = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
  expect(rola).toBe(false)
})

// Filtro por cor (F30, SPEC 10.1).

test('o filtro "Pretas" mostra só aberturas de pretas, e "Todas" volta a mostrar todas', async ({ page }) => {
  await page.goto('/')
  const filtro = page.getByRole('group', { name: 'Filtrar por cor' })
  const titulos = page.getByRole('heading', { level: 3 })

  // Começa em "Todas", com o estado anunciado.
  await expect(filtro.getByRole('button', { name: 'Todas' })).toHaveAttribute('aria-pressed', 'true')
  await expect(filtro.getByRole('button', { name: 'Pretas' })).toHaveAttribute('aria-pressed', 'false')
  await expect(titulos).toHaveText(['Italiana (Giuoco Piano)', 'Defesa Escandinava'])

  await filtro.getByRole('button', { name: 'Pretas' }).click()
  await expect(filtro.getByRole('button', { name: 'Pretas' })).toHaveAttribute('aria-pressed', 'true')
  await expect(filtro.getByRole('button', { name: 'Todas' })).toHaveAttribute('aria-pressed', 'false')
  await expect(titulos).toHaveText(['Defesa Escandinava'])

  await filtro.getByRole('button', { name: 'Brancas' }).click()
  await expect(titulos).toHaveText(['Italiana (Giuoco Piano)'])

  await filtro.getByRole('button', { name: 'Todas' }).click()
  await expect(titulos).toHaveText(['Italiana (Giuoco Piano)', 'Defesa Escandinava'])
})

test('o filtro não muda o indicador geral de progresso e funciona pelo teclado', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Pretas' }).focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('button', { name: 'Pretas' })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('heading', { level: 3 })).toHaveText(['Defesa Escandinava'])
  await expect(page.getByText('0 de 2 aberturas concluídas')).toBeVisible()
})
