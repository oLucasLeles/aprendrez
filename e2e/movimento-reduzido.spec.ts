import { expect, test, type Page } from '@playwright/test'

// Movimento reduzido (F41, SPEC seção 9): as animações duram até 200 ms e somem quando a
// pessoa pede "menos movimento" no sistema (prefers-reduced-motion).
//
// Atenção: o padrão dos testes (playwright.config.ts) já é `reducedMotion: 'reduce'`, para os
// cliques do robô não se perderem durante animações. Por isso o grupo que quer VER a animação
// pede 'no-preference' de forma explícita.

const square = (page: Page, name: string) => page.locator(`[data-square="${name}"]`)

/**
 * Faz 1.e4 na página de testes do tabuleiro e devolve as durações de transição (em ms)
 * que o navegador aplicou nos elementos do tabuleiro durante o lance. Também devolve
 * se a peça já estava em e4 logo depois do lance.
 */
async function playE4AndCollectTransitions(page: Page) {
  await page.goto('/dev/tabuleiro?jogar=brancas')
  await expect(page.locator('[data-piece]')).toHaveCount(32)

  // Um "observador" anota toda transição que aparecer no tabuleiro (a biblioteca escreve
  // `transition: transform 150ms` direto no estilo da peça que anda).
  await page.evaluate(() => {
    const seen: number[] = []
    ;(window as unknown as { __transitions: number[] }).__transitions = seen
    const board = document.querySelector('.board')!
    const read = (el: Element) => {
      const duration = getComputedStyle(el).transitionDuration
      for (const part of duration.split(',')) {
        const value = part.trim()
        const ms = value.endsWith('ms') ? parseFloat(value) : parseFloat(value) * 1000
        if (ms > 0.1) seen.push(ms)
      }
    }
    new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.target instanceof Element) read(m.target)
        m.addedNodes.forEach((n) => n instanceof Element && read(n))
      }
    }).observe(board, { subtree: true, childList: true, attributes: true, attributeFilter: ['style'] })
  })

  await square(page, 'e2').click()
  await square(page, 'e4').click()
  await expect(page.getByTestId('lances-feitos')).toHaveText('e4')
  // espera a animação (se houver) acabar
  await page.waitForTimeout(400)
  return page.evaluate(() => (window as unknown as { __transitions: number[] }).__transitions)
}

test.describe('com a preferência "sem preferência de movimento"', () => {
  test.use({ reducedMotion: 'no-preference' })

  test('o tabuleiro anima o lance, e a animação dura até 200 ms', async ({ page }) => {
    const durations = await playE4AndCollectTransitions(page)
    // Existe animação...
    expect(durations.length).toBeGreaterThan(0)
    // ...e nenhuma passa de 200 ms (SPEC, seção 9)
    for (const ms of durations) expect(ms).toBeLessThanOrEqual(200)
  })
})

test.describe('com "reduzir movimento" ligado', () => {
  test.use({ reducedMotion: 'reduce' })

  test('o tabuleiro não anima os lances', async ({ page }) => {
    const durations = await playE4AndCollectTransitions(page)
    expect(durations).toEqual([])
    // A peça está em e4 e e2 ficou vazia
    await expect(square(page, 'e4').locator('[data-piece="wP"]')).toHaveCount(1)
    await expect(square(page, 'e2').locator('[data-piece]')).toHaveCount(0)
  })

  test('nenhum elemento da página tem animação ou transição de CSS', async ({ page }) => {
    await page.goto('/')
    const animated = await page.evaluate(() => {
      const result: string[] = []
      for (const el of document.querySelectorAll('*')) {
        const style = getComputedStyle(el)
        const durations = [...style.transitionDuration.split(','), ...style.animationDuration.split(',')]
        const longest = Math.max(...durations.map((d) => (d.trim().endsWith('ms') ? parseFloat(d) : parseFloat(d) * 1000)))
        if (longest > 1) result.push(`${el.tagName.toLowerCase()}.${el.className} (${longest} ms)`)
      }
      return result
    })
    expect(animated).toEqual([])
  })

  test('a resposta do adversário continua demorando um pouco, sem animação', async ({ page }) => {
    await page.goto('/abertura/italiana?etapa=desafio&acaso=0')
    const moves = page.getByRole('region', { name: 'Painel da lição' }).getByLabel('Lista de lances')
    await expect(moves).toBeVisible()

    // Anota o instante em que o lance da pessoa e a resposta aparecem na lista de lances
    await page.evaluate(() => {
      const times: Record<string, number> = {}
      ;(window as unknown as { __times: Record<string, number> }).__times = times
      const list = document.querySelector('[aria-label="Lista de lances"]')!
      new MutationObserver(() => {
        const text = list.textContent ?? ''
        if (text.includes('e4') && !('user' in times)) times.user = performance.now()
        if (text.includes('e5') && !('reply' in times)) times.reply = performance.now()
      }).observe(list, { subtree: true, childList: true, characterData: true })
    })

    await square(page, 'e2').click()
    await square(page, 'e4').click()
    await expect(moves).toHaveText('1. e4 e5')

    const times = await page.evaluate(() => (window as unknown as { __times: Record<string, number> }).__times)
    // SPEC 7.5: cerca de 400 ms. Aceitamos uma folga para máquinas lentas.
    expect(times.reply - times.user).toBeGreaterThanOrEqual(300)
  })
})
