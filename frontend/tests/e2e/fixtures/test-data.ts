/**
 * Dados de teste para os diferentes tipos de cadastro
 * 
 * IMPORTANTE: Use dados únicos para cada teste para evitar conflitos
 */

export interface BuyerTestData {
  fullName: string;
  nickname: string;
  birthDate: string;
  cpf: string;
  email: string;
  phone: string;
  password: string;
  address: string;
  cep: string;
  city: string;
  state: string;
  neighborhood: string;
}

export interface ProducerPFTestData {
  fullName: string;
  nickname: string;
  birthDate: string;
  cpf: string;
  email: string;
  phone: string;
  companyName: string;
  password: string;
  address: string;
  cep: string;
  city: string;
  state: string;
  neighborhood: string;
  producerType: 'agricultor' | 'pecuarista' | 'ambos';
}

export interface ProducerSupplierPJTestData {
  fullName: string;
  nickname: string;
  birthDate: string;
  cpf: string;
  email: string;
  phone: string;
  cnpj: string;
  companyName: string;
  tradeName: string;
  stateRegistration: string;
  password: string;
  address: string;
  cep: string;
  city: string;
  state: string;
  neighborhood: string;
}

export interface ServiceProviderTestData {
  fullName: string;
  nickname: string;
  birthDate: string;
  cpf: string;
  email: string;
  phone: string;
  serviceName: string;
  password: string;
  address: string;
  cep: string;
  city: string;
  state: string;
  neighborhood: string;
}

/**
 * Gera um email único baseado em timestamp
 */
function generateUniqueEmail(prefix: string = 'test'): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `${prefix}-${timestamp}-${random}@test.com`;
}

/**
 * Gera um CPF válido para testes (formato apenas, não valida dígitos verificadores)
 */
function generateTestCPF(): string {
  const numbers = Array.from({ length: 11 }, () => Math.floor(Math.random() * 10));
  return `${numbers.slice(0, 3).join('')}.${numbers.slice(3, 6).join('')}.${numbers.slice(6, 9).join('')}-${numbers.slice(9, 11).join('')}`;
}

/**
 * Gera um CNPJ válido para testes (formato apenas)
 */
function generateTestCNPJ(): string {
  const numbers = Array.from({ length: 14 }, () => Math.floor(Math.random() * 10));
  return `${numbers.slice(0, 2).join('')}.${numbers.slice(2, 5).join('')}.${numbers.slice(5, 8).join('')}/${numbers.slice(8, 12).join('')}-${numbers.slice(12, 14).join('')}`;
}

/**
 * Dados de teste para cadastro de Comprador
 */
export function getBuyerTestData(): BuyerTestData {
  return {
    fullName: 'João Silva Teste',
    nickname: `joao-${Date.now()}`,
    birthDate: '15/05/1990',
    cpf: generateTestCPF(),
    email: generateUniqueEmail('buyer'),
    phone: '+55 11 9 9876-5432',
    password: 'Teste123!@#',
    address: 'Rua Teste, 123',
    cep: '01310-100',
    city: 'São Paulo',
    state: 'SP',
    neighborhood: 'Bela Vista',
  };
}

/**
 * Dados de teste para cadastro de Produtor (PF)
 */
export function getProducerPFTestData(): ProducerPFTestData {
  return {
    fullName: 'Maria Santos Teste',
    nickname: `maria-${Date.now()}`,
    birthDate: '20/08/1985',
    cpf: generateTestCPF(),
    email: generateUniqueEmail('producer'),
    phone: '+55 11 9 8765-4321',
    companyName: 'Fazenda Teste',
    password: 'Teste123!@#',
    address: 'Estrada Rural, Km 5',
    cep: '13800-000',
    city: 'Mogi Mirim',
    state: 'SP',
    neighborhood: 'Zona Rural',
    producerType: 'agricultor',
  };
}

/**
 * Dados de teste para cadastro de Produtor + Fornecedor (PJ)
 */
export function getProducerSupplierPJTestData(): ProducerSupplierPJTestData {
  return {
    fullName: 'Carlos Oliveira Teste',
    nickname: `carlos-${Date.now()}`,
    birthDate: '10/03/1980',
    cpf: generateTestCPF(),
    email: generateUniqueEmail('producer-supplier'),
    phone: '+55 11 9 7654-3210',
    cnpj: generateTestCNPJ(),
    companyName: 'Agro Teste Ltda',
    tradeName: 'Agro Teste',
    stateRegistration: '123.456.789.012',
    password: 'Teste123!@#',
    address: 'Av. Teste, 456',
    cep: '14020-000',
    city: 'Ribeirão Preto',
    state: 'SP',
    neighborhood: 'Centro',
  };
}

/**
 * Dados de teste para cadastro de Prestador de Serviço
 */
export function getServiceProviderTestData(): ServiceProviderTestData {
  return {
    fullName: 'Ana Costa Teste',
    nickname: `ana-${Date.now()}`,
    birthDate: '25/12/1992',
    cpf: generateTestCPF(),
    email: generateUniqueEmail('service-provider'),
    phone: '+55 11 9 6543-2109',
    serviceName: 'Serviços Agro Teste',
    password: 'Teste123!@#',
    address: 'Rua Serviços, 789',
    cep: '15000-000',
    city: 'São José do Rio Preto',
    state: 'SP',
    neighborhood: 'Vila Teste',
  };
}

