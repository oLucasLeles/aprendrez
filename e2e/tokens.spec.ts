import { expect, test } from '@playwright/test'

// Confere, num navegador de verdade, que os tokens de design estão em uso
// e que a fonte vem do próprio app, sem depender de servidor externo.
test('a fonte Geist é carregada do próprio app', async ({ page, baseURL }) => {
  const externalRequests: string[] = []
  page.on('request', (request) => {
    if (!request.url().startsWith(baseURL!)) externalRequests.push(request.url())
  })

  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)

  const fontLoaded = await page.evaluate(() => document.fonts.check('16px "Geist Variable"'))
  expect(fontLoaded).toBe(true)

  const bodyFont = await page.evaluate(() => getComputedStyle(document.body).fontFamily)
  expect(bodyFont).toContain('Geist Variable')
  expect(externalRequests).toEqual([])
})

test('os estilos globais usam os tokens', async ({ page }) => {
  await page.goto('/')
  const styles = await page.evaluate(() => {
    const root = getComputedStyle(document.documentElement)
    const body = getComputedStyle(document.body)
    return {
      tokenText: root.getPropertyValue('--color-text').trim(),
      tokenColumns: root.getPropertyValue('--grid-columns').trim(),
      bodyColor: body.color,
    }
  })
  expect(styles.tokenText).not.toBe('')
  expect(styles.bodyColor).not.toBe('')
  const viewport = page.viewportSize()!
  expect(styles.tokenColumns).toBe(viewport.width >= 768 ? '12' : '4')
})
