import { expect, type Page } from '@playwright/test'

// Ajudantes dos testes para o indicador de etapas da lição. Desde 2026-11-23 ele é um anel com
// "Etapa X de 6" e o nome da etapa; ao ser clicado, abre a lista das 6 etapas. O nome acessível
// do botão é o próprio texto visível, como "Etapa 2 de 6 Assistir".

/** O botão do indicador (anel + "Etapa X de 6"). O nome acessível termina com a etapa atual. */
export function currentStage(page: Page) {
  return page.getByRole('navigation', { name: 'Etapas da lição' }).getByRole('button', { name: /^Etapa \d+ de \d+ / })
}

/** Abre a lista de etapas e escolhe uma pelo nome. */
export async function goToStage(page: Page, name: string) {
  const nav = page.getByRole('navigation', { name: 'Etapas da lição' })
  await currentStage(page).click()
  await nav.getByRole('button', { name, exact: true }).click()
}

/** Confere qual é a etapa atual. */
export async function expectStage(page: Page, name: string) {
  await expect(currentStage(page)).toHaveAccessibleName(new RegExp(` ${name}$`))
}
