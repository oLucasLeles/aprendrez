import { defineConfig, devices } from '@playwright/test'

// Testes de ponta a ponta: abrem o app num navegador de verdade e
// interagem como uma pessoa faria. Rodam em dois tamanhos de tela,
// porque a spec exige que o app funcione em 1440 px e em 375 px.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
    // O navegador dos testes pede "movimento reduzido", então as peças não deslizam.
    // Motivo: o robô clica muito mais rápido que uma pessoa. Às vezes o clique caía
    // durante a animação de 150 ms e se perdia, e o teste falhava por acaso (~10%
    // das vezes). Um teste que quiser ver a animação pode pedir
    // test.use({ reducedMotion: 'no-preference' }).
    reducedMotion: 'reduce',
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'celular',
      use: { ...devices['Desktop Chrome'], viewport: { width: 375, height: 812 }, hasTouch: true },
    },
  ],
  webServer: {
    command: 'npm run dev -- --port 5173 --strictPort',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 60_000,
  },
})
