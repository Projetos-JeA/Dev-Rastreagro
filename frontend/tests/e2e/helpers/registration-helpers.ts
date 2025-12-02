import { Page, expect } from '@playwright/test';

/**
 * Helpers para facilitar os testes de cadastro
 */

/**
 * Aguarda e clica no botão Continuar (React Native Web usa div, não button)
 */
async function clickContinueButton(page: Page, step: string = '') {
  console.log(`[TEST] Tentando clicar no botão Continuar ${step ? `(${step})` : ''}...`);
  
  // Aguarda o botão aparecer e estar habilitado
  // React Native Web renderiza TouchableOpacity como div com texto
  const continueButton = page.locator('text=/Continuar/i').first();
  
  // Aguarda o botão estar visível
  await continueButton.waitFor({ state: 'visible', timeout: 10000 });
  
  // Verifica se não está desabilitado (loading)
  const isDisabled = await continueButton.getAttribute('disabled').catch(() => null);
  if (isDisabled !== null) {
    console.log('[TEST] Botão está desabilitado, aguardando...');
    await page.waitForTimeout(2000);
  }
  
  // Scroll até o botão se necessário
  await continueButton.scrollIntoViewIfNeeded();
  
  // Aguarda um pouco para garantir que está clicável
  await page.waitForTimeout(500);
  
  console.log('[TEST] Clicando no botão Continuar...');
  await continueButton.click({ force: true });
  console.log('[TEST] Botão Continuar clicado!');
}

/**
 * Preenche a primeira etapa do cadastro (Dados Pessoais)
 */
export async function fillFirstAccessStep(
  page: Page,
  data: {
    fullName: string;
    nickname: string;
    birthDate: string;
    cpf: string;
    email: string;
    phone: string;
  }
) {
  console.log('[TEST] Preenchendo primeira etapa do cadastro...');
  
  // Aguarda a página carregar
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  
  console.log('[TEST] Preenchendo Nome completo...');
  await page.fill('input[placeholder*="nome" i], input[placeholder*="Nome" i]', data.fullName);
  
  console.log('[TEST] Preenchendo Apelido...');
  await page.fill('input[placeholder*="apelido" i], input[placeholder*="chamado" i]', data.nickname);
  
  console.log('[TEST] Preenchendo Data de nascimento...');
  await page.fill('input[placeholder*="xx/xx/xxxx" i], input[placeholder*="data" i]', data.birthDate);
  
  console.log('[TEST] Preenchendo CPF...');
  await page.fill('input[placeholder*="xxx.xxx.xxx-xx" i], input[placeholder*="CPF" i]', data.cpf);
  
  console.log('[TEST] Preenchendo Email...');
  await page.fill('input[type="email"], input[placeholder*="email" i]', data.email);
  
  console.log('[TEST] Preenchendo Telefone...');
  await page.fill('input[placeholder*="telefone" i], input[placeholder*="+xx" i]', data.phone);
  
  // Aguarda um pouco para garantir que todos os campos foram preenchidos
  await page.waitForTimeout(1000);
  
  // Clica em Continuar
  await clickContinueButton(page, 'Etapa 1');
  
  // Aguarda validação de email/CPF (pode demorar um pouco)
  console.log('[TEST] Aguardando validação de email/CPF...');
  await page.waitForTimeout(3000);
  
  // Verifica se há erros de validação
  const errorMessages = page.locator('text=/já.*cadastrado/i, text=/erro/i, text=/inválido/i');
  const errorCount = await errorMessages.count();
  if (errorCount > 0) {
    console.log(`[TEST] ⚠️ Encontrados ${errorCount} erros de validação`);
    const errorText = await errorMessages.first().textContent().catch(() => '');
    console.log(`[TEST] Erro: ${errorText}`);
  } else {
    console.log('[TEST] ✅ Validação passou, prosseguindo...');
  }
}

/**
 * Preenche a segunda etapa do cadastro (Dados da Empresa/Propriedade)
 */
export async function fillSecondAccessStep(
  page: Page,
  data: {
    companyName?: string;
    tradeName?: string;
    cnpj?: string;
    stateRegistration?: string;
    address: string;
    cep: string;
    city: string;
    state: string;
    neighborhood: string;
    password: string;
    confirmPassword: string;
  },
  isPJ: boolean = false
) {
  console.log('[TEST] Preenchendo segunda etapa do cadastro...');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000); // Aguarda página carregar completamente
  
  if (isPJ && data.cnpj) {
    console.log('[TEST] Preenchendo dados de PJ (CNPJ)...');
    // Preenche CNPJ
    await page.fill('input[placeholder*="CNPJ" i], input[placeholder*="cnpj" i]', data.cnpj);
    
    // Clica em Buscar CNPJ (se existir)
    const buscarCnpjButton = page.locator('text=/Buscar/i').first();
    if (await buscarCnpjButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('[TEST] Clicando em Buscar CNPJ...');
      await buscarCnpjButton.click();
      await page.waitForTimeout(3000); // Aguarda busca do CNPJ
      console.log('[TEST] ✅ Busca de CNPJ concluída');
    }
    
    // Preenche Razão Social
    if (data.companyName) {
      console.log('[TEST] Preenchendo Razão Social...');
      await page.fill('input[placeholder*="razão" i], input[placeholder*="Razão" i]', data.companyName);
    }
    
    // Preenche Nome Fantasia
    if (data.tradeName) {
      console.log('[TEST] Preenchendo Nome Fantasia...');
      await page.fill('input[placeholder*="fantasia" i], input[placeholder*="Fantasia" i]', data.tradeName);
    }
    
    // Preenche Inscrição Estadual (se fornecido)
    if (data.stateRegistration) {
      console.log('[TEST] Preenchendo Inscrição Estadual...');
      await page.fill('input[placeholder*="inscrição" i], input[placeholder*="estadual" i]', data.stateRegistration);
    }
  } else {
    // Preenche Nome da Propriedade
    if (data.companyName) {
      console.log('[TEST] Preenchendo Nome da Propriedade...');
      await page.fill('input[placeholder*="propriedade" i], input[placeholder*="Propriedade" i]', data.companyName);
    }
  }
  
  // Preenche CEP
  console.log('[TEST] Preenchendo CEP...');
  await page.fill('input[placeholder*="CEP" i], input[placeholder*="cep" i]', data.cep);
  
  // Clica em Buscar CEP (se existir)
  const buscarCepButtons = page.locator('text=/Buscar/i');
  const buscarCepCount = await buscarCepButtons.count();
  if (buscarCepCount > 0) {
    const buscarCepButton = buscarCepButtons.last();
    if (await buscarCepButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('[TEST] Clicando em Buscar CEP...');
      await buscarCepButton.click();
      await page.waitForTimeout(2000); // Aguarda busca do CEP
      console.log('[TEST] ✅ Busca de CEP concluída');
    }
  }
  
  // Preenche Endereço
  console.log('[TEST] Preenchendo Endereço...');
  await page.fill('input[placeholder*="endereço" i], input[placeholder*="Endereço" i]', data.address);
  
  // Preenche Bairro
  console.log('[TEST] Preenchendo Bairro...');
  await page.fill('input[placeholder*="bairro" i], input[placeholder*="Bairro" i]', data.neighborhood);
  
  // Preenche Cidade
  console.log('[TEST] Preenchendo Cidade...');
  await page.fill('input[placeholder*="cidade" i], input[placeholder*="Cidade" i]', data.city);
  
  // Preenche Estado
  console.log('[TEST] Preenchendo Estado...');
  await page.fill('input[placeholder*="estado" i], input[placeholder*="Estado" i]', data.state);
  
  // Preenche Senha
  console.log('[TEST] Preenchendo Senha...');
  const passwordInputs = page.locator('input[type="password"]');
  const count = await passwordInputs.count();
  if (count >= 1) {
    await passwordInputs.first().fill(data.password);
    console.log('[TEST] ✅ Senha preenchida');
  }
  
  // Preenche Confirmação de Senha
  if (count >= 2) {
    console.log('[TEST] Preenchendo Confirmação de Senha...');
    await passwordInputs.nth(1).fill(data.confirmPassword);
    console.log('[TEST] ✅ Confirmação de senha preenchida');
  }
  
  // Aguarda um pouco para validação de senha
  await page.waitForTimeout(1000);
  
  // Clica em Continuar
  await clickContinueButton(page, 'Etapa 2');
  
  console.log('[TEST] ✅ Segunda etapa concluída, aguardando próxima etapa...');
  await page.waitForTimeout(2000);
}

/**
 * Seleciona perfis na segunda etapa
 */
export async function selectProfiles(page: Page, profiles: string[]) {
  console.log(`[TEST] Selecionando perfis: ${profiles.join(', ')}...`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  
  // Mapeia os nomes dos perfis para os textos exibidos na tela
  const profileMap: Record<string, string[]> = {
    'producer': ['Produtor', 'PRODUTOR'],
    'supplier': ['Fornecedor', 'FORNECEDOR'],
    'service_provider': ['Prestador', 'PRESTADOR', 'Prestador de Serviço'],
  };
  
  for (const profile of profiles) {
    const profileTexts = profileMap[profile] || [profile];
    let clicked = false;
    
    for (const text of profileTexts) {
      const profileButton = page.locator(`text=/^${text}$/i, text="${text}"`).first();
      const isVisible = await profileButton.isVisible({ timeout: 5000 }).catch(() => false);
      
      if (isVisible) {
        console.log(`[TEST] Clicando no perfil: ${text}...`);
        await profileButton.scrollIntoViewIfNeeded();
        await page.waitForTimeout(300);
        await profileButton.click({ force: true });
        await page.waitForTimeout(500);
        clicked = true;
        console.log(`[TEST] ✅ Perfil ${text} selecionado!`);
        break;
      }
    }
    
    if (!clicked) {
      console.log(`[TEST] ⚠️ Perfil ${profile} não encontrado na tela`);
    }
  }
  
  console.log('[TEST] ✅ Seleção de perfis concluída');
}

/**
 * Preenche a terceira etapa do cadastro (Dados específicos do perfil)
 */
export async function fillThirdAccessStep(
  page: Page,
  profileType: 'buyer' | 'producer' | 'supplier' | 'service_provider',
  data: any
) {
  await page.waitForLoadState('networkidle');
  
  if (profileType === 'producer') {
    // Seleciona tipo de produtor
    if (data.producerType) {
      const producerTypeSelect = page.locator('select, [role="combobox"]').first();
      if (await producerTypeSelect.isVisible()) {
        await producerTypeSelect.selectOption(data.producerType);
      }
    }
    
    // Preenche atividades (se necessário)
    // Aqui você pode adicionar lógica para preencher atividades específicas
  }
  
  // Clica em Criar/Finalizar
  console.log('[TEST] Procurando botão Criar/Finalizar...');
  const createButton = page.locator('text=/Criar/i, text=/Finalizar/i, text=/CRIAR/i').first();
  await createButton.waitFor({ state: 'visible', timeout: 10000 });
  await createButton.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  
  console.log('[TEST] Clicando no botão Criar/Finalizar...');
  await createButton.click({ force: true });
  console.log('[TEST] Botão Criar/Finalizar clicado!');
  
  // Aguarda redirecionamento ou mensagem de sucesso
  console.log('[TEST] Aguardando resposta do servidor...');
  await page.waitForTimeout(5000);
}

/**
 * Verifica se o cadastro foi bem-sucedido
 */
export async function verifyRegistrationSuccess(page: Page) {
  console.log('[TEST] Verificando se o cadastro foi bem-sucedido...');
  
  // Verifica se foi redirecionado para login ou se aparece mensagem de sucesso
  const successMessage = page.locator('text=/cadastro.*sucesso/i, text=/registro.*sucesso/i, text=/Cadastro realizado/i');
  const loginPage = page.locator('input[type="email"], input[placeholder*="email" i]');
  const currentUrl = page.url();
  
  console.log(`[TEST] URL atual: ${currentUrl}`);
  
  // Aguarda um dos dois aparecer
  try {
    await Promise.race([
      successMessage.waitFor({ timeout: 10000, state: 'visible' }).then(() => {
        console.log('[TEST] ✅ Mensagem de sucesso encontrada!');
        return 'success';
      }),
      loginPage.waitFor({ timeout: 10000, state: 'visible' }).then(() => {
        console.log('[TEST] ✅ Redirecionado para página de login!');
        return 'login';
      }),
      page.waitForURL('**/login**', { timeout: 10000 }).then(() => {
        console.log('[TEST] ✅ URL mudou para login!');
        return 'login-url';
      }),
    ]);
    
    console.log('[TEST] ✅ Cadastro verificado com sucesso!');
  } catch (error) {
    console.log('[TEST] ❌ Não foi possível verificar sucesso do cadastro');
    console.log('[TEST] Verificando elementos na página...');
    
    // Tira screenshot para debug
    await page.screenshot({ path: 'test-results/debug-registration-failure.png' });
    console.log('[TEST] Screenshot salvo em test-results/debug-registration-failure.png');
    
    // Verifica se pelo menos um dos indicadores de sucesso está presente
    const hasSuccess = await successMessage.isVisible().catch(() => false);
    const isOnLoginPage = await loginPage.isVisible().catch(() => false);
    const isLoginUrl = currentUrl.includes('/login');
    
    console.log(`[TEST] hasSuccess: ${hasSuccess}, isOnLoginPage: ${isOnLoginPage}, isLoginUrl: ${isLoginUrl}`);
    
    expect(hasSuccess || isOnLoginPage || isLoginUrl).toBeTruthy();
  }
}

