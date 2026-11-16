// Confere a tabela de rotas sem abrir um navegador: o MemoryRouter
// é um roteador "de mentira" em que escolhemos o endereço inicial.
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, describe, expect, it } from 'vitest'
import { AppRoutes } from './App'

function renderAt(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>,
  )
}

// Limpa a tela entre um teste e outro (senão os elementos se acumulam).
afterEach(cleanup)

describe('rotas', () => {
  it('/ mostra o Início', () => {
    renderAt('/')
    expect(screen.getByRole('heading', { level: 1, name: 'Aprendrez' })).toBeInTheDocument()
  })

  it('/abertura/italiana mostra a Lição com o nome da abertura', () => {
    renderAt('/abertura/italiana')
    expect(screen.getByRole('heading', { level: 1, name: 'Lição' })).toBeInTheDocument()
    expect(screen.getByText('Abertura: Italiana (Giuoco Piano)')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Voltar à trilha' })).toHaveAttribute('href', '/')
  })

  it('/abertura/id-que-nao-existe mostra a Página não encontrada', () => {
    renderAt('/abertura/id-que-nao-existe')
    expect(screen.getByRole('heading', { level: 1, name: 'Página não encontrada' })).toBeInTheDocument()
  })

  it('um endereço desconhecido mostra a Página não encontrada', () => {
    renderAt('/rota-que-nao-existe')
    expect(screen.getByRole('heading', { level: 1, name: 'Página não encontrada' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ir para o início' })).toHaveAttribute('href', '/')
  })
})
