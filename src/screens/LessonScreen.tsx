import { Link, useParams } from 'react-router'

// Tela da Lição de uma abertura. O endereço é /abertura/:id, e o ":id"
// (por exemplo, "italiana") diz qual abertura abrir.
// Por enquanto é só o esqueleto: as etapas da lição vêm em funcionalidades futuras.
function LessonScreen() {
  const { id } = useParams()

  return (
    <main className="grid page">
      <div className="grid-full">
        <title>Lição · Aprendrez</title>
        <p>
          <Link to="/">Voltar à trilha</Link>
        </p>
        <h1>Lição</h1>
        <p>Abertura: {id}</p>
      </div>
    </main>
  )
}

export default LessonScreen
