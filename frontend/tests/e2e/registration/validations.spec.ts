import { test, expect } from '@playwright/test';

/**
 * Teste de validações do cadastro
 * 
 * Para ver este teste rodando:
 * 1. Certifique-se que backend e frontend estão rodando
 * 2. Execute: npm run test:e2e -- validations.spec.ts
 * 3. O navegador abrirá automaticamente e você verá o teste executando
 */
test.describe('Validações do Cadastro', () => {
  test('deve validar email duplicado', async ({ page }) => {
    // Primeiro, cadastra um usuário
    await page.goto('/first-access');
    await page.waitForLoadState('networkidle');
    
    // Preenche com um email
    const email = `test-${Date.now()}@test.com`;
    await page.fill('input[type="email"], input[placeholder*="email"]', email);
    await page.fill('input[placeholder*="nome"]', 'Teste Nome');
    await page.fill('input[placeholder*="apelido"]', `test-${Date.now()}`);
    await page.fill('input[placeholder*="data"]', '01/01/1990');
    await page.fill('input[placeholder*="CPF"]', '123.456.789-00');
    await page.fill('input[placeholder*="telefone"]', '+55 11 9 9999-9999');
    
    await page.click('button:has-text("Continuar")');
    await page.waitForTimeout(3000);
    
    // Tenta cadastrar novamente com o mesmo email
    await page.goto('/first-access');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[type="email"], input[placeholder*="email"]', email);
    await page.fill('input[placeholder*="nome"]', 'Outro Nome');
    await page.fill('input[placeholder*="apelido"]', `outro-${Date.now()}`);
    await page.fill('input[placeholder*="data"]', '01/01/1990');
    await page.fill('input[placeholder*="CPF"]', '987.654.321-00');
    await page.fill('input[placeholder*="telefone"]', '+55 11 9 8888-8888');
    
    await page.click('button:has-text("Continuar")');
    await page.waitForTimeout(3000);
    
    // Deve mostrar erro de email duplicado
    const errorMessage = page.locator('text=/já.*cadastrado/i, text=/email.*já/i');
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
  });
  
  test('deve validar requisitos de senha', async ({ page }) => {
    await page.goto('/first-access');
    await page.waitForLoadState('networkidle');
    
    // Preenche dados básicos
    await page.fill('input[placeholder*="nome"]', 'Teste Nome');
    await page.fill('input[placeholder*="apelido"]', `test-${Date.now()}`);
    await page.fill('input[placeholder*="data"]', '01/01/1990');
    await page.fill('input[placeholder*="CPF"]', '123.456.789-00');
    await page.fill('input[type="email"]', `test-${Date.now()}@test.com`);
    await page.fill('input[placeholder*="telefone"]', '+55 11 9 9999-9999');
    
    await page.click('button:has-text("Continuar")');
    await page.waitForTimeout(3000);
    
    // Vai para segunda etapa
    await page.waitForLoadState('networkidle');
    
    // Tenta senha fraca
    await page.fill('input[type="password"]', '123');
    
    // Deve mostrar requisitos de senha
    const passwordRequirements = page.locator('text=/requisitos/i, text=/senha/i');
    await expect(passwordRequirements.first()).toBeVisible({ timeout: 5000 });
  });
});

