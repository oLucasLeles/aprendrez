// Rodapé discreto com os créditos que as licenças exigem (SPEC 9, "Licenças").
// A lista completa de pacotes e licenças está em CREDITOS.md, na raiz do projeto.
function Footer() {
  return (
    <footer className="site-footer grid">
      <p className="grid-full site-footer-text">
        <span>Peças de xadrez: Colin M.L. Burnett (CC BY-SA 3.0).</span>{' '}
        <span>Fonte Geist: Vercel (SIL OFL 1.1).</span>{' '}
        <span>Base de aberturas: Lichess (CC0).</span>
      </p>
    </footer>
  )
}

export default Footer
