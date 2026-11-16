// Gera as capturas de tela para revisão visual (npm run capturas).
//
// Abre o app num navegador de verdade (Playwright) e salva em docs/capturas/revisao/
// uma imagem de cada tela e de cada etapa da lição, em 1440 px (desktop) e 375 px (celular).
// É o material que o dono do projeto usa para revisar o visual sem precisar rodar o app.
//
// O script sobe sozinho o servidor de desenvolvimento do Vite (e o desliga no fim),
// então não precisa de nada aberto antes. Cada imagem é uma página inteira, com rolagem.

import { chromium } from '@playwright/test'
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outDir = path.join(root, 'docs', 'capturas', 'revisao')

const SIZES = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'celular', width: 375, height: 812 },
]

// As 8 aberturas, na ordem da trilha da SPEC (id = nome do arquivo de conteúdo).
const OPENINGS = [
  'italiana',
  'londres',
  'escandinava',
  'espanhola',
  'caro-kann',
  'gambito-da-dama-recusado',
  'gambito-da-dama',
  'siciliana',
]

const STAGES = ['Conhecer', 'Assistir', 'Praticar com guia', 'Praticar sozinho', 'Variações', 'Desafio']

/** Lista de imagens geradas, para montar o LEIA-ME no fim. */
const generated = []

async function main() {
  // Começa de uma pasta limpa, para não sobrar imagem de uma tela que não existe mais.
  await rm(outDir, { recursive: true, force: true })
  await mkdir(outDir, { recursive: true })

  const server = await createServer({
    root,
    logLevel: 'error',
    server: { port: 5199, strictPort: false },
  })
  await server.listen()
  const baseURL = server.resolvedUrls.local[0].replace(/\/$/, '')
  console.log(`Servidor de desenvolvimento em ${baseURL}`)

  const browser = await chromium.launch()
  try {
    for (const size of SIZES) {
      await captureAll(browser, baseURL, size)
    }
  } finally {
    await browser.close()
    await server.close()
  }

  await writeReadme()
  console.log(`\n${generated.length} imagens salvas em docs/capturas/revisao/`)
}

async function captureAll(browser, baseURL, size) {
  console.log(`\n== ${size.name} (${size.width} px) ==`)
  // "Movimento reduzido" igual aos testes: nada deslizando na hora da foto.
  const context = await browser.newContext({
    baseURL,
    viewport: { width: size.width, height: size.height },
    hasTouch: size.name === 'celular',
    reducedMotion: 'reduce',
  })

  /** Abre uma página nova, já com um progresso salvo (ou vazio). */
  async function newPage(progress) {
    const page = await context.newPage()
    const errors = []
    page.on('pageerror', (e) => errors.push(e.message))
    // Todas as páginas dividem o mesmo armazenamento do navegador; por isso cada uma define
    // o seu progresso (ou apaga o das anteriores) antes de a página carregar.
    await page.addInitScript((value) => {
      if (value) window.localStorage.setItem('aprendrez:progresso', JSON.stringify(value))
      else window.localStorage.removeItem('aprendrez:progresso')
    }, progress ?? null)
    page.errors = errors
    return page
  }

  async function shot(page, name, description) {
    const file = `${name}-${size.name}.png`
    await page.screenshot({ path: path.join(outDir, file), fullPage: true })
    // Rolagem horizontal seria um defeito visual; avisamos no terminal.
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    )
    if (overflow) console.warn(`  ATENÇÃO: ${file} tem rolagem horizontal`)
    generated.push({ file, name, description, size: size.name })
    console.log(`  ${file}`)
  }

  const allStages = (id) => ({
    version: 1,
    openings: { [id]: { stages: [0, 1, 2, 3, 4], completed: false } },
  })
  const goToStage = async (page, stage) => {
    await page
      .getByRole('navigation', { name: 'Etapas da lição' })
      .getByRole('button', { name: new RegExp(`^${stage}`) })
      .click()
    await page.getByRole('region', { name: 'Painel da lição' }).getByRole('heading', { name: stage }).waitFor()
  }
  const square = (page, name) => page.locator(`[data-square="${name}"]`)

  // ---------- Tela inicial (trilha) ----------
  let page = await newPage()
  await page.goto('/')
  await page.getByRole('heading', { name: 'Aprendrez' }).waitFor()
  await shot(page, '01-inicio', 'Tela inicial, primeira visita')

  await page.getByRole('button', { name: 'Pretas' }).click()
  await shot(page, '02-inicio-filtro-pretas', 'Tela inicial com o filtro "Pretas"')

  await page.getByRole('button', { name: /Reiniciar progresso/ }).click()
  await page.getByRole('button', { name: 'Cancelar' }).waitFor()
  await shot(page, '03-inicio-confirmar-reiniciar', 'Confirmação de "Reiniciar progresso"')
  await page.close()

  // Tela inicial com algum progresso (uma concluída e uma em andamento).
  page = await newPage({
    version: 1,
    openings: {
      italiana: { stages: [0, 1, 2, 3, 4, 5], completed: true },
      londres: { stages: [0, 1], completed: false },
    },
  })
  await page.goto('/')
  await page.getByRole('heading', { name: 'Aprendrez' }).waitFor()
  await shot(page, '04-inicio-com-progresso', 'Tela inicial com uma abertura concluída e uma em andamento')
  await page.close()

  // ---------- Lição da Italiana: cada etapa ----------
  page = await newPage(allStages('italiana'))
  await page.goto('/abertura/italiana')
  const panel = page.getByRole('region', { name: 'Painel da lição' })

  await goToStage(page, 'Conhecer')
  await shot(page, '10-licao-1-conhecer', 'Lição da Italiana · etapa Conhecer')

  await goToStage(page, 'Assistir')
  for (let i = 0; i < 5; i++) await panel.getByRole('button', { name: 'Próximo' }).click()
  await shot(page, '11-licao-2-assistir', 'Lição da Italiana · etapa Assistir, no 5º lance')

  await goToStage(page, 'Praticar com guia')
  await shot(page, '12-licao-3-praticar-com-guia', 'Lição da Italiana · Praticar com guia (peça destacada e seta)')

  await goToStage(page, 'Praticar sozinho')
  await shot(page, '13-licao-4-praticar-sozinho', 'Lição da Italiana · Praticar sozinho, começo')

  // Lance fora do roteiro (1.d4) e depois o "Ver lance".
  await square(page, 'd2').click()
  await square(page, 'd4').click()
  await panel.getByRole('button', { name: 'Voltar' }).waitFor()
  await shot(page, '14-licao-4-fora-do-roteiro', 'Praticar sozinho · lance fora do roteiro, com dica e botão "Voltar"')
  await panel.getByRole('button', { name: 'Voltar' }).click()

  await panel.getByRole('button', { name: 'Ver lance' }).click()
  await shot(page, '15-licao-4-ver-lance', 'Praticar sozinho · "Ver lance" mostrando o guia só deste lance')

  // Lance correto (1.e4): aparece a explicação e a resposta do adversário.
  await square(page, 'e2').click()
  await square(page, 'e4').click()
  await panel.getByLabel('Lista de lances').getByText('e5').waitFor()
  await shot(page, '16-licao-4-lance-correto', 'Praticar sozinho · lance correto, com a explicação e a resposta')

  await goToStage(page, 'Variações')
  await shot(page, '17-licao-5-variacoes', 'Lição da Italiana · etapa Variações')

  await goToStage(page, 'Desafio')
  await shot(page, '18-licao-6-desafio', 'Lição da Italiana · etapa Desafio')
  await page.close()

  // ---------- Lição de pretas (tabuleiro invertido) ----------
  page = await newPage(allStages('siciliana'))
  await page.goto('/abertura/siciliana')
  await goToStage(page, 'Conhecer')
  await shot(page, '20-licao-pretas-conhecer', 'Siciliana (pretas) · Conhecer, tabuleiro invertido')
  await goToStage(page, 'Praticar com guia')
  // Nas pretas, o app joga o 1.e4 sozinho primeiro (com um pequeno atraso): esperamos a vez da pessoa.
  await page.getByText(/Sua vez/).waitFor()
  await shot(page, '21-licao-pretas-com-guia', 'Siciliana (pretas) · Praticar com guia, depois do 1.e4 do adversário')
  await page.close()

  // ---------- Conhecer de cada uma das 8 aberturas ----------
  for (const [index, id] of OPENINGS.entries()) {
    page = await newPage()
    await page.goto(`/abertura/${id}`)
    await page.getByRole('region', { name: 'Painel da lição' }).getByRole('heading', { name: 'Conhecer' }).waitFor()
    await shot(page, `3${index}-conhecer-${id}`, `Etapa Conhecer · ${id}`)
    await page.close()
  }

  // ---------- Conclusão e página não encontrada ----------
  page = await newPage()
  await page.goto('/abertura/italiana/conclusao')
  await page.getByRole('heading', { name: 'Abertura concluída' }).waitFor()
  await shot(page, '40-conclusao', 'Tela de conclusão da Italiana')
  await page.close()

  page = await newPage()
  await page.goto('/isto-nao-existe')
  await page.getByRole('heading', { name: /não encontrada/i }).waitFor()
  await shot(page, '41-nao-encontrada', 'Página não encontrada')
  await page.close()

  await context.close()
}

/** Escreve um índice simples, para a pessoa saber o que cada imagem mostra. */
async function writeReadme() {
  const names = [...new Set(generated.map((g) => g.name))]
  const lines = [
    '# Capturas para revisão visual',
    '',
    'Geradas por `npm run capturas` (não edite à mão: o comando apaga e recria esta pasta).',
    'Cada tela aparece em 1440 px (desktop) e 375 px (celular), página inteira.',
    '',
    '| Tela | Desktop | Celular |',
    '|---|---|---|',
  ]
  for (const name of names) {
    const desktop = generated.find((g) => g.name === name && g.size === 'desktop')
    const mobile = generated.find((g) => g.name === name && g.size === 'celular')
    const description = (desktop ?? mobile).description
    lines.push(`| ${description} | [ver](${desktop?.file ?? ''}) | [ver](${mobile?.file ?? ''}) |`)
  }
  await writeFile(path.join(outDir, 'LEIA-ME.md'), lines.join('\n') + '\n', 'utf8')
  // Confere que a pasta tem tudo o que foi anunciado.
  const files = await readdir(outDir)
  if (files.filter((f) => f.endsWith('.png')).length !== generated.length) {
    throw new Error('O número de imagens na pasta não bate com o que o script gerou.')
  }
}

main().catch((error) => {
  console.error('\nO script de capturas falhou:', error)
  process.exit(1)
})
