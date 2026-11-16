import { Link } from 'react-router'

// Tela mostrada para qualquer endereço que o app não conhece (SPEC 10.4):
// uma mensagem simples e um link para o início, no mesmo visual das outras telas.
function NotFoundScreen() {
  return (
    <main className="grid page">
      <div className="grid-full not-found">
        <title>Página não encontrada · Aprendrez</title>
        <h1>Página não encontrada</h1>
        <p className="not-found-text">Não achamos o que você procurava. Que tal voltar ao começo?</p>
        {/* Link com a aparência do botão principal (leva a outra tela) */}
        <Link to="/" className="button-primary not-found-link">
          Ir para o início
        </Link>
      </div>
    </main>
  )
}

export default NotFoundScreen
