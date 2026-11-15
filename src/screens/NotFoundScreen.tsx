import { Link } from 'react-router'

// Tela mostrada para qualquer endereço que o app não conhece.
function NotFoundScreen() {
  return (
    <main className="grid page">
      <div className="grid-full">
        <title>Página não encontrada · Aprendrez</title>
        <h1>Página não encontrada</h1>
        <p>Não achamos o que você procurava. Que tal voltar ao começo?</p>
        <p>
          <Link to="/">Ir para o início</Link>
        </p>
      </div>
    </main>
  )
}

export default NotFoundScreen
