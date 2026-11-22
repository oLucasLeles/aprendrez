import { splitSquareRefs } from '../chess/squareRefs'

// Texto da lição em que as casas e os lances citados ("e4", "Cf6") ganham um sublinhado
// pontilhado. Ao passar o mouse, a casa é destacada no tabuleiro (quem cuida disso é a tela,
// que recebe a casa por `onHoverSquare`).
function BoardText({ text, onHoverSquare }: { text: string; onHoverSquare: (square: string | null) => void }) {
  return (
    <>
      {splitSquareRefs(text).map((part, index) =>
        part.square ? (
          <span
            key={index}
            className="square-ref"
            data-square-ref={part.square}
            onMouseEnter={() => onHoverSquare(part.square!)}
            onMouseLeave={() => onHoverSquare(null)}
          >
            {part.text}
          </span>
        ) : (
          part.text
        ),
      )}
    </>
  )
}

export default BoardText
