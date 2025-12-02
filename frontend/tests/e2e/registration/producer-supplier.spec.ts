import { test, expect } from '@playwright/test';
import { getProducerSupplierPJTestData } from '../fixtures/test-data';
import {
  fillFirstAccessStep,
  fillSecondAccessStep,
  fillThirdAccessStep,
  selectProfiles,
  verifyRegistrationSuccess,
} from '../helpers/registration-helpers';

/**
 * Teste de cadastro de Produtor + Fornecedor (PJ - Pessoa Jurídica)
 * 
 * Para ver este teste rodando:
 * 1. Certifique-se que backend e frontend estão rodando
 * 2. Execute: npm run test:e2e -- producer-supplier.spec.ts
 * 3. O navegador abrirá automaticamente e você verá o teste executando
 */
test.describe('Cadastro de Produtor + Fornecedor (PJ)', () => {
  test('deve cadastrar um produtor + fornecedor pessoa jurídica com sucesso', async ({ page }) => {
    const testData = getProducerSupplierPJTestData();
    
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
    
    // Aguarda validação
    await page.waitForTimeout(3000);
    
    // Verifica se passou para a próxima etapa
    const hasErrors = await page.locator('text=/já.*cadastrado/i, text=/erro/i').isVisible().catch(() => false);
    if (hasErrors) {
      testData.email = `producer-supplier-${Date.now()}-${Math.random()}@test.com`;
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
    
    // Seleciona perfis de Produtor + Fornecedor
    await selectProfiles(page, ['producer', 'supplier']);
    
    // Preenche segunda etapa (com CNPJ)
    await fillSecondAccessStep(
      page,
      {
        cnpj: testData.cnpj,
        companyName: testData.companyName,
        tradeName: testData.tradeName,
        stateRegistration: testData.stateRegistration,
        address: testData.address,
        cep: testData.cep,
        city: testData.city,
        state: testData.state,
        neighborhood: testData.neighborhood,
        password: testData.password,
        confirmPassword: testData.password,
      },
      true // isPJ = true
    );
    
    // Preenche terceira etapa
    await fillThirdAccessStep(page, 'producer', {
      producerType: 'agricultor',
    });
    
    // Verifica sucesso
    await verifyRegistrationSuccess(page);
  });
});

