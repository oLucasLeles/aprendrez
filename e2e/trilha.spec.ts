import { expect, test } from '@playwright/test'

// Tela inicial com a trilha (F29, SPEC 10.1).

test('mostra os cartões das aberturas que têm conteúdo, nos níveis certos', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1, name: 'Aprendrez' })).toBeVisible()
  await expect(page.getByText('Aprenda aberturas de xadrez jogando.')).toBeVisible()

  // Nível 1 tem a Italiana, o Sistema Londres e a Escandinava (nesta ordem, a da trilha).
  // Os níveis sem conteúdo nem aparecem.
  const nivel1 = page.getByRole('region', { name: /Primeiros passos/ })
  await expect(nivel1.getByRole('heading', { level: 3 })).toHaveText([
    'Italiana (Giuoco Piano)',
    'Sistema Londres',
    'Defesa Escandinava',
  ])
  // O nível 2 tem a Espanhola, a Caro-Kann e o Gambito da Dama Recusado; o nível 3, o Gambito da Dama e a Siciliana.
  const nivel2 = page.getByRole('region', { name: /Construindo repertório/ })
  await expect(nivel2.getByRole('heading', { level: 3 })).toHaveText(['Espanhola (Ruy Lopez)', 'Defesa Caro-Kann', 'Gambito da Dama Recusado'])
  await expect(nivel2.getByRole('link', { name: 'Espanhola (Ruy Lopez)' })).toHaveAttribute('href', '/abertura/espanhola')
  const espanhola = nivel2.getByRole('listitem').filter({ hasText: 'Espanhola (Ruy Lopez)' })
  await expect(espanhola.getByText('Brancas')).toBeVisible()
  const caroKann = nivel2.getByRole('listitem').filter({ hasText: 'Defesa Caro-Kann' })
  await expect(caroKann.getByRole('link', { name: 'Defesa Caro-Kann' })).toHaveAttribute('href', '/abertura/caro-kann')
  await expect(caroKann.getByText('Pretas')).toBeVisible()
  const gambito = nivel2.getByRole('listitem').filter({ hasText: 'Gambito da Dama Recusado' })
  await expect(gambito.getByRole('link', { name: 'Gambito da Dama Recusado' })).toHaveAttribute('href', '/abertura/gambito-da-dama-recusado')
  await expect(gambito.getByText('Pretas')).toBeVisible()
  const nivel3 = page.getByRole('region', { name: /Desafio/ })
  await expect(nivel3.getByRole('heading', { level: 3 })).toHaveText(['Gambito da Dama', 'Defesa Siciliana (linha aberta)'])
  const gambitoDaDama = nivel3.getByRole('listitem').filter({ hasText: 'Gambito da Dama' })
  await expect(gambitoDaDama.getByRole('link', { name: 'Gambito da Dama' })).toHaveAttribute('href', '/abertura/gambito-da-dama')
  await expect(gambitoDaDama.getByText('Brancas')).toBeVisible()
  const siciliana = nivel3.getByRole('listitem').filter({ hasText: 'Defesa Siciliana (linha aberta)' })
  await expect(siciliana.getByRole('link', { name: 'Defesa Siciliana (linha aberta)' })).toHaveAttribute('href', '/abertura/siciliana')
  await expect(siciliana.getByText('Pretas')).toBeVisible()
  await expect(siciliana.getByRole('group', { name: /pretas embaixo/ })).toBeVisible()

  // Cada cartão: cor em texto, ideia em uma frase, mini-tabuleiro e link para a lição.
  const italiana = nivel1.getByRole('listitem').filter({ hasText: 'Italiana (Giuoco Piano)' })
  await expect(italiana.getByText('Brancas')).toBeVisible()
  await expect(italiana.getByText('Você ocupa o centro do tabuleiro, põe o bispo numa diagonal que mira o ponto mais fraco das pretas e protege o rei com o roque.')).toBeVisible()
  await expect(italiana.getByRole('group', { name: /Tabuleiro de xadrez, brancas embaixo/ })).toBeVisible()
  await expect(italiana.getByRole('link', { name: 'Italiana (Giuoco Piano)' })).toHaveAttribute('href', '/abertura/italiana')

  const londres = nivel1.getByRole('listitem').filter({ hasText: 'Sistema Londres' })
  await expect(londres.getByText('Brancas')).toBeVisible()
  await expect(londres.getByRole('link', { name: 'Sistema Londres' })).toHaveAttribute('href', '/abertura/londres')

  const escandinava = nivel1.getByRole('listitem').filter({ hasText: 'Defesa Escandinava' })
  await expect(escandinava.getByText('Pretas')).toBeVisible()
  await expect(escandinava.getByRole('group', { name: /pretas embaixo/ })).toBeVisible()
})

test('a trilha mostra as 8 aberturas da SPEC: 4 de brancas e 4 de pretas, nos 3 níveis', async ({ page }) => {
  await page.goto('/')
  const titulos = page.getByRole('heading', { level: 3 })
  await expect(titulos).toHaveCount(8)
  await expect(page.getByRole('region', { name: /Primeiros passos/ }).getByRole('heading', { level: 3 })).toHaveCount(3)
  await expect(page.getByRole('region', { name: /Construindo repertório/ }).getByRole('heading', { level: 3 })).toHaveCount(3)
  await expect(page.getByRole('region', { name: /Desafio/ }).getByRole('heading', { level: 3 })).toHaveCount(2)

  const filtro = page.getByRole('group', { name: 'Filtrar por cor' })
  await filtro.getByRole('button', { name: 'Brancas' }).click()
  await expect(titulos).toHaveCount(4)
  await filtro.getByRole('button', { name: 'Pretas' }).click()
  await expect(titulos).toHaveCount(4)
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
  await expect(titulos).toHaveText(['Italiana (Giuoco Piano)', 'Sistema Londres', 'Defesa Escandinava', 'Espanhola (Ruy Lopez)', 'Defesa Caro-Kann', 'Gambito da Dama Recusado', 'Gambito da Dama', 'Defesa Siciliana (linha aberta)'])

  await filtro.getByRole('button', { name: 'Pretas' }).click()
  await expect(filtro.getByRole('button', { name: 'Pretas' })).toHaveAttribute('aria-pressed', 'true')
  await expect(filtro.getByRole('button', { name: 'Todas' })).toHaveAttribute('aria-pressed', 'false')
  await expect(titulos).toHaveText(['Defesa Escandinava', 'Defesa Caro-Kann', 'Gambito da Dama Recusado', 'Defesa Siciliana (linha aberta)'])

  await filtro.getByRole('button', { name: 'Brancas' }).click()
  await expect(titulos).toHaveText(['Italiana (Giuoco Piano)', 'Sistema Londres', 'Espanhola (Ruy Lopez)', 'Gambito da Dama'])

  await filtro.getByRole('button', { name: 'Todas' }).click()
  await expect(titulos).toHaveText(['Italiana (Giuoco Piano)', 'Sistema Londres', 'Defesa Escandinava', 'Espanhola (Ruy Lopez)', 'Defesa Caro-Kann', 'Gambito da Dama Recusado', 'Gambito da Dama', 'Defesa Siciliana (linha aberta)'])
})

test('o filtro funciona pelo teclado', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Pretas' }).focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('button', { name: 'Pretas' })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('heading', { level: 3 })).toHaveText(['Defesa Escandinava', 'Defesa Caro-Kann', 'Gambito da Dama Recusado', 'Defesa Siciliana (linha aberta)'])
})

// Botão principal "Começar" (SPEC 10.1).

test('o botão principal diz "Começar" e leva à Italiana', async ({ page }) => {
  await page.goto('/')
  const botao = page.getByRole('link', { name: 'Começar' })
  await expect(botao).toBeVisible()

  await botao.click()
  await expect(page).toHaveURL('/abertura/italiana')
  await expect(page.getByRole('heading', { level: 1, name: 'Italiana (Giuoco Piano)' })).toBeVisible()
})

// Exploração livre (decisão do dono do projeto, 2026-11-22): nada de status nem contagem.
test('a trilha não mostra status de progresso nem contagem de aberturas concluídas', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 3 })).toHaveCount(8)
  for (const texto of ['Não iniciada', 'Em andamento', 'Concluída', 'aberturas concluídas', 'Reiniciar progresso', 'Continuar de onde parei']) {
    await expect(page.getByText(texto)).toHaveCount(0)
  }
})
