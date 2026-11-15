// Testes "de fumaça": só confirmam que as peças básicas funcionam.
// Se estes falharem, o problema é de configuração, não de funcionalidade.
import { render, screen } from '@testing-library/react'
import { Chess } from 'chess.js'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('fundação', () => {
  it('renderiza o nome do app', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Aprendrez' })).toBeInTheDocument()
  })

  it('chess.js aceita a linha da Italiana e recusa um lance ilegal', () => {
    const chess = new Chess()
    for (const lance of ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5']) chess.move(lance)
    expect(chess.history()).toHaveLength(6)
    expect(() => chess.move('Ke3')).toThrow()
  })
})
