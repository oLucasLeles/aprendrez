import { expect, test } from '@playwright/test'

// Tela inicial com a trilha (F29, SPEC 10.1).

test('mostra os cartões das aberturas que têm conteúdo, nos níveis certos', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1, name: 'Aprendrez' })).toBeVisible()
  await expect(page.getByText('Aprenda aberturas de xadrez jogando.')).toBeVisible()
  await expect(page.getByText('0 de 5 aberturas concluídas')).toBeVisible()

  // Nível 1 tem a Italiana, o Sistema Londres e a Escandinava (nesta ordem, a da trilha).
  // Os níveis sem conteúdo nem aparecem.
  const nivel1 = page.getByRole('region', { name: /Primeiros passos/ })
  await expect(nivel1.getByRole('heading', { level: 3 })).toHaveText([
    'Italiana (Giuoco Piano)',
    'Sistema Londres',
    'Defesa Escandinava',
  ])
  // O nível 2 aparece com a Espanhola e a Caro-Kann; o nível 3 ainda não tem conteúdo.
  const nivel2 = page.getByRole('region', { name: /Construindo repertório/ })
  await expect(nivel2.getByRole('heading', { level: 3 })).toHaveText(['Espanhola (Ruy Lopez)', 'Defesa Caro-Kann'])
  await expect(nivel2.getByRole('link', { name: 'Espanhola (Ruy Lopez)' })).toHaveAttribute('href', '/abertura/espanhola')
  const espanhola = nivel2.getByRole('listitem').filter({ hasText: 'Espanhola (Ruy Lopez)' })
  await expect(espanhola.getByText('Brancas')).toBeVisible()
  await expect(espanhola.getByText('Não iniciada')).toBeVisible()
  const caroKann = nivel2.getByRole('listitem').filter({ hasText: 'Defesa Caro-Kann' })
  await expect(caroKann.getByRole('link', { name: 'Defesa Caro-Kann' })).toHaveAttribute('href', '/abertura/caro-kann')
  await expect(caroKann.getByText('Pretas')).toBeVisible()
  await expect(caroKann.getByText('Não iniciada')).toBeVisible()
  await expect(page.getByRole('heading', { level: 2, name: /Desafio/ })).toHaveCount(0)

  // Cada cartão: cor em texto, status, ideia em uma frase, mini-tabuleiro e link para a lição.
  const italiana = nivel1.getByRole('listitem').filter({ hasText: 'Italiana (Giuoco Piano)' })
  await expect(italiana.getByText('Brancas')).toBeVisible()
  await expect(italiana.getByText('Não iniciada')).toBeVisible()
  await expect(italiana.getByText('Você ocupa o centro do tabuleiro, põe o bispo numa diagonal que mira o ponto mais fraco das pretas e protege o rei com o roque.')).toBeVisible()
  await expect(italiana.getByRole('group', { name: /Tabuleiro de xadrez, brancas embaixo/ })).toBeVisible()
  await expect(italiana.getByRole('link', { name: 'Italiana (Giuoco Piano)' })).toHaveAttribute('href', '/abertura/italiana')

  const londres = nivel1.getByRole('listitem').filter({ hasText: 'Sistema Londres' })
  await expect(londres.getByText('Brancas')).toBeVisible()
  await expect(londres.getByText('Não iniciada')).toBeVisible()
  await expect(londres.getByRole('link', { name: 'Sistema Londres' })).toHaveAttribute('href', '/abertura/londres')

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
  await expect(page.getByText('1 de 5 aberturas concluídas')).toBeVisible()
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
  await expect(titulos).toHaveText(['Italiana (Giuoco Piano)', 'Sistema Londres', 'Defesa Escandinava', 'Espanhola (Ruy Lopez)', 'Defesa Caro-Kann'])

  await filtro.getByRole('button', { name: 'Pretas' }).click()
  await expect(filtro.getByRole('button', { name: 'Pretas' })).toHaveAttribute('aria-pressed', 'true')
  await expect(filtro.getByRole('button', { name: 'Todas' })).toHaveAttribute('aria-pressed', 'false')
  await expect(titulos).toHaveText(['Defesa Escandinava', 'Defesa Caro-Kann'])

  await filtro.getByRole('button', { name: 'Brancas' }).click()
  await expect(titulos).toHaveText(['Italiana (Giuoco Piano)', 'Sistema Londres', 'Espanhola (Ruy Lopez)'])

  await filtro.getByRole('button', { name: 'Todas' }).click()
  await expect(titulos).toHaveText(['Italiana (Giuoco Piano)', 'Sistema Londres', 'Defesa Escandinava', 'Espanhola (Ruy Lopez)', 'Defesa Caro-Kann'])
})

test('o filtro não muda o indicador geral de progresso e funciona pelo teclado', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Pretas' }).focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('button', { name: 'Pretas' })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('heading', { level: 3 })).toHaveText(['Defesa Escandinava', 'Defesa Caro-Kann'])
  await expect(page.getByText('0 de 5 aberturas concluídas')).toBeVisible()
})

// Botão principal "Começar" / "Continuar de onde parei" (F31, SPEC 10.1).

test('na primeira visita o botão diz "Começar" e leva à Italiana', async ({ page }) => {
  await page.goto('/')
  const botao = page.getByRole('link', { name: 'Começar' })
  await expect(botao).toBeVisible()
  await expect(page.getByRole('link', { name: 'Continuar de onde parei' })).toHaveCount(0)

  await botao.click()
  await expect(page).toHaveURL('/abertura/italiana')
  await expect(page.getByText('Abertura: Italiana (Giuoco Piano)')).toBeVisible()
})

test('com a Italiana concluída, o botão leva à próxima abertura da trilha', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      'aprendrez:progresso',
      JSON.stringify({ version: 1, openings: { italiana: { stages: [0, 1, 2, 3, 4, 5], completed: true } } }),
    )
  })
  await page.goto('/')
  await expect(page.getByRole('link', { name: 'Começar', exact: true })).toHaveCount(0)

  await page.getByRole('link', { name: 'Continuar de onde parei' }).click()
  await expect(page).toHaveURL('/abertura/londres')
  await expect(page.getByText('Abertura: Sistema Londres')).toBeVisible()
})

test('com uma abertura em andamento, o botão volta a ela, na etapa certa', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      'aprendrez:progresso',
      JSON.stringify({ version: 1, openings: { italiana: { stages: [0, 1], completed: false } } }),
    )
  })
  await page.goto('/')
  await page.getByRole('link', { name: 'Continuar de onde parei' }).click()
  await expect(page).toHaveURL('/abertura/italiana')
  // A lição abre na primeira etapa não concluída: "Praticar com guia".
  await expect(page.getByRole('navigation', { name: /etapas/i }).locator('[aria-current="step"]')).toContainText('Praticar com guia')
})

test('com tudo concluído, o botão oferece rever desde o início', async ({ page }) => {
  await page.addInitScript(() => {
    const done = { stages: [0, 1, 2, 3, 4, 5], completed: true }
    window.localStorage.setItem(
      'aprendrez:progresso',
      JSON.stringify({ version: 1, openings: { italiana: done, londres: done, escandinava: done, espanhola: done, 'caro-kann': done } }),
    )
  })
  await page.goto('/')
  await page.getByRole('link', { name: 'Rever desde o início' }).click()
  await expect(page).toHaveURL('/abertura/italiana')
})

// Reiniciar progresso (F32, SPEC 10.1).

const PROGRESSO_SALVO = {
  version: 1,
  openings: {
    italiana: { stages: [0, 1, 2, 3, 4, 5], completed: true },
    escandinava: { stages: [0, 1], completed: false },
  },
}

// Grava o progresso só na primeira carga (senão ele voltaria depois de recarregar a página).
async function comProgressoSalvo(page: import('@playwright/test').Page) {
  await page.addInitScript((progresso) => {
    if (!window.sessionStorage.getItem('semeado')) {
      window.localStorage.setItem('aprendrez:progresso', JSON.stringify(progresso))
      window.sessionStorage.setItem('semeado', '1')
    }
  }, PROGRESSO_SALVO)
}

test('cancelar a confirmação mantém o progresso', async ({ page }) => {
  await comProgressoSalvo(page)
  await page.goto('/')
  await expect(page.getByText('1 de 5 aberturas concluídas')).toBeVisible()

  await page.getByRole('button', { name: 'Reiniciar progresso' }).click()
  const janela = page.getByRole('dialog', { name: 'Reiniciar progresso?' })
  await expect(janela).toBeVisible()
  await janela.getByRole('button', { name: 'Cancelar' }).click()

  await expect(janela).toBeHidden()
  await expect(page.getByText('1 de 5 aberturas concluídas')).toBeVisible()
  await expect(page.getByRole('listitem').filter({ hasText: 'Italiana (Giuoco Piano)' }).getByText('Concluída')).toBeVisible()
  await expect(page.getByRole('listitem').filter({ hasText: 'Defesa Escandinava' }).getByText('Em andamento')).toBeVisible()
  // Também continua salvo no navegador depois de recarregar.
  await page.reload()
  await expect(page.getByText('1 de 5 aberturas concluídas')).toBeVisible()
})

test('confirmar apaga tudo e os cartões voltam a "não iniciada"', async ({ page }) => {
  await comProgressoSalvo(page)
  await page.goto('/')
  await expect(page.getByRole('link', { name: 'Continuar de onde parei' })).toBeVisible()

  await page.getByRole('button', { name: 'Reiniciar progresso' }).click()
  await page.getByRole('dialog', { name: 'Reiniciar progresso?' }).getByRole('button', { name: 'Apagar progresso' }).click()

  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page.getByText('0 de 5 aberturas concluídas')).toBeVisible()
  await expect(page.getByText('Não iniciada')).toHaveCount(5)
  await expect(page.getByText('Concluída', { exact: true })).toHaveCount(0)
  await expect(page.getByText('Em andamento', { exact: true })).toHaveCount(0)
  // O botão principal volta a ser o da primeira visita.
  await expect(page.getByRole('link', { name: 'Começar', exact: true })).toBeVisible()

  // E o navegador não guarda mais nada: recarregar continua zerado.
  await page.reload()
  await expect(page.getByText('0 de 5 aberturas concluídas')).toBeVisible()
  const guardado = await page.evaluate(() => window.localStorage.getItem('aprendrez:progresso'))
  expect(guardado).toBeNull()
})

test('a confirmação funciona pelo teclado: foco em "Cancelar", Esc cancela e o foco volta ao botão', async ({ page }) => {
  await comProgressoSalvo(page)
  await page.goto('/')

  const abrir = page.getByRole('button', { name: 'Reiniciar progresso' })
  await abrir.focus()
  await page.keyboard.press('Enter')
  const janela = page.getByRole('dialog', { name: 'Reiniciar progresso?' })
  await expect(janela.getByRole('button', { name: 'Cancelar' })).toBeFocused()

  await page.keyboard.press('Escape')
  await expect(janela).toBeHidden()
  await expect(abrir).toBeFocused()
  await expect(page.getByText('1 de 5 aberturas concluídas')).toBeVisible()
})
