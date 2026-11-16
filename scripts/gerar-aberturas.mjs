// Gera docs/ABERTURAS.md a partir dos arquivos de src/content/openings/.
// Uso: npm run docs:aberturas
//
// Os arquivos de conteúdo são TypeScript; para carregá-los usamos o próprio Vite
// (já instalado), que entende TypeScript sem precisar de nenhum pacote extra.
import { readdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { createServer } from 'vite'

const root = resolve(import.meta.dirname, '..')
const contentDir = join(root, 'src', 'content', 'openings')

const files = readdirSync(contentDir)
  .filter((name) => name.endsWith('.ts') && name !== 'index.ts' && !name.endsWith('.test.ts'))
  .sort()

const server = await createServer({
  root,
  appType: 'custom',
  logLevel: 'error',
  server: { middlewareMode: true, hmr: false, watch: null },
})

try {
  const openings = []
  for (const file of files) {
    const module = await server.ssrLoadModule(`/src/content/openings/${file}`)
    openings.push(module.default)
  }
  const { generateOpeningsDoc } = await server.ssrLoadModule('/src/chess/openingsDoc.ts')
  const target = join(root, 'docs', 'ABERTURAS.md')
  writeFileSync(target, generateOpeningsDoc(openings), 'utf8')
  console.log(`docs/ABERTURAS.md gerado com ${openings.length} abertura(s).`)
} finally {
  await server.close()
}
