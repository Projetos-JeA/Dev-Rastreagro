import { test, expect } from '@playwright/test';
import { getBuyerTestData } from '../fixtures/test-data';
import {
  fillFirstAccessStep,
  fillSecondAccessStep,
  fillThirdAccessStep,
  verifyRegistrationSuccess,
} from '../helpers/registration-helpers';

/**
 * Teste de cadastro de Comprador (Buyer)
 * 
 * Para ver este teste rodando:
 * 1. Certifique-se que backend e frontend estão rodando
 * 2. Execute: npm run test:e2e -- buyer.spec.ts
 * 3. O navegador abrirá automaticamente e você verá o teste executando
 */
test.describe('Cadastro de Comprador', () => {
  test('deve cadastrar um comprador com sucesso', async ({ page }) => {
    const testData = getBuyerTestData();
    
    // Navega para a página de primeiro acesso
    await page.goto('/first-access');
    
    // Aguarda a página carregar
    await page.waitForLoadState('networkidle');
    
    // Preenche primeira etapa (Dados Pessoais)
    await fillFirstAccessStep(page, {
      fullName: testData.fullName,
      nickname: testData.nickname,
      birthDate: testData.birthDate,
      cpf: testData.cpf,
      email: testData.email,
      phone: testData.phone,
    });
    
    // Aguarda validação de email/CPF
    await page.waitForTimeout(3000);
    
    // Verifica se passou para a próxima etapa (não deve ter erros)
    const hasErrors = await page.locator('text=/já.*cadastrado/i, text=/erro/i').isVisible().catch(() => false);
    if (hasErrors) {
      // Se houver erro, tenta com dados diferentes
      testData.email = `buyer-${Date.now()}-${Math.random()}@test.com`;
      await page.reload();
      await fillFirstAccessStep(page, {
        fullName: testData.fullName,
        nickname: testData.nickname,
        birthDate: testData.birthDate,
        cpf: testData.cpf,
        email: testData.email,
        phone: testData.phone,
      });
      await page.waitForTimeout(3000);
    }
    
    // Seleciona perfil de Comprador (se necessário)
    await page.waitForLoadState('networkidle');
    
    // Preenche segunda etapa (Dados da Empresa/Endereço)
    await fillSecondAccessStep(page, {
      address: testData.address,
      cep: testData.cep,
      city: testData.city,
      state: testData.state,
      neighborhood: testData.neighborhood,
      password: testData.password,
      confirmPassword: testData.password,
    });
    
    // Preenche terceira etapa (Dados específicos do comprador)
    await fillThirdAccessStep(page, 'buyer', {});
    
    // Verifica sucesso do cadastro
    await verifyRegistrationSuccess(page);
  });
});

