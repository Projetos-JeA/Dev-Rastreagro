import AsyncStorage from '@react-native-async-storage/async-storage';

const REGISTRATION_STORAGE_KEY = '@rastreagro:registration_data';

export interface RegistrationStep1Data {
  fullName: string;
  nickname: string;
  birthDate: string;
  cpf: string;
  email: string;
  phone: string;
}

export interface RegistrationStep2Data {
  cnpj: string;
  cpf: string;
  documentType: 'cpf' | 'cnpj';
  serviceDocumentType: 'cpf' | 'cnpj';
  companyName: string;
  tradeName: string;
  stateRegistration: string;
  password: string;
  confirmPassword: string;
  address: string;
  cep: string;
  city: string;
  state: string;
  neighborhood: string;
  selectedProfiles: string[];
}

export interface RegistrationStep3Data {
  [key: string]: any; // Dados dinâmicos da etapa 3
}

export interface RegistrationData {
  step1?: RegistrationStep1Data;
  step2?: RegistrationStep2Data;
  step3?: RegistrationStep3Data;
}

/**
 * Salva os dados da etapa 1
 */
export async function saveStep1Data(data: RegistrationStep1Data): Promise<void> {
  try {
    const existing = await getRegistrationData();
    const updated: RegistrationData = {
      ...existing,
      step1: data,
    };
    await AsyncStorage.setItem(REGISTRATION_STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Erro ao salvar dados da etapa 1:', error);
  }
}

/**
 * Salva os dados da etapa 2
 */
export async function saveStep2Data(data: RegistrationStep2Data): Promise<void> {
  try {
    const existing = await getRegistrationData();
    const updated: RegistrationData = {
      ...existing,
      step2: data,
    };
    await AsyncStorage.setItem(REGISTRATION_STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Erro ao salvar dados da etapa 2:', error);
  }
}

/**
 * Salva os dados da etapa 3
 */
export async function saveStep3Data(data: RegistrationStep3Data): Promise<void> {
  try {
    const existing = await getRegistrationData();
    const updated: RegistrationData = {
      ...existing,
      step3: data,
    };
    await AsyncStorage.setItem(REGISTRATION_STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Erro ao salvar dados da etapa 3:', error);
  }
}

/**
 * Carrega todos os dados do cadastro
 */
export async function getRegistrationData(): Promise<RegistrationData> {
  try {
    const data = await AsyncStorage.getItem(REGISTRATION_STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Erro ao carregar dados do cadastro:', error);
    return {};
  }
}

/**
 * Carrega os dados da etapa 1
 */
export async function getStep1Data(): Promise<RegistrationStep1Data | null> {
  try {
    const data = await getRegistrationData();
    return data.step1 || null;
  } catch (error) {
    console.error('Erro ao carregar dados da etapa 1:', error);
    return null;
  }
}

/**
 * Carrega os dados da etapa 2
 */
export async function getStep2Data(): Promise<RegistrationStep2Data | null> {
  try {
    const data = await getRegistrationData();
    return data.step2 || null;
  } catch (error) {
    console.error('Erro ao carregar dados da etapa 2:', error);
    return null;
  }
}

/**
 * Carrega os dados da etapa 3
 */
export async function getStep3Data(): Promise<RegistrationStep3Data | null> {
  try {
    const data = await getRegistrationData();
    return data.step3 || null;
  } catch (error) {
    console.error('Erro ao carregar dados da etapa 3:', error);
    return null;
  }
}

/**
 * Limpa todos os dados do cadastro (chamado após cadastro bem-sucedido)
 */
export async function clearRegistrationData(): Promise<void> {
  try {
    await AsyncStorage.removeItem(REGISTRATION_STORAGE_KEY);
  } catch (error) {
    console.error('Erro ao limpar dados do cadastro:', error);
  }
}

/**
 * Limpa apenas os dados de uma etapa específica
 */
export async function clearStepData(step: 1 | 2 | 3): Promise<void> {
  try {
    const data = await getRegistrationData();
    if (step === 1) {
      delete data.step1;
    } else if (step === 2) {
      delete data.step2;
    } else if (step === 3) {
      delete data.step3;
    }
    await AsyncStorage.setItem(REGISTRATION_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error(`Erro ao limpar dados da etapa ${step}:`, error);
  }
}

