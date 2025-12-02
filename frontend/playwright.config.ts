import { defineConfig, devices } from '@playwright/test';

/**
 * Configuração do Playwright para testes E2E
 * 
 * Para ver os testes rodando na tela:
 * 1. Certifique-se que backend e frontend estão rodando
 * 2. Execute: npm run test:e2e
 * 3. Os testes abrirão o navegador automaticamente
 */
export default defineConfig({
  testDir: './tests/e2e',
  
  // Timeout para cada teste (aumentado para validações)
  timeout: 120 * 1000, // 120 segundos
  
  // Expect timeout
  expect: {
    timeout: 10 * 1000, // 10 segundos
  },
  
  // Executa testes em paralelo
  fullyParallel: true,
  
  // Falha o build se você deixou test.only no código
  forbidOnly: !!process.env.CI,
  
  // Retry em CI
  retries: process.env.CI ? 2 : 0,
  
  // Workers em CI
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
  ],
  
  // Compartilha configuração entre projetos
  use: {
    // URL base da aplicação
    baseURL: 'http://localhost:8081',
    
    // Coleta trace sempre (para debug)
    trace: 'on',
    
    // Screenshot sempre (para debug)
    screenshot: 'on',
    
    // Vídeo sempre (para ver o que aconteceu)
    video: 'on',
    
    // Headless: false = mostra o navegador (para ver os testes)
    headless: false,
    
    // Viewport
    viewport: { width: 1280, height: 720 },
  },

  // Configuração dos projetos (navegadores)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Servidor web (opcional - se quiser que o Playwright inicie o servidor)
  // webServer: {
  //   command: 'npm start',
  //   url: 'http://localhost:8081',
  //   reuseExistingServer: !process.env.CI,
  // },
});

