import { Chess } from 'chess.js'
import { expect, test, type Page } from '@playwright/test'
import type { Opening, OpeningNode } from '../src/chess/openingTree'
import { toPortugueseSan } from '../src/chess/notation'
import caroKann from '../src/content/openings/caro-kann'
import escandinava from '../src/content/openings/escandinava'
import espanhola from '../src/content/openings/espanhola'
import gambitoDaDama from '../src/content/openings/gambito-da-dama'
import gambitoDaDamaRecusado from '../src/content/openings/gambito-da-dama-recusado'
import italiana from '../src/content/openings/italiana'
import londres from '../src/content/openings/londres'
import siciliana from '../src/content/openings/siciliana'

// Revisão final da definição de pronto (F44, SPEC seção 14):
// "As 8 aberturas existem e cada uma pode ser concluída do começo ao fim, Desafio incluído".
//
// Para cada abertura, o teste joga o Desafio inteiro no navegador e clica em "Concluir".
// Os lances vêm dos próprios arquivos de conteúdo (a árvore), então o teste não repete
// a lista de lances à mão. O sorteio do adversário é fixado com `?acaso=`:
//   0    = o adversário sempre escolhe o primeiro galho (a linha principal);
//   0.99 = o adversário sempre escolhe o último galho (uma variação, quando existe).
// (`?acaso=` e `?etapa=desafio` só existem no servidor de desenvolvimento.)

const ALL_OPENINGS: Opening[] = [
  italiana,
  londres,
  escandinava,
  espanhola,
  caroKann,
  gambitoDaDamaRecusado,
  gambitoDaDama,
  siciliana,
]

/** Mesma regra do Desafio: o número sorteado (0 a 1) é dividido em fatias iguais, uma por galho. */
function pickChild(children: OpeningNode[], random: number): OpeningNode {
  return children[Math.min(Math.floor(random * children.length), children.length - 1)]
}

/** A partida que o Desafio vai ter com o acaso fixo: os lances em SAN, na ordem, até a ponta da árvore. */
function planGame(opening: Opening, random: number): OpeningNode[] {
  const game: OpeningNode[] = []
  let options = opening.tree
  while (options.length > 0) {
    // Nos lances da pessoa só existe um galho (aberturas de linha fixa); nos do adversário, sorteia.
    const node = options[0].by === 'opponent' ? pickChild(options, random) : options[0]
    game.push(node)
    options = node.children
  }
  return game
}

/** Monta a lista numerada esperada, como "1. e4 e5 2. Cf3". */
function numbered(tokens: string[]): string {
  return tokens.map((token, index) => (index % 2 === 0 ? `${index / 2 + 1}. ${token}` : token)).join(' ')
}

const square = (page: Page, name: string) => page.locator(`[data-square="${name}"]`)

async function playWholeChallenge(page: Page, opening: Opening, random: number) {
  const game = planGame(opening, random)
  const tokens = game.map((node) => toPortugueseSan(node.san))
  const chess = new Chess()
  const panel = page.getByRole('region', { name: 'Painel da lição' })
  const moveList = panel.getByLabel('Lista de lances')

  await page.goto(`/abertura/${opening.id}?etapa=desafio&acaso=${random}`)
  await expect(panel.getByRole('heading', { name: 'Desafio' })).toBeVisible()
  await expect(panel.getByRole('button', { name: 'Concluir' })).toBeDisabled()

  for (const [index, node] of game.entries()) {
    const move = chess.move(node.san)
    if (node.by === 'opponent') continue // o app joga sozinho; a gente só espera ele aparecer
    // Espera a posição ficar pronta (inclui a resposta do adversário ao lance anterior)
    await expect(moveList).toHaveText(index === 0 ? /Nenhum lance ainda/ : numbered(tokens.slice(0, index)))
    await square(page, move.from).click()
    await square(page, move.to).click()
    await expect(moveList).toContainText(tokens[index])
  }
  // A partida chegou ao fim: a lista tem todos os lances, na ordem certa.
  await expect(moveList).toHaveText(numbered(tokens))
  await expect(panel.getByText(/Você chegou ao fim da linha/)).toBeVisible()
  return { tokens }
}

for (const opening of ALL_OPENINGS) {
  test(`${opening.name}: o Desafio vai do começo ao fim e leva à conclusão (linha principal)`, async ({ page }) => {
    test.setTimeout(90_000)
    await playWholeChallenge(page, opening, 0)
    const panel = page.getByRole('region', { name: 'Painel da lição' })
    await panel.getByRole('button', { name: 'Concluir' }).click()
    await expect(page).toHaveURL(new RegExp(`/abertura/${opening.id}/conclusao$`))
    await expect(page.getByRole('heading', { name: 'Abertura concluída' })).toBeVisible()
    await expect(page.getByLabel('Linha principal em notação')).toBeVisible()

    // O progresso sobrevive a um recarregamento: na trilha, a contagem continua em "1 de 8".
    await page.goto('/')
    await expect(page.getByText('1 de 8 aberturas concluídas')).toBeVisible()
    await page.reload()
    await expect(page.getByText('1 de 8 aberturas concluídas')).toBeVisible()
  })

  test(`${opening.name}: o Desafio também termina quando o adversário escolhe o último galho`, async ({ page }) => {
    test.setTimeout(90_000)
    await playWholeChallenge(page, opening, 0.99)
    const panel = page.getByRole('region', { name: 'Painel da lição' })
    await panel.getByRole('button', { name: 'Concluir' }).click()
    await expect(page).toHaveURL(new RegExp(`/abertura/${opening.id}/conclusao$`))
    await expect(page.getByRole('heading', { name: 'Abertura concluída' })).toBeVisible()
  })
}

test('as 8 aberturas do catálogo estão cobertas por este teste', () => {
  expect(ALL_OPENINGS.map((opening) => opening.id).sort()).toEqual(
    [
      'caro-kann',
      'escandinava',
      'espanhola',
      'gambito-da-dama',
      'gambito-da-dama-recusado',
      'italiana',
      'londres',
      'siciliana',
    ].sort(),
  )
})

test('nas duas larguras de tela a conclusão não tem rolagem horizontal', async ({ page }) => {
  await page.goto('/abertura/escandinava/conclusao')
  await expect(page.getByRole('heading', { name: 'Abertura concluída' })).toBeVisible()
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
  expect(overflow).toBe(false)
})
