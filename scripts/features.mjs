// Ferramentas do harness para a lista de funcionalidades (features.json).
//
//   node scripts/features.mjs status       -> quantas passam, e qual é a próxima
//   node scripts/features.mjs restantes    -> só o número das que ainda não passam
//   node scripts/features.mjs assinatura   -> "impressão digital" da lista
//
// A assinatura ignora o campo `passes`. Se o agente mudar qualquer outra
// coisa (descrição, passos, ordem, remover itens), a assinatura muda, e o
// script que roda os turnos percebe e interrompe a execução.
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'

const features = JSON.parse(readFileSync(new URL('../features.json', import.meta.url), 'utf8'))
const command = process.argv[2] ?? 'status'

const pending = features.filter((f) => f.passes !== true)

if (command === 'assinatura') {
  const withoutPasses = features.map(({ passes: _ignored, ...rest }) => rest)
  console.log(createHash('sha256').update(JSON.stringify(withoutPasses)).digest('hex'))
} else if (command === 'restantes') {
  console.log(pending.length)
} else {
  const done = features.length - pending.length
  console.log(`${done} de ${features.length} funcionalidades passam.`)
  if (pending.length > 0) console.log(`Próxima: ${pending[0].id} · ${pending[0].titulo}`)
}
