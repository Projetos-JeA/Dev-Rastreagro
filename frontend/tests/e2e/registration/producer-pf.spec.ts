import { test, expect } from '@playwright/test';
import { getProducerPFTestData } from '../fixtures/test-data';
import {
  fillFirstAccessStep,
  fillSecondAccessStep,
  fillThirdAccessStep,
  selectProfiles,
  verifyRegistrationSuccess,
} from '../helpers/registration-helpers';

/**
 * Teste de cadastro de Produtor (PF - Pessoa Física)
 * 
 * Para ver este teste rodando:
 * 1. Certifique-se que backend e frontend estão rodando
 * 2. Execute: npm run test:e2e -- producer-pf.spec.ts
 * 3. O navegador abrirá automaticamente e você verá o teste executando
 */
test.describe('Cadastro de Produtor (PF)', () => {
  test('deve cadastrar um produtor pessoa física com sucesso', async ({ page }) => {
    const testData = getProducerPFTestData();
    
    // Navega para a página de primeiro acesso
    await page.goto('/first-access');
    
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
    
    // Aguarda navegação para segunda etapa
    console.log('[TEST] Aguardando navegação para segunda etapa...');
    await page.waitForURL('**/second-access**', { timeout: 10000 }).catch(() => {
      console.log('[TEST] ⚠️ URL não mudou, mas continuando...');
    });
    await page.waitForTimeout(2000);
    
    // Verifica se há erros de validação
    const hasErrors = await page.locator('text=/já.*cadastrado/i, text=/erro/i').isVisible().catch(() => false);
    if (hasErrors) {
      console.log('[TEST] ⚠️ Erro encontrado, tentando com novo email...');
      testData.email = `producer-${Date.now()}-${Math.random()}@test.com`;
      await page.reload();
      await fillFirstAccessStep(page, {
        fullName: testData.fullName,
        nickname: testData.nickname,
        birthDate: testData.birthDate,
        cpf: testData.cpf,
        email: testData.email,
        phone: testData.phone,
      });
      await page.waitForURL('**/second-access**', { timeout: 10000 }).catch(() => {});
      await page.waitForTimeout(2000);
    }
    
    // Seleciona perfil de Produtor (deve ser feito na segunda etapa)
    await selectProfiles(page, ['producer']);
    
    // Preenche segunda etapa
    await fillSecondAccessStep(page, {
      companyName: testData.companyName,
      address: testData.address,
      cep: testData.cep,
      city: testData.city,
      state: testData.state,
      neighborhood: testData.neighborhood,
      password: testData.password,
      confirmPassword: testData.password,
    });
    
    // Preenche terceira etapa
    await fillThirdAccessStep(page, 'producer', {
      producerType: testData.producerType,
    });
    
    // Verifica sucesso
    await verifyRegistrationSuccess(page);
  });
});

